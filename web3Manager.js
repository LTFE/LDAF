let Web3;
try{
    Web3 = require('web3');
}
catch (e){
    console.error('Web3 module enabled, but the package is missing');
    process.exit();
}

if(!Web3.version || !Web3.version.startsWith('1.')){
    console.error('LDAF is designed to use Web3 version 1.X.X. Please install the correct version');
    process.exit();
}

const startWeb3 = initWeb3Provider(),
    ee = require.main.exports.eventEmitter;

function initWeb3Provider() {
    if (process.env.WEB3_CONNECTION_TYPE === "ipc") {
        const ipcpath = process.env.WEB3_IPC_PATH || `${require('os').userInfo().homedir}/.ethereum/testnet/geth.ipc`,
            net = require('net');
        console.log('using IPC provider at:', ipcpath);
        return () => new Web3(new Web3.providers.IpcProvider(ipcpath, net))
    }
    else if (process.env.WEB3_CONNECTION_TYPE === "ws") {
        const wsAddr = process.env.WEB3_WS_ADDR || 'ws://localhost:8546';
        console.log('using WS provider at:', wsAddr);
        return () => new Web3(new Web3.providers.WebsocketProvider(wsAddr));
    }
    else {
        console.error('invalid web3 connection type', process.env.WEB3_CONNECTION_TYPE);
        process.exit(1);
    }
}

let web3, provider;

function connect() {
    console.log('connecting to Ethereum node...');
    web3 = startWeb3();
    provider = web3.currentProvider;

    provider.on('end', function () {
        console.log('end');
        disconnect();
        setTimeout(connect, 5000);
    });

    provider.on('connect', function () {
        console.log('connected to Ethereum node');
        init();
    });

    provider.on('error', function () {
        console.log('web3 connection error');
        disconnect();
        setTimeout(connect, 5000);
    });

    provider.on('finish', function (a,b,c,d) {
        console.log('finish', arguments);
        disconnect();
        setTimeout(connect, 5000);
        ee.emit('gethConnectionLost')
    });
}

function disconnect() {
    for (const event of ['end', 'connect', 'error', 'finish']){
        provider.removeAllListeners(event);
    }
    module.exports = null;
    web3 = null;
    provider = null;
}

function init() {
    module.exports = web3;
    ee.emit('newWeb3', web3);
}
connect();