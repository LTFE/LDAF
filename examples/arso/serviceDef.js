"use strict";
const root = (require("protobufjs")).loadSync('services/arso/messages.proto');
const exportObj = {
    name: 'arso',
    messageTypes:
        [
            {
                name: 'getTemperature',
                type: 'req',
                schema: root.lookupType('getTemperature')
            },
            {
                name: 'returnTemperature',
                type: 'res',
                schema: root.lookupType('returnTemperature')
            }
        ]
};

for(let messageType of exportObj.messageTypes){
    messageType.encode = (obj) => messageType.schema.encode(messageType.schema.create(obj)).finish();
    messageType.decode = (buf) => messageType.schema.decode(buf);
}

module.exports = exportObj;