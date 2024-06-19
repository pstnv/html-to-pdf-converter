const url = "/api/v1/auth/register";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

const alertDOM = getElement(".alert-msg");
const btnSubmit = getElement(".btnSubmit");
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
        btnSubmit.disabled = true;

        // form fields
        const formFieldsCollection = formDOM.querySelectorAll("input") || [];
        const formFields = [...formFieldsCollection].map((elem) => elem.name);
        // form data
        const formData = new FormData(formDOM);
        // check that all form fields are filled in
        const isValid = formFields.every(
            (field) => !!formData.get(field).trim()
        );
        if (!isValid) {
            throw new CustomError("All fields are required");
        }

        // form the request body
        const body = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field).trim();
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

        // we get the message from the response
        const { msg } = await response.json();
        // if the server returned an error, throw an error with the received message
        if (Math.floor(response.status / 100) !== 2) {
            throw new CustomError(msg);
        }

        // show welcome window
        const html = `
            <div class="text-center my-1">
                <i class="fa-solid fa-check fa-4x"></i>
            </div>
            <h2 class="fs-4">Complete registration</h2>
            <p class="greet-msg">
                ${msg}
            </p>`;
        // display success message
        setStatus({
            container: formDOM,
            html,
        });
        // unlock the form submit button when work with the server is completed
        btnSubmit.disabled = false;
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
        setStatus({
            container: alertDOM,
            message: customErr.message,
        });
        // unlock the form submit button in case of an error
        btnSubmit.disabled = false;
    }
});
