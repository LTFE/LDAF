'use strict';
const extensions = {
    web3: function() {
        this.on('constructor', () => {
            this.web3Subs = {};
            this.ee.on('gethConnectionLost', () => {
                this.stopSubs()
            });
            this.ee.on('newWeb3', (web3) => {
                if (this.connections.length === 0) return;
                this.web3 = web3;
                this.init();
            });
        });
        this.on('init', () => {
            if(!this.web3) {
                try {
                    this.web3 = require('../web3Manager');
                }
                catch (e){
                    this.cle('cant require Web3. Are you sure its installed?');
                    process.exit();
                }
            }
        });
        this.on('stopSubs', () => {
            for (const key of Object.keys(this.web3Subs)) {
                this.web3Subs[key].unsubscribe((err, success) => {
                    if (err) {
                        this.clg('unsub error', key, err);
                    }
                    this.clg('unsub', key, success);
                    delete this.web3Subs[key];
                });
            }
        })
    }
};

class Service extends require('events'){

    constructor(serviceName){
        super();
        //TODO: use the name of the object instead of passing in a parameter
        this.ee = require.main.exports.eventEmitter;
        this.serviceName = serviceName || this.constructor.name;
        this.clg = console.log.bind(null, (process.env.DEBUG_TIME === "true" ? new Date() : "") +this.serviceName);
        this.cle = console.error.bind(null, this.serviceName);
        this.connections = [];

        this.extensions = this.__proto__.__proto__.constructor.extensions;
        for (const extension of this.extensions){
            extension.call(this);
        }

        try {
            this.serviceDef = require('../services/' + this.serviceName + '/serviceDef');
            if(this.serviceName !== this.serviceDef.name){
                this.cle(`service \"${this.serviceName}\" imported a service definition that doesn\'t belong to it \"${this.serviceDef}\"`);
                process.exit();
            }
            this.messageTypeArray = this.serviceDef.messageTypes;
            this.typeCount = this.messageTypeArray.length;
            for (let i in this.messageTypeArray){
                this.messageTypeArray[i].number = parseInt(i);
            }
        }
        catch (e){
            this.cle(`Error with serviceDef`, e);
            this.emit('error', e);
            process.exit();
        }

        this.emit('constructor', serviceName);
    }

    newConnection(connection){

        if (!connection.conn.services.includes(this.serviceName)) {
            this.cle('tried to add wrong connection', connection.conn.services);
            return;
        }
        this.clg('new connection');
        if (this.connections.length === 0){
            this.init();
        }
        this.connections.push(connection);

        connection.conn.on('close', () => {
            this.connections = this.connections.filter(item => item.conn !== connection.conn);
            if(this.connections.length === 0){
                this.stopSubs();
            }
        });

        connection.conn.on('message', (message) =>{
            let correctedMessageType = message.type - connection.offset;

            //this message was not intended for this service
            if(correctedMessageType < 0 || correctedMessageType >= this.typeCount) return;

            message.type = correctedMessageType;

            try {
                message.payload = this.messageTypeArray[message.type].decode(message.payload)
            }
            catch (e){
                this.cle('error in decode', e, message);
                return;
            }
            this.emit(
                this.messageTypeArray[message.type].name,
                message.payload,
                this.sendToConnection.bind(this, connection, message.seq)
            );
        });

        this.emit('newConnection', connection)
        // this.emit.apply(this,['newConnection'].concat(arguments))
    }

    init(){
        this.clg('init');
        this.emit('init');
    }

    stopSubs(){
        this.clg('stopSubs');
        this.emit('stopSubs');
    }

    sendToAllConnections(type, messageObj){
        let messageType = this.getMessageType(type, 0);//seq is always 0 when broadcasting
        let encodedMessage;
        try {
            encodedMessage = messageType.encode(messageObj);
        }
        catch (e){
            this.cle('error in encoding with schema',
                {
                    type,
                    messageType,
                    messageObj
                })
        }
        for (const connection of this.connections){
            //seq is always 0 when broadcasting
            connection.conn.send(messageType.number + connection.offset, 0, encodedMessage);
        }
    }
    
    sendToConnection(connection, seq, type, messageObj){
        let messageType = this.getMessageType(type, seq);
        let encodedMessage;
        try {
            encodedMessage = messageType.encode(messageObj);
        }
        catch (e){
            this.cle('error in encoding with schema',
                {
                    type,
                    messageType,
                    messageObj
                })
        }
        connection.conn.send(messageType.number + connection.offset, seq, encodedMessage);

        this.emit('sendToConnection', connection, type, seq, messageObj)
        
    }

    getMessageType(type, seq){
        switch (typeof type) {
            case 'number':
                return this.messageTypeArray[type];
            case 'string':
                return this.messageTypeArray.find(
                    element =>
                    element.name === type &&
                    element.type === (seq === 0 ? 'psh' : 'res')
                );
            default:
                return type
        }
    }
}

module.exports = (requiredExtensions) => {
    Service.extensions = [];
    for (const extension of requiredExtensions) {
        if(typeof extension === 'function'){
            Service.extensions.push(extension);
        }
        else if(typeof extension === 'string'){
            Service.extensions.push(extensions[extension]);
        }
    }
    return Service;
};