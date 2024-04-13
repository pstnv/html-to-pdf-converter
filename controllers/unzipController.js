import path from "path";
import AdmZip from "adm-zip";
import { CustomError } from "../errors/index.js";

const unzipController = (req, res, next) => {
    const { tempFilePath: zipFilePath, name: zipName } = req.file;
    // создаем путь папки, в которую будет извлечен архив
    // она будет находиться в той же временной папке, имя папки = имя архива
    const unzippedFolderPath = path.resolve(path.dirname(zipFilePath), zipName);

    try {
        // распаковываем архив в папку unzippedFolderPath
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(unzippedFolderPath, true);

        // добавляем в req.file данные о папке, в которую извлечен архив
        req.file.unzippedFolder = {
            path: unzippedFolderPath,
            name: zipName,
        };
        
        next();
    } catch (error) {
        console.log(error);
        throw new CustomError("Что-то пошло не так на этапе извлечения архива");
    }
};

export default unzipController;
