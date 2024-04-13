import AdmZip from "adm-zip";
import path from "path";
import { CustomError } from "../errors/index.js";

const unzipController = (req, res, next) => {
    const { tempFilePath: zipFilePath, name: zipName } = req.file;
    // создаем путь папки, в которую будет извлечен архив
    // она будет находиться в той же временной папке, имя папки = имя архива
    const unzippedFolderPath = path.resolve(path.dirname(zipFilePath), zipName);

    // распаковываем архив в папку unzippedFolderPath
    try {
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(unzippedFolderPath, true);
    } catch (error) {
        console.log(error);
        throw new CustomError("Что-то пошло не так на этапе извлечения архива")
    }
    // добавляем в req.file данные о папке, в которую извлечен архив
    req.file.unzippedFolder = {
        path: unzippedFolderPath,
        name: zipName,
    };

    next();
};

export default unzipController;