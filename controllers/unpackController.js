import AdmZip from "adm-zip";
import path from "path";

const unpackController = (req, res, next) => {
    const { tempFilePath: zipFilePath, name: outputFolderName } = req.file;
    // создаем путь папки, в которую будет извлечен архив
    // она будет находиться в той же временной папке, имя папки = имя архива
    const outputFolderPath = path.resolve(
        path.dirname(zipFilePath),
        outputFolderName
    );
    try {
        const zip = new AdmZip(zipFilePath);
        zip.extractAllTo(outputFolderPath, true);
    } catch (error) {
        console.log(error);
    }
    // добавляем в req.file данные о папке, в которую извлечен архив
    req.file.outputFolder = {
        path: outputFolderPath,
        name: outputFolderName,
    };
    res.send("unpacked");
};

export default unpackController;
