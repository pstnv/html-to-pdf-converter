import morgan from "morgan";
import accessLogStream from "../utils/accessLogStream.js";

// имя файла
morgan.token("status", (req, res) => {
    if (Math.floor(res.statusCode / 100) !== 2) {
        return `${res.statusCode} Конвертация прервана: ${res.errMessage}`;
    }
    return `${res.statusCode} Конвертация завершена успешно`;
});

// имя файла
morgan.token("filename", (req, res) => {
    const file = req.file;
    if (file && file.pdf) {
        return req.file.pdf.name;
    }
});

// память на конвертацию (весь запрос)
morgan.token("memory", (req, res) => {
    return `${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB`;
});

// время на конвертацию в секундах
morgan.token("response-time-seconds", function (req, res) {
    return Math.ceil(this["response-time"](req, res) / 1000) + "sec";
});


/*
- статус :status
- имя файла :filename
- дата выполнения операции :date[web] или [iso]
- время, затраченное на операцию по умолчанию в мс :response-time, custom - в секундах :response-time-seconds
- память, затраченная на операцию :memory
*/
const settings = ":date[web] :status :filename :response-time-seconds :memory";

// добавить поля settings, записать в файл
const logger = morgan(settings, {
    stream: {
        write: accessLogStream,
    },
});

export default logger;
