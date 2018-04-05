"use strict";
const ldaf = new (require('../Client'))({
    address: 'ws://localhost:8547',
    serviceDefs: [
        require('./serviceDefs/genericWeb3'),
        require('./serviceDefs/swether31'),

        // require('./schemas/basicMessageHandling')
    ]
});

ldaf.on('bookEvent', function (payload) {
    console.log('got book event', payload)
});

ldaf.on('newBlock', function (payload) {
    console.log('got new block', payload)
});

ldaf.on('connected', function test() {
    ldaf.callServerFn( 'blockNumber', {}, (res) => {
        console.log('block number', res);
    });
    ldaf.callServerFn( 'isSyncing', {}, (res) => {
        console.log('isSyncing', res);
    });
    ldaf.callServerFn( 'getTransaction', {
        txHash: Buffer.from('034a6a15b42c51f34b1c4ff9d7448912216e28c425f41e6f7e4f56b458626527', 'hex')
    }, (res) => {
        console.log('getTransaction', res);
    });
    //the following should fail
    ldaf.callServerFn( 'getTransaction', {
        txHash: Buffer.from('134a6a15b42c51f34b1c4ff9d7448912216e28c425f41e6f7e4f56b458626527', 'hex')
    }, (res) => {
        console.log('getTransaction - should fail', res);
    });
    ldaf.callServerFn( 'gasPrice', {}, (res) => {
        console.log('gasPrice', res);
    });
    ldaf.callServerFn( 'balance', {
        address: Buffer.from('EF9830802eEdF5CEF8A1BD4e06789E41b475112f', 'hex')
    }, (res) => {
        console.log('balance', res);
    });
    ldaf.callServerFn( 'checkTransaction', {
        txHash: Buffer.from('034a6a15b42c51f34b1c4ff9d7448912216e28c425f41e6f7e4f56b458626527', 'hex'),
        blockNumber: 2434097
    }, (res) => {
        console.log('verify transaction (swether 3.1)', res);
    });
    //the following should fail
    ldaf.callServerFn( 'checkTransaction', {
        txHash: Buffer.from('034a6a15b42c51f34b1c4ff9d7448912216e28c425f41e6f7e4f56b458626527', 'hex'),
        blockNumber: 2434098
    }, (res) => {
        console.log('verify transaction (swether 3.1) - should fail', res);
    });

    // basic message handling example test
    // ldaf.callServerFn( 16, {
    //     a: 4,
    //     b: 6
    // }, (res) => {
    //     console.log('basic message handling', res);
    // });
});