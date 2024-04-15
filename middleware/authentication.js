import jwt from "jsonwebtoken";
import { UnauthenticatedError } from "../errors/index.js";

const auth = async (req, res, next) => {
    // проверяем заголовки headers
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer")) {
        throw new UnauthenticatedError("Авторизация не пройдена");
    }
    const token = authHeader.split(" ").pop();
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET);

        // прикрепляем юзера к маршруту conversions (без пароля!)
        req.user = { userId: payload.userId, name: payload.name };
        next();
    } catch (error) {
        throw new UnauthenticatedError("Авторизация не пройдена");
    }
};

export { auth };
