class ConversionUtils {
    static base64toHex(base64) {
        const buffer = Buffer.from(base64, 'base64');
        return buffer.toString('hex');
    }
}


module.exports = { ConversionUtils };