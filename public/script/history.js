const url = "/api/v1/tasks";

import getElement from "./utils/getElement.js";
const tableBody = getElement("tbody");

import setStatus from "./utils/setStatus.js";

// загружаем данные о пользователе из localStorage
import { getUserFromLocalStorage } from "./utils/localStorage.js";
const user = getUserFromLocalStorage();

const getAllTasks = async () => {
    try {
        const params = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${user.token}`,
            },
        };
        const response = await fetch(url, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new Error(msg);
        }
        const { tasks, count } = await response.json();
        if (count === 0) {
            tableBody.innerHTML = "";
            // отображаем статус
            setStatus("Записей нет");
            return;
        }
        const tableContent = displayTasks(tasks);
        tableBody.innerHTML = tableContent;
        // очищаем статус
        setStatus();
    } catch (error) {
        console.log(error.message);
        // отображаем статус с сообщением
        setStatus("Не удается загрузить записи. Повторите попытку позже");
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
            const {
                createdAt,
                name: filename,
                status,
                file: link,
                _id: id,
            } = task;

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
                        ${filename}
                    </td>
                    <td>
                        <span class="status"
                            ><img src="./assets/icons/icon-${
                                status ? "success" : "fail"
                            }.png"
                        /></span>
                    </td>
                    <td>
                        <button class="button-action deleteButton" data-id="${id}">
                            <img src="./assets/icons/icon-trash.png" />
                        </button>
                        <button class="button-action downloadButton">
                            <a href="${link}" target="_blank" download="${filename}" title="download file">
                                <img
                                    src="./assets/icons/icon-download.png"
                                />
                            </a>
                        </button>
                    </td>
                </tr>
        `;
        })
        .join("");
    return tableContent;
}

async function deleteTask(id) {
    // очищаем статус
    setStatus();
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
            throw new Error(msg);
        }
        setStatus("Запись удалена", true);
    } catch (error) {
        console.log(error.message);
        // отображаем статус с сообщением
        setStatus("Не удается удалить запись. Повторите попытку позже");
    } finally {
        setTimeout(() => {
            getAllTasks();
        }, 1000);
    }
}
