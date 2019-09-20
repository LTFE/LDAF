'use strict';
const WebSocket = require('ws');
const querystring = require("querystring");
const fs = require('fs');
const path = require('path');
const http = require("http");
const transcoder = new (require('./ServerTranscoder'))({
    typeLen: 1,
    seqLen: 1
});
const clg = console.log.bind(null, 'ws');
const cle = console.error.bind(null, 'ws');

const httpServer = http.createServer();
httpServer.listen(process.env.WS_PORT || 8547)

const wss = new WebSocket.Server({
    server: httpServer
});


wss.on('listening', function () {
    clg('server listening', wss.address());
});


wss.on('error', function (a,b,c,d) {
    cle('error', arguments);
});


wss.on('connection', function newConnection(ws, req) {

    let params = querystring.parse(req.url.substr(1));

    if(!params.s) {
        ws.send('missing services info. disconnecting');
        clg('missing services info. disconnecting');
        ws.close();
        return;
    }

    let services;

    if(Array.isArray(params.s)){
        services = params.s;
    }
    else {
        services = [params.s];
    }

    let conn = new Connection(ws, req, services);
    clg('new connection. services:', services);

    let currentOffset = 0;
    for(let serviceName of services) {
        let serviceLocation = path.resolve('./services/' + serviceName + '/main.js');
        if(!fs.existsSync(serviceLocation)){
            cle(`Service ${serviceName} not found at ${serviceLocation}`);
            continue;
        }
        //TODO: find a way to maintain the correct order of services without using synchronous functions
        try {
            let service = require(serviceLocation);
            service.newConnection({conn, offset: currentOffset});
            currentOffset += service.typeCount;
            conn.serviceCount++
        }
        catch (e) {
            clg('error starting service', serviceName, e);
        }
    }
    if(conn.serviceCount === 0){
        clg('connection didn\'t use any services. disconnecting');
        conn.ws.send('no valid services specified');
        conn.close();
    }
});


class Connection extends require('events'){
    constructor(ws, req, services){
        super();
        ws._socket.setKeepAlive(true, 30*60*1000);
        this.type = 'ws';
        this.services = services;
        this.serviceCount = 0;

        //the following only exist in websocket connections
        this.ws = ws;
        this.req = req;

        ws.on('message', (rawMessage) => {
            let message;
            try {
                message = transcoder.decode(rawMessage)
            }
            catch (e){
                this.emit('error', e);
                clg('couldnt decode raw message', rawMessage);
            }
            this.emit('message', message);
        });

        ws.on('end', () => {

        });

        ws.on('close', () => {
            this.close();
            clg('connection closed');
        });
        ws.on('error', (e) => {
            this.emit('error', e);
            clg('connection errored');
            this.close();
        })
    }

    send(type, seq, encodedMessage){
        this.ws.send(transcoder.encode(
            type,
            seq,
            encodedMessage
        ));
    }

    close(){
        clg('closing websocket connection');
        this.ws.close();
        this.emit('close');
    }
}