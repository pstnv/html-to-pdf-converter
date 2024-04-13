import getElement from "./getElement.js";

const alertDOM = getElement(".alert");

const toggleAlert = (error) => {
    // если оне передана ошибка, скрываем
    if (!error) {
        alertDOM.classList.add("hide");
        return;
    }
    // если передана ошибка, отображаем alert с сообщением
    alertDOM.textContent = error.message;
    alertDOM.classList.remove("hide");
};

export default toggleAlert;
