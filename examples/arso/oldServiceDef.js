const Type = require('js-binary').Type;
const exportObj = {
    name: "arso",
    messageTypes: [
        {
            name: "getTemperature",
            type: "req",
            schema: new Type({})
        },
        {
            name: "returnTemperature",
            type: "res",
            schema: new Type({
                temp: "float"
            })
        },

    ]
};

for(let messageType of exportObj.messageTypes){
    messageType.encode = messageType.schema.encode.bind(messageType.schema);
    messageType.decode = messageType.schema.decode.bind(messageType.schema);
}

module.exports = exportObj;