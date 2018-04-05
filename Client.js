"use strict";
const WebSocket = require('ws');
module.exports = class Client extends require('events'){

    constructor(opts){
        /*
        address - LDAF server address
        serviceDefs - array of service definitions
        seqLen - number of bytes for sequence number
        typeLen - number of bytes for type number

         */
        //address, schemas, eventTypes, transcoderOptions
        super();

        this.parseServiceDefs(opts.serviceDefs);

        this.transcoder = new ClientTranscoder({
            typeLen: opts.typeLen || 1,
            seqLen: opts.seqLen || 1,
            eventTypes: this.eventTypes
        });

        this.opts = opts;
        this.activeRequests = [];

        this.seq = 0;
        this.maxSeq = (256^this.transcoder.seqLen) - 1;

        this.ws = new WebSocket(opts.address, [],{
            headers: {
                services: this.services.join(',')
            }
        });

        this.ws.on('open', () => {
            this.emit('connected');//TODO: separate client and message event emitters
            this.ws.on('message', (encodedMessage) => {
                let message = this.transcoder.decode(encodedMessage);

                let messageType;
                try {
                    messageType = this.messageTypeArray[message.type];
                    message.payload = messageType.decode(message.payload);
                }
                catch (e){
                    console.error('failed to decode payload', message);
                    console.error(e);
                    return;
                }
//TODO: handle rejections from the server

                if(message.seq === 0){
                    if(!this.eventTypes.includes(message.type)){
                        console.log('Got seq = 0 with non-event type. Check your event types and services');
                        return;
                    }
                    this.emit(messageType.name, message.payload);

                }
                else {
                    if(this.activeRequests[message.seq]){
                        this.activeRequests[message.seq].cb(message.payload);
                        delete this.activeRequests[message.seq];
                    }
                    else {
                        console.log('got response without requesting it')
                    }
                }
            })
        })
    }


    callServerFn(type, obj, cb) {
        let currentSeq = this.stepSeq();
        let messageType = this.getMessageType(type);
        if(this.activeRequests[currentSeq]){
            //in practice there will always be sequence numbers free unless there is a serious issue
            console.log('sequence number taken', this.activeRequests);
            return;
        }
        this.activeRequests[currentSeq] = {
            type,
            seq: currentSeq,
            cb
        };
        this.ws.send(this.transcoder.encode(messageType.number, currentSeq, messageType.encode(obj)));

    }

    parseServiceDefs (serviceDefs){
        this.services = [];
        let tmp = [];
        for(const serviceDef of serviceDefs) {
            this.services.push(serviceDef.name);
            tmp.push(serviceDef.messageTypes);
        }
        this.messageTypeArray = [].concat.apply([], tmp);
        this.eventTypes = [];
        for (const i in this.messageTypeArray){
            this.messageTypeArray[i].number = parseInt(i);
            if (this.messageTypeArray[i].type === 'psh'){
                this.eventTypes.push(parseInt(i));
            }
        }
    }

    getMessageType(input){
        switch (typeof input) {
            case 'number':
                return this.messageTypeArray[input];
            case 'string':
                return this.messageTypeArray.find(element => element.name === input && element.type === 'req');
            default:
                return input
        }
    }

    stepSeq(){
        this.seq++;
        if(this.seq >= this.maxSeq) this.seq = 1;
        return this.seq;
    }
};

class ClientTranscoder {
    constructor(_opts) {
        this.opts = {
            typeLen: 1,
            seqLen: 1,
            eventTypes: []
        };
        Object.assign(this.opts, _opts);
        Object.freeze(this.opts);
    }


    encodeInt(num, length) {
        if (typeof num !== 'number' || num < 0 || num >= (256 ^ length)) {
            throw new Error(`can't encode ${num} into ${length} bytes`);
        }
        let out = Buffer.alloc(length);
        switch (length) {
            case 1:
                out.writeUInt8(num);
                break;
            case 2:
                out.writeUInt16BE(num);
                break;
            case 4:
                out.writeUInt32BE(num);
                break;
            default:
                throw new Error('invalid UInt length ' + length);
        }
        return out
    }


    readInt(buf) {
        switch (buf.length) {
            case 1:
                return buf.readUInt8();
            case 2:
                return buf.readUInt16BE();
            case 4:
                return buf.readUInt32BE();
            default:
                throw new Error('invalid UInt length ' + buf.length);
        }
    }


    encode(type, seq, encodedMessage) {
        try {
            return Buffer.concat([
                this.encodeInt(type, this.opts.typeLen),
                this.encodeInt(seq, this.opts.seqLen),
                encodedMessage
            ]);
        }
        catch (e) {
            console.error('error in encoding', arguments, e);
        }
    }


    decode(messageBuffer) {
        try {
            let type = this.readInt(messageBuffer.slice(0, this.opts.typeLen));
            if (this.opts.eventTypes.includes(type)) {
                return {
                    type,
                    seq: 0,
                    payload: messageBuffer.slice(this.opts.typeLen)
                }
            }
            return {
                type: this.readInt(messageBuffer.slice(0, this.opts.typeLen)),
                seq: this.readInt(messageBuffer.slice(this.opts.typeLen, this.opts.typeLen + this.opts.seqLen)),
                payload: messageBuffer.slice(this.opts.typeLen + this.opts.seqLen)
            }
        }
        catch (e) {
            console.error('error in decoding', arguments, e);
        }
        /*
    Note:
    When encoding, the sequence number is omitted when the message is not a response to a request and does not need to be tracked in this way.
    The server can never receive a request encoded like this and can therefore assume the sequence number will always be present.

    The client will know which types are associated with responses and notifications, and will therefore be able to predict if the sequence number is there or not.
     */
    }
}