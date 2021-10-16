const express = require("express");
const asyncHandler = require("express-async-handler");
const fetch = require("node-fetch");
const cors = require("cors");

const nacl_factory = require("js-nacl");
const CryptoJS = require("crypto-js");

const { BodySigner } = require("../utils/body-signer.js");
const { EventLogger } = require("../utils/event-logger.js");
const { MongoWrapper } = require("../utils/mongo-wrapper.js");

class ApiWebServer {
    constructor({ providerInfo, providerKeys, configServer, configMongo }) {
        this.providerInfo = providerInfo;
        this.providerKeys = providerKeys;
        this.configServer = configServer;
        this.configMongo = configMongo;

        this.app = express();
        this.mongo = new MongoWrapper(configMongo);
    }

    async start() {
        return this.startNacl()
            .then(this.startSigner.bind(this))
            .then(this.startMongo.bind(this))
            .then(this.startServer.bind(this))
            .then(() => {console.log("WEB SERVER READY")})
    }

    async startNacl() {
        return new Promise((resolve, reject) => {
            nacl_factory.instantiate((nacl) => {
                this.nacl = nacl;
                resolve(this.nacl);
            });   
        });
    }

    async startSigner() {
        this.providerKeys = this.nacl.crypto_sign_keypair_from_seed(this.nacl.from_hex(this.providerKeys.secret));
        this.signer = new BodySigner(this.nacl, this.providerKeys);
    }

    async startMongo() {
        await this.mongo.connect();
        this.mongo.setDatabase("notificationdb");
        this.mongo.addCollection("notifications");
        this.mongo.addCollection("users");
        this.mongo.addCollection("logs");

        this.logger = new EventLogger(this.mongo);
    }

    async startServer() {
        return new Promise((resolve, reject) => {           
            const urlencodedParser = express.urlencoded({ extended: true });
            const jsonParser = express.json();
            
            this.app.use(cors());
            this.app.use("/static", express.static("static"));

            this.app.get("/api/info", asyncHandler(this.methodGetInfo.bind(this)));
            this.app.post("/api/subscribe", urlencodedParser, asyncHandler(this.methodPostSubscription.bind(this)));
            this.app.post("/api/test", urlencodedParser, asyncHandler(this.methodTestRequest.bind(this)));

            this.app.post("/api/statistics", jsonParser, asyncHandler(this.methodGetStatistics.bind(this)));

            
            this.app.use(express.static("docs/doc", {index: "index.html"}));
            this.app.use("*", express.static("docs/doc", {index: "index.html"}));

            this.app.listen(this.configServer.port, this.configServer.host, () => {
                resolve();
            });
        });
    }



    /*  */

    async methodGetStatistics(req, res) {
        const { start_time, end_time, period } = req.body;
        const messages_delivered = [];
        const messages_received = [];
        const x = []

        if ((end_time - start_time) / period > 128) {
            this.sendError(res, 400, "BadRequest", "too many points", {});
            return;
        } 

        for (let i = start_time; i < end_time; i += period) {
            messages_delivered.push(await this.mongo.collections.notifications.count({ 
                received_by_consumer_time: { $lt: i + period , $gt: i + 1 }
            }));

            messages_received.push(await this.mongo.collections.notifications.count({ 
                received_by_provider_time: { $lt: i + period , $gt: i + 1 }
            }));

            x.push(i)
        }

        this.sendSignedJson(res, 200, { x, messages_received, messages_delivered });
    }



    /* Get info method */

    async methodGetInfo(req, res) {
        this.sendSignedJson(res, 200, this.providerInfo);
    }



    /* Subscribe method */

