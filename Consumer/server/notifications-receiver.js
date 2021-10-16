const nacl_factory = require("js-nacl");
const fetch = require("node-fetch");
const express = require('express');
const asyncHandler = require("express-async-handler");
const CryptoJS = require("crypto-js");

const { MongoWrapper } = require("../utils/mongo-wrapper.js");
const { ReceiverAdminPage } = require("./admin-panel-receiver");

class NotificationsReceiver {
    constructor({configServer, configMongo}) {
        this.configServer = configServer;
        this.configMongo = configMongo;

        this.app = express();
        this.app.set("trust proxy", "127.0.0.1");
        this.mongo = new MongoWrapper(configMongo);

        this.adminPanel = new ReceiverAdminPage({
            configMongo, configServer: { 
                host: configServer.host,
                port: configServer.adminPanelPort
            }
        }, this.onChangeReceiverConfig.bind(this));
    }

    async start() {
        return this.startNacl()
            .then(this.startAdminPanel.bind(this))
            .then(this.startMongo.bind(this))
            .then(this.startServer.bind(this));
    }

    async startNacl() {
        return new Promise((resolve) => {
            nacl_factory.instantiate((nacl) => {
                console.log("NACL READY");
                this.nacl = nacl;
                resolve(this.nacl);
            });   
        });
    }

    async startAdminPanel() {
        await this.adminPanel.start();

        const config = await this.adminPanel.generateConfigJson();
        await this.onChangeReceiverConfig(config);
    }

    async startMongo() {
        await this.mongo.connect();
        this.mongo.setDatabase("receiverdb");
        this.mongo.addCollection("messages");
    }

    async startServer() {
        return new Promise((resolve) => {      
            const jsonParser = express.json({
                verify: (req, res, buf) => { req.rawBody = buf }
            })
            
            this.app.post("/events", jsonParser, asyncHandler(this.onTonEvent.bind(this)));  
            this.app.get("/killer", jsonParser, asyncHandler(this.killerMethod.bind(this)));  
            this.app.post("/killer", jsonParser, asyncHandler(this.killerMethod.bind(this)));       
            this.app.listen(this.configServer.receiverPort, this.configServer.host, () => {
                console.log("SERVER READY\n");
                resolve();
            });
        });
    }

    async onChangeReceiverConfig(receiverConfig) {
        this.receiverConfig = receiverConfig;
        this.decryptionServiceKey = this.nacl.from_hex("a36bf515ee8de6b79d30b294bbe7162f5e2a45b95ea97e4baebab8873492ee43");

        console.log("UPDATE CONSUMER CONFIG");
    }


    async killerMethod(req, res) {
        setTimeout(() => res.sendStatus(200), 10000);
    }


    /* receive event function */
   
    async onTonEvent(req, res) {
        const { pubkey, sign } = req.headers;
        const { body, rawBody } = req;

        const eventType = body.type;
        const eventData = body.data;

        const userHash = eventData.from;            // обязательное поле
        const providerId = eventData.provider;      // обязательное поле
        const encryptToConfirm = eventData.encrypt; // необязательное поле

        const providerConfig = this.receiverConfig.providers[providerId];
        if (!providerConfig) { console.log("NO PROVIDER", providerId); res.sendStatus(400); return; }

        const consumerConfig = this.receiverConfig.consumers[userHash];
        if (!consumerConfig) { console.log("NO CONSUMER", userHash); res.sendStatus(400); return; }

        const consumerRule = consumerConfig.rules[providerId];
        if (!consumerRule) { console.log("NO RULE", providerId, userHash); res.sendStatus(400); return; }

        const publicKey = providerConfig.public_key;
        const needCheckSign = publicKey && true;
        const isSigned = needCheckSign ? ((pubkey && sign && rawBody) ? 
            this.checkSign({ pubkey, sign, rawBody }) : false) : true;
        
        const verifiedSign = this.checkParam(pubkey, publicKey) && isSigned;

        const isVerified = verifiedSign;
        if (!isVerified) { res.sendStatus(400); return; }
                    
        //console.log("NEW EVENT -", eventType, eventData );   

        if ( eventType === "NOTIFY" ) {
            const currentTime = Math.floor(Date.now() / 1000);
           
            const [nonce, data] = eventData.data.split(" ");
            const nonceHex = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(nonce));
            const dataHex = CryptoJS.enc.Hex.stringify(CryptoJS.enc.Base64.parse(data));

            const decryptionSecretKeyBytes =  this.nacl.from_hex(consumerConfig.secret_key); 
            const decryptionPublicKeyBytes = this.decryptionServiceKey;
            
            const nonceBytes = this.nacl.from_hex(nonceHex);
            const dataBytes = this.nacl.from_hex(dataHex);
            
            const result = this.nacl.crypto_box_open(
                dataBytes, nonceBytes, decryptionPublicKeyBytes, decryptionSecretKeyBytes);

            const notification = JSON.parse(this.nacl.decode_utf8(result));
            const notificationJson = {
                user: userHash, date: currentTime, notification, provider: providerId
            }

            console.log("SUCCESS");   

            try {
                fetch(consumerRule.forward, {
                    headers: { "Content-Type": "application/json" },
                    method: "POST", body: JSON.stringify(notificationJson)
                }).catch((e) => {console.log("ERR", e); });
            } catch (e) {}
            await this.mongo.collections.messages.insertOne(notificationJson);

            res.status(200).json({ success: true });
        } else if ( eventType === "SUBSCRIBE" ) {
            const hmac = this.generateHmacCode(consumerRule.secret, encryptToConfirm);
            res.status(200).json({ success: true, encrypted: hmac }); 
        } else if ( eventType === "TEST") {
            const hmac = this.generateHmacCode(consumerRule.secret, encryptToConfirm);
            res.status(200).json({ success: true, encrypted: hmac }); 
        } else {
            console.log("UNKNOWN EVENT", body)
            res.sendStatus(404);
        }
    }

    generateHmacCode(secret, encrypt) {
        const b_encrypt = CryptoJS.enc.Hex.parse(encrypt);
        const b_secret = CryptoJS.enc.Hex.parse(secret);
        const b_hash = CryptoJS.HmacSHA256(b_encrypt, b_secret);
        
        const hash = CryptoJS.enc.Hex.stringify(b_hash);

        return hash;
    }

    checkParam(value, config) {
        if (!config) return true;

        if (Array.isArray(config)) {
            for (let test of config) {
                if (this.checkParam(value, test)) { 
                    return true; 
                }
            }

            return false;
        }

        return (new RegExp(config)).test(value);
    }

    checkSign({ pubkey, sign, rawBody }) {
        const b_pubkey = this.nacl.from_hex(pubkey);
        const b_sign = this.nacl.from_hex(sign);
        const b_body = Uint8Array.from(rawBody);
        return this.nacl.crypto_sign_verify_detached(b_sign, b_body, b_pubkey);
    }
}

module.exports = { NotificationsReceiver };