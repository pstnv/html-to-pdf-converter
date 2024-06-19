import { sendEmail } from "./sendEmail.js";

const sendVerificationEmail = async ({
    name,
    email,
    verificationToken,
    origin,
}) => {
    const confirmType = "register";
    const verifyEmailLink = `${origin}/verify-email.html?token=${verificationToken}&email=${email}&confirm=${confirmType}`;
    const message = `
    <h4>Hello, ${name}!</h4>
    <p>To complete the registration process, visit the following link: 
        <a href="${verifyEmailLink}">confirm email</a>
    </p>
    <p>The password reset window is limited to 24 hours.</p>`;

    // call function and pass to it arguments
    // function sendEmail returns Promise
    return sendEmail({
        to: email,
        subject: "Confirm your email",
        html: message,
    });
};

export default sendVerificationEmail;