    async methodPostSubscription(req, res) {
        const { data, hash } = req.body;
        const isDebot = req.body.isDebot !== "false";

        if ( !data || !hash ) {
            this.sendError(res, 400, "BadRequest", "data and hash must be provided", {});
            return;
        }

        let decoded; 
        try { 
            decoded = atob(data);
        } catch (e) { 
            this.sendError(res, 400, "BadRequest", "incorrect data", {});
            return;
        }

        const currentTime = Math.floor(Date.now() / 1000);
        const newSecret = this.nacl.to_hex(this.nacl.random_bytes(32));

        const newUserObject = { 
            hash, callback: decoded, callback_type: "URL", 
            confirmed: false, secret: newSecret, last_update: currentTime 
        }

        const oldUserInfo = await this.mongo.collections.users.findOneAndUpdate({ hash }, { 
            $setOnInsert: newUserObject 
        }, { upsert: true });

        const oldUserValue = oldUserInfo.value;
        const user = oldUserValue?oldUserValue:newUserObject;
        const isNewUser = oldUserValue?false:true;

        if (user.confirmed) {
            if (isDebot) {
                res.status(200).send("The callback is already registered");
            } else if (newUserObject.callback_type === user.callback_type && newUserObject.callback === user.callback) {
                this.sendSignedJson(res, 200, { confirmed: true });
            } else { this.sendError(res, 400, "BadRequest", "callback already registered", {})}
            
            return;
        }

        if (isNewUser) {
            if (isDebot) {
                res.status(200).send(`Hash: ${user.hash}\nSecret: ${user.secret}\n\nUse this secret to verify ownership of the server. Then repeat the call to the bot.\n\nKeep this secret, you may need it later.`);
            } else { this.sendSignedJson(res, 200, { confirmed: false, secret: user.secret })}

            return;
        }

        const [random, answer] = this.generateHmacCode(user.secret);
        const confirmStatus = await this.checkUserServer(user.callback, hash, "SUBSCRIBE", random, {});
        if (!confirmStatus) {
            if (isDebot) {
                res.status(200).send("Failed to get a response from the server");
            } else { this.sendError(res, 400, "BadRequest", "incorrect server response", {})}

            return;    
        }
        
        if (confirmStatus.encrypted === answer) {
            const confirmationTime = Math.floor(Date.now() / 1000);
            await this.mongo.collections.users.updateOne({ hash }, { $set: {
                confirmed: true, 
                last_update: confirmationTime
            }});

            await this.logger.event(confirmationTime, "SUBSCRIBE", {});
            if (isDebot) { 
                res.status(200).send("Callback registered successfully");
            } else { this.sendSignedJson(res, 200, { confirmed: true })}
            
            return;
        } else {
            if (isDebot) {
                res.status(200).send("The server gave an incorrect answer");
            } else { this.sendSignedJson(res, 200, { confirmed: false })}

            return;   
        }      
    }

    async checkUserServer(url, hash, event, random, data) {
        try {
            const body = JSON.stringify(this.generateEventJson(event, {
                from: hash,
                provider: this.providerInfo.id,
                callback: url,
                encrypt: random,
                ...data
            }));

            const sign = this.signer.signString(body);
            const signPk = this.nacl.to_hex(this.providerKeys.signPk);
            const result = await fetch(url, {
                method: "POST", body,
                headers: { 
                    "Content-Type": "application/json",
                    "Pubkey": signPk, "Sign": sign
                }                
            });

            if (!result.ok) return null;
            return await result.json();
        } catch (e) {
            return null;
        }
    }



    /* Test request method */

    async methodTestRequest(req, res) {
        const { hash } = req.body;

        if ( !hash ) {
            this.sendError(res, 400, "BadRequest", "hash must be provided", {});
            return;
        }

        const user = await this.mongo.collections.users.findOne({ hash });
        if (!user) { this.sendError(res, 404, "BadRequest", "user not found", {}); return; }

        const [ random, answer ] = this.generateHmacCode(user.secret);
        const confirmResult = await this.checkUserServer(user.callback, hash, "TEST", random, {});

        if (!confirmResult) {
            this.sendError(res, 400, "BadRequest", "incorrect server response", {});   
            return;    
        }

        this.sendSignedJson(res, 200, { correct_secret: confirmResult.encrypted === answer, confirmed: user.confirmed });
    }

    
    
    /* Utils */

    generateHmacCode(secret) {
        const random = this.nacl.to_hex(this.nacl.random_bytes(32));

        const b_random = CryptoJS.enc.Hex.parse(random);
        const b_secret = CryptoJS.enc.Hex.parse(secret);
        const b_hash = CryptoJS.HmacSHA256(b_random, b_secret);
        const answer = CryptoJS.enc.Hex.stringify(b_hash);

        return [random, answer]
    }

    generateEventJson(type, data) {
        return { type, data }
    }

    generateErrorJson(status, type, error, data) {
        return {status, type, error, data}
    }

    sendError(res, status, type, error, data) {
        const errJson = this.generateErrorJson(status, type, error, data);
        this.sendSignedJson(res, status, errJson);
    }

    sendSignedJson(res, status, body) {
        const s_body = JSON.stringify(body);
        const sign = this.signer.signString(s_body);
        const signPk = this.nacl.to_hex(this.providerKeys.signPk);

        res.set("Content-Type", "application/json");
        res.set("Pubkey", signPk);
        res.set("Sign", sign);

        res.status(status).send(s_body);
    }
}

module.exports = ApiWebServer;