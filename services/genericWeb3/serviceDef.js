const Type = require('js-binary').Type;
const emptyType = new Type({});
const exportObj = {
    name: 'genericWeb3',
    messageTypes:
        [
            {
                name: 'blockNumber',
                type: 'req',
                schema: emptyType
            },
            {
                name: 'blockNumber',
                type: 'res',
                schema: new Type({
                    blockNumber: 'uint'
                })
            },


            {
                name: 'isSyncing',
                type: 'req',
                schema: emptyType
            },
            {
                name: 'isSyncing',
                type: 'psh',
                schema: new Type({
                    isSyncing: 'uint'
                })
            },
            {
                name: 'isSyncing',
                type: 'res',
                schema: new Type({
                    isSyncing: 'uint'
                })
            },


            {
                name: 'getTransaction',
                type: 'req',
                schema: new Type({
                    txHash: 'Buffer'
                })
            },
            {
                name: 'getTransaction',
                type: 'res',
                schema: new Type({
                    from: 'Buffer',
                    to: 'Buffer',
                    value: 'float',
                    blockNumber: 'uint'
                })
            },


            {
                name: 'gasPrice',
                type: 'req',
                schema: emptyType
            },
            {
                name: 'gasPrice',
                type: 'res',
                schema: new Type({
                    gasPrice: 'float'
                })
            },


            {
                name: 'balance',
                type: 'req',
                schema: new Type({
                    address: "Buffer"
                })
            },
            {
                name: 'balance',
                type: 'res',
                schema: new Type({
                    balance: 'float'
                })
            },


            {
                name: 'sendRawTransaction',
                type: 'req',
                schema: new Type({
                    signedTransaction: "Buffer"
                })
            },
            {
                name: 'sendRawTransaction',
                type: 'res',
                schema: new Type({
                    success: 'uint'
                })
            }
        ]
};


for(let messageType of exportObj.messageTypes){
    messageType.encode = messageType.schema.encode.bind(messageType.schema);
    messageType.decode = messageType.schema.decode.bind(messageType.schema);
}

module.exports = exportObj