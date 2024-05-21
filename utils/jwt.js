import jwt from "jsonwebtoken";

// функция создает и возвращает jsonwebtoken
const createJWT = ({ payload }) => {
    // срок действия токена будет определяться куками
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
};

// проверяем, существует ли токен
const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

// прикрепить кукис к ответу
const attachCookiesToResponse = ({ res, user, refreshToken }) => {
    // создали 2 токена
    // accessTokenJWT создается на основе информации о пользователе,
    // используется для короткой сессии, доступ к данным
    const accessTokenJWT = createJWT({ payload: { user } });
    // refreshTokenJWT создается на основе информации о пользователе и refreshToken
    // долгосрочный (30, 60 дней и т.д.)
    const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

    const oneDay = 1000 * 60 * 60 * 24;
    const oneMonth = 1000 * 60 * 60 * 24;
    // этот куки (token) хранит accessToken с информацией о пользователе
    res.cookie("accessToken", accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure в режиме production (протокол https)
        signed: true,
        expires: new Date(Date.now() + oneDay),
    });
    // этот куки хранит accessToken с информацией о пользователе, а также refreshToken
    res.cookie("refreshToken", refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure в режиме production (протокол https)
        signed: true,
        expires: new Date(Date.now() + oneMonth),
    });
};

export { createJWT, isTokenValid, attachCookiesToResponse };
