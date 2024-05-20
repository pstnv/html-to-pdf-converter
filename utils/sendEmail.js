import nodemailer from "nodemailer";

import nodemailerConfig from "./nodemailerConfig.js";

const sendEmail = async ({ to, subject, html }) => {
    const testAccount = await nodemailer.createTestAccount();

    const transporter = nodemailer.createTransport(nodemailerConfig);

    // отправить сообщение
    // метод .sendMail возвращает promise
    return transporter.sendMail({
        from: process.env.GMAIL_EMAIL, // адрес отправителя
        to, // получатель
        subject, // тема
        html, // сообщение
    });
};

export { sendEmail };
