const express = require("express");
const asyncHandler = require("express-async-handler");
const cors = require("cors");

const { MongoWrapper } = require("../utils/mongo-wrapper.js");

function makeid(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    for ( let i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

class ReceiverAdminPage {

    constructor({ configServer, configMongo }, onReceiverConfigChange) {
        this.onReceiverConfigChange = onReceiverConfigChange;
        this.configServer = configServer;
        this.configMongo = configMongo;

        this.app = express();
        this.mongo = new MongoWrapper(configMongo);
    }

    async start() {
        return this.startMongo().then(this.startServer.bind(this))
            .then(() => console.log("ADMIN PANEL READY"));
    }

    async startMongo() {
        await this.mongo.connect();
        this.mongo.setDatabase("receiverdb");
        this.mongo.addCollection("messages");
        this.mongo.addCollection("providers");
        this.mongo.addCollection("consumers");
        this.mongo.addCollection("rules");
        this.mongo.addCollection("configs");

        await this.mongo.collections.configs.updateOne({ config: "AUTH" }, { 
            $setOnInsert: { login: "admin", password: "admin", config: "AUTH" } 
        }, { upsert: true });

        await this.mongo.collections.configs.updateOne({ config: "CONSUMER" }, { 
            $setOnInsert: { hash: null, secret_key: null, config: "CONSUMER" } 
        }, { upsert: true });
    }

    async startServer() {
        return new Promise((resolve, reject) => {           
            const jsonParser = express.json();
            
            this.app.use(cors());
            this.app.post("/admin/auth/login", jsonParser, asyncHandler(this.methodAuthLogin.bind(this)));
            this.app.post("/admin/auth/logout", jsonParser, asyncHandler(this.methodAuthLogout.bind(this)));
            this.app.post("/admin/auth/change", jsonParser, asyncHandler(this.methodAuthChange.bind(this)));
            this.app.post("/admin/auth/check", jsonParser, asyncHandler(this.methodAuthCheck.bind(this)));

            this.app.post("/admin/config/providers/add", jsonParser, asyncHandler(this.methodProvidersAdd.bind(this)));
            this.app.post("/admin/config/providers/remove", jsonParser, asyncHandler(this.methodProvidersRemove.bind(this)));
            
            this.app.post("/admin/config/consumers/add", jsonParser, asyncHandler(this.methodConsumersAdd.bind(this)));
            this.app.post("/admin/config/consumers/update", jsonParser, asyncHandler(this.methodConsumersUpdate.bind(this)));
            this.app.post("/admin/config/consumers/remove", jsonParser, asyncHandler(this.methodConsumersRemove.bind(this)));

            this.app.post("/admin/config/rules/add", jsonParser, asyncHandler(this.methodRulesAdd.bind(this)));
            this.app.post("/admin/config/rules/update", jsonParser, asyncHandler(this.methodRulesUpdate.bind(this)));
            this.app.post("/admin/config/rules/remove", jsonParser, asyncHandler(this.methodRulesRemove.bind(this)));

            this.app.get("/admin/messages/get", asyncHandler(this.methodGetMessages.bind(this)));

            this.app.get("/admin/config", asyncHandler(this.methodGetConfig.bind(this)));
            
            this.app.use(express.static('admin_page/build', {index: "index.html"}));
            this.app.use('*', express.static('admin_page/build', {index: "index.html"}));

            this.app.listen(this.configServer.port, this.configServer.host, () => { resolve() });
        });
    }





    async methodAuthLogin(req, res) {
        const { login, password } = req.body;
        
        const authInfo = await this.mongo.collections.configs.findOne({ config: "AUTH" })
        if (login === authInfo.login && password === authInfo.password) {
            this.token = makeid(96);
            res.status(200).json({ token: this.token });
        } else res.status(401).json({ status: 401 });
    }

    async methodAuthLogout(req, res) {
        if (!this.checkAuth(req, res)) return;
        this.token = undefined;
        res.status(200).json({ ok: true });
    }

    async methodAuthChange(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { new_login, new_password, old_password } = req.body;
        const authInfo = await this.mongo.collections.configs.findOne({ config: "AUTH" })

        if (old_password === authInfo.password) {
            const newAuthInfo = { login: new_login, password: new_password, config: "AUTH" }
            await this.mongo.collections.configs.updateOne({config: "AUTH" }, { $set: newAuthInfo });
            this.token = makeid(96);
            res.status(200).json({ token: this.token });
        } else res.status(401).json({ status: 401 });        
    }

    async methodAuthCheck(req, res) {
        if (!this.checkAuth(req, res)) return;
        res.status(200).json({ ok: true });
    }


    
    /* providers */

    async methodProvidersAdd(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { provider } = req.body;
        await this.mongo.collections.providers.insertOne(provider);

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }

    async methodProvidersUpdate(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { provider } = req.body;
        await this.mongo.collections.providers.updateOne({id: provider.id}, { $set: provider });

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }

    async methodProvidersRemove(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { provider_id } = req.body;
        await this.mongo.collections.providers.deleteOne({id: provider_id});

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }



    /* consumers */

    async methodConsumersAdd(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { consumer } = req.body;
        await this.mongo.collections.consumers.insertOne(consumer);

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }

    async methodConsumersUpdate(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { consumer } = req.body;
        const { hash } = consumer;

        console.log("UPDATE", consumer, hash)

        await this.mongo.collections.consumers.updateOne({hash}, {$set: consumer});

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }

    async methodConsumersRemove(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { hash } = req.body;
        await this.mongo.collections.consumers.deleteOne({hash});

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }



    /* rules */

    async methodRulesAdd(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { rule } = req.body;
        await this.mongo.collections.rules.insertOne(rule);

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }

    async methodRulesUpdate(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { rule } = req.body;
        const { hash, provider_id } = rule;
        await this.mongo.collections.rules.updateOne({hash, provider_id}, {$set: rule});

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }

    async methodRulesRemove(req, res) {
        if (!this.checkAuth(req, res)) return;

        const { rule } = req.body;
        const { hash, provider_id } = rule;
        await this.mongo.collections.rules.deleteOne({hash, provider_id});

        this.onReceiverConfigChange(await this.generateConfigJson());
        res.status(200).json({ ok: true });
    }  



    /* messages */

    async methodGetMessages(req, res) {
        if (!this.checkAuth(req, res)) return;

        const messages = await this.mongo.collections.messages.find({}).sort({ date: -1 }).limit(20).toArray();

        res.json(messages);
    }

    /* config */

    async methodGetConfig(req, res) {    
        if (!this.checkAuth(req, res)) return;

        const config = await this.generateConfigJson();       
        res.json(config);
    }



    /* utils */
    
    checkAuth(req, res) {
        const { authorization } = req.headers;
        if (authorization !== this.token || !authorization) {
            res.status(401).json({ status: 401 });
            return false;
        } else {
            return true;
        }
    }

    async generateConfigJson() {
        let providers = {}
        await this.mongo.collections.providers.find({}).forEach((doc) => {
            const { id, name, version, description, address, icon, public_key, url } = doc;
            providers[id] = { id, name, version, description, address, icon, public_key, url }
        });   

        let consumers = {}
        await this.mongo.collections.consumers.find({}).forEach((doc) => {
            const { hash, secret_key, public_key } = doc;
            consumers[hash] = { hash, secret_key, public_key, rules: {}}
        });   

        await this.mongo.collections.rules.find({}).forEach((doc) => {
            const { hash, provider_id, secret, forward, active } = doc;
            if (hash in consumers)
                consumers[hash].rules[provider_id] = { secret, forward, active }
        });   

        return { consumers, providers }
    }
}

module.exports = { ReceiverAdminPage };
