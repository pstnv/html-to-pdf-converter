import { StatusCodes } from "http-status-codes";
import crypto from "crypto";

// models MongoDB
import User from "../models/User.js";
import Token from "../models/Token.js";
// errors
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
// utils
import {
    attachCookiesToResponse,
    clearCookiesFromResponse,
    createTokenUser,
    sendVerificationEmail,
    sendResetPasswordEmail,
    createHash,
} from "../utils/index.js";

const register = async (req, res) => {
    // проверяем, если пользователь зарегистрирован
    const { email } = req.body;
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new BadRequestError(
            `Пользователь с email ${email} уже зарегистрирован`
        );
    }
    // встроенный модуль создает buffer, конвертируем в строку, каждый байт будет сконвертрован в hex-строку
    const verificationToken = crypto.randomBytes(40).toString("hex");
    // получили данные из post-запроса
    // проверили на соответствие
    // переписали пароль на хешированный

    // срок действия ссылки
    const oneDay = 1000 * 60 * 60 * 24;
    const verificationTokenExpirationDate = new Date(Date.now() + oneDay);
    // добавили verificationToken и verificationTokenExpirationDate
    // отправили новую запись в MongoDB
    const user = await User.create({
        ...req.body,
        verificationToken,
        verificationTokenExpirationDate,
    });
    // отправили письмо со ссылкой
    const origin = process.env.ORIGIN; // в режиме dev localhost:3000, в продакшн - ссылка на фронт

    // переменные (tempOrigin, protocol, host, forwardedHost, forwardedProtocol)
    // не используются в проекте, показаны в учебных целях
    // const tempOrigin = req.get("origin"); // localhost:5000 <= back-end server
    // const protocol = req.protocol; // http
    // const host = req.get("host"); // localhost:5000
    // const forwardedHost = req.get("x-forwarded-host"); // localhost:3000 <= front-end (because we use proxy)
    // const forwardedProtocol = req.get("x-forwarded-proto"); // http

    await sendVerificationEmail({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
        origin,
    });
    res.status(StatusCodes.CREATED).json({
        msg: "Пользователь зарегистрирован. Проверьте указанную электронную почту, чтобы подтвердить аккаунт",
    });

    /*
        #swagger.summary = 'Register a new user'
        #swagger.description = 'User fills in the registration form - name, email, password' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['user'] = {
            in: 'body',
            description: 'The request body contains name, email, password',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/AddUser'
            }
        }
        #swagger.responses[201] = {
            schema: {
                msg: 'Your email has been successfully registered. Please check your email to complete your profile'
            },
            description: 'User registered successfully',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The field name (email or password) is required'
            },
            description: 'User registration failed. Missing name (email or password)',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'This email is already registered'
            },
            description: 'User registration failed. The email is already registered',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'User registration failed. Internal server error',
        }    
        */
};

// пользователь переходит по ссылке для подтверждения email и делает запрос
const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError("Неудачная верификация");
    }
    const currentDate = new Date();
    // сверяем verificationToken из запроса (письма) в тем, что записан в поле пользователя user.verificationToken
    // и проверяем, что срок его действия не истек
    if (user.verificationToken !== verificationToken) {
        throw new UnauthenticatedError("Неудачная верификация");
    } else if (
        // если токен совпадает, но срок его действия истек
        user.verificationToken === verificationToken &&
        user.verificationTokenExpirationDate <= currentDate
    ) {
        throw new UnauthenticatedError("Срок действия ссылки истек");
    }
    // в случае, если токены совпали, и срок действия токена не окончен
    // меняем поля пользователя (пользователь верифицирован, дата верификации, очищаем токен)
    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = null;
    user.verificationTokenExpirationDate = null;
    // сохраняем изменения в пользователе
    await user.save();
    res.status(StatusCodes.OK).json({
        msg: "Email подтвержден. Регистрация завершена",
    });

    /*
        #swagger.summary = 'Verify new user email'
        #swagger.description = 'User gets an email with a link to complete registration' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'The request body contains email and verificationToken',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/VerifyUser'
            }
        }
        #swagger.responses[201] = {
            schema: {
                msg: 'Your email has been successfully confirmed. Please login with your email and password'
            },
            description: 'User completed registration',
        }
        #swagger.responses[401] = {
            schema: {
                msg: 'Verification failed'
            },
            description: 'User completion of registration failed',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'User completion of registration failed. Internal server error',
        }    
        */
};

