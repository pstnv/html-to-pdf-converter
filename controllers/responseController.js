import { unlink, rm } from "fs/promises";
import StatusCodes from "http-status-codes";

const responseController = async (req, res, next) => {
    const {
        pdf: { name: pdfName, buffer: pdfBuffer },
        tempFilePath,
        unzippedFolder: { path: unzippedFolder },
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
        "Content-Disposition": `attachment; filename=${pdfName}`,
    });
    res.status(StatusCodes.OK).send(pdfBuffer);
};

export default responseController;
