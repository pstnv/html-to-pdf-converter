import { StatusCodes } from "http-status-codes";
import Conversion from "../models/Conversion.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";

const getAllConversions = async (req, res) => {
    const { userId } = req.user;
    // ищем в MongoDB все записи с id пользователя
    const conversions = await Conversion.find({ createdBy: userId });
    res.status(StatusCodes.OK).json({ count: conversions.length, conversions });
};

const getConversion = async (req, res) => {
    const {
        user: { userId },
        params: { id: conversionId },
    } = req;
    // ищем в MongoDB запись с id пользователя и id записи
    const conversion = await Conversion.findOne({
        createdBy: userId,
        _id: conversionId,
    });
    if (!conversion) {
        throw new NotFoundError(
            `Данные о конвертации с id: ${conversionId} не найдены`
        );
    }
    res.status(StatusCodes.OK).json({ conversion });
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
    await Conversion.findOneAndDelete({
        createdBy: userId,
        _id: conversionId,
    });
    res.status(StatusCodes.OK).send();
};

export { getAllConversions, getConversion, createConversion, deleteConversion };
