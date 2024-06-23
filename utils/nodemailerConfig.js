import dotenv from "dotenv"; // access to  enviroment variables
dotenv.config();

const mode = process.env.NODE_ENV?.trim();
// конфигурация по умолчанию, используем в режиме разработчика
// где идет эмуляци отправки электронных писем с помощью ethereal
let nodemailerConfirg = {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASSWORD,
    },
};
// в режиме продакшн используем реальную почту
if (mode === "production") {
    nodemailerConfirg = {
        host: "smtp.gmail.com",
        port: 587,
        auth: {
            user: process.env.GMAIL_EMAIL,
            pass: process.env.GMAIL_APP_PASSWORD,
        },
    };
}

export default nodemailerConfirg;