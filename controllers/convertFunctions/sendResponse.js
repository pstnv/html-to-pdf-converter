import { unlink, rm } from "fs/promises";
import StatusCodes from "http-status-codes";

const sendResponse = async (req, res, next) => {
    const {
        pdf: { name: pdfName, buffer: pdfBuffer },
        tempFilePath,
        unzippedFolder: { path: unzippedFolder },
    } = req.file;

    // delete zip-archive
    await unlink(tempFilePath);
    // deletefolder with extracted zip-archive
    await rm(unzippedFolder, {
        recursive: true,
        force: true,
        maxRetries: 2,
    });

    // set response headers
    res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": `attachment; filename=${pdfName}`,
    });
    res.status(StatusCodes.OK).send(pdfBuffer);
};

export default sendResponse;
