import { UnauthenticatedError } from "../errors/index.js";
import { isTokenValid } from "../utils/index.js";
import Token from "../models/Token.js";
import { attachCookiesToResponse } from "../utils/index.js";

// function of authentication is used on the routes where it is required
const authenticateUser = async (req, res, next) => {
    const { accessToken, refreshToken } = req.signedCookies;
    try {
        // check if accessToken for short sessions is exists
        if (accessToken) {
            const payload = isTokenValid(accessToken);
            // if accessToken exists and hasn't expired, add user to request as a prop
            req.user = payload.user;
            return next();
        }

        // if accessToken expires, work with refreshToken
        // check if refreshToken for long sessions is exists
        if (!refreshToken) {
            throw new UnauthenticatedError("Authentication failed");
        }
        // check if refreshToken exists and hasn't expired yet
        const payload = isTokenValid(refreshToken);
        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });
        // if refreshToken doesn't exist or refreshToken exists but it has expired throw error
        if (!existingToken || !existingToken?.isValid) {
            throw new UnauthenticatedError("Authentication failed");
        }
        // if refreshToken exists and hasn't expired, add user to request as a prop
        req.user = payload.user;
        // attach cookie (create new accessToken, update expiration date for refreshToken)
        attachCookiesToResponse({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken,
        });
        return next();
    } catch (error) {
        throw new UnauthenticatedError("Authentication failed");
    }
};

// function of checking authentication is used on the routes where it is not necessary (not required)
const checkAuthentication = async (req, res, next) => {
    const { accessToken, refreshToken } = req.signedCookies;
    try {
        // check if accessToken for short sessions is exists
        if (accessToken) {
            const payload = isTokenValid(accessToken);
            // if accessToken exists and hasn't expired, add user to request as a prop
            req.user = payload.user;
            return next();
        }

        // if accessToken expires, work with refreshToken
        // check if refreshToken for long sessions is exists
        // if refreshToken doesn't exist, do not throw error - continue conversion without authentication
        if (!refreshToken) {
            return next();
        }
        // check if refreshToken exists and hasn't expired yet
        const payload = isTokenValid(refreshToken);
        const existingToken = await Token.findOne({
            user: payload.user.userId,
            refreshToken: payload.refreshToken,
        });
        // if refreshToken doesn't exist or refreshToken exists but it has expired
        // do not throw error - continue conversion without authentication
        if (!existingToken || !existingToken?.isValid) {
            return next();
        }
        // if refreshToken exists and hasn't expired, add user to request as a prop
        req.user = payload.user;
        // attach cookie (create new accessToken, update expiration date for refreshToken)
        attachCookiesToResponse({
            res,
            user: payload.user,
            refreshToken: existingToken.refreshToken,
        });
        return next();
    } catch (error) {
        // console.log error, but do not trow it (because authentication is unnecessary)
        console.log(error.message);
        next();
    }
};

export { authenticateUser, checkAuthentication };
