const Service = require('../Service');
const dnsModule = require('dns');
class Dns extends Service([]) {
    constructor(){
        super('dns');

        this.on('lookup', (message, sendResponse) => {
            dnsModule.lookup(message.hostname, (err, address, family) => {
                if(err){
                    sendResponse('error', {code: err.code});
                    return;
                }
                sendResponse('lookup', {ip:address})
            });
        });

        this.on('reverse', (message, sendResponse) => {
            dnsModule.reverse(message.ip, (err, hostnames) => {
                if(err){
                    sendResponse('error', {code: err.code});
                    return;
                }
                sendResponse('reverse', {hostnames:hostnames})
            });
        })
    }
}
module.exports = new Dns();