"use strict";

// import * as test from "./protobuf.js";
const {root} = protobuf.parse( //imported in HTML script tag
    'syntax = "proto3";' +
    'message bookEvent {' +
    '    bytes txHash = 1;' +
    '    fixed32 blockNumber = 2;' +
    '    fixed32 startTime = 3;' +
    '    uint32 chargingTime = 4;' +
    '    bytes NFC = 5;' +
    '    uint32 plugId = 6;' +
    '}' +
    'message checkTransactionReq {' +
    '    bytes txHash = 1;' +
    '    fixed32 blockNumber = 2;' +
    '}' +
    'message checkTransactionRes {' +
    '    bool exists = 1;' +
    '}' +
    'message newBlock {' +
    '    fixed32 blockNumber = 1;' +
    '}'
);
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

export default exportObj;