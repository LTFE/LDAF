const Service = require('../Service');
class Swether31 extends Service([
    'web3'
]) {
    constructor(){
        super('swether31');
        Object.assign(this, require('./sc'));

        this.on('checkTransaction', (message, sendResponse) => {
            if(message.txHash.length !== 32){
                this.clg('txHash length is wrong', message.txHash.length);
                return;
            }
            let txHash = '0x' + message.txHash.toString('hex');
            this.contractInstance.getPastEvents(
                'BookEvent',
                {
                    fromBlock: message.blockNumber,
                    toBlock: message.blockNumber
                },
                (err, list) => {
                    if(err) this.clg(err);
                    //the filter gets all events from that block and checks them
                    for (const listEvent of list) {
                        if (listEvent.transactionHash === txHash) {
                            sendResponse('checkTransaction', {
                                exists: true
                            });
                            return;
                        }
                    }
                    sendResponse('checkTransaction', {
                        exists: false
                    })
                }
            );
        })
    }

    init(){
        super.init();
        this.contractInstance = new this.web3.eth.Contract(this.contractABI, this.contractAddr);

        this.web3Subs.newBlockHeaders = this.web3.eth.subscribe('newBlockHeaders')
            .on('data', (newBlockHeaders) => {
                this.sendToAllConnections('newBlock', {
                    blockNumber: newBlockHeaders.number
                });
                this.clg('new block', newBlockHeaders.number);
            })
            .on("error",(error) => {
                this.clg( "blockHeaderError", error);
            });

        this.web3Subs.BookEvent = this.contractInstance.events.BookEvent({})
            .on("data", (event) => {
                this.sendToAllConnections('bookEvent', {
                    txHash: Buffer.from(event.transactionHash.slice(2), 'hex'),
                    blockNumber: event.blockNumber,
                    startTime: parseInt(event.returnValues.startTime),
                    chargingTime: parseInt(event.returnValues.chargingTime),
                    NFC: Buffer.from(event.returnValues.NFC.slice(2), 'hex'),
                    plugId: parseInt(event.returnValues.plugId)
                });
                this.clg('bookEvent');
            })
            .on("error", (error) => {
                this.clg("bookEvent error", error);
            });
    }

}
module.exports = new Swether31();