const login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new BadRequestError(
            "Поля email и пароль обязательны для заполнения"
        );
    }
    // ищем пользователя в базе
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError(
            `Пользователь с адресом ${email} не найден`
        );
    }
    // сверяем пароль
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError(`Неправильный пароль`);
    }
    if (!user.isVerified) {
        throw new UnauthenticatedError(`Подтвердите свой email`);
    }
    // создаем профиль пользователя для токена
    const tokenUser = createTokenUser(user);

    // создаем переменную refreshToken и в качестве значения будем использовать:
    // существующий или вновь созданный токен
    let refreshToken = "";
    // проверяем, есть ли у пользователя (в документе MongoDB) существующий токен
    const existingToken = await Token.findOne({ user: user._id });
    if (existingToken) {
        // если токен существует, проверяем, является ли он действующим
        const { isValid } = existingToken;
        if (!isValid) {
            throw new UnauthenticatedError("Недействительные учетные данные");
        }
        // если существующий токен является действительным, не перезаписываем его, а используем
        refreshToken = existingToken.refreshToken;
        // добавляем токен в куки
        attachCookiesToResponse({ res, user: tokenUser, refreshToken });
        res.status(StatusCodes.OK).json({ user: tokenUser });
        return;
    }
    //если у пользователя нет документа Token, то создаем новый документ Токен для пользователя
    // встроенный модуль создает buffer, конвертируем в строку, каждый байт будет сконвертрован в hex-строку
    refreshToken = crypto.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const usertoken = { refreshToken, ip, userAgent, user: user._id };
    // создаем документ токен в MongoDB
    await Token.create(usertoken);

    // добавляем токен в куки
    attachCookiesToResponse({ res, user: tokenUser, refreshToken });
    res.status(StatusCodes.OK).json({ user: tokenUser });

    /*
        #swagger.summary = 'Login a user'
        #swagger.description = 'User fills in the login form - email, password' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'The request body contains email, password',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/User'
            }
        }
        #swagger.responses[200] = {
            schema: {
                user: {
                    $ref: '#/definitions/TokenUser'
                }
            },
            description: 'User logged in successfully',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The field name (email or password) is required'
            },
            description: 'User login failed. Missing name (email or password)',
        }
        #swagger.responses[401] = {
            schema: {
                msg: 'User with this email not found'
            },
            description: 'User login failed. User not found',
        }        
        #swagger.responses[401] = {
            schema: {
                msg: 'Wrong password/ Invalid credentials'
            },
            description: 'User login failed. Invalid credentials',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'User login failed. Internal server error',
        }    
    */
};

