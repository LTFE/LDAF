let cp = require("child_process");

let numberOfProcesses = parseInt(process.argv[2]);
if(typeof numberOfProcesses !== "number"){
    console.log("invalid arguments");
    return;
}

let childProcesses = [];

for(let i = 0; i < numberOfProcesses; i++) {
    childProcesses.push(cp.fork("./index.js", [], {silent: true}))
    console.log("spawned " + i);

}