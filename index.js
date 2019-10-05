let result = require('dotenv').config();
if(result.error && result.error.code !== "ENOENT"){
    console.error(result.error);
}
module.exports = {
    eventEmitter: new(require('events'))
};
if(process.env.WEB3 === 'true') require('./web3Manager');
if(!(process.env.WS === 'false')) require('./connections/ws');