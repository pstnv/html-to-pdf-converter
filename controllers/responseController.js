import fs from "fs";
import StatusCodes from "http-status-codes";

const responseController = async (req, res, next) => {
    const {
        pdfBuffer,
        tempFilePath,
        unzippedFolder: { name: zipName, path: unzippedFolder },
    } = req.file;

    // удаляем zip-архив и папку с распакованным архивом
    fs.unlinkSync(tempFilePath);
    fs.rmSync(unzippedFolder, {
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
};

export default responseController;
