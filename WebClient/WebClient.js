"use strict";
// import events from "./events.js";

export default class Client extends EventEmitter{

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

        let encodedServices = this.services.map(s => `s=${s}`);

        console.log(opts.address + encodedServices.join("&"));

        this.ws = new WebSocket(opts.address + "/" + encodedServices.join("&"));
        this.ws.binaryType = 'arraybuffer';

        this.ws.addEventListener("error", console.error);

        this.ws.addEventListener("closed", () => {
            console.log("ws closed")
        });

        this.ws.addEventListener('open', () => {
            this.emit('connected');//TODO: separate client and message event emitters
            this.ws.addEventListener('message', (encodedMessage) => {
                let ab = encodedMessage.data;
                let message = this.transcoder.decode(ab);

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
}

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
        if(![1,2,4].includes(length)){
            throw new Error('invalid UInt length ' + length);
        }

        if (typeof num !== 'number' || num < 0 || num >= (256 ^ length)) {
            throw new Error(`can't encode ${num} into ${length} bytes`);
        }
        let out = new ArrayBuffer(length);
        let dv = new DataView(out);
        switch (length) {
            case 1:
                dv.setUint8(0,num);
                break;
            case 2:
                dv.setUint16(0,num);
                break;
            case 4:
                dv.setUint32(0,num);
                break;

        }
        return dv.buffer;
    }


    readInt(ab) {
        let dv = new DataView(ab);
        switch (ab.byteLength) {
            case 1:
                return dv.getUint8();
            case 2:
                return dv.getUint16();
            case 4:
                return dv.getUint32();
            default:
                throw new Error('invalid UInt length ' + ab.byteLength);
        }
    }


    encode(type, seq, encodedMessage) {
        try {
            let out = new Uint8Array(this.opts.typeLen + this.opts.seqLen + encodedMessage.length);

            out.set(new Uint8Array(this.encodeInt(type, this.opts.typeLen)));
            out.set(new Uint8Array(this.encodeInt(seq, this.opts.seqLen)), this.opts.typeLen);
            out.set(encodedMessage, this.opts.typeLen + this.opts.seqLen);

            return out;
        }
        catch (e) {
            console.error('error in encoding', arguments, e);
        }
    }


    decode(ab) {
        try {
            let type = this.readInt(ab.slice(0, this.opts.typeLen));
            let seq = this.opts.eventTypes.includes(type) ? 0 : this.readInt(ab.slice(this.opts.typeLen, this.opts.typeLen + this.opts.seqLen));

            return {
                type,
                seq,
                payload: new Uint8Array(ab.slice(this.opts.typeLen + (seq === 0 ? 0 : this.opts.seqLen)))
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