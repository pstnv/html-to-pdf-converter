import puppeteer from "puppeteer";
import url from "url";

const convertController = async (req, res, next) => {
    const {
        unzippedFolder: { htmlPage, name: zipName },
    } = req.file;

    try {
        // процесс конвертации(по документации puppeteer) - старт
        // запускаем браузер, открываем пустую страницу
        const browser = await puppeteer.launch({ headless: "new" });
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
            res.send("Пустой запрос");
        }
        // закрываем браузер
        await browser.close();
        // процесс конвертации - окончание

        // устанавливаем заголовки ответа
        res.set({
            "Content-Type": "application/pdf",
            "Content-Length": pdfBuffer.length,
            "Content-Disposition": `attachment; filename=${zipName}.pdf`,
        });
        res.status(201).send(pdfBuffer);
    } catch (error) {
        console.log(error);
    }
};

export default convertController;
