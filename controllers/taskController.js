import { StatusCodes } from "http-status-codes";
import Conversion from "../models/Conversion.js";
import { NotFoundError } from "../errors/index.js";
import { v2 as cloudinary } from "cloudinary";
import {
    uploadZip,
    unzipFolder,
    findHtmlFile,
    convertHTMLToPDF,
    sendPDFToCloudinary,
    sendResultToMongoDB,
    sendResponse,
} from "./convertFunctions/index.js";

const getAllTasks = async (req, res) => {
    const { userId } = req.user;
    // ищем в MongoDB все записи с id пользователя
    const tasks = await Conversion.find({
        createdBy: userId,
    });
    res.status(StatusCodes.OK).json({ count: tasks.length, tasks });

    /*
        #swagger.summary = 'Fetch all tasks'
        #swagger.description = 'User must be authorized' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']        
        #swagger.responses[200] = {
            schema: {
                count: 1, tasks: [{$ref: '#/definitions/Conversion'}]
            },
            description: 'Tasks successfully fetched',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Internal server error',
        }    
    */
};

const deleteTask = async (req, res) => {
    const {
        user: { userId },
        params: { id: taskId },
    } = req;

    // ищем в MongoDB запись с id пользователя и id записи
    const taskToDelete = await Conversion.findOne({
        createdBy: userId,
        _id: taskId,
    });
    if (!taskToDelete) {
        throw new NotFoundError(
            `Данные о конвертации с id: ${taskId} не найдены`
        );
    }

    // удаляем файл из хранилища cloudinary по cloudId
    const { cloudId } = taskToDelete;
    cloudinary.uploader.destroy(cloudId).catch((error) => {
        // в случае ошибки при удалении файла из cloudinary
        // выводим в консоль ошибку, но не выбрасываем ее пользователю
        console.log("Не удалось удалить файл из cloudinary: ", error.message);
    });

    // удаляем запись в mongoDB
    await Conversion.deleteOne(taskToDelete);
    res.status(StatusCodes.OK).send({ msg: "Запись удалена" });

    /*
        #swagger.summary = 'Delete the task'
        #swagger.description = 'User must be authorized' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.parameters['body'] = {
            in: 'body',
            description: 'The request body contains user id and params - task id',
            required: true,
            schema: {
                type: "object",
                $ref: '#/definitions/DeleteTaskUser'
            }
        }
        #swagger.parameters['id'] = {
            in: 'path',
            name: "id",
            description: 'The request params contains task id',
            required: true,
            schema: {
                type: "string",
                $ref: '#/definitions/DeleteTask'
            }
        }   
        #swagger.responses[200] = {
            schema: {
                msg: 'Task deleted successfully'
            },
            description: 'Task deleted successfully',
        }
        #swagger.responses[404] = {
            schema: {
                msg: 'The task not found'
            },
            description: 'Task deletion failed. The task not found',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Internal server error',
        }    
    */
};

const createTask = [
    uploadZip, // загрузить архив
    unzipFolder, // распаковать архив
    findHtmlFile, // найти index.html в папке
    convertHTMLToPDF, // конвертировать index.html в *.pdf
    sendPDFToCloudinary, // если пользователь авторизован - отправить в облако *.pdf, иначе - пропустить
    sendResultToMongoDB, // если пользователь авторизован - отправить информацию о конвертации в MongoDB, иначе - пропустить
    sendResponse, // отправить ответ
];

export { getAllTasks, deleteTask, createTask };
