import { globSync } from "glob";
import path from "path";

const htmlController = (req, res, next) => {
    const { unzippedFolder } = req.file;

    // поиск index.html в папке
    const indexPage = "index.html";
    let [indexPageRelPath] = globSync(`${unzippedFolder.path}/**/${indexPage}`);
    if (!indexPageRelPath) {
        return res.send("Страница не найдена");
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
