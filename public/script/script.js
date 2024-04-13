const url = "/api/v1/convertion/uploads";

import getElement from "./utils/getElement.js";
import toggleSpinner from "./utils/toggleSpinner.js";
import toggleAlert from "./utils/toggleAlert.js";

const formDOM = getElement(".form");
const fileInputDOM = getElement("#formFile");

fileInputDOM.addEventListener("change", (e) => {
    // скрываем alert, если он отображался ранее
    toggleAlert(null);
});

formDOM.addEventListener("submit", async (e) => {
    e.preventDefault();
    try {
        const file = fileInputDOM.files[0];
        if (!file) {
            throw new Error("Загрузите архив");
        }
        // блокируем форму и отображаем спиннер
        toggleSpinner();

        const formData = new FormData();
        formData.append("file", file);

        const params = {
            method: "POST",
            body: formData,
        };
        const response = await fetch(`${url}`, params);
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

        // разблокируем форму и скрываем спиннер
        toggleSpinner();
    } catch (error) {
        console.log(error.message);

        // отображаем alert с сообщением
        toggleAlert(error);

        // разблокируем форму и скрываем спиннер
        toggleSpinner();
    }
});
