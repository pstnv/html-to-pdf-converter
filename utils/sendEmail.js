import nodemailer from "nodemailer";

import nodemailerConfig from "./nodemailerConfig.js";

const sendEmail = async ({ to, subject, html }) => {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport(nodemailerConfig);

    // send email
    // method .sendMail returns Promise
    return transporter.sendMail({
        from: process.env.GMAIL_EMAIL, // email address of sender
        to, // recipient
        subject, // theme
        html, // message
    });
};

export { sendEmail };
