const url = "/api/v1/auth/forgot-password";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

// контейнер для статусов в форме пользователя
const btnSubmitFormDOM = getElement(".btnSubmit");
const alertDOM = getElement(".alert-msg");
const formDOM = getElement("form");
formDOM.addEventListener("input", (e) => {
    // очищаем статус, если он отображался ранее
    setStatus({ container: alertDOM });
});

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
        // отображаем alert со статусом ожидания
        setStatus({
            container: alertDOM,
            message: "Пожалуйста, ждите...",
        });
        // предотвратить повторный сабмит формы, если уж идет отправка запроса на сервер
        // блокируем кнопки (Сохранить и Отмена) на время запроса на сервер для исключения нескольких запросов одновременно
        btnSubmitFormDOM.disabled = true;
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

        const { msg } = await response.json();

        if (Math.floor(response.status / 100) !== 2) {
            throw new CustomError(msg);
        }

        // разблокируем кнопку формы, когда работа с сервером завершена
        btnSubmitFormDOM.disabled = false;
        // очищаем статус, если он отображался ранее
        setStatus({
            container: alertDOM,
            message: msg,
        });
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

        // отображаем статус с сообщением об ошибке
        setStatus({ container: alertDOM, message: customErr.message });
        // разблокируем кнопки (Сохранить и Отмена), когда работа с сервером завершена
        btnSubmitFormDOM.disabled = false;
    }
});
