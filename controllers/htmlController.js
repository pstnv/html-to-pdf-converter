import { globSync } from "glob";
import path from "path";

const htmlController = (req, res, next) => {
    const { outputFolder } = req.file;

    // поиск index.html в папке
    const pageName = "index.html";
    let [htmlPage] = globSync(`${outputFolder.path}/**/${pageName}`);
    if (!htmlPage) {
        return res.send("Страница не найдена");
    }

    // абсолютный путь к index.html, используется puppeteer в convertController
    const pagePath = path.resolve(htmlPage);

    // добавляем в req.file.outputFolder новые свойства - данные о найденной странице index.html(имя, путь)
    outputFolder.htmlPage = {
        name: pageName,
        path: pagePath,
    };
    next();
};
export default htmlController;
