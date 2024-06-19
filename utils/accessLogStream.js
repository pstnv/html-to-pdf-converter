import fs from "fs";

const LOGFILE = "./access.log";

/*
flag  "a":
- if file doesn't exist - creates it
- opens file for recording
- add new record to the end of file
*/

const accessLogStream = function (message) {
    fs.writeFile(LOGFILE, message, { flag: "a" }, (error) => {
        if (error) {
            console.log("An error occurred while writing to logger", error);
        }
    });
};

export default accessLogStream;
