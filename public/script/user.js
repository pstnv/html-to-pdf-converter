const userInfoURL = "/api/v1/users/showMe";
const updateUserInfoURL = "/api/v1/users/updateUser";
const updateUserEmailURL = "/api/v1/users/updateUserEmail";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";
import logoutUser from "./utils/logout.js";
import { getUser } from "./utils/localStorage.js";

import CustomError from "./errors/custom.js";

// user data form
const userFormDOM = getElement("#userForm");
// select all inputs in the userFormDOM form
const userFormFieldsCollection = userFormDOM.querySelectorAll("input");
const btnSubmitUserFormDOM = getElement(".btnSubmit");
const btnCloseUserFormDOM = getElement(".btn-close");
const emailInputUserFormDOM = getElement("#email");
// container for statuses
const alertUserFormDOM = getElement("#userForm .alert-msg");

// form for changing email
const changeEmailFormDOM = getElement("#changeEmailForm");
// select all inputs in the userFormDOM form
const changeEmailFormFieldsCollection =
    changeEmailFormDOM.querySelectorAll("input");
const btnsChangeEmailFormDOM = changeEmailFormDOM.querySelectorAll(
    ".btnChangeEmailForm"
);
// container for statuses in the email update form
const alertChangeEmailFormDOM = getElement("#changeEmailForm .alert-msg");
// modal window
const modalDOMBS = new bootstrap.Modal(getElement("#modal"));
// container for message about successful mail change
const alertConfirmEmail = getElement("#emailToConfirm");
const btnOkConfirmEmail = getElement(".btnOK");
// link Logout
const logoutDOM = getElement(".logout");

// variable with user information
const userInfo = {};

// load user profile when page loads
document.addEventListener("DOMContentLoaded", displayContent);
logoutDOM.addEventListener("click", logoutUser);

// When loading the page, check if there is an entry in localStorage about the user
// if does not exist - redirect to the authorization page
// if exists - request user profile
function displayContent() {
    const user = getUser();
    if (!user) {
        return window.location.assign("login.html");
    }
    loadUserInfo();
}
// load user profile page
async function loadUserInfo() {
    try {
        // get user data, get request, authorization via cookies
        const response = await fetch(userInfoURL);

        // if the user is not authorized, redirect him to the authorization page
        if (response.status === 401) {
            window.location.assign("login.html");
        }

        // if the server returned an error, throw an error with the received message
        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }

        // get user data from the response
        const { user } = await response.json();
        // go through the inputFieldsDOM loop through the collection - for each input
        userFormFieldsCollection.forEach((input) => {
            const field = input.name;
            // if the user has a property matching the input.name field,
            // fill in the input field
            // or leave it blank
            input.value = user[field] || "";
            // write the property from input to userInfo
            userInfo[field] = input.value;
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
        setStatus({
            container: alertUserFormDOM,
            message: customErr.message,
        });
    }
}

userFormDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    // claer status
    setStatus({
        container: alertUserFormDOM,
    });
    if (!userFormDOM.classList.contains("active")) {
        // "Change" button is pressed
        // the form is activated - all fields become available for editing
        // text on the "Save" button
        userFormFieldsCollection.forEach((input) => {
            input.disabled = false;
        });
        userFormDOM.classList.add("active");
        btnSubmitUserFormDOM.textContent = "Save";
        return false;
    }
    // "Save" button is pressed
    try {
        // display an alert with a waiting status
        setStatus({
            container: alertUserFormDOM,
            message: "Loading...",
        });
        // prevent repeated form submission if a request is already being sent to the server
        // block the button for the duration of the request to the server to exclude several requests at the same time
        btnSubmitUserFormDOM.disabled = true;
        // form field names
        const formFields = [...userFormFieldsCollection].map(
            (elem) => elem.name
        );
        // form data
        const formData = new FormData(userFormDOM);
        // check that all form fields are filled in
        const isValid = formFields.every(
            (field) => !!formData.get(field).trim()
        );
        if (!isValid) {
            throw new CustomError("All fields are required");
        }
        // form the request body
        const newUserInfo = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field).trim();
            return acc;
        }, {});
        // check that the new user data differs from the original (there is at least one change)
        const isUpdated =
            JSON.stringify(userInfo) !== JSON.stringify(newUserInfo);
        // if there are no changes, exit the function without saving
        if (!isUpdated) {
            throw new CustomError("The card has been updated");
        }

        const params = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUserInfo),
        };
        const response = await fetch(updateUserInfoURL, params);

        // if the user is not authorized, redirect him to the authorization page
        if (response.status === 401) {
            window.location.assign("login.html");
        }

        // if the server returned an error, throw an error with the received message
        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }
        // updating user data in the card
        await loadUserInfo();
        // display success message
        setStatus({
            container: alertUserFormDOM,
            message: "User info updated",
            clear: true,
        });
        // unlock the form submit button when work with the server is completed
        btnSubmitUserFormDOM.disabled = false;
    } catch (error) {
        console.log(error);
        // reset changes to the form
        userFormFieldsCollection.forEach((input) => {
            const field = input.name;
            // if the user has a property matching the input.name field,
            // fill in the input field
            // or leave it blank
            input.value = userInfo[field] || "";
        });
        // if the error is custom, display its message
        // else - "Something went wrong..."
        const customErr = {
            message:
                error.message && error instanceof CustomError
                    ? error.message
                    : "Something went wrong. Try again later",
        };

        // display status with error message
        setStatus({
            container: alertUserFormDOM,
            message: customErr.message,
        });
        // unlock the form submit button in case of an error
        btnSubmitUserFormDOM.disabled = false;
    } finally {
        // the form is deactivated - all fields become unavailable for editing
        // text on the "Edit" button
        userFormFieldsCollection.forEach((input) => {
            input.disabled = true;
        });
        userFormDOM.classList.remove("active");
        btnSubmitUserFormDOM.textContent = "Change";
        return false;
    }
});

