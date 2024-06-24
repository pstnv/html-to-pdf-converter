import crypto from "crypto";
import { StatusCodes } from "http-status-codes";
// models MongoDB
import User from "../models/User.js";
// errors
import { BadRequestError, UnauthenticatedError } from "../errors/index.js";
// utils
import {
    createTokenUser,
    attachCookiesToResponse,
    createHash,
    sendUpdateEmailEmail,
} from "../utils/index.js";

const showCurrentUser = async (req, res) => {
    const { userId } = req.user;
    // find document User in MongoDB, delete prop passsword from the result
    const user = await User.findOne({ _id: userId }).select("-password");
    res.status(StatusCodes.OK).json({
        user: { name: user.name, email: user.email },
    });

    /*
        #swagger.summary = 'Show current user'
        #swagger.description = 'User must be authenticated' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.responses[200] = {
            schema: {
                user: {$ref: '#/definitions/CurrentUser'}
            },
            description: 'Current user successfully fetched',
        }
        #swagger.responses[401] = {
            schema: {
                msg: 'Authentication failed'
            },
            description: 'User must be authenticated',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Internal server error',
        }    
    */
};

const updateUser = async (req, res) => {
    // *current user setting have fields name, email, password
    // **email and password can be changed with other functions
    const { name } = req.body;
    // check if field name exists
    if (!name) {
        throw new BadRequestError("All fields are required");
    }
    // search for user in MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });
    // change every prop in user separately
    // do not use method .findOneAndUpdate because it doesn't call method "pre"
    user.name = name;
    // save changes in user document
    await user.save();
    // create new token beacuse user properties have changed
    const tokenUser = createTokenUser(user);
    // attach to the cookies
    attachCookiesToResponse({ res, user: tokenUser });
    res.status(StatusCodes.OK).json({ user: tokenUser });

    /*
        #swagger.summary = 'Update user info'
        #swagger.description = 'User must be authenticated' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'The request body contains user parameters - name',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/UpdateUser'
            }
        } 
        #swagger.responses[200] = {
            schema: {
                user: {$ref: '#/definitions/TokenUpdatedUser'}
            },
            description: 'User updated successfully',
        }
        #swagger.responses[401] = {
            schema: {
                msg: 'Authentication failed'
            },
            description: 'User must be authenticated',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The field name is required'
            },
            description: 'User update failed. Missing name',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Internal server error',
        }    
    */
};

const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body;
    // check both passwords present - old and new
    if (!oldPassword || !newPassword) {
        throw new BadRequestError("All fields are required");
    }
    // search for user in MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });
    // check if old password matches
    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Password incorrect");
    }
    // change password
    user.password = newPassword;
    // save user document
    await user.save();
    res.status(StatusCodes.OK).json({ msg: "Password has been changed" });

    /*
        #swagger.summary = 'Update user password'
        #swagger.description = 'User must be authenticated' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'The request body contains user parameters - oldPassword, newPassword',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/UpdateUserPassword'
            }
        } 
        #swagger.responses[200] = {
            schema: {
                msg: 'User password updated successfully'
            },
            description: 'User password updated successfully',
        }
        #swagger.responses[401] = {
            schema: {
                msg: 'Authentication failed'
            },
            description: 'User must be authenticated',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The fields oldPassword and newPassword are required'
            },
            description: 'User update failed. Missing oldPassword (or newPassword)',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Internal server error',
        }    
    */
};

