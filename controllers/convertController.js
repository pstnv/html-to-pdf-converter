import uploadZip from "./convertFunctions/uploadZip.js";
import unzipFolder from "./convertFunctions/unzipFolder.js";
import findHtmlFile from "./convertFunctions/findHtmlFile.js";
import convertHTMLToPDF from "./convertFunctions/convertHTMLToPDF.js";
import sendPDFToCloudinary from "./convertFunctions/sendPDFToCloudinary.js";
import sendResultToMongoDB from "./convertFunctions/sendResultToMongoDB.js";
import sendResponse from "./convertFunctions/sendResponse.js";

const convertController = [
    uploadZip,
    unzipFolder,
    findHtmlFile,
    convertHTMLToPDF,
    sendPDFToCloudinary,
    sendResultToMongoDB,
    sendResponse,
];

export default convertController;

