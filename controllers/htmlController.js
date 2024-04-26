import { glob } from "glob";
import path from "path";
import { NotFoundError } from "../errors/index.js";

const htmlController = async (req, res, next) => {
    const { unzippedFolder } = req.file;

    // поиск index.html в папке
    const indexPage = "index.html";
    let [indexPageRelPath] = await glob(
        `${unzippedFolder.path}/**/${indexPage}`
    );
    if (!indexPageRelPath) {
        throw new NotFoundError(`Файл ${indexPage} не найден`);
    }

    // абсолютный путь к index.html, используется puppeteer в convertController
    const indexPageAbsPath = path.resolve(indexPageRelPath);

    // добавляем в req.file.unzippedFolder новые свойства - данные о найденной странице index.html(имя, путь)
    unzippedFolder.htmlPage = {
        name: indexPage,
        path: indexPageAbsPath,
    };

    next();
};
export default htmlController;