// close the form (cross button) without saving changes
// reset changes
// deactivate the form
btnCloseUserFormDOM.addEventListener("click", () => {
    userFormFieldsCollection.forEach((input) => {
        const field = input.name;
        // if the user has a property matching the input.name field,
        // fill in the input field
        // or leave it blank
        input.value = userInfo[field] || "";
        input.disabled = true;
    });
    userFormDOM.classList.remove("active");
    btnSubmitUserFormDOM.textContent = "Change";
});

changeEmailFormDOM.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
        // display an alert with a waiting status
        setStatus({
            container: alertChangeEmailFormDOM,
            message: "Loading...",
        });
        // prevent repeated form submission if a request is already being sent to the server
        // we block the buttons (Save and Cancel) for the duration of the request to the server to exclude several requests at the same time
        btnsChangeEmailFormDOM.forEach((btn) => (btn.disabled = true));

        // form fields
        const formFields = [...changeEmailFormFieldsCollection].map(
            (elem) => elem.name
        );
        // form data
        const formData = new FormData(changeEmailFormDOM);
        // check that all form fields are filled in
        const isValid = formFields.every(
            (field) => !!formData.get(field).trim()
        );
        if (!isValid) {
            throw new CustomError("All fields are required");
        }
        // check that both mail fields match
        const newEmail = formData.get("newEmail").trim();
        const newEmailRepeat = formData.get("newEmailRepeat").trim();
        if (newEmail !== newEmailRepeat) {
            throw new CustomError("The email addresses do not match");
        }
        // check that the email has changed
        const oldEmail = userInfo.email;
        if (newEmail === oldEmail) {
            throw new CustomError("No data to change");
        }

        // form the request body
        const body = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field).trim();
            return acc;
        }, {});

        const params = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        };
        const response = await fetch(updateUserEmailURL, params);

        // if the user is not authorized, redirect him to the authorization page
        if (response.status === 401) {
            window.location.assign("login.html");
        }

        // we get the message from the response
        const { msg } = await response.json();
        // if the server returned an error, throw an error with the received message
        if (Math.floor(response.status / 100) !== 2) {
            throw new CustomError(msg);
        }
        // unlock the buttons (Save and Cancel) when work with the server is completed
        btnsChangeEmailFormDOM.forEach((btn) => (btn.disabled = false));
        // display a message about a successful request to change email
        // and the need to confirm it
        alertConfirmEmail.classList.remove("hide");
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
            container: alertChangeEmailFormDOM,
            message: customErr.message,
        });
        // unlock the buttons (Save and Cancel) when work with the server is completed
        btnsChangeEmailFormDOM.forEach((btn) => (btn.disabled = false));
    }
});

emailInputUserFormDOM.addEventListener("click", () => {
    // hide the container with the message
    alertConfirmEmail.classList.add("hide");
    // clear the form
    changeEmailFormDOM.reset();
    // hide the modal window
    modalDOMBS.hide();
    // clear the status if it was previously displayed
    setStatus({
        container: alertChangeEmailFormDOM,
    });
});

btnOkConfirmEmail.addEventListener("click", () => {
    // hide the container with the message
    alertConfirmEmail.classList.add("hide");
    // clear the form
    changeEmailFormDOM.reset();
    // hide the modal window
    modalDOMBS.hide();
    // hide the modal window
    setStatus({
        container: alertUserFormDOM,
    });
    // updating the user profile
    loadUserInfo();
});
