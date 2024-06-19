const logoutURL = "/api/v1/auth/logout";

import { removeUser } from "./localStorage.js";
import setStatus from "./setStatus.js";
import getElement from "./getElement.js";

// container for statuses
const alertDOM = getElement(".alert-msg");

async function logoutUser() {
    try {
        const params = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await fetch(logoutURL, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new Error(msg);
        }
        // clear localStorage from recording that the user is logged in
        removeUser();
        // move to main page
        window.location.assign("/");
    } catch (error) {
        console.log(error.message);
        // clear localStorage from recording that the user is logged in
        removeUser();
        // display status with message
        setStatus({
            container: alertDOM,
            message: "Something went wrong. Try again later",
        });
    }
}

export default logoutUser;
