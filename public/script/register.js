const url = "/api/v1/auth/register";

import getElement from "./utils/getElement.js";
import toggleAlert from "./utils/toggleAlert.js";

const formDOM = getElement("form");
const alertDOM = getElement(".alert");

formDOM.addEventListener("input", (e) => {
    // скрываем alert, если он отображался ранее
    toggleAlert(null);
})

formDOM.addEventListener("submit", (e) => {
    e.preventDefault();

    try {
        // имена полей формы
        const formFieldsCollection = formDOM.querySelectorAll("input") || [];
        const formFields = [...formFieldsCollection].map((elem) => elem.name);
        // данные формы
        const formData = new FormData(formDOM);
        // проверяем, что все поля формы заполнены
        const isValid = formFields.every((field) => !!formData.get(field));
        if (!isValid) {
            throw new Error("Все поля формы должны быть заполнены");
        }

        // формируем тело запроса
        const body = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field);
            return acc;
        }, {});
        console.log(body);
    } catch (error) {
        console.log(error.message);

        // отображаем alert с сообщением
        toggleAlert(error);
    }
});
