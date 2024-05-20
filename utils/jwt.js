import jwt from "jsonwebtoken";

// функция создает и возвращает jsonwebtoken
const createJWT = ({ payload }) => {
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_LIFETIME,
    });
    return token;
};

// проверяем, существует ли токен
const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

// прикрепить куки к ответу
const attachCookiesToResponse = ({ res, user }) => {
    // создали токен
    const token = createJWT({ payload: user });
    const oneDay = 1000 * 60 * 60 * 24;
    res.cookie("token", token, {
        httpOnly: true,
        expires: new Date(Date.now() + oneDay),
        secure: process.env.NODE_ENV === "production",
        signed: true,
    });
};

export { createJWT, isTokenValid, attachCookiesToResponse };
