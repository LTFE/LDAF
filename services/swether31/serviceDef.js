"use strict";
const root = (require("protobufjs")).loadSync('./services/swether31/messages.proto');
const exportObj = {
    name: 'swether31',
    messageTypes:
        [
            {
                name: 'bookEvent',
                type: 'psh',
                schema: root.lookupType('bookEvent')
            },
            {
                name: 'checkTransaction',
                type: 'req',
                schema: root.lookupType('checkTransactionReq')
            },
            {
                name: 'checkTransaction',
                type: 'res',
                schema: root.lookupType('checkTransactionRes')
            },
            {
                name: 'newBlock',
                type: 'psh',
                schema: root.lookupType('newBlock')
            }
        ]
};

for(let messageType of exportObj.messageTypes){
    messageType.encode = (obj) => messageType.schema.encode(messageType.schema.create(obj)).finish();
    messageType.decode = (buf) => messageType.schema.decode(buf);
}

module.exports = exportObj;