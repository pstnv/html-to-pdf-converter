const url = "/api/v1/tasks/html_to_pdf";

import getElement from "./utils/getElement.js";
import toggleSpinner from "./utils/toggleSpinner.js";
import setStatus from "./utils/setStatus.js";
import { getUser } from "./utils/localStorage.js";
import logoutUser from "./utils/logout.js";

import CustomError from "./errors/custom.js";

const formDOM = getElement(".form");
const fileInputDOM = getElement("#formFile");
// container for statuses
const alertDOM = getElement(".alert-msg");
// link to login
const logLinkDOM = getElement(".logLink");

// display the header correctly when the page loads
document.addEventListener("DOMContentLoaded", displayPageHeader);
// if the user selects a file, we clear the status (in case it was displayed earlier)
fileInputDOM.addEventListener("change", clearStatus);

// if the user is logged in, display "Logout" in the header, if not - "Login"
function displayPageHeader() {
    const user = getUser();
    if (user) {
        logLinkDOM.textContent = "Logout";
        logLinkDOM.href = "";
        logLinkDOM.addEventListener("click", logoutUser);
    } else {
        logLinkDOM.textContent = "Login/Sign up";
        logLinkDOM.href = "login.html";
        logLinkDOM.removeEventListener("click", logoutUser);
    }
}
// clear status function
function clearStatus() {
    setStatus({ container: alertDOM });
}

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const startConversionTime = Date.now();

    try {
        // lock the form and display the spinner
        toggleSpinner();

        const file = fileInputDOM.files[0];
        if (!file) {
            throw new CustomError("Upload zip-archive");
        }
        // attach the file
        const formData = new FormData();
        formData.append("file", file);

        const params = {
            method: "POST",
            body: formData,
        };
        const response = await fetch(url, params);
        if (Math.floor(response.status / 100) !== 2) {
            const { msg, err } = await response.json();
            console.log(err)
            console.log(msg)
            throw new CustomError(msg);
        }
        const blob = await response.blob();

        // get the file name from the response header
        const contentDisposition = response.headers.get("content-disposition");
        const filenameResponse = contentDisposition.split("filename=").pop();
        // if the previous method did not produce results, we get the name from the file sent by the user
        const filenameRequest = file.name.split(".zip").shift() + ".pdf";
        // file name
        const filename = filenameRequest || filenameResponse;
        // forced start of downloading the result under the file filename
        let dataURL = URL.createObjectURL(blob);
        let anchor = document.createElement("a");
        anchor.href = dataURL;
        anchor.download = filename;
        document.body.append(anchor);
        anchor.style = "display:none";
        anchor.click();
        anchor.remove();
        setStatus({
            container: alertDOM,
            message: "Conversion completed successfully. File downloaded",
            clear: true,
        });
    } catch (error) {
        console.log(error.message);

        // display an alert with a message
        setStatus({
            container: alertDOM,
            message: error.message,
        });
    } finally {
        // unlock the form and hide the spinner
        toggleSpinner(startConversionTime);
    }
});
