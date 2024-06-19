import { glob } from "glob";
import path from "path";
import { NotFoundError } from "../../errors/index.js";

const findHtmlFile = async (req, res, next) => {
    const { unzippedFolder } = req.file;

    // find index.html in the folder
    const indexPage = "index.html";
    let [indexPageRelPath] = await glob(
        `${unzippedFolder.path}/**/${indexPage}`
    );
    if (!indexPageRelPath) {
        throw new NotFoundError(`File ${indexPage} not found`);
    }

    // bsolute path to index.html (it's used by puppeteer in convertController)
    const indexPageAbsPath = path.resolve(indexPageRelPath);

    // add to req.file.unzippedFolder new props - info about the found page index.html(name, path)
    unzippedFolder.htmlPage = {
        name: indexPage,
        path: indexPageAbsPath,
    };

    next();
};
export default findHtmlFile;
