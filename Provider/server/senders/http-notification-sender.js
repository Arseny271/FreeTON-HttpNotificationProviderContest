const axios = require("axios");
const http = require("http")
const https = require("https")

const { CancelToken } = axios;

class HttpNotificationSender {
    constructor(nacl, keypair) {
        this.keypair = keypair;
        this.nacl = nacl;

        const httpAgent = new http.Agent({ keepAlive: false });
        const httpsAgent = new https.Agent({ keepAlive: false });

        this.pubkeyHex = nacl.to_hex(keypair.signPk);
        this.axios = axios.create({ httpAgent, httpsAgent, headers: {
            "Content-Type": "application/json",
            "Pubkey": this.pubkeyHex
        }});
    }

    async fetch(url, body, sign, timeout) {        
        let cancel, ignoreCancel = false;
        let cancelToken = new CancelToken((c) => { cancel = c });
        
        const request = this.axios.post(url, body, { cancelToken, headers: { "Sign": sign }})
            .finally(() => { ignoreCancel = true; cancel = null; cancelToken = null; });

        if (timeout !== 0) { setTimeout(() => { if (!ignoreCancel) { cancel() }}, timeout)}
        return request;
    }

    async send(message, url, provider, timeout = 0) {
        const { nonce, encoded, hash, attempts } = message;
        const body = JSON.stringify({
            type: "NOTIFY",
            data: {        
                data: `${nonce} ${encoded}`,
                attempt: attempts,
                from: hash,
                to: url,
                provider
            }
        })

        const encoded_body = this.nacl.encode_utf8(body);
        const signBytes = this.nacl.crypto_sign_detached(encoded_body, this.keypair.signSk);
        const sign = this.nacl.to_hex(signBytes)

        return this.fetch(url, body, sign, timeout)//.catch(e => console.log(e));
    }
}

module.exports = { HttpNotificationSender };