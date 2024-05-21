import { sendEmail } from "./sendEmail.js";

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
    const resetPasswordLink = `${origin}/user/reset-password?token=${token}&email=${email}`;
    const message = `
    <h4>Здравствуйте, ${name}!</h4>
    <p>Для сброса пароля перейдите по ссылке: 
        <a href="${resetPasswordLink}">сбросить пароль</a>
    </p>
    <p>Ссылка действительна в течение 10 минут.</p>`;

    // вызываем функцию и передаем в нее аргументы
    // функция sendEmail возвращает promise
    return sendEmail({
        to: email,
        subject: "Восстановления пароля",
        html: message,
    });
};

export default sendResetPasswordEmail;
