const Type = require('js-binary').Type;
const exportObj = {
    name: "dns",
    messageTypes: [
        {
            name: "lookup",
            type: "req",
            schema: new Type({
                hostname: 'string'
            })
        },
        {
            name: "lookup",
            type: "res",
            schema: new Type({
                ip: "string"
            })
        },


        {
            name: "reverse",
            type: "req",
            schema: new Type({
                ip: 'string'
            })
        },
        {
            name: "reverse",
            type: "res",
            schema: new Type({
                hostnames: ["string"]
            })
        },


        {
            name: "error",
            type: "res",
            schema: new Type({
                code: 'string'
            })
        },
    ]
};

for(let messageType of exportObj.messageTypes){
    messageType.encode = messageType.schema.encode.bind(messageType.schema);
    messageType.decode = messageType.schema.decode.bind(messageType.schema);
}

module.exports = exportObj;