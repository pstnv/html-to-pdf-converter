import { sendEmail } from "./sendEmail.js";

const sendResetPasswordEmail = async ({ name, email, token, origin }) => {
    const resetPasswordLink = `${origin}/reset-password.html?token=${token}&email=${email}`;
    const message = `
    <h4>Hello, ${name}!</h4>
    <p>A password reset event has been triggered. The password reset window is limited to 10 minutes. </p> 
    <p>To complete the password reset process, visit the following link: 
        <a href="${resetPasswordLink}">reset password</a>
    </p>
    <p>If you do not reset your password within 10 minutes, you will need to submit a new request.</p>`;

    // call function and pass to it arguments
    // function sendEmail returns Promise
    return sendEmail({
        to: email,
        subject: "Reset your password",
        html: message,
    });
};

export default sendResetPasswordEmail;
