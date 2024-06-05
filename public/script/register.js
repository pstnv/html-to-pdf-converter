const url = "/api/v1/auth/register";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

const alertDOM = getElement(".alert-msg");
const btnSubmit = getElement(".btnSubmit");
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
        btnSubmit.disabled = true;

        // имена полей формы
        const formFieldsCollection = formDOM.querySelectorAll("input") || [];
        const formFields = [...formFieldsCollection].map((elem) => elem.name);
        // данные формы
        const formData = new FormData(formDOM);
        // проверяем, что все поля формы заполнены
        const isValid = formFields.every(
            (field) => !!formData.get(field).trim()
        );
        if (!isValid) {
            throw new CustomError("Все поля формы должны быть заполнены");
        }

        // формируем тело запроса
        const body = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field).trim();
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

        // получаем сообщение из ответа
        const { msg } = await response.json();
        // если сервер вернул ошибку, выбрасываем ошибку с полученным сообщением
        if (Math.floor(response.status / 100) !== 2) {
            throw new CustomError(msg);
        }

        // отобразить приветственное окно
        const html = `
            <div class="text-center my-1">
                <i class="fa-solid fa-check fa-4x"></i>
            </div>
            <h2 class="fs-4">Завершите регистрацию</h2>
            <p class="greet-msg">
                ${msg}
            </p>`;
        // отобразить сообщение об успехе
        setStatus({
            container: formDOM,
            html,
        });
        // разблокируем кнопку отправки формы, когда работа с сервером завершена
        btnSubmit.disabled = false;
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
        // отображаем alert с сообщением об ошибке
        setStatus({
            container: alertDOM,
            message: customErr.message,
        });
        // разблокируем кнопку отправки формы в случае ошибки
        btnSubmit.disabled = false;
    }
});
