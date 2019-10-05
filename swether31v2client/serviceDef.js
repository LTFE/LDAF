"use strict";
const root = (require("protobufjs")).loadSync('messages.proto');
const exportObj = {
    name: 'swether31v2',
    messageTypes:
        [
            {
                name: 'bookEvent',
                type: 'psh',
                schema: root.lookupType('bookEvent')
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