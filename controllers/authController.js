import { StatusCodes } from "http-status-codes";

import User from "../models/User.js";
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
import { attachCookiesToResponse } from "../utils/index.js";

const register = async (req, res) => {
    // проверяем, если пользователь зарегистрирован
    const { email } = req.body;
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new BadRequestError(
            `Пользователь с email ${email} уже зарегистрирован`
        );
    }
    // получили данные из post-запроса
    // проверили на соответствие
    // переписали пароль на хешированный
    // отправили новую запись в MongoDB
    const user = await User.create({ ...req.body });
    // создали профиль пользователя для токена
    const tokenUser = { name: user.name, userId: user._id };
    // добавляем токен в куки
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.CREATED).json({
        user: { user: tokenUser },
    });
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError(
            "Поля email и пароль обязательны для заполнения"
        );
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
    // создали профиль пользователя для токена
    const tokenUser = { name: user.name, userId: user._id };
    // добавляем токен в куки
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({
        user: { user: tokenUser },
    });
};

const logout = async (req, res) => {
    res.cookie("token", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({ msg: "Пользователь разлогинился" });
};

export { register, login, logout };
