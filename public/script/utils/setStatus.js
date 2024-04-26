import getElement from "./getElement.js";

const alertMsg = getElement(".alert-msg");
const delayMsec = 3000;

const setStatus = (message = "", clear = false) => {
    alertMsg.textContent = message;
    if (clear) {
        setTimeout(() => {
            alertMsg.textContent = "";
        }, delayMsec);
    }
};

export default setStatus;
