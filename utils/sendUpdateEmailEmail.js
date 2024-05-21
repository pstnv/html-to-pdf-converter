import { sendEmail } from "./sendEmail.js";

const sendUpdateEmailEmail = async ({
    name,
    email,
    token,
    origin,
}) => {
    const updateEmailLink = `${origin}/user/confirm-email-change?token=${token}&email=${email}`;
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
