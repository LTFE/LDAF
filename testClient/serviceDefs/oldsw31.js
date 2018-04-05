const Type = require('js-binary').Type;
const exportObj = {
    name: 'swether31',
    messageTypes:
        [
            {
                name: 'bookEvent',
                type: 'psh',
                schema: new Type({
                    txHash: 'Buffer',
                    blockNumber: 'uint',
                    startTime: 'uint',
                    chargingTime: 'uint',
                    NFC: 'Buffer',
                    plugId: 'uint'
                })
            },
            {
                name: 'checkTransaction',
                type: 'req',
                schema: new Type({
                    txHash: 'Buffer',
                    blockNumber: 'uint'
                })
            },
            {
                name: 'checkTransaction',
                type: 'res',
                schema: new Type({
                    exists: 'uint'
                })
            },
            {
                name: 'newBlock',
                type: 'psh',
                schema: new Type({
                    blockNumber: 'uint'
                })
            }
        ]
};

for(let messageType of exportObj.messageTypes){
    messageType.encode = messageType.schema.encode.bind(messageType.schema);
    messageType.decode = messageType.schema.decode.bind(messageType.schema);
}

module.exports = exportObj