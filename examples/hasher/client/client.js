"use strict";
const ldaf = new (require('../../../Client'))({
    address: 'ws://localhost:8547',
    serviceDefs: [
        require('./serviceDef')
    ]
});
setInterval(console.log.bind("asd"), 5000);
ldaf.on('connected', () => {
    ldaf.callServerFn('getHash', {
        data: Buffer.from("Hash Me Pls"),
        algorithm: "SHA512"
    }, console.log.bind(null, 'The hash is: '));
});
