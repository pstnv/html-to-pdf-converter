const userInfoURL = "/api/v1/users/showMe";
const updateUserInfoURL = "/api/v1/users/updateUser";
const updateUserEmailURL = "/api/v1/users/updateUserEmail";

import getElement from "./utils/getElement.js";
import setStatus from "./utils/setStatus.js";

import CustomError from "./errors/custom.js";

// форма данных пользователя
const userFormDOM = getElement("#userForm");
// делаем выборку всех input в форме userFormDOM
const userFormFieldsCollection = userFormDOM.querySelectorAll("input");
const btnSubmitUserFormDOM = getElement(".btnSubmit");
const btnCloseUserFormDOM = getElement(".btn-close");
const emailInputUserFormDOM = getElement("#email");
// контейнер для статусов в форме пользователя
const alertUserFormDOM = getElement("#userForm .alert-msg");

// форма для изменения email
const changeEmailFormDOM = getElement("#changeEmailForm");
// делаем выборку всех input в форме userFormDOM
const changeEmailFormFieldsCollection =
    changeEmailFormDOM.querySelectorAll("input");
const btnsChangeEmailFormDOM = changeEmailFormDOM.querySelectorAll(
    ".btnChangeEmailForm"
);
// контейнер для статусов в форме обновления email
const alertChangeEmailFormDOM = getElement("#changeEmailForm .alert-msg");
// модальное окно
const modalDOMBS = new bootstrap.Modal(getElement("#modal"));
// контейнер для сообщения об успешном изменении почты
const alertConfirmEmail = getElement("#emailToConfirm");
const btnOkConfirmEmail = getElement(".btnOK");

// переменная с информацией о пользователе
const userInfo = {};

// загрузить страницу с профилем пользователя
async function loadUserInfo() {
    try {
        // получаем данные о пользователе, get-запрос, авторизация через куки
        const response = await fetch(userInfoURL);

        // если сервер вернул ошибку, выбрасываем ошибку с полученным сообщением
        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }

        // получаем данные о пользователе из ответа
        const { user } = await response.json();
        // проходимся циклом inputFieldsDOM по коллекции - по каждому input
        userFormFieldsCollection.forEach((input) => {
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
        setStatus({
            container: alertUserFormDOM,
            message: customErr.message,
        });
    }
}

// при загрузке страницы загрузить профиль пользователя
loadUserInfo();

userFormDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    // очищаем статус, если он отображался ранее
    setStatus({
        container: alertUserFormDOM,
    });
    if (!userFormDOM.classList.contains("active")) {
        // нажата кнопка "Изменить"
        // активируется форма - все поля становятся доступными для редактирования
        // текст на кнопке "Сохранить"
        userFormFieldsCollection.forEach((input) => {
            input.disabled = false;
        });
        userFormDOM.classList.add("active");
        btnSubmitUserFormDOM.textContent = "Сохранить";
        return false;
    }
    // нажата кнопка "Сохранить"
    try {
        // отображаем alert со статусом ожидания
        setStatus({
            container: alertUserFormDOM,
            message: "Пожалуйста, ждите...",
        });
        // предотвратить повторный сабмит формы, если уж идет отправка запроса на сервер
        // блокируем кнопку на время запроса на сервер для исключения нескольких запросов одновременно
        btnSubmitUserFormDOM.disabled = true;
        // имена полей формы
        const formFields = [...userFormFieldsCollection].map(
            (elem) => elem.name
        );
        // данные формы
        const formData = new FormData(userFormDOM);
        // проверяем, что все поля формы заполнены
        const isValid = formFields.every(
            (field) => !!formData.get(field).trim()
        );
        if (!isValid) {
            throw new CustomError("Все поля формы должны быть заполнены");
        }
        // формируем тело запроса
        const newUserInfo = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field).trim();
            return acc;
        }, {});
        // проверяем, что новые данные пользователя отличаются от исходных (есть хотя бы одно изменение)
        const isUpdated =
            JSON.stringify(userInfo) !== JSON.stringify(newUserInfo);
        // если изменений нет, выходим из функции без сохранения
        if (!isUpdated) {
            throw new CustomError("Нет данных для изменения");
        }

        const params = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newUserInfo),
        };
        const response = await fetch(updateUserInfoURL, params);

        // если сервер вернул ошибку, выбрасываем ошибку с полученным сообщением
        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }
        //обновляем данные о пользователе в карточке
        await loadUserInfo();
        // отобразить сообщение об успехе
        setStatus({
            container: alertUserFormDOM,
            message: "Данные пользователя обновлены",
            clear: true,
        });
        // разблокируем кнопку отправки формы, когда работа с сервером завершена
        btnSubmitUserFormDOM.disabled = false;
    } catch (error) {
        console.log(error);
        // сбрасываем изменения в форме
        userFormFieldsCollection.forEach((input) => {
            const field = input.name;
            // если пользователь имеет свойство, совпадающее с полем input.name,
            // заполняем поле input
            // или оставляем пустым
            input.value = userInfo[field] || "";
        });
        // если ошибка кастомная, отображаем ее сообщение
        // если нет - "Что-то пошло не так..."
        const customErr = {
            message:
                error.message && error instanceof CustomError
                    ? error.message
                    : "Что-то пошло не так. Повторите попытку позже",
        };
        // отображаем alert с сообщением об ошибке
        setStatus({
            container: alertUserFormDOM,
            message: customErr.message,
        });
        // разблокируем кнопку отправки формы в случае ошибки
        btnSubmitUserFormDOM.disabled = false;
    } finally {
        // дезактивируется форма - все поля становятся недоступными для редактировани
        // текст на кнопке "Изменить"
        userFormFieldsCollection.forEach((input) => {
            input.disabled = true;
        });
        userFormDOM.classList.remove("active");
        btnSubmitUserFormDOM.textContent = "Изменить";
        return false;
    }
});

