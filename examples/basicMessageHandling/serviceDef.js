const Type = require('js-binary').Type;
const exportObj = {
    name: "basicMessageHandling",
    messageTypes: [
        {
            name: "add",
            type: "req",
            schema: new Type({
                a: 'int',
                b: 'int'
            })
        },
        {
            name: "sum",
            type: "res",
            schema: new Type({
                sum: 'int'
            })
        },
    ]
};

for(let messageType of exportObj.messageTypes){
    messageType.encode = messageType.schema.encode.bind(messageType.schema);
    messageType.decode = messageType.schema.decode.bind(messageType.schema);
}

module.exports = exportObj;