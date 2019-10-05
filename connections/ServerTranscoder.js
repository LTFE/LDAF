"use strict";
module.exports = class ServerTranscoder {
    constructor(_opts){
        this.opts = {
            typeLen: 1,
            seqLen: 1
        };
        Object.assign(this.opts, _opts);
        Object.freeze(this.opts);
    }


    encodeInt(num, length){
        if(typeof num !== 'number' || num < 0 || num >= (256^length)){
            throw new Error(`can't encode ${num} into ${length} bytes`);
        }
        let out = Buffer.alloc(length);
        switch (length){
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


    readInt(buf){
        switch (buf.length){
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


    encode(type, seq, encodedMessage){
        if(!(encodedMessage instanceof Buffer)){
            console.error('ServerTranscoder error: encodedMessage is not a Buffer, it is:', encodedMessage);
            return;
        }
        try {
            return Buffer.concat([
                this.encodeInt(type, this.opts.typeLen),
                seq === 0 ? Buffer.alloc(0) : this.encodeInt(seq, this.opts.seqLen),
                encodedMessage
            ]);
        }
        catch (e){
            console.error('error in encoding', arguments, e);
        }
    }

    decode(messageBuffer){
        if(!Buffer.isBuffer(messageBuffer)){
            console.error(messageBuffer);
            throw "got invalid messageBuffer type in decoder. Probably because the client sent a string instead of binary data";
        }

        try {
            return {
                type: this.readInt(messageBuffer.slice(0, this.opts.typeLen)),
                seq: this.readInt(messageBuffer.slice(this.opts.typeLen, this.opts.typeLen + this.opts.seqLen)),
                payload: messageBuffer.slice(this.opts.typeLen + this.opts.seqLen)
            }
        }
        catch (e){
            console.error('error in decoding', arguments, e);
        }
    }
    /*
    Note:
    When encoding, the sequence number is omitted when the message is not a response to a request and does not need to be tracked in this way.
    The server can never receive a request encoded like this and can therefore assume the sequence number will always be present.

    The client will know which types are associated with responses and notifications, and will therefore be able to predict if the sequence number is there or not.
     */
};