import fs from "fs";

const LOGFILE = "./access.log";

// create a write stream (in append mode)
// создает файл один раз
// не создает файл зановое, если он был удален
// const accessLogStream = fs.createWriteStream(LOGFILE, { flag: "a" });

/*
флаг  "a":
- если файл не существует, создает его
- открывает файл для записи
- добавляет новую запись в конце файла
*/

const accessLogStream = function (message) {
    fs.writeFile(LOGFILE, message, { flag: "a" }, (error) => {
        if (error) {
            console.log("Ошибка записи лога", error);
        }
    });
};

export default accessLogStream;


