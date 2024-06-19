import path from "path";
import AdmZip from "adm-zip";

const unzipFolder = (req, res, next) => {
    const { tempFilePath: zipFilePath, name: zipName } = req.file;
    // create folder path, where the archive will be extracted
    // it will be in the same temp folder, folder name = archive name
    const unzippedFolderPath = path.resolve(path.dirname(zipFilePath), zipName);

    // extract archive to unzippedFolderPath
    const zip = new AdmZip(zipFilePath);
    zip.extractAllTo(unzippedFolderPath, true);

    // add info about folder (where extracted archive) to req.file
    req.file.unzippedFolder = {
        path: unzippedFolderPath,
        name: zipName,
    };

    next();
};

export default unzipFolder;
