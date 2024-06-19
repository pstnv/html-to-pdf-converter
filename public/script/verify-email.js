const url = {
    register: "/api/v1/auth/verify-email",
    update: "/api/v1/users/verifyUpdatedUserEmail",
};

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

// container for statuses
const alertDOM = getElement(".alert-msg");

// get data from the url string - token and email
const query = new URLSearchParams(window.location.search.slice(1));
const token = query.get("token");
const email = query.get("email");
const confirmType = query.get("confirm"); // register or update
setStatus({ container: alertDOM, message: "Loading..." });

try {
    // form the request body
    const body = {
        verificationToken: token,
        email,
    };

    const params = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
    };
    const verifyEmailURL = url[confirmType];
    const response = await fetch(verifyEmailURL, params);

    // we get the message from the response
    const { msg } = await response.json();
    // if the server returned an error, throw an error with the received message
    if (Math.floor(response.status / 100) !== 2) {
        throw new CustomError(msg);
    }
    const html = `
                <h3 class="fs-4 my-4">${msg}</h3>
                <a class="my-4" href="login.html">
                    <button class="btn btn-danger w-100 m-0">
                        Log in
                    </button>
                </a>`;
    setStatus({ container: alertDOM, html });
} catch (error) {
    console.log(error.message);
    // if the error is custom, display its message
    // else - "Something went wrong..."
    const customErr = {
        message:
            error instanceof CustomError
                ? error.message
                : "Something went wrong. Check the link and try again later",
    };
    // display status with error message
    setStatus({ container: alertDOM, message: customErr.message });
}
