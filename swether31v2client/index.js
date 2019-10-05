"use strict";
const ldaf = new (require('./Client'))({
    address: 'ws://192.168.42.161:8547',
    serviceDefs: [
        require('./serviceDef')
    ]
});

ldaf.on('bookEvent', (payload) => {
    console.log('got book event', payload)
});

ldaf.on('newBlock', (payload) => {
    console.log('got new block', payload)
});

ldaf.on('connected', () => {
    console.log("Connected to LDAF server");
});
