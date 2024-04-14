import fs from "fs";
import StatusCodes from "http-status-codes";

const errorHandlerMiddleware = (err, req, res, next) => {
    // // если zip-архив сохранился, удаляем
    // if (req.files && req.files.file && req.files.file.tempFilePath) {
    //     const tempFilePath = req.files.file.tempFilePath;
    //     fs.unlinkSync(tempFilePath);
    // }
    // // если существует папка с распакованным архивом, удаляем вместе с содержимым
    // if (req.files && req.files.file && req.files.file.unzippedFolder) {
    //     const unzippedFolder = req.files.file.unzippedFolder.path;
    //     fs.rmSync(unzippedFolder, {
    //         recursive: true,
    //         force: true,
    //         maxRetries: 2,
    //     });
    // }
    let customError = {
        statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
        msg: err.message || "Что-то пошло не так. Попробуйте позже",
    };
    return res.status(customError.statusCode).json({ msg: customError.msg });
};

export default errorHandlerMiddleware;
