const url = "/api/v1/auth/login";

import getElement from "./utils/getElement.js";
import toggleAlert from "./utils/toggleAlert.js";
import displaySuccessAnswer from "./utils/successAnswer.js";
import {
    addUserToLocalStorage,
    getUserFromLocalStorage,
} from "./utils/localStorage.js";

import CustomError from "./errors/custom.js";

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
            throw new CustomError("Все поля формы должны быть заполнены");
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
            throw new CustomError(msg);
        }
        const { user } = await response.json();
        // записываем пользователя в localStorage
        addUserToLocalStorage(user);

        // отобразить приветственное окно
        const timeDelaySec = 3;
        formDOM.innerHTML = displaySuccessAnswer(user.name, timeDelaySec);
        // перенаправить на главную страницу
        setTimeout(() => {
            window.location.assign("/");
        }, timeDelaySec * 1000);
    } catch (error) {
        console.log(error.message);
        // если ошибка кастомная, отображаем ее сообщение
        // если нет - "Что-то пошло не так..."
        const customErr = {
            message:
                error instanceof CustomError
                    ? error.message
                    : "Что-то пошло не так. Повторите попытку позже",
        };

        // отображаем alert с сообщением
        toggleAlert(customErr);
    }
});

document.addEventListener("DOMContentLoaded", (e) => {
    const user = getUserFromLocalStorage();
    if (!user) {
        return;
    }
    // отобразить приветственное окно
    const timeDelaySec = 3;
    formDOM.innerHTML = displaySuccessAnswer(user.name, timeDelaySec);
    // перенаправить на главную страницу
    setTimeout(() => {
        window.location.assign("/");
    }, timeDelaySec * 1000);
});
