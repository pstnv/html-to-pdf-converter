import getElement from "./getElement.js";

const alertDOM = getElement(".alert");
const alertMsg = getElement(".alert-msg");

const toggleAlert = (error) => {
    // если не передана ошибка, скрываем
    if (!error) {
        alertDOM.classList.add("hide");
        return;
    }
    // если передана ошибка, отображаем alert с сообщением
    alertMsg.textContent = error.message;
    alertDOM.classList.remove("hide");
};

export default toggleAlert;
