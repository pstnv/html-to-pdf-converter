const url = "/api/v1/auth/reset-password";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

// контейнер для статусов в форме пользователя
const alertDOM = getElement(".alert-msg");
// форма
const formDOM = getElement("form");
const passwordFieldDOM = getElement("#password");
const passwordConfirmFieldDOM = getElement("#passwordConfirm");
const btnSubmitFormDOM = getElement(".btnSubmit");

// получаем данные из url строки - token и email
const query = new URLSearchParams(window.location.search.slice(1));
const token = query.get("token");
const email = query.get("email");

// при введении паролей сравнить до сабмита формы, что они совпадают
// если не совпадают - заблокировать кнопку сабмита формы
passwordFieldDOM.addEventListener("keyup", comparePassword);
passwordConfirmFieldDOM.addEventListener("keyup", comparePassword);
function comparePassword() {
    const password = passwordFieldDOM.value.trim();
    const passwordConfirm = passwordConfirmFieldDOM.value.trim();
    const isMatch = password === passwordConfirm;
    if (isMatch) {
        setStatus({ container: alertDOM, message: "Пароли совпадают" });
        btnSubmitFormDOM.disabled = false;
    } else {
        setStatus({ container: alertDOM, message: "Пароли не совпадают" });
        btnSubmitFormDOM.disabled = true;
    }
}

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
        // проверяем, что пароли совпадают
        const password = formData.get("password").trim();
        const passwordConfirm = formData.get("passwordConfirm").trim();
        const isMatch = password === passwordConfirm;
        if (!isMatch) {
            throw new CustomError("Пароли не совпадают");
        }

        // формируем тело запроса
        const body = {
            token,
            email,
            password,
        };
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
        // отображаем статус о успешном завершении операции, если он отображался ранее
        const timeDelay = 3;
        const seconds = timeDelay === 1 ? "секунды" : "секунд";
        const html = `
            <div class="text-center my-1">
                <i class="fa-solid fa-check fa-4x"></i>
            </div>
            <p>${msg}</p>
            <p> В течение ${timeDelay} ${seconds} Вы будете перенаправлены на главную страницу.
                Если это не произошло, нажмите на кнопку ниже
            </p>
            <a class="link" href="login.html">
                <button
                    type="button"
                    class="btn btn-danger w-100 my-4"
                >
                    Войти
                </button>
            </a>`;
        setStatus({
            container: formDOM,
            html,
        });
        // переводим на страницу авторизации
        // setTimeout(() => {
        //     window.location.assign("/login.html");
        // }, timeDelay * 1000);
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
