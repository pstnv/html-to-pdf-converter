import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
// models MongoDB
import User from "../models/User.js";
// errors
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
// utils
import {
    createTokenUser,
    attachCookiesToResponse,
    createHash,
    sendUpdateEmailEmail,
} from "../utils/index.js";

const showCurrentUser = async (req, res) => {
    const { userId } = req.user;
    // найти документ пользователя в MongoDB, убрать из результатов пароль
    const user = await User.findOne({ _id: userId }).select("-password");
    res.status(StatusCodes.OK).json({
        user: { name: user.name, email: user.email },
    });
};

const updateUser = async (req, res) => {
    // *в текущем наборе пользователь имеет поля name, email, password
    // **email и password изменяются отдельной функцией
    const { name } = req.body;
    // проверяем, что передано поле name
    if (!name) {
        throw new BadRequestError("Все поля обязательны для заполнения");
    }
    // ищем пользователя в MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });
    // обновляем поля по отдельности
    // не используем метод .findOneAndUpdate потому, что он не вызывает метод "pre"
    user.name = name;
    // сохраняем изменения в пользователе
    await user.save();
    // создаем новый токен, т.к. поля пользователя изменились
    const tokenUser = createTokenUser(user);
    // и прикрепляем cookie
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });
};

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    // проверяем, что переданы оба пароля - старый и новый
    if (!oldPassword || !newPassword) {
        throw new BadRequestError("Все поля обязательны для заполнения");
    }
    // ищем пользователя в MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });
    // проверяем, что старый пароль введен правильно
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Введен неверный пароль");
    }
    // меняем пароль
    user.password = newPassword;
    // сохраняем изменения в пользователе
    await user.save();
    res.status(StatusCodes.OK).json({ msg: "Пароль был изменен" });
};

const updateUserEmail = async (req, res) => {
    const { newEmail, newEmailRepeat, password } = req.body;
    if (!newEmail || !newEmailRepeat || !password) {
        throw new BadRequestError("Все поля обязательны для заполнения");
    }
    if (newEmail !== newEmailRepeat) {
        throw new BadRequestError("Введенные email адреса не совпадают");
    }
    // проверяем, если пользователь с новым newEmail уже зарегистрирован
    const emailAlreadyExists = await User.findOne({ email: newEmail });
    if (emailAlreadyExists) {
        throw new BadRequestError(
            `Пользователь с email ${newEmail} уже зарегистрирован`
        );
    }
    // ищем пользователя в MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });

    // проверяем, что старый пароль введен правильно
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Введен неверный пароль");
    }
    // создать токен для изменения почты
    // встроенный модуль создает buffer, конвертируем в строку, каждый байт будет сконвертрован в hex-строку
    const emailToken = crypto.randomBytes(70).toString("hex");
    // отправить письмо со ссылкой для восстановления
    const origin = process.env.ORIGIN; // в режиме dev localhost:3000, в продакшн - ссылка на фронт
    await sendUpdateEmailEmail({
        name: user.name,
        email: newEmail,
        token: emailToken,
        origin,
    });

    // срок действия ссылки
    const oneHour = 1000 * 60 * 60;
    const emailTokenExpirationDate = new Date(Date.now() + oneHour);
    // вносим изменения в документ пользователя
    user.emailToken = createHash(emailToken);
    user.emailTokenExpirationDate = emailTokenExpirationDate;
    // сохраняем пользователя
    await user.save();
    res.status(StatusCodes.OK).json({
        msg: "На указанную почту отправлено письмо со ссылкой для подтверждения. Проверьте почту",
    });
};

// пользователь переходит по ссылке для подтверждения нового email и делает запрос
const verifyUpdatedUserEmail = async (req, res) => {
    const { verificationToken: emailToken, email: newEmail } = req.body;
    if (!emailToken || !newEmail) {
        throw new BadRequestError("Все поля обязательны для заполнения");
    }
    // повторно проверяем, если пользователь с новым newEmail уже зарегистрирован
    const emailAlreadyExists = await User.findOne({ email: newEmail });
    if (emailAlreadyExists) {
        throw new BadRequestError(
            `Пользователь с email ${newEmail} уже зарегистрирован`
        );
    }
    // ищем пользователя в MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });
    // проверяем, что токен в запросе совпадает с токеном для сброса почты
    // (который хранится в захешированном виде в документе пользователя user)
    // и что срок действия токена для изменения почты не истек
    const currentDate = new Date();
    if (
        user.emailToken === createHash(emailToken) &&
        user.emailTokenExpirationDate > currentDate
    ) {
        // устанавливаем новый email
        user.email = newEmail;
        // сбрасываем токен и время его действия
        user.emailToken = null;
        user.emailTokenExpirationDate = null;
        // сохраняем документ пользователя в MongoDB
        await user.save();
        // создаем новый токен, т.к. поля пользователя изменились
        createTokenUser(user);
        // и прикрепляем cookie
        // attachCookiesToResponse({ res, user: tokenUser });  // не нужно авторизовать пользователя автоматически при смене почты, должен залогиниться сам?
        res.status(StatusCodes.OK).json({
            msg: "Почта успешно изменена. Для входа используйте новый email",
        });
        return;
    } else if (
        user.emailToken === createHash(emailToken) &&
        user.emailTokenExpirationDate <= currentDate
    ) {
        // если токен в запросе совпадает с токеном для сброса почты
        // (который хранится в захешированном виде в документе пользователя user),
        // но срок действия токена для изменения почты истек
        res.status(StatusCodes.OK).json({
            msg: "Срок действия ссылки истек",
        });
        return;
    }
    res.status(StatusCodes.OK).json({
        msg: "Email подтвержден. Ваша была изменена. Войдите с новыми учетными данными",
    });
};

export {
    showCurrentUser,
    updateUser,
    updateUserPassword,
    updateUserEmail,
    verifyUpdatedUserEmail,
};
