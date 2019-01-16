"use strict";
const ldaf = new (require('./Client'))({
    address: 'ws://localhost:8547',
    serviceDefs: [
        require('./serviceDef')
    ]
});
ldaf.on('connected', () => {
    let url = process.argv[2];

    if(!url) {
        console.error("no URL specified");
        return;
    }
    console.log("using url:", url);

    ldaf.callServerFn('diff', {
        newFileUrl: url,
        hash: Buffer.from("711e79c417181a3845d386c5640bc581")
    }, (res) => {
        console.log(res.res.length);
    });

});
