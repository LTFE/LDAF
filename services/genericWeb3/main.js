const Service = require('../Service');
class GenericWeb3 extends Service([
    'web3'
]) {
    constructor(){
        super('genericWeb3');

        this.on('blockNumber', (message, sendResponse) => {
            this.web3.eth.getBlockNumber((err, res) => {
                if(err) {
                    this.clg(err)
                }
                else {
                    sendResponse('blockNumber', {
                        blockNumber: res
                    })
                }
            });
        });

        this.on('isSyncing', (message, sendResponse) => {
            this.web3.eth.isSyncing((err, res) => {
                if(err) {
                    this.clg(err)
                }
                else {
                    sendResponse('isSyncing', {
                        isSyncing: res ? 1 : 0
                    });
                }
            });
        });

        this.on('getTransaction', (message, sendResponse) => {
            if (message.txHash.length !== 32) {
                this.clg('txHash length is wrong', message.txHash.length);
                return;
            }
            this.web3.eth.getTransaction('0x' + message.txHash.toString('hex'))
                .then((res) => {
                    if(res){
                        sendResponse('getTransaction', {
                            from: Buffer.from(res.from.slice(2), 'hex'),
                            to: Buffer.from(res.to.slice(2), 'hex'),
                            value: parseFloat(this.web3.utils.fromWei(res.value, 'ether')),
                            blockNumber: res.blockNumber
                        })
                    }
                    else {
                        sendResponse('getTransaction', {
                            from: Buffer.from('', 'hex'),
                            to: Buffer.from('', 'hex'),
                            value: 0,
                            blockNumber: 0
                        })
                    }
                });
        });

        this.on('gasPrice', (message, sendResponse) => {
            this.web3.eth.getGasPrice((err, res) => {
                if(err) {
                    this.clg(err)
                }
                else {
                    sendResponse('gasPrice', {
                        gasPrice: parseFloat(this.web3.utils.fromWei(res, 'ether'))
                    });
                }
            });
        });

        this.on('balance', (message, sendResponse) => {
            if(message.address.length !== 20){
                this.clg('txHash length is wrong', message.txHash);
                return;
            }
            this.web3.eth.getBalance('0x' + message.address.toString('hex'),(err, res) => {
                if(err) {
                    this.clg(err)
                }
                else {
                    sendResponse('balance', {
                        balance: parseFloat(this.web3.utils.fromWei(res, 'ether'))
                    });
                }
            });
        });

        this.on('sendRawTransaction', (message, sendResponse) => {
            //TODO: This function needs testing
            this.web3.eth.sendSignedTransaction('0x' + message.rawTransaction.toString('hex'))
                .on('receipt', this.clg)
                .on('error', this.cle);
        });
    }

    init(){
        super.init();
        this.web3Subs.syncing = this.web3.eth.subscribe('syncing')
            .on("changed",(data) => {
                this.sendToAllConnections('isSyncing', {
                    isSyncing: data ? 1 : 0
                });
            });
    }
}
module.exports = new GenericWeb3();