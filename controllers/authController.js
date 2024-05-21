import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

// models MongoDB
import User from "../models/User.js";
import Token from "../models/Token.js";
// errors
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
// utils
import {
    attachCookiesToResponse,
    createTokenUser,
    sendVerificationEmail,
    sendResetPasswordEmail,
    createHash,
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
    const origin = process.env.ORIGIN; // в режиме dev localhost:3000, в продакшн - ссылка на фронт

    // переменные (tempOrigin, protocol, host, forwardedHost, forwardedProtocol)
    // не используются в проекте, показаны в учебных целях
    // const tempOrigin = req.get("origin"); // localhost:5000 <= back-end server
    // const protocol = req.protocol; // http
    // const host = req.get("host"); // localhost:5000
    // const forwardedHost = req.get("x-forwarded-host"); // localhost:3000 <= front-end (because we use proxy)
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

// пользователь переходит по ссылке для подтверждения email и делает запрос
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
    // создаем профиль пользователя для токена
    const tokenUser = createTokenUser(user);

    // создаем переменную refreshToken и в качестве значения будем использовать:
    // существующий или вновь созданный токен
    let refreshToken = "";
    // проверяем, есть ли у пользователя (в документе MongoDB) существующий токен
    const existingToken = await Token.findOne({ user: user._id });
    if (existingToken) {
        // если токен существует, проверяем, является ли он действующим
        const { isValid } = existingToken;
        if (!isValid) {
            throw new UnauthenticatedError("Недействительные учетные данные");
        }
        // если существующий токен является действительным, не перезаписываем его, а используем
        refreshToken = existingToken.refreshToken;
        // добавляем токен в куки
        attachCookiesToResponse({ res, user: tokenUser, refreshToken });
        res.status(StatusCodes.OK).json({
            user: { user: tokenUser },
        });
        return;
    }
    //если у пользователя нет документа Token, то создаем новый документ Токен для пользователя
    // встроенный модуль создает buffer, конвертируем в строку, каждый байт будет сконвертрован в hex-строку
    refreshToken = crypto.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const usertoken = { refreshToken, ip, userAgent, user: user._id };
    // создаем документ токен в MongoDB
    const token = await Token.create(usertoken);

    // добавляем токен в куки
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({
        user: { user: tokenUser },
    });
};

const logout = async (req, res) => {
    // если пользователь разлогинился
    // удаляем документ токен из MongoDB
    const { userId } = req.user;
    await Token.findOneAndDelete({ user: userId });

    // очищаем куки от accessToken и refreshToken
    res.cookie("accessToken", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie("refreshToken", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.status(StatusCodes.OK).json({
        msg: "Пользователь вышел из учетной записи",
    });
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new BadRequestError("Поля email обязательно для заполнения");
    }
    // ищем пользователя в базе MongoDB по email
    const user = await User.findOne({ email });
    // не отправляем ответ, что пользователь не существует в целях безопасности
    // чтобы не было ответа, какой пользователь существует, а какой - нет
    // поэтому на все запросы ответ "На почту отправлено письмо"
    if (user) {
        // создать токен для восстановления пароля
        // встроенный модуль создает buffer, конвертируем в строку, каждый байт будет сконвертрован в hex-строку
        const passwordToken = crypto.randomBytes(70).toString("hex");
        // отправить письмо со ссылкой для восстановления
        const origin = process.env.ORIGIN; // в режиме dev localhost:3000, в продакшн - ссылка на фронт
        sendResetPasswordEmail({
            name: user.name,
            email: user.email,
            token: passwordToken,
            origin,
        });

        // срок действия ссылки
        const tenMinutes = 1000 * 60 * 10;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
        // вносим изменения в документ пользователя
        user.passwordToken = createHash(passwordToken);
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        // сохраняем пользователя
        await user.save();
    }
    res.status(StatusCodes.OK).json({
        msg: "На указанную почту отправлено письмо со ссылкой для сброса пароля. Проверьте почту",
    });
};

const resetPassword = async (req, res) => {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
        throw new BadRequestError("Все поля обязательны для заполнения");
    }
    // ищем пользователя в базе MongoDB по email
    const user = await User.findOne({ email });
    // не отправляем ответ, что пользователь не существует в целях безопасности
    // чтобы не было ответа, какой пользователь существует, а какой - нет
    // поэтому на все запросы ответ "На почту отправлено письмо"
    if (user) {
        // проверяем, что токен в запросе совпадает с токеном для сброса пароля
        // (который хранится в захешированном виде в документе пользователя user)
        // и что срок действия токена для сброса пароля не истек
        const currentDate = new Date();
        if (
            user.passwordToken === createHash(token) &&
            user.passwordTokenExpirationDate > currentDate
        ) {
            // устанавливаем новый пароль
            user.password = password;
            // сбрасываем токен и время его действия
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            // сохраняем документ пользователя в MongoDB
            await user.save();
            res.status(StatusCodes.OK).json({
                msg: "Пароль был успешно изменен. Для входа используйте новый пароль",
            });
            return;
        } else if (
            user.passwordToken === createHash(token) &&
            user.passwordTokenExpirationDate <= currentDate
        ) {
            // если токен в запросе совпадает с токеном для сброса пароля
            // (который хранится в захешированном виде в документе пользователя user),
            // но срок действия токена для сброса пароля истек
            res.status(StatusCodes.OK).json({
                msg: "Срок действия ссылки истек",
            });
            return;
        }
    }
    res.status(StatusCodes.OK).json({
        msg: "Если вы все сделали правильно, ваш пароль должен быть изменен",
    });
};

export { register, login, logout, verifyEmail, forgotPassword, resetPassword };
