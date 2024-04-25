const url = "/api/v1/conversions";

import getElement from "./utils/getElement.js";
const tableBody = getElement("tbody");

// import toggleAlert from "./utils/toggleAlert.js";
// import displaySuccessAnswer from "./utils/successAnswer.js";

import { getUserFromLocalStorage } from "./utils/localStorage.js";
const user = getUserFromLocalStorage();

// import CustomError from "./errors/custom.js";

const getAllTasks = async () => {
    try {
        const params = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${user.token}`,
            },
        };
        const response = await fetch(url, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }
        const { conversions, count } = await response.json();
        if (count === 0) {
            console.log("записей нет");
            tableBody.innerHTML = "";
            return;
        }
        const tableContent = displayTasks(conversions);
        tableBody.innerHTML = tableContent;
    } catch (error) {
        console.log(error.message);
        // если ошибка кастомная, отображаем ее сообщение
        // если нет - "Что-то пошло не так..."
        // const customErr = {
        //     message:
        //         error instanceof CustomError
        //             ? error.message
        //             : "Что-то пошло не так. Повторите попытку позже",
        // };

        // // отображаем alert с сообщением
        // toggleAlert(customErr);
    }
};

document.addEventListener("DOMContentLoaded", async (e) => {
    e.preventDefault();
    if (!user) {
        console.log("пользователь не найден в локальном хранилище");
        window.location.assign("login.html");
        return;
    }
    await getAllTasks();
    tableBody.addEventListener("click", (e) => {
        const isDeleteButton =
            e.target.parentElement.classList.contains("deleteButton");
        if (isDeleteButton) {
            const deleteButton = e.target.parentElement;
            const taskId = deleteButton.getAttribute("data-id");
            deleteTask(taskId);
        }
    });
});

function displayTasks(tasks) {
    const tableContent = tasks
        .map((task) => {
            const { createdAt, name, status, file, _id } = task;

            const options = {
                year: "numeric",
                month: "short",
                day: "numeric",
                timezone: "UTC",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
            };
            const date = new Date(createdAt).toLocaleString("ru", options);
            return `
                <tr>
                    <td>${date}</td>
                    <td class="break-word">
                        ${name}
                    </td>
                    <td>
                        <span class="status"
                            ><img src="./assets/icons/icon-${
                                status ? "success" : "fail"
                            }.png"
                        /></span>
                    </td>
                    <td>
                        <button class="button-action deleteButton" data-id="${_id}">
                            <img src="./assets/icons/icon-trash.png" />
                        </button>
                        <button class="button-action">
                            <img
                                src="./assets/icons/icon-download.png"
                            />
                        </button>
                    </td>
                </tr>
        `;
        })
        .join("");
    return tableContent;
}

async function deleteTask(id) {
    if (!id) {
        return;
    }
    try {
        const params = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        };
        const response = await fetch(`${url}/${id}`, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new CustomError(msg);
        }
    } catch (error) {
        console.log(error.message);
        // если ошибка кастомная, отображаем ее сообщение
        // если нет - "Что-то пошло не так..."
        // const customErr = {
        //     message:
        //         error instanceof CustomError
        //             ? error.message
        //             : "Что-то пошло не так. Повторите попытку позже",
        // };

        // // отображаем alert с сообщением
        // toggleAlert(customErr);
    } finally {
        getAllTasks();
    }
}
