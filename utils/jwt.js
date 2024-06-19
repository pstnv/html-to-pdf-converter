import jwt from "jsonwebtoken";

// function creates andreturns jsonwebtoken
const createJWT = ({ payload }) => {
    // token's expiration date will be determined by cookies
    const token = jwt.sign(payload, process.env.JWT_SECRET);
    return token;
};

// check if token exists
const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET);

// attach cookies to response
const attachCookiesToResponse = ({ res, user, refreshToken }) => {
    // create 2 tokens
    // accessTokenJWT contains user info,
    // it is used for shorter sessions
    const accessTokenJWT = createJWT({ payload: { user } });
    // refreshTokenJWT contains user info and refreshToken
    // it is used for longer sessions (30, 60 days etc.)
    const refreshTokenJWT = createJWT({ payload: { user, refreshToken } });

    const oneDay = 1000 * 60 * 60 * 24;
    const oneMonth = 1000 * 60 * 60 * 24 * 30;
    // this cookie (token) keeps accessToken with user info
    res.cookie("accessToken", accessTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure in production mode (protocol https)
        signed: true,
        expires: new Date(Date.now() + oneDay),
    });
    // this cookie (token) keeps accessToken with user info and also refreshToken
    res.cookie("refreshToken", refreshTokenJWT, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // secure in production mode (protocol https)
        signed: true,
        expires: new Date(Date.now() + oneMonth),
    });
};

const clearCookiesFromResponse = async ({ res }) => {
    // clear cookies from accessToken and refreshToken
    res.cookie("accessToken", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
    res.cookie("refreshToken", "logout", {
        httpOnly: true,
        expires: new Date(Date.now()),
    });
};

export {
    createJWT,
    isTokenValid,
    attachCookiesToResponse,
    clearCookiesFromResponse,
};
