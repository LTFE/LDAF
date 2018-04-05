"use strict";
const ldaf = new (require('../../../Client'))({
    address: 'ws://localhost:8547',
    serviceDefs: [
        require('./serviceDef')
    ]
});
ldaf.on('connected', () => {
    ldaf.callServerFn('add', {
        a: 4,
        b: 6
    }, console.log.bind(null, 'The sum is:'));
});
