const logoutURL = "/api/v1/auth/logout";

import { removeUser } from "./localStorage.js";
import setStatus from "./setStatus.js";
import getElement from "./getElement.js";

// контейнер для статусов
const alertDOM = getElement(".alert-msg");

async function logoutUser() {
    try {
        const params = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await fetch(logoutURL, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new Error(msg);
        }
        // очищаем localStorage от записи, что пользователь залогинен
        removeUser();
        // переводим на главную страницу
        window.location.assign("/");
    } catch (error) {
        console.log(error.message);
        // очищаем localStorage от записи, что пользователь залогинен
        removeUser();
        // отображаем статус с сообщением
        setStatus({
            container: alertDOM,
            message: "Что-то пошло не так. Повторите попытку позже",
        });
    }
}

export default logoutUser;
