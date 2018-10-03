const Service = require('../Service');
class Swether31 extends Service([]) {
    constructor(){
        super('hasher');
        let crypto = require("crypto");

        this.on('getHash', (message, sendResponse) => {
            const hash = crypto.createHash(message.algorithm);

            hash.update(message.data);
            sendResponse('getHash', {hash: hash.digest()})
        })
    }


}
module.exports = new Swether31();