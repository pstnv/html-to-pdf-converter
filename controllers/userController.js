import { StatusCodes } from "http-status-codes";
import User from "../models/User.js";
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
import { createTokenUser, attachCookiesToResponse } from "../utils/index.js";

const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user });
};

const updateUser = async (req, res) => {
    const { name, email } = req.body;
    // проверяем, что переданы оба поля - имя и email
    if (!name || !email) {
        throw new BadRequestError("Все поля обязательны для заполнения");
    }
    // ищем пользователя в MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });
    // обновляем поля по отдельности
    // не используем метод .findOneAndUpdate потому, что он не вызывает метод "pre"
    user.name = name;
    user.email = email;
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

export { showCurrentUser, updateUser, updateUserPassword };
