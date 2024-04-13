import getElement from "./getElement.js";

const fieldsetDOM = getElement("fieldset");
const spinnerDOM = getElement(".spinner-container");

const toggleSpinner = () => {
    // блокируем форму и отображаем спиннер на время конвертации
    // или разблокируем форму и скрываем спиннер после конвертации или при ошибке
    fieldsetDOM.disabled = !fieldsetDOM.disabled;
    spinnerDOM.classList.toggle("hide");
};

export default toggleSpinner;
