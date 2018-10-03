"use strict";
const root = (require("protobufjs")).loadSync('../messages.proto');
const exportObj = {
    name: 'hasher',
    messageTypes:
        [
            {
                name: 'getHash',
                type: 'req',
                schema: root.lookupType('getHash')
            },
            {
                name: 'getHash',
                type: 'res',
                schema: root.lookupType('returnHash')
            }
        ]
};

for(let messageType of exportObj.messageTypes){
    messageType.encode = (obj) => messageType.schema.encode(messageType.schema.create(obj)).finish();
    messageType.decode = (buf) => messageType.schema.decode(buf);
}

module.exports = exportObj;