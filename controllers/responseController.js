import { unlink, rm } from "fs/promises";
import StatusCodes from "http-status-codes";
import asyncWrapper from "../middleware/async.js";

const responseController = asyncWrapper(async (req, res, next) => {
    const {
        pdfBuffer,
        tempFilePath,
        unzippedFolder: { name: zipName, path: unzippedFolder },
    } = req.file;

    // удаляем zip-архив
    await unlink(tempFilePath);
    // удаляем папку с распакованным архивом
    await rm(unzippedFolder, {
        recursive: true,
        force: true,
        maxRetries: 2,
    });

    // устанавливаем заголовки ответа
    res.set({
        "Content-Type": "application/pdf",
        "Content-Length": pdfBuffer.length,
        "Content-Disposition": `attachment; filename=${zipName}.pdf`,
    });
    res.status(StatusCodes.OK).send(pdfBuffer);
});

export default responseController;
