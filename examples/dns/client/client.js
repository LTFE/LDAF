"use strict";
const ldaf = new (require('../../../Client'))({
    address: 'ws://localhost:8547',
    serviceDefs: [
        require('./serviceDef')
    ]
});
ldaf.on('connected', () => {
    ldaf.callServerFn('lookup', {
        hostname: "ltfe.org"
    }, console.log.bind(null, 'ltfe.org is on'));

    ldaf.callServerFn('reverse', {
        ip: "216.58.194.142"
    }, console.log.bind(null, '216.58.194.142 resolves to:'))
});
