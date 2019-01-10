const root = (require("protobufjs")).loadSync('./messages.proto');
const exportObj = {
    name: "bsdiff",
    messageTypes: [
        {
            name: "diff",
            type: "req",
            schema: root.lookupType("diff")
        },
        {
            name: "diff",
            type: "res",
            schema: root.lookupType("response")
        }
    ]
};

for(let messageType of exportObj.messageTypes){
    messageType.encode = (obj) => messageType.schema.encode(messageType.schema.create(obj)).finish();
    messageType.decode = (buf) => messageType.schema.decode(buf);
}

module.exports = exportObj;