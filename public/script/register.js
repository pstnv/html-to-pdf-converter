const url = "/api/v1/auth/register";

import getElement from "./utils/getElement.js";
import toggleAlert from "./utils/toggleAlert.js";
import displaySuccessAnswer from "./utils/successAnswer.js";

const formDOM = getElement("form");
formDOM.addEventListener("input", (e) => {
    // скрываем alert, если он отображался ранее
    toggleAlert(null);
});

formDOM.addEventListener("submit", async (e) => {
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

        const params = {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        };
        const response = await fetch(url, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new Error(msg);
        }
        const { user } = await response.json();
        // записываем в localStorage
        localStorage.setItem("user", JSON.stringify(user));

        // отобразить приветственное окно
        formDOM.innerHTML = displaySuccessAnswer(user.name);
        // перенаправить на главную страницу
        setTimeout(() => {
            const startPage = "index.html"
            window.location.replace(startPage);
        }, 1000)
    } catch (error) {
        console.log(error.message);

        // отображаем alert с сообщением
        toggleAlert(error);
    }
});
