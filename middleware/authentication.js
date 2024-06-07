// import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/index.js";
import { isTokenValid } from "../utils/index.js";
import Token from "../models/Token.js";
import { attachCookiesToResponse } from "../utils/index.js";

// функция аутентификации используется на тех маршрутах, где авторизация обязательна
const authenticateUser = async (req, res, next) => {
    const { accessToken, refreshToken } = req.signedCookies;
    try {
        // проверяем, есть ли действующий токен доступа accessToken для коротких сессий
        if (accessToken) {
            const payload = isTokenValid(accessToken);
            // если токен существует и действителен, записываем в запрос пользователя
            req.user = payload.user;
            return next();
        }

        // если срок действия accessToken истек, обращаемся к refreshToken
        // проверяем, есть ли действующий токен refreshToken для длинных сессий
        if (!refreshToken) {
            throw new UnauthenticatedError("Авторизация не пройдена");
        }
        // проверяем, что он есть в базе и является действующим
        const payload = isTokenValid(refreshToken);
        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });
        // если токен не существует или срок действия истек , выбрасываем ошибку
        if (!existingToken || !existingToken?.isValid) {
            throw new UnauthenticatedError("Авторизация не пройдена");
        }
        // если токен существует и действителен, записываем в запрос пользователя
        req.user = payload.user;
        // прикрепляем куки (создадим новый accessToken, обновим срок действия refreshToken)
        attachCookiesToResponse({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken,
        });
        return next();
    } catch (error) {
        throw new UnauthenticatedError("Авторизация не пройдена");
    }
};

// функция проверки аутентификации используется на тех маршрутах, где авторизация не обязательна
const checkAuthentication = async (req, res, next) => {
    const { accessToken, refreshToken } = req.signedCookies;
    try {
        // проверяем, есть ли действующий токен доступа accessToken для коротких сессий
        if (accessToken) {
            const payload = isTokenValid(accessToken);
            // если токен существует и действителен, записываем в запрос пользователя
            req.user = payload.user;
            return next();
        }

        // если срок действия accessToken истек, обращаемся к refreshToken
        // проверяем, есть ли действующий токен refreshToken для длинных сессий
        // если refreshToken отсутствует, не выбрасываем ошибку - продолжаем конвертацию без авторизации
        if (!refreshToken) {
            return next();
        }
        // если refreshToken существует, проверяем, что он есть в базе и является действующим
        const payload = isTokenValid(refreshToken);
        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });
        // если токен не существует или не является действующим,
        // не выбрасываем ошибку - продолжаем конвертацию без авторизации
        if (!existingToken || !existingToken?.isValid) {
            return next();
        }
        // если токен существует и действителен, записываем в запрос пользователя
        req.user = payload.user;
        // прикрепляем куки (создадим новый accessToken, обновим срок действия refreshToken)
        attachCookiesToResponse({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken,
        });
        return next();
    } catch (error) {
        // выводим в консоль ошибку, но не выбрасываем, т.к. авторизация не обязательна
        console.log(error.message);
        next();
    }
};

export { authenticateUser, checkAuthentication };
