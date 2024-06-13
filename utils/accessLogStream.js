import fs from "fs";

const LOGFILE = "./access.log";


// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(LOGFILE, { flags: "a" });


export default accessLogStream;