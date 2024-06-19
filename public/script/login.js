const url = "/api/v1/auth/login";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";
import displaySuccessAnswer from "./utils/successAnswer.js";

import CustomError from "./errors/custom.js";
import { setUser, removeUser } from "./utils/localStorage.js";

// container for statuses
const alertDOM = getElement(".alert-msg");
const formDOM = getElement("form");
formDOM.addEventListener("input", (e) => {
    // clear the status if it was previously displayed
    setStatus({ container: alertDOM });
});

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        // form field names
        const formFieldsCollection = formDOM.querySelectorAll("input") || [];
        const formFields = [...formFieldsCollection].map((elem) => elem.name);
        // form data
        const formData = new FormData(formDOM);
        // check that all form fields are filled in
        const isValid = formFields.every((field) => !!formData.get(field));
        if (!isValid) {
            throw new CustomError("All fields are required");
        }

        // form the request body
        const body = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field);
            return acc;
        }, {});
        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        };
        const response = await fetch(url, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }
        const { user } = await response.json();
        // We save a record in localStorage that the user is logged in
        setUser();

        // show welcome window
        const timeDelaySec = 3;
        formDOM.innerHTML = displaySuccessAnswer(user.name, timeDelaySec);
        // redirect to home page
        setTimeout(() => {
            window.location.assign("/");
        }, timeDelaySec * 1000);
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
        // clear localStorage from recording that the user is logged in
        removeUser();

        // display status with error message
        setStatus({ container: alertDOM, message: customErr.message });
    }
});