// закрыть форму (кнопка крестик) без сохранения изменений
// сбрасываем изменения
// дезактивируем форму
btnCloseUserFormDOM.addEventListener("click", () => {
    userFormFieldsCollection.forEach((input) => {
        const field = input.name;
        // если пользователь имеет свойство, совпадающее с полем input.name,
        // заполняем поле input
        // или оставляем пустым
        input.value = userInfo[field] || "";
        input.disabled = true;
    });
    userFormDOM.classList.remove("active");
    btnSubmitUserFormDOM.textContent = "Изменить";
});

changeEmailFormDOM.addEventListener("submit", async function (e) {
    e.preventDefault();
    try {
        // отображаем alert со статусом ожидания
        setStatus({
            container: alertChangeEmailFormDOM,
            message: "Пожалуйста, ждите...",
        });
        // предотвратить повторный сабмит формы, если уж идет отправка запроса на сервер
        // блокируем кнопки (Сохранить и Отмена) на время запроса на сервер для исключения нескольких запросов одновременно
        btnsChangeEmailFormDOM.forEach((btn) => (btn.disabled = true));
        // имена полей формы
        const formFields = [...changeEmailFormFieldsCollection].map(
            (elem) => elem.name
        );
        // данные формы
        const formData = new FormData(changeEmailFormDOM);
        // проверяем, что все поля формы заполнены
        const isValid = formFields.every(
            (field) => !!formData.get(field).trim()
        );
        if (!isValid) {
            throw new CustomError("Все поля формы должны быть заполнены");
        }
        // проверяем, что оба поля почта совпадают
        const newEmail = formData.get("newEmail").trim();
        const newEmailRepeat = formData.get("newEmailRepeat").trim();
        if (newEmail !== newEmailRepeat) {
            throw new CustomError("Введенные email адреса не совпадают");
        }
        // проверяем, что почта изменилась
        const oldEmail = userInfo.email;
        if (newEmail === oldEmail) {
            throw new CustomError("Нет данных для изменения");
        }

        // формируем тело запроса
        const body = formFields.reduce((acc, field) => {
            acc[field] = formData.get(field).trim();
            return acc;
        }, {});

        const params = {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body),
        };
        const response = await fetch(updateUserEmailURL, params);

        // получаем сообщение из ответа
        const { msg } = await response.json();
        // если сервер вернул ошибку, выбрасываем ошибку с полученным сообщением
        if (Math.floor(response.status / 100) !== 2) {
            throw new CustomError(msg);
        }
        // разблокируем кнопки (Сохранить и Отмена), когда работа с сервером завершена
        btnsChangeEmailFormDOM.forEach((btn) => (btn.disabled = false));
        // показываем сообщение об успешном запросе на изменение email
        // и необходимости его подтверждения
        alertConfirmEmail.classList.remove("hide");
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
            container: alertChangeEmailFormDOM,
            message: customErr.message,
        });
        // разблокируем кнопки (Сохранить и Отмена) в случае ошибки
        btnsChangeEmailFormDOM.forEach((btn) => (btn.disabled = false));
    }
});

emailInputUserFormDOM.addEventListener("click", () => {
    // скрываем контейнер с сообщением
    alertConfirmEmail.classList.add("hide");
    // очищаем форму
    changeEmailFormDOM.reset();
    // скрываем модальное окно
    modalDOMBS.hide();
    // очищаем статус, если он отображался ранее
    setStatus({
        container: alertChangeEmailFormDOM,
    });
});

btnOkConfirmEmail.addEventListener("click", () => {
    // скрываем контейнер с сообщением
    alertConfirmEmail.classList.add("hide");
    // очищаем форму
    changeEmailFormDOM.reset();
    // скрываем модальное окно
    modalDOMBS.hide();
    // очищаем статус, если он отображался ранее
    setStatus({
        container: alertUserFormDOM,
    });
});

// **если пользователь подтвердил почту - перевести на страницу подтверждения
// добавить блокировку почты на время регистрации
