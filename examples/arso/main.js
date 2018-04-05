const Service = require('../Service');
const http = require('http');
const parseString = require('xml2js').parseString;

const getTemperature = function getTemperature(cb){
    http.get('http://meteo.arso.gov.si/uploads/probase/www/observ/surface/text/sl/observation_LJUBL-ANA_BEZIGRAD_latest.xml', (resp) => {
        let data = '';
        resp.on('data', (chunk) => {
            data += chunk;
        });
        resp.on('end', () => {
            parseString(data, function (err, obj) {
                try {
                    cb(parseFloat(obj.data.metData[0].t[0]))
                }
                catch (e){
                    console.error(e);
                }
            })
        });
    })
};

class Arso extends Service([]) {
    constructor(){
        super('arso');

        this.on('getTemperature', (message, sendResponse) => {
            getTemperature((temp) => {
                sendResponse('returnTemperature', {temp})
            })
        });
    }
}
module.exports = new Arso();