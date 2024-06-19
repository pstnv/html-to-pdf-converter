const url = "/api/v1/auth/reset-password";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

// container for statuses
const alertDOM = getElement(".alert-msg");
// form
const formDOM = getElement("form");
const passwordFieldDOM = getElement("#password");
const passwordConfirmFieldDOM = getElement("#passwordConfirm");
const btnSubmitFormDOM = getElement(".btnSubmit");

// we get data from the url string - token and email
const query = new URLSearchParams(window.location.search.slice(1));
const token = query.get("token");
const email = query.get("email");

// when entering passwords, check before submitting the form that they match
// if they do not match, block the form submit button
passwordFieldDOM.addEventListener("keyup", comparePassword);
passwordConfirmFieldDOM.addEventListener("keyup", comparePassword);
function comparePassword() {
    const password = passwordFieldDOM.value.trim();
    const passwordConfirm = passwordConfirmFieldDOM.value.trim();
    const isMatch = password === passwordConfirm;
    if (isMatch) {
        setStatus({ container: alertDOM, message: "Passwords match" });
        btnSubmitFormDOM.disabled = false;
    } else {
        setStatus({ container: alertDOM, message: "Password mismatch" });
        btnSubmitFormDOM.disabled = true;
    }
}

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        // display alert with status Loading
        setStatus({
            container: alertDOM,
            message: "Loading...",
        });
        // prevent repeated form submission if a request is already being sent to the server
        // we block the buttons (Save and Cancel) for the duration of the request to the server to exclude several requests at the same time
        btnSubmitFormDOM.disabled = true;
        // form fields
        const formFieldsCollection = formDOM.querySelectorAll("input") || [];
        const formFields = [...formFieldsCollection].map((elem) => elem.name);
        // orm data
        const formData = new FormData(formDOM);
        // check that all form fields are filled in
        const isValid = formFields.every((field) => !!formData.get(field));
        if (!isValid) {
            throw new CustomError("All fields are required");
        }
        // check that the passwords match
        const password = formData.get("password").trim();
        const passwordConfirm = formData.get("passwordConfirm").trim();
        const isMatch = password === passwordConfirm;
        if (!isMatch) {
            throw new CustomError("Password mismatch");
        }

        // form the request body
        const body = {
            token,
            email,
            password,
        };
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        };
        const response = await fetch(url, params);

        const { msg } = await response.json();

        if (Math.floor(response.status / 100) !== 2) {
            throw new CustomError(msg);
        }

        // unlock the form button when work with the server is completed
        btnSubmitFormDOM.disabled = false;
        // display the status of successful completion of the operation, if it was displayed previously
        const timeDelay = 3;
        const seconds = timeDelay === 1 ? "second" : "seconds";
        const html = `
            <div class="text-center my-1">
                <i class="fa-solid fa-check fa-4x"></i>
            </div>
            <p>${msg}</p>
            <p>Within ${timeDelay} ${seconds} you will be redirected to the main page.
                If this does not happen, click on the button below
            </p>
            <a class="link" href="login.html">
                <button
                    type="button"
                    class="btn btn-danger w-100 my-4"
                >
                    Log in
                </button>
            </a>`;
        setStatus({
            container: formDOM,
            html,
        });
        // send user to the login page
        setTimeout(() => {
            window.location.assign("/login.html");
        }, timeDelay * 1000);
    } catch (error) {
        console.log(error.message);
        // if the error is custom, display its message
        // else - "Something went wrong..."
        const customErr = {
            message:
                error instanceof CustomError
                    ? error.message
                    : "Something went wrong. Try again later",
        };

        // display status with error message
        setStatus({ container: alertDOM, message: customErr.message });
        // unlock the buttons (Save and Cancel) when work with the server is completed
        btnSubmitFormDOM.disabled = false;
    }
});
