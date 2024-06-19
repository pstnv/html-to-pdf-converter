import puppeteer from "puppeteer";
import url from "url";
import { CustomError } from "../../errors/index.js";

const convertHTMLToPDF = async (req, res, next) => {
    const {
        name: filename,
        unzippedFolder: { htmlPage },
    } = req.file;

    // start conversion process
    // launch browser, open new tab
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    // convert .html path to url
    const htmlURL = url.pathToFileURL(htmlPage.path).href;
    await page.goto(htmlURL, { waitUntil: "networkidle0" });

    // genere]ate pdf in screen mode (the most accurate color rendition)
    await page.emulateMediaType("screen");

    const pageOptions = {
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
    };
    const pdfBuffer = await page.pdf(pageOptions);
    if (!pdfBuffer) {
        throw new CustomError("No result received. Try again later");
    }
    // close browser
    await browser.close();
    // end conversion process

    //  add result as prop pdf to req.file
    req.file.pdf = {
        name: filename + ".pdf",
        status: true,
        buffer: pdfBuffer,
    };

    next();
};

export default convertHTMLToPDF;
