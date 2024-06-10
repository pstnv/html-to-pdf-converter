const tasksURL = "/api/v1/tasks";

import setStatus from "./utils/setStatus.js";
import getElement from "./utils/getElement.js";
import logoutUser from "./utils/logout.js";

// таблица для записей
const tableBody = getElement("tbody");
// контейнер для статусов
const alertDOM = getElement(".alert-msg");
// ссылка Выйти
const logoutDOM = getElement(".logout");

document.addEventListener("DOMContentLoaded", async (e) => {
    await getAllTasks();
});
tableBody.addEventListener("click", deleteBtnHandler);
logoutDOM.addEventListener("click", logoutUser);


// получить все задачи
async function getAllTasks() {
    try {
        const params = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await fetch(tasksURL, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new Error(msg);
        }
        const { tasks, count } = await response.json();
        // если массив пуст, отображаем статус Записей нет
        if (!count) {
            tableBody.innerHTML = "";
            setStatus({ container: alertDOM, message: "Записей нет" });
            return;
        }
        const tableContent = displayTasks(tasks);
        tableBody.innerHTML = tableContent;
        // очищаем статус
        setStatus({ container: alertDOM });
    } catch (error) {
        console.log(error.message);
        // отображаем статус с сообщением
        setStatus({
            container: alertDOM,
            message: "Не удается загрузить записи. Повторите попытку позже",
        });
    }
}
// отрисовать таблицу с задачами
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

// обработчик удаления задачи
async function deleteBtnHandler(e) {
    const isDeleteButton =
        e.target.parentElement.classList.contains("deleteButton");
    if (isDeleteButton) {
        const deleteButton = e.target.parentElement;
        const taskId = deleteButton.getAttribute("data-id");
        await deleteTask(taskId);
        const isEmpty = tableBody.innerHTML === "";
        if (isEmpty) {
            setStatus({ container: alertDOM, message: "Записей нет" });
        }
    }
}
// удалить задачу
async function deleteTask(id) {
    // очищаем статус
    setStatus({
        container: alertDOM,
    });
    if (!id) {
        throw new Error("id задачи не найден");
    }
    try {
        const params = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await fetch(`${tasksURL}/${id}`, params);

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new Error(msg);
        }
        await getAllTasks();
        setStatus({
            container: alertDOM,
            message: "Запись удалена",
            clear: true,
        });
    } catch (error) {
        console.log(error.message);
        // отображаем статус с сообщением
        setStatus({
            container: alertDOM,
            message: "Не удается удалить запись. Повторите попытку позже",
        });
    }
}

// блокировать таблицу на время удаления задачи
