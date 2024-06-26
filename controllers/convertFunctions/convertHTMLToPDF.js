import puppeteer from "puppeteer";
import url from "url";
import { CustomError } from "../../errors/index.js";

const convertHTMLToPDF = async (req, res, next) => {
    const {
        name: filename,
        unzippedFolder: { htmlPage },
    } = req.file;

    // процесс конвертации(по документации puppeteer) - старт
    // запускаем браузер, открываем пустую страницу
    const browser = await puppeteer.launch({
        headless: "new",
        // executablePath:
        //     "./node_modules/puppeteer-core/.local-chromium/win64-1045629/chrome-win/chrome.exe",
    });
    const page = await browser.newPage();

    // приводим адрес к виду url
    const htmlURL = url.pathToFileURL(htmlPage.path).href;
    await page.goto(htmlURL, { waitUntil: "networkidle0" });

    // генерирует PDF в режиме (media type) 'экран' (максимально точная цветопередача)
    await page.emulateMediaType("screen");

    const pageOptions = {
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
    };
    const pdfBuffer = await page.pdf(pageOptions);
    if (!pdfBuffer) {
        throw new CustomError("Результат не получен. Попробуйте позже");
    }
    // закрываем браузер
    await browser.close();
    // процесс конвертации - окончание

    //  добавляем результат в поле pdf в req.file
    req.file.pdf = {
        name: filename + ".pdf",
        status: true,
        buffer: pdfBuffer,
    };

    next();
};

export default convertHTMLToPDF;
