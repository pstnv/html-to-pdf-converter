const url = "/api/v1/tasks/html_to_pdf";

import getElement from "./utils/getElement.js";
import toggleSpinner from "./utils/toggleSpinner.js";
import setStatus from "./utils/setStatus.js";
import { getUser } from "./utils/localStorage.js";
import logoutUser from "./utils/logout.js";

import CustomError from "./errors/custom.js";

const formDOM = getElement(".form");
const fileInputDOM = getElement("#formFile");
// контейнер для статусов в форме пользователя
const alertDOM = getElement(".alert-msg");
// контейнер для статусов в форме пользователя
const logLinkDOM = getElement(".logLink");

// при загрузке страницы отобразить header корректно
document.addEventListener("DOMContentLoaded", displayPageHeader);
// если пользователь выбирает файл, очищаем статус (на слуйчай, если отображался ранее)
fileInputDOM.addEventListener("change", clearStatus);

// если пользователь залогинен, в header отобразить "Выйти",если нет - "Войти"
function displayPageHeader() {
    const user = getUser();
    if (user) {
        logLinkDOM.textContent = "Выйти";
        logLinkDOM.href = "";
        logLinkDOM.addEventListener("click", logoutUser);
    } else {
        logLinkDOM.textContent = "Вход/регистрация";
        logLinkDOM.href = "login.html";
        logLinkDOM.removeEventListener("click", logoutUser);
    }
}
// очистить статус
function clearStatus() {
    setStatus({ container: alertDOM });
}

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const startConversionTime = Date.now();

    try {
        // блокируем форму и отображаем спиннер
        toggleSpinner();

        const file = fileInputDOM.files[0];
        if (!file) {
            throw new CustomError("Загрузите архив");
        }
        // прикрепляем файл
        const formData = new FormData();
        formData.append("file", file);

        const params = {
            method: "POST",
            body: formData,
        };
        const response = await fetch(url, params);
        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }
        const blob = await response.blob();

        // получаем имя файла из заголовка ответа
        const contentDisposition = response.headers.get("content-disposition");
        const filenameResponse = contentDisposition.split("filename=").pop();
        // если предыдущий способ не дал результат - получаем имя из отправленного пользователем файла
        const filenameRequest = file.name.split(".zip").shift() + ".pdf";
        // присваиваемое файлу имя
        const filename = filenameRequest || filenameResponse;
        // принудительный запуск скачивания резульата под файлом filename
        let dataURL = URL.createObjectURL(blob);
        let anchor = document.createElement("a");
        anchor.href = dataURL;
        anchor.download = filename;
        document.body.append(anchor);
        anchor.style = "display:none";
        anchor.click();
        anchor.remove();
        setStatus({
            container: alertDOM,
            message: "Конвертация выполнена успешно. Файл скачан",
            clear: true,
        });
    } catch (error) {
        console.log(error.message);

        // отображаем alert с сообщением
        setStatus({
            container: alertDOM,
            message: error.message,
        });
    } finally {
        // разблокируем форму и скрываем спиннер
        toggleSpinner(startConversionTime);
    }
});
