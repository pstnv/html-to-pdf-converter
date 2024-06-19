const url = "/api/v1/auth/forgot-password";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

// container for statuses
const btnSubmitFormDOM = getElement(".btnSubmit");
const alertDOM = getElement(".alert-msg");
const formDOM = getElement("form");
formDOM.addEventListener("input", (e) => {
    // clear status if it's displayed
    setStatus({ container: alertDOM });
});

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

        const { msg } = await response.json();

        if (Math.floor(response.status / 100) !== 2) {
            throw new CustomError(msg);
        }

        // unlock the form button when work with the server is completed
        btnSubmitFormDOM.disabled = false;
        // clear the status if it was previously displayed
        setStatus({
            container: alertDOM,
            message: msg,
        });
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
