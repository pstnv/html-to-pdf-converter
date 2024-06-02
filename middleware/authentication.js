// import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/index.js";
import { isTokenValid } from "../utils/index.js";
import Token from "../models/Token.js";
import { attachCookiesToResponse } from "../utils/index.js";

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
        const payload = isTokenValid(refreshToken);
        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });
        // если токен не существует или не является действующим, выбрасываем ошибку
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

const checkAuthentication = async (req, res, next) => {
    const token = req.signedCookies.token;
    // проверяем куки на наличие токена
    // если их нет, продолжаем конвертацию без авторизации
    if (!token) {
        return next();
    }
    // пытаемся авторизоваться
    try {
        // проверяем действующий токен
        const { name, userId } = isTokenValid(token);
        // прикрепляем юзера к запросу (без пароля!)
        req.user = { name, userId };
    } catch (error) {
        // выводим в консоль ошибку, но не выбрасываем, т.к. авторизация не обязательна
        console.log(error.message);
    } finally {
        next();
    }
};

export { authenticateUser, checkAuthentication };