const updateUserEmail = async (req, res) => {
    const { newEmail, newEmailRepeat, password } = req.body;
    if (!newEmail || !newEmailRepeat || !password) {
        throw new BadRequestError("All fields are required");
    }
    if (newEmail !== newEmailRepeat) {
        throw new BadRequestError("The email addresses mismatch");
    }
    // check if user is already registered
    const emailAlreadyExists = await User.findOne({ email: newEmail });
    if (emailAlreadyExists) {
        throw new BadRequestError(
            `Account with the email ${email} already exists`
        );
    }
    // search for user in MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });

    // check if password correct
    const isPasswordCorrect = await user.comparePassword(password);
    if (!isPasswordCorrect) {
        throw new UnauthenticatedError("Password incorrect");
    }
    // create token for changing email
    const emailToken = crypto.randomBytes(70).toString("hex");
    // send email with link to change email
    // dev && prod
    let origin = process.env.ORIGIN_DEV; // in dev-mode localhost:5000 (|| 3000), in prod-mode - link to the front
    if (process.env.NODE_ENV?.trim() === "production") {
        // prod
        origin = process.env.ORIGIN_PROD;
    }
    await sendUpdateEmailEmail({
        name: user.name,
        email: newEmail,
        token: emailToken,
        origin,
    });

    // link expiration date
    const oneHour = 1000 * 60 * 60;
    const emailTokenExpirationDate = new Date(Date.now() + oneHour);
    // add changes to user document
    user.emailToken = createHash(emailToken);
    user.emailTokenExpirationDate = emailTokenExpirationDate;
    // save changes to user document
    await user.save();
    res.status(StatusCodes.OK).json({
        msg: "Check the confirmation email in your new email inbox ",
    });

    /*
        #swagger.summary = 'Update user email'
        #swagger.description = 'User must be authenticated' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'The request body contains user parameters - newEmail, newEmailRepeat, password, newPassword',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/UpdateUserEmail'
            }
        } 
        #swagger.responses[200] = {
            schema: {
                msg: 'Please check your new email to confirm it'
            },
            description: 'User needs to check new email to confirm it',
        }
        #swagger.responses[401] = {
            schema: {
                msg: 'Authentication failed'
            },
            description: 'User must be authenticated',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The fields newEmail (or newEmailRepeat, password) is required'
            },
            description: 'User email update failed. Missing newEmail (or newEmailRepeat, password)',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Internal server error',
        }    
    */
};

// user clicks on the confirmation link to change email and sends response
const verifyUpdatedUserEmail = async (req, res) => {
    const { verificationToken: emailToken, email: newEmail } = req.body;
    if (!emailToken || !newEmail) {
        throw new BadRequestError("All fields are required");
    }
    // check if user with this email is already registered
    const emailAlreadyExists = await User.findOne({ email: newEmail });
    if (emailAlreadyExists) {
        throw new BadRequestError(
            `Account with the email ${email} already exists`
        );
    }
    // search for user in MongoDB
    const { userId } = req.user;
    const user = await User.findOne({ _id: userId });
    // check emailToken from response(letter) and user.emailToken in mongoDB are equal
    // also check if link has expired
    const currentDate = new Date();
    if (
        user.emailToken === createHash(emailToken) &&
        user.emailTokenExpirationDate > currentDate
    ) {
        // set new email
        user.email = newEmail;
        // clear emailToken and its expiration date
        user.emailToken = null;
        user.emailTokenExpirationDate = null;
        // save user document in MongoDB
        await user.save();
        res.status(StatusCodes.OK).json({
            msg: "Your email address has been successfully changed. Use your new email to login",
        });
        return;
    } else if (
        user.emailToken === createHash(emailToken) &&
        user.emailTokenExpirationDate <= currentDate
    ) {
        // if emailToken from response(letter) and user.emailToken in mongoDB  are equal
        // but link has expired
        throw new BadRequestError("The link you followed has expired");
    }
    // for security purposes send success answer
    res.status(StatusCodes.OK).json({
        msg: "Your email address has been successfully changed. Use your new email to login",
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
                $ref: '#/definitions/VerifyNewUserEmail'
            }
        }
        #swagger.responses[200] = {
            schema: {
                msg: 'User email updated. Please login with your new email'
            },
            description: 'User email updated',
        }
        #swagger.responses[401] = {
            schema: {
                msg: 'Authentication failed'
            },
            description: 'User must be authenticated',
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'The field email (or verificationToken) is required'
            },
            description: 'User email update failed. Missing email (or verificationToken)',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Internal server error',
        }    
        */
};

export {
    showCurrentUser,
    updateUser,
    updateUserPassword,
    updateUserEmail,
    verifyUpdatedUserEmail,
};
