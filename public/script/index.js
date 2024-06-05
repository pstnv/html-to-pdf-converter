const url = "/api/v1/tasks/html_to_pdf";

import getElement from "./utils/getElement.js";
import toggleSpinner from "./utils/toggleSpinner.js";
import setStatus from "./utils/setStatus.js";

// проверяем, есть ли в localStorage запись о пользователе
import { getUserFromLocalStorage } from "./utils/localStorage.js";
const user = getUserFromLocalStorage();

const formDOM = getElement(".form");
const fileInputDOM = getElement("#formFile");

// контейнер для статусов в форме пользователя
const alertDOM = getElement(".alert-msg");

fileInputDOM.addEventListener("change", (e) => {
    // очищаем статус, если он отображался ранее
    setStatus({ container: alertDOM });
});

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    const startConversionTime = Date.now();

    try {
        // блокируем форму и отображаем спиннер
        toggleSpinner();

        const file = fileInputDOM.files[0];
        if (!file) {
            throw new Error("Загрузите архив");
        }

        const formData = new FormData();
        formData.append("file", file);

        const params = {
            method: "POST",
            body: formData,
        };
        if (user) {
            params.headers = {
                Authorization: `Bearer ${user.token}`,
            };
        }
        const response = await fetch(url, params);
        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new Error(msg);
        }
        const blob = await response.blob();

        // имя из заголовка ответа
        const contentDisposition = response.headers.get("content-disposition");
        const filenameResponse = contentDisposition.split("filename=").pop();
        // резервное имя из отправляемого файла
        const filenameRequest = file.name.split(".zip").shift() + ".pdf";
        const filename = filenameRequest || filenameResponse;

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
            message: "Конвертация выполнена успешно",
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
