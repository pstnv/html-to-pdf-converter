import { StatusCodes } from "http-status-codes";

import User from "../models/User.js";
import asyncWrapper from "../middleware/async.js";
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";

const register = async (req, res) => {
    // получили данные из post-запроса
    // проверили на соответствие
    // переписали пароль на хешированный
    // отправили новую запись в MongoDB
    const user = await User.create({ ...req.body });
    // создали токен
    const token = user.createJWT();
    res.status(StatusCodes.CREATED).json({ user: { name: user.name }, token });
};

const login = asyncWrapper(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Введите email и пароль");
    }
    // ищем пользователя в базе
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError(
            `Пользователь с адресом ${email} не найден`
        );
    }
    // сверяем пароль
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError(`Неправильный пароль`);
    }
    const token = user.createJWT();
    res.status(StatusCodes.OK).json({ user: { name: user.name }, token });
});

export { register, login };
