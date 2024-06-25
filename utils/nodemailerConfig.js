import dotenv from "dotenv"; // access to  enviroment variables
dotenv.config();

const mode = process.env.NODE_ENV?.trim();
// default configuration (used in development mode)
let nodemailerConfirg = {
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
        user: process.env.ETHEREAL_USER,
        pass: process.env.ETHEREAL_PASSWORD,
    },
};
// in production mode
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
