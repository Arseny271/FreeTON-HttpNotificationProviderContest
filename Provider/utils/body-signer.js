class BodySigner {

    constructor(nacl, keypair) {
        this.nacl = nacl;
        this.keypair = keypair;
    }

    signString(body) {
        const encoded_body = this.nacl.encode_utf8(body);
        const sign = this.nacl.crypto_sign_detached(encoded_body, this.keypair.signSk);

        return this.nacl.to_hex(sign);
    }

}

module.exports = { BodySigner };