const Service = require('../Service');
class BasicMessageHandling extends Service([]) {
    constructor(){
        super('basicMessageHandling');

        this.on('add', (message, sendResponse) => {
            sendResponse('sum', {sum: (message.a + message.b)})
        })
    }
}
module.exports = new BasicMessageHandling();