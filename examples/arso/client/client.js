"use strict";
const ldaf = new (require('../../../Client'))({
    address: 'ws://localhost:8547',
    serviceDefs: [
        require('./serviceDef')
    ]
});
ldaf.on('connected', () => {
    ldaf.callServerFn('getTemperature', {}, console.log.bind(null, 'The temperature in ljubljana is:'));
});
