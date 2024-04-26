import { StatusCodes } from "http-status-codes";
import Conversion from "../models/Conversion.js";
import { NotFoundError } from "../errors/index.js";
import { v2 as cloudinary } from "cloudinary";

const getAllConversions = async (req, res) => {
    const { userId } = req.user;
    // ищем в MongoDB все записи с id пользователя
    const conversions = await Conversion.find({
        createdBy: userId,
    });
    res.status(StatusCodes.OK).json({ count: conversions.length, conversions });
};

const createConversion = async (req, res) => {
    const { userId } = req.user;
    // добавляем к req.body свойство - id пользователя,
    // чтобы создать в MongoDB запись, привязанную к id пользователя
    req.body.createdBy = userId;
    // создаем документ conversion
    // поля name, status, file придут из запроса req.body,
    // поле req.body.createdBy будет добавлено
    const conversion = await Conversion.create(req.body);
    res.status(StatusCodes.CREATED).json({ conversion });
};

const deleteConversion = async (req, res) => {
    const {
        user: { userId },
        params: { id: conversionId },
    } = req;

    // ищем в MongoDB запись с id пользователя и id записи
    const conversionToDelete = await Conversion.findOne({
        createdBy: userId,
        _id: conversionId,
    });
    if (!conversionToDelete) {
        throw new NotFoundError(
            `Данные о конвертации с id: ${conversionId} не найдены`
        );
    }

    // удаляем файл из хранилища cloudinary по cloudId
    const { cloudId } = conversionToDelete;
    cloudinary.uploader.destroy(cloudId).catch((error) => {
        // в случае ошибки при удалении файла из cloudinary
        // выводим в консоль ошибку, но не выбрасываем ее пользователю
        console.log("Не удалось удалить файл из cloudinary: ", error.message);
    });

    // удаляем запись в mongoDB
    await Conversion.deleteOne(conversionToDelete);
    res.status(StatusCodes.OK).send();
};

export { getAllConversions, createConversion, deleteConversion };
