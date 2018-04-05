require('dotenv').load();
module.exports = {
    eventEmitter: new(require('events'))
};
if(!(process.env.WEB3 === 'false'))require('./web3Manager');
if(!(process.env.WS === 'false'))require('./connections/ws');