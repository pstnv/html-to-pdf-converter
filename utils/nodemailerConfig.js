import dotenv from "dotenv"; // доступ к переменным среды
dotenv.config();

// тестовый вариант
export default {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASSWORD,
    },
};

/* // production вариант
export default {
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
};
*/
