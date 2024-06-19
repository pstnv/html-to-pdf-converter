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
    // check if user is already registered
    const { email } = req.body;
    const emailAlreadyExists = await User.findOne({ email });
    if (emailAlreadyExists) {
        throw new BadRequestError(
            `Account with the email ${email} already exists`
        );
    }

    const verificationToken = crypto.randomBytes(40).toString("hex");
    // get data frompost-request
    // check for correspondence
    // re-write password for hashed

    // link expiration date
    const oneDay = 1000 * 60 * 60 * 24;
    const verificationTokenExpirationDate = new Date(Date.now() + oneDay);
    // add verificationToken and verificationTokenExpirationDate
    // send new record to MongoDB
    const user = await User.create({
        ...req.body,
        verificationToken,
        verificationTokenExpirationDate,
    });
    // send letter with confirmation link
    const origin = process.env.ORIGIN; // in dev-mode localhost:5000 (|| 3000), in prod-mode - link to the front

    await sendVerificationEmail({
        name: user.name,
        email: user.email,
        verificationToken: user.verificationToken,
        origin,
    });
    res.status(StatusCodes.CREATED).json({
        msg: "You have successfully registered. Check your email to confirm your account",
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

// user clicks on the confirmation link to verify email and sends response
const verifyEmail = async (req, res) => {
    const { verificationToken, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError("Verification failed");
    }
    const currentDate = new Date();
    // check verificationToken from response(letter) and user.verificationToken in mongoDB  are equal
    // also check if link has expired
    if (user.verificationToken !== verificationToken) {
        throw new UnauthenticatedError("Verification failed");
    } else if (
        // if tokens are equal, but link has expired
        user.verificationToken === verificationToken &&
        user.verificationTokenExpirationDate <= currentDate
    ) {
        throw new UnauthenticatedError("The link you followed has expired");
    }
    // if tokens are equal and token is still active (link hasn't expired yet)
    // change fields (user is verified, date and clear verification token)
    user.isVerified = true;
    user.verified = Date.now();
    user.verificationToken = null;
    user.verificationTokenExpirationDate = null;
    // save changes in user
    await user.save();
    res.status(StatusCodes.OK).json({
        msg: "Email is confirmed. Registration has been completed",
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
        #swagger.responses[200] = {
            schema: {
                msg: 'Your email has been successfully confirmed. Please login with your email and password'
            },
            description: 'User completed registration',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The field email (or verificationToken) is required'
            },
            description: 'User completion of registration failed. Missing email (or verificationToken)',
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
        throw new BadRequestError("Fields email and password are required");
    }
    // search for user in MongoDB
    const user = await User.findOne({ email });
    if (!user) {
        throw new UnauthenticatedError(
            `Account with email ${email} not found`
        );
    }
    // check for password
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError(`Password incorrect`);
    }
    if (!user.isVerified) {
        throw new UnauthenticatedError(`Confirm your email`);
    }
    // create user profile for token
    const tokenUser = createTokenUser(user);

    // create refreshToken
    let refreshToken = "";
    // if user has existing token (in MongoDB)
    const existingToken = await Token.findOne({ user: user._id });
    if (existingToken) {
        // if token exists, check if it's valid (not expired)
        const { isValid } = existingToken;
        if (!isValid) {
            throw new UnauthenticatedError("Invalid credentials");
        }
        // if token exists and valid (not expired), use it
        refreshToken = existingToken.refreshToken;
        // add token to the cookie
        attachCookiesToResponse({ res, user: tokenUser, refreshToken });
        res.status(StatusCodes.OK).json({ user: tokenUser });
        return;
    }
    // if user has no Token document, create new Token document for the user
    refreshToken = crypto.randomBytes(40).toString("hex");
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;
    const usertoken = { refreshToken, ip, userAgent, user: user._id };
    // create document Token in MongoDB
    await Token.create(usertoken);

    // add token to the cookie
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
    // if user logged out
    // delete Token document from MongoDB
    const { userId } = req.user;
    await Token.findOneAndDelete({ user: userId });

    // clear cookies from accessToken and refreshToken
    clearCookiesFromResponse({ res });
    res.status(StatusCodes.OK).json({
        msg: "User has logged out",
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
            description: 'User logout failed. Internal server error',
        }    
    */
};

const forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        throw new BadRequestError("Field email is required");
    }
    // search for user in MongoDB by this email
    const user = await User.findOne({ email });
    // for safety don't response that user with this email doesn't exist
    // so all responses would be "We send you a letter"
    if (user && user.isVerified) {
        // if user was found and his account is confirmed
        // create token to restore password
        const passwordToken = crypto.randomBytes(70).toString("hex");
        // send email with link to reset password
        const origin = process.env.ORIGIN; // in dev-mode localhost:5000 (||3000), in prod-mode - link to the front
        sendResetPasswordEmail({
            name: user.name,
            email: user.email,
            token: passwordToken,
            origin,
        });

        // link expires in 10 minutes
        const tenMinutes = 1000 * 60 * 10;
        const passwordTokenExpirationDate = new Date(Date.now() + tenMinutes);
        // add changes to the user document
        user.passwordToken = createHash(passwordToken);
        user.passwordTokenExpirationDate = passwordTokenExpirationDate;
        // save user document
        await user.save();
    }
    res.status(StatusCodes.OK).json({
        msg: "Check your email to reset your password",
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
        throw new BadRequestError("All fields are required");
    }
    // secrah for user in MongoDB by email
    const user = await User.findOne({ email });
    // for safety don't response that user with this email doesn't exist
    // so all responses would be "The password has been successfully updated"
    if (user) {
        // check if token in request and token in user document (which hashed in MongodB) are equal
        // and also token hasn't expired yet
        const currentDate = new Date();
        if (
            user.passwordToken === createHash(token) &&
            user.passwordTokenExpirationDate > currentDate
        ) {
            // set new password
            user.password = password;
            // reset token and it's expiration time
            user.passwordToken = null;
            user.passwordTokenExpirationDate = null;
            // save user document in MongoDB
            await user.save();
            res.status(StatusCodes.OK).json({
                msg: "The password has been successfully updated. Use your new password to log in",
            });
            return;
        } else if (
            user.passwordToken === createHash(token) &&
            user.passwordTokenExpirationDate <= currentDate
        ) {
            // if token has expired
            throw new BadRequestError("The Link You Followed Has Expired");
        }
    }
    res.status(StatusCodes.OK).json({
        msg: "The password has been successfully updated. Use your new password to log in",
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
