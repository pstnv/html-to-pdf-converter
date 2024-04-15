import { StatusCodes } from "http-status-codes";

import User from "../models/User.js";
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

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError("Поля email и пароль обязательны для заполнения");
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
};

export { register, login };
