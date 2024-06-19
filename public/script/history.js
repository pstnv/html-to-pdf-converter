const tasksURL = "/api/v1/tasks";

import setStatus from "./utils/setStatus.js";
import getElement from "./utils/getElement.js";
import logoutUser from "./utils/logout.js";
import { getUser } from "./utils/localStorage.js";

// record table
const tableBody = getElement("tbody");
// container for statuses
const alertDOM = getElement(".alert-msg");
// link Logout
const logoutDOM = getElement(".logout");

document.addEventListener("DOMContentLoaded", displayContent);
tableBody.addEventListener("click", deleteBtnHandler);
logoutDOM.addEventListener("click", logoutUser);

// When loading the page, check if there is an entry in localStorage about the user
// if does not exist - redirect to the authorization page
// if exists - request all task records
function displayContent() {
    const user = getUser();
    if (!user) {
        return window.location.assign("login.html");
    }
    getAllTasks();
}

// get all tasks
async function getAllTasks() {
    try {
        const params = {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await fetch(tasksURL, params);

        // if the user is not authenticated, redirect user to the authorization page
        if (response.status === 401) {
            window.location.assign("login.html");
        }

        if (Math.floor(response.status / 100) !== 2) {
            const { msg } = await response.json();
            throw new Error(msg);
        }
        const { tasks, count } = await response.json();
        // If the array is empty, display the status No entries
        if (!count) {
            tableBody.innerHTML = "";
            setStatus({ container: alertDOM, message: "No tasks" });
            return;
        }
        const tableContent = displayTasks(tasks);
        tableBody.innerHTML = tableContent;
        // clear the status
        setStatus({ container: alertDOM });
    } catch (error) {
        console.log(error.message);
        // display status with message
        setStatus({
            container: alertDOM,
            message: "Cannot load tasks. Please try again later",
        });
    }
}
// display a table with tasks
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

// task deletion handler
async function deleteBtnHandler(e) {
    const isDeleteButton =
        e.target.parentElement.classList.contains("deleteButton");
    if (isDeleteButton) {
        const deleteButton = e.target.parentElement;
        const taskId = deleteButton.getAttribute("data-id");
        await deleteTask(taskId);
        const isEmpty = tableBody.innerHTML === "";
        if (isEmpty) {
            setStatus({ container: alertDOM, message: "No tasks" });
        }
    }
}
// delete a task
async function deleteTask(id) {
    // clear status
    setStatus({
        container: alertDOM,
    });
    if (!id) {
        throw new Error("task id not found");
    }
    try {
        const params = {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
        };
        const response = await fetch(`${tasksURL}/${id}`, params);

        // if the user is not authenticated, redirect him to the authorization page
        if (response.status === 401) {
            window.location.assign("login.html");
        }

        const { msg } = await response.json();
        if (Math.floor(response.status / 100) !== 2) {
            throw new Error(msg);
        }
        await getAllTasks();
        setStatus({
            container: alertDOM,
            message: msg,
            clear: true,
        });
    } catch (error) {
        console.log(error.message);
        // display status with message
        setStatus({
            container: alertDOM,
            message: "Cannot delete the task. Please try again later",
        });
    }
}