const logout = async (req, res) => {
    // если пользователь разлогинился
    // удаляем документ токен из MongoDB
    const { userId } = req.user;
    await Token.findOneAndDelete({ user: userId });

    // очищаем куки от accessToken и refreshToken
    clearCookiesFromResponse({ res });
    res.status(StatusCodes.OK).json({
        msg: "Пользователь вышел из учетной записи",
    });

    /*
        #swagger.summary = 'Log out a user'
        #swagger.description = 'User clicked the button "Logout"' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.responses[200] = {
            schema: {
                msg: 'User logged out'
            },
            description: 'User logged out',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'User logout. Internal server error',
        }    
    */
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new BadRequestError("Поля email обязательно для заполнения");
    }
    // ищем пользователя в базе MongoDB по email
    const user = await User.findOne({ email });
    // не отправляем ответ, что пользователь не существует в целях безопасности
    // чтобы не было ответа, какой пользователь существует, а какой - нет
    // поэтому на все запросы ответ "На почту отправлено письмо"
    if (user && user.isVerified) {
        // если пользователь найден, и его провиль подтвержден
        // создать токен для восстановления пароля
        // встроенный модуль создает buffer, конвертируем в строку, каждый байт будет сконвертрован в hex-строку
        const passwordToken = crypto.randomBytes(70).toString("hex");
        // отправить письмо со ссылкой для восстановления
        const origin = process.env.ORIGIN; // в режиме dev localhost:3000, в продакшн - ссылка на фронт
        sendResetPasswordEmail({
            name: user.name,
            email: user.email,
            token: passwordToken,
            origin,
        });

        // срок действия ссылки 10 минут
        const tenMinutes = 1000 * 60 * 1;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
        // вносим изменения в документ пользователя
        user.passwordToken = createHash(passwordToken);
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        // сохраняем пользователя
        await user.save();
    }
    res.status(StatusCodes.OK).json({
        msg: "На указанную почту отправлено письмо со ссылкой для сброса пароля. Проверьте почту",
    });

    /*
        #swagger.summary = 'User forgot password'
        #swagger.description = 'User fills in the form - email' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'The request body contains user email',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/ForgotUserPassword'
            }
        }
        #swagger.responses[200] = {
            schema: {
                msg: 'Please check the email for instructions to reset your password'
            },
            description: 'Link to reset password was sent to the user email',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The field email is required'
            },
            description: 'Reset password failed. Missing email',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Reset password failed. Internal server error',
        }    
    */
};

const resetPassword = async (req, res) => {
    const { token, email, password } = req.body;
    if (!token || !email || !password) {
        throw new BadRequestError("Все поля обязательны для заполнения");
    }
    // ищем пользователя в базе MongoDB по email
    const user = await User.findOne({ email });
    // не отправляем ответ, что пользователь не существует в целях безопасности
    // чтобы не было ответа, какой пользователь существует, а какой - нет
    // поэтому на все запросы ответ "На почту отправлено письмо"
    if (user) {
        // проверяем, что токен в запросе совпадает с токеном для сброса пароля
        // (который хранится в захешированном виде в документе пользователя user)
        // и что срок действия токена для сброса пароля не истек
        const currentDate = new Date();
        if (
            user.passwordToken === createHash(token) &&
            user.passwordTokenExpirationDate > currentDate
        ) {
            // устанавливаем новый пароль
            user.password = password;
            // сбрасываем токен и время его действия
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            // сохраняем документ пользователя в MongoDB
            await user.save();
            res.status(StatusCodes.OK).json({
                msg: "Пароль был успешно изменен. Для входа используйте новый пароль",
            });
            return;
        } else if (
            user.passwordToken === createHash(token) &&
            user.passwordTokenExpirationDate <= currentDate
        ) {
            // если токен в запросе совпадает с токеном для сброса пароля
            // (который хранится в захешированном виде в документе пользователя user),
            // но срок действия токена для сброса пароля истек
            throw new BadRequestError("Срок действия ссылки истек");
        }
    }
    res.status(StatusCodes.OK).json({
        msg: "Пароль был успешно изменен. Для входа используйте новый пароль",
    });

    /*
        #swagger.summary = 'Reset user password'
        #swagger.description = 'User fills in the form - email, password' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'The request body contains token, email, password',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/ResetUserPassword'
            }
        }
        #swagger.responses[200] = {
            schema: {
                msg: 'The password was changed. Please use new password to login'
            },
            description: 'User has changed password',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The field email (or password) is required'
            },
            description: 'Changing password failed. Missing email (or password)',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'Link has expired'
            },
            description: 'Changing password failed. Link has expired',
        }  
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Changing password failed. Internal server error',
        }    
    */
};

export { register, login, logout, verifyEmail, forgotPassword, resetPassword };
