const url = "/api/v1/users/showMe";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

const formDOM = getElement("form");

// загрузить страницу с профилем пользователя
async function loadUserInfo() {
    try {
        // получаем данные о пользователе, get-запрос, авторизация через куки
        const response = await fetch(url);

        // если сервер вернул ошибку, выбрасываем ошибку с полученным сообщением
        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }

        // получаем данные о пользователе из ответа
        const { user } = await response.json();
        // делаем выборку всех input в форме
        const inputFieldsDOM = formDOM.querySelectorAll("input");
        // проходимся по коллекции - по каждому input
        inputFieldsDOM.forEach((input) => {
            const field = input.name;
            // если пользователь имеет свойство, совпадающее с полем input.name,
            // заполняем это поле или оставляем пустым
            input.value = user[field] || "";
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
        // отображаем alert с сообщением об ошибке
        setStatus(customErr.message);
    }
}

// при загрузке страницы загрузить профиль пользователя
loadUserInfo();
