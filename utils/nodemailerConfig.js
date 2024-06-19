import dotenv from "dotenv"; // access to  enviroment variables
dotenv.config();

// in developers mode
export default {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASSWORD,
    },
};

/* // in production mode
export default {
    host: "smtp.gmail.com",
    port: 587,
    auth: {
        user: process.env.GMAIL_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
    },
};
*/
