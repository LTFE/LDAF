const Service = require('../Service');

class Swether31v2 extends Service([
    'web3'
]) {
    constructor(){
        super('swether31v2');
        Object.assign(this, require('./sc'));
        this.bookings = [];

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

    checkEvent (booking, callback) {
        try {
            this.contractInstance.getPastEvents(
                'BookEvent',
                {
                    fromBlock: booking.blockNumber,
                    toBlock: booking.blockNumber
                },
                function (err, list) {
                    //the filter gets all events from that block and checks them
                    for (const listEvent of list) {
                        if (listEvent.transactionHash === (booking.txHash)) {
                            callback(true);
                            return;
                        }
                    }
                    callback(false);
                }
            );
        }
        catch (e){
            console.log(e);
        }
    }

    checkBookings(currentBlockNumber){
        for (let booking of this.bookings) {
            //booking has not been confirmed yet AND it is old enough. the number is the number of blocks BETWEEN the event's block and the block in which it will be tested.
            if (booking.blockNumber <= currentBlockNumber - 3) {
                this.checkEvent(
                    booking,
                    (exists) => {
                        if(exists){
                            this.clg("Booking event verified. Sending to device");
                            this.sendToAllConnections("bookEvent", {
                                    startTime: new Date(booking.startTime * 1000),
                                    chargingTime: new Date(booking.chargingTime * 1000),
                                    plugId: booking.plugId
                                })
                        }
                        else {
                            this.clg("Booking event couldn't be verified")
                        }
                        this.bookings.splice(this.bookings.indexOf(this, 1));
                    }
                );
            }
        }
    }

    init(){
        super.init();
        this.contractInstance = new this.web3.eth.Contract(this.contractABI, this.contractAddr);

        this.web3Subs.newBlockHeaders = this.web3.eth.subscribe('newBlockHeaders')
            .on('data', (newBlockHeaders) => {
                console.log("new block", newBlockHeaders.number);
                this.checkBookings(newBlockHeaders.number);
                if(!(newBlockHeaders.number%2 === 0)) return;
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
                this.bookings.push({
                    blockNumber: event.blockNumber,
                    txHash: event.transactionHash,
                    ...event.returnValues
                });
                this.clg('bookEvent', event.transactionHash);
            })
            .on("error", (error) => {
                this.clg("bookEvent error", error);
            });
    }

}
module.exports = new Swether31v2();