const url = "/api/v1/auth/verify-email";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

// контейнер статуса
const statusDOM = getElement(".status-body");

// получаем данные из url строки - token и email
const query = new URLSearchParams(window.location.search.slice(1));
const token = query.get("token");
const email = query.get("email");
setStatus("Пожалуйста, ждите...");

try {
    // формируем тело запроса
    const body = {
        verificationToken: token,
        email,
    };

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
    statusDOM.innerHTML = `
                    <h3 class="fs-4 my-4">${msg}</h3>
                    <a class="my-4" href="login.html">
                        <button class="btn btn-danger w-100 m-0">
                            Войти
                        </button>
                    </a>`;
} catch (error) {
    console.log(error.message);
    // если ошибка кастомная, отображаем ее сообщение
    // если нет - "Что-то пошло не так..."
    const customErr = {
        message:
            error instanceof CustomError
                ? error.message
                : "Что-то пошло не так. Проверьте ссылку и повторите попытку позже",
    };
    // отображаем alert с сообщением об ошибке
    setStatus(customErr.message);
}
