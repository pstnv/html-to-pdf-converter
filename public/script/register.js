const url = "/api/v1/auth/register";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";
import displaySuccessAnswer from "./utils/successAnswer.js";
import { addUserToLocalStorage } from "./utils/localStorage.js";

import CustomError from "./errors/custom.js";

const formDOM = getElement("form");
formDOM.addEventListener("input", (e) => {
    // очищаем статус, если он отображался ранее
    setStatus();
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
        const { msg } = await response.json();

        // отобразить приветственное окно
        formDOM.innerHTML = `
            <div class="text-center my-1">
                <i class="fa-solid fa-check fa-4x"></i>
            </div>
            <h2 class="fs-4">Завершите регистрацию</h2>
            <p class="greet-msg">
                ${msg}
            </p>`;
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
        setStatus(customErr.message);
    }
});
