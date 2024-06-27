import morgan from "morgan";
import accessLogStream from "../utils/accessLogStream.js";

// status
morgan.token("status", (req, res) => {
    if (Math.floor(res.statusCode / 100) !== 2) {
        return `${res.statusCode} Conversion aborted: ${res.errMessage}`;
    }
    return `${res.statusCode} Conversion completed successfully`;
});

// filename
morgan.token("filename", (req, res) => {
    const file = req.file;
    if (file && file.pdf) {
        return req.file.pdf.name;
    }
});

// memory on conversion (all request)
morgan.token("memory", (req, res) => {
    return `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`;
});

morgan.token(
    "response-time-seconds",
    function (req, res) {
        return Math.ceil(this["response-time"](req, res) / 1000) + "sec";
    }
);

/*
- status :status
- name of file :filename
- date of conversion :date[web] or [iso]
- time spent on conversion in seconds :response-time-seconds or simpy in ms :response-time
- memory spent on conversion :memory
*/
const settings = ":date[web] :status :filename :response-time-seconds :memory";

// add prop settings, save to the file
const logger = morgan(settings, {
    stream: {
        write: accessLogStream,
    },
});

export default logger;
