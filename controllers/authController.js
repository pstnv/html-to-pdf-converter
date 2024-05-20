import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

import User from "../models/User.js";
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
import {
    attachCookiesToResponse,
    createTokenUser,
    sendVerificationEmail,
} from "../utils/index.js";

const register = async (req, res) => {
    // проверяем, если пользователь зарегистрирован
    const { email } = req.body;
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new BadRequestError(
            `Пользователь с email ${email} уже зарегистрирован`
        );
    }
    // встроенный модуль создает buffer, конвертируем в строку, каждый байт будет сконвертрован в hex-строку
    const verificationToken = crypto.randomBytes(40).toString("hex");
    // получили данные из post-запроса
    // проверили на соответствие
    // переписали пароль на хешированный
    // добавили verificationToken
    // отправили новую запись в MongoDB
    const user = await User.create({ ...req.body, verificationToken });
    // отправили письмо со ссылкой
    const origin = "http://localhost:3000"; // в режиме dev, в продакшн - ссылка на фронт

    // переменные (tempOrigin, protocol, host, forwardedHost, forwardedProtocol)
    // не используются в проекте, показаны в учебных целях
    // const tempOrigin = req.get("origin"); // localhost:5000 <= back-end server
    // const protocol = req.protocol; // http
    // const host = req.get("host"); // localhost:5000
    // const forwardedHost = req.get("x-forwarded-host"); // localhost:3000 <= front-end 9because we use proxy)
    // const forwardedProtocol = req.get("x-forwarded-proto"); // http

    await sendVerificationEmail({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
        origin,
    });
    res.status(StatusCodes.CREATED).json({
        msg: "Пользователь зарегистрирован. Проверьте указанную электронную почту, чтобы подтвердить аккаунт",
    });
};

const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError("Неудачная верификация");
    }
    // сверяем verificationToken из запроса (письма) в тем, что записан в поле пользователя user.verificationToken
    if (user.verificationToken !== verificationToken) {
        throw new UnauthenticatedError("Неудачная верификация");
    }
    // в случае, если токены совпали
    // меняем поля пользователя (пользователь верифицирован, дата верификации, очищаем токен)
    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = "";
    // сохраняем изменения в пользователе
    await user.save();
    res.status(StatusCodes.OK).json({
        msg: "Email подтвержден. Регистрация завершена",
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
    if (!user.isVerified) {
        throw new UnauthenticatedError(`Подтвердите свой email`);
    }
    // создали профиль пользователя для токена
    const tokenUser = createTokenUser(user);
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

export { register, login, logout, verifyEmail };
