import path from "path";
import { BadRequestError } from "../../errors/index.js";

const uploadZip = (req, res, next) => {
    // check:
    // if request has no files
    if (!req.files) {
        throw new BadRequestError("The file was not uploaded");
    }

    const file = req.files.file;
    // check:
    // if type of file is not .zip
    // or !file.mimetype.includes("zip")
    if (!file.name.endsWith(".zip")) {
        throw new BadRequestError("Upload zip-archive");
    }
    // add fileds - name and basename
    const fileName = file.name;
    file.basename = fileName; // file name with extension
    file.name = path.parse(fileName).name; // file name without extension
    req.file = file;

    next();
};

export default uploadZip;
