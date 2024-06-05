import { sendEmail } from "./sendEmail.js";

const sendUpdateEmailEmail = async ({
    name,
    email,
    token,
    origin,
}) => {
    const confirmType = "update"
    // const verifyEmailLink = `${origin}/verify-email?token=${verificationToken}&email=${email}`;
    const updateEmailLink = `${origin}/verify-email.html?token=${token}&email=${email}&confirm=${confirmType}`;
    const message = `
    <h4>Здравствуйте, ${name}!</h4>
    <p>Для сброса изменения email-адреса перейдите по ссылке: 
        <a href="${updateEmailLink}">изменить email</a>
    </p>
    <p>Ссылка действительна в течение 1 часа.</p>`;

    // вызываем функцию и передаем в нее аргументы
    // функция sendEmail возвращает promise
    return sendEmail({
        to: email,
        subject: "Изменение почты",
        html: message,
    });
};

export default sendUpdateEmailEmail;
