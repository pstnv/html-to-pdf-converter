import { sendEmail } from "./sendEmail.js";

const sendVerificationEmail = async ({
    name,
    email,
    verificationToken,
    origin,
}) => {
    const verifyEmailLink = `${origin}/user/verify-email?token=${verificationToken}&email=${email}`;
    const message = `
    <h4>Здравствуйте, ${name}!</h4>
    <p>Для завершения регистрации перейдите по ссылке: 
        <a href="${verifyEmailLink}">подтвердить email</a>
    </p>
    <p>Ссылка действительна в течение 24 часов.</p>`;

    // вызываем функцию и передаем в нее аргументы
    // функция sendEmail возвращает promise
    return sendEmail({
        to: email,
        subject: "Подтверждение регистрации",
        html: message,
    });
};

export default sendVerificationEmail;
