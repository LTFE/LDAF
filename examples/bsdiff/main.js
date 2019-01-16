const Service = require('../../services/Service');
const wget = require("node-wget");
const bsdiff = require('bsdiff-nodejs');

const fs = require('fs-extra');

class BsDiff extends Service([]) {
    constructor(){
        super('bsdiff');

        this.on('diff',async (message, sendResponse) => {
            let oldFile = `${__dirname}/oldFile`;
            let newFile = `${__dirname}/tmp_bsdiff_newFile` + Date.now();
            let patchFile = `${__dirname}/tmp_bsdiff_patchFile` + Date.now();
            wget({
                url: message.newFileUrl,
                dest: newFile
            }, async (err) => {
                if(err){
                    this.cle(err)
                }


                try {
                    if(!(await fs.exists(oldFile))) {
                        this.clg("file missing. Generating one");
                        await fs.writeFile(oldFile, "");
                    }
                    // await fs.writeFile(newFile, message.newFile);
                    await fs.writeFile(patchFile, Buffer.from([]));
                }
                catch (e) {
                    this.cle(e)
                }
                bsdiff.diff(oldFile, newFile, patchFile, async function (res, err) {
                    if(err){
                        this.cle(err)
                    }
                    // let finishedFile = fs.readFileSync(patchFile);
                    // console.log(fs.readFileSync(patchFile));
                    let response = fs.readFileSync(patchFile);
                    if(response.length < 10) return;
                    sendResponse("diff", {res: response});
                    [
                        newFile,
                        patchFile
                    ].forEach(file => {
                        fs.unlink(file, (err) => {
                            if(err){
                                if(err.code === 'ENOENT') {
                                    console.log(file, "not found")
                                }
                                this.cle(err);
                            }
                        })

                });
            });
        });


    }
}
module.exports = new BsDiff();