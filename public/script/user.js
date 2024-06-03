const userInfoUrL = "/api/v1/users/showMe";
const updateUserInfoUrL = "/api/v1/users/updateUser";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

const formDOM = getElement("form");
// делаем выборку всех input в форме
const formFieldsCollection = formDOM.querySelectorAll("input");
const btnSubmitDOM = getElement(".btnSubmit");
const btnCloseDOM = getElement(".btn-close");
// переменная с информацией о пользователе
const userInfo = {};

// загрузить страницу с профилем пользователя
async function loadUserInfo() {
    try {
        // получаем данные о пользователе, get-запрос, авторизация через куки
        const response = await fetch(userInfoUrL);

        // если сервер вернул ошибку, выбрасываем ошибку с полученным сообщением
        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }

        // получаем данные о пользователе из ответа
        const { user } = await response.json();
        // проходимся циклом inputFieldsDOM по коллекции - по каждому input
        formFieldsCollection.forEach((input) => {
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

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    // нажата кнопка "Изменить"
    // активируется форма - все поля становятся доступными для редактировани
    // текст на кнопке сохранить
    if (!formDOM.classList.contains("active")) {
        formFieldsCollection.forEach((input) => {
            input.disabled = false;
        });
        formDOM.classList.add("active");
        btnSubmitDOM.textContent = "Сохранить";
        return false;
    }
    // нажата кнопка "Сохранить"
    try {
        // имена полей формы
        const formFields = [...formFieldsCollection].map((elem) => elem.name);
        // данные формы
        const formData = new FormData(formDOM);
        // проверяем, что все поля формы заполнены
        const isValid = formFields.every((field) => !!formData.get(field));
        if (!isValid) {
            throw new CustomError("Все поля формы должны быть заполнены");
        }
        // формируем тело запроса
        const newUserInfo = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field);
            return acc;
        }, {});
        // проверяем, что новые данные пользователя отличаются от исходных (есть хотя бы одно изменение)
        const isUpdated =
            JSON.stringify(userInfo) !== JSON.stringify(newUserInfo);
        // если изменений нет, выходим из функции без сохранения
        if (!isUpdated) {
            formDOM.classList.remove("active");
            btnSubmitDOM.textContent = "Изменить";
            return false;
        }

        const params = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUserInfo),
        };
        const response = await fetch(updateUserInfoUrL, params);

        // получаем сообщение из ответа
        const { user } = await response.json();
        // если сервер вернул ошибку, выбрасываем ошибку с полученным сообщением
        if (Math.floor(response.status / 100) !== 2) {
            throw new CustomError(msg);
        }
        // отобразить сообщение об успехе
        setStatus("Данные пользователя изменены", true);
    } catch (error) {
        // если ошибка кастомная, отображаем ее сообщение
        // если нет - "Что-то пошло не так..."
        const customErr = {
            message:
                error.message && error instanceof CustomError
                    ? error.message
                    : "Что-то пошло не так. Повторите попытку позже",
        };
        // отображаем alert с сообщением об ошибке
        setStatus(customErr.message);
    } finally {
        formDOM.classList.remove("active");
        btnSubmitDOM.textContent = "Изменить";
        return false;
    }
});

btnCloseDOM.addEventListener("click", () => {
    formFieldsCollection.forEach((input) => {
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
