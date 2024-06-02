const url = "/api/v1/users/showMe";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

const formDOM = getElement("form");
// делаем выборку всех input в форме
const inputFieldsDOM = formDOM.querySelectorAll("input");
const btnSubmitDOM = getElement(".btnSubmit");
const btnCloseDOM = getElement(".btn-close");
// переменная с информацией о пользователе
const userInfo = {};

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
        // проходимся циклом inputFieldsDOM по коллекции - по каждому input
        inputFieldsDOM.forEach((input) => {
            const field = input.name;
            // если пользователь имеет свойство, совпадающее с полем input.name,
            // заполняем поле input
            // или оставляем пустым
            input.value = user[field] || "";
            // записываем в userInfo свойство из input
            userInfo[field] = input.value;
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

formDOM.addEventListener("submit", (e) => {
    e.preventDefault();
    // нажата кнопка "Изменить"
    // активируется форма - все поля становятся доступными для редактировани
    // текст на кнопке сохранить
    if (!formDOM.classList.contains("active")) {
        inputFieldsDOM.forEach((input) => {
            input.disabled = false;
        });
        formDOM.classList.add("active");
        btnSubmitDOM.textContent = "Сохранить";
        return false;
    } else {
        // нажата кнопка "Сохранить"
        // валидируем форму
        // отправляем запрос на сервер
        // вносим новые данные в форму
        // вносим новые данные в пользователя
        // инпуты.disabled
        // кнопка "Изменить"
        // сообщение об успешной операции или ошибке (3 секунды)
        // рефактор повторяющихся функций

        // снимаем класс active с формы
        formDOM.classList.remove("active");
        btnSubmitDOM.textContent = "Изменить";
        return false;
    }
});

btnCloseDOM.addEventListener("click", () => {
    inputFieldsDOM.forEach((input) => {
        const field = input.name;
        // если пользователь имеет свойство, совпадающее с полем input.name,
        // заполняем поле input
        // или оставляем пустым
        input.value = userInfo[field] || "";
        input.disabled = true;
    });
    formDOM.classList.remove("active");
    btnSubmitDOM.textContent = "Изменить";
});
