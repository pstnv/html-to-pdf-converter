// import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/index.js";
import { isTokenValid } from "../utils/index.js";

const authenticateUser = async (req, res, next) => {
    const token = req.signedCookies.token;
    // проверяем куки на наличие токена
    if (!token) {
        throw new UnauthenticatedError("Авторизация не пройдена");
    }
    try {
        // проверяем действующий токен
        const { name, userId } = isTokenValid(token);
        // прикрепляем юзера к запросу (без пароля!)
        req.user = { name, userId };
        next();
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
