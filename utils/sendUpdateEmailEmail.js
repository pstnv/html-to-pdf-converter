import { sendEmail } from "./sendEmail.js";

const sendUpdateEmailEmail = async ({
    name,
    email,
    token,
    origin,
}) => {
    const confirmType = "update";
    const updateEmailLink = `${origin}/verify-email.html?token=${token}&email=${email}&confirm=${confirmType}`;
    const message = `
    <h4>Hello, ${name}!</h4>
    <p>To change your email visit the following link: 
        <a href="${updateEmailLink}">change email</a>
    </p>
    <p>The email change window is limited to one hour.</p>
    <p>If you do not change your email within one hour, you will need to submit a new request.</p>`;

    // call function and pass to it arguments
    // function sendEmail returns Promise
    return sendEmail({
        to: email,
        subject: "Change your email",
        html: message,
    });
};

export default sendUpdateEmailEmail;
