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
    // search for  all documents in MongoDB for current user
    const tasks = await Conversion.find({
        createdBy: userId,
    });
    res.status(StatusCodes.OK).json({ count: tasks.length, tasks });

    /*
        #swagger.summary = 'Fetch all tasks'
        #swagger.description = 'User must be authenticated' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
        #swagger.responses[200] = {
            schema: {
                count: 1, tasks: [{$ref: '#/definitions/Conversion'}]
            },
            description: 'Tasks successfully fetched',
        }
        #swagger.responses[401] = {
            schema: {
                msg: 'Authentication failed'
            },
            description: 'User must be authenticated',
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

    // search for document in MongoDB using it's id and user id
    const taskToDelete = await Conversion.findOne({
        createdBy: userId,
        _id: taskId,
    });
    if (!taskToDelete) {
        throw new NotFoundError(
            `Conversion with id: ${taskId} not found`
        );
    }

    // delete .pdf file from cloudinary by it's cloudId
    const { cloudId } = taskToDelete;
    cloudinary.uploader.destroy(cloudId).catch((error) => {
        // in error case don't throw error - only console.log it
        console.log("Couldn't delete file from cloudinary: ", error.message);
    });

    // delete document Task from MongoDB
    await Conversion.deleteOne(taskToDelete);
    res.status(StatusCodes.OK).send({ msg: "Task deleted" });

    /*
        #swagger.summary = 'Delete the task'
        #swagger.description = 'User must be authenticated' 
        #swagger.produces = ['application/json']
        #swagger.consumes = ['application/json']
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
        #swagger.responses[401] = {
            schema: {
                msg: 'Authentication failed'
            },
            description: 'User must be authenticated',
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
    uploadZip, // upload zip-archive
    unzipFolder, // unzip archive
    findHtmlFile, // find index.html in folder with unzipped archive
    convertHTMLToPDF, // conver index.html to *.pdf
    sendPDFToCloudinary, // if user authenticated - send to cloudinary *.pdf, else - skip
    sendResultToMongoDB, // if user authenticated - send information about conversion to MongoDB, else - skip
    sendResponse, // send response to the user

    /*
        #swagger.summary = 'Convert html to pdf'
        #swagger.description = 'No need to user authentication' 
        #swagger.produces = ['application/pdf']
        #swagger.consumes = ['multipart/form-data']
        #swagger.parameters['singleFile'] = {
            in: 'formData',
            type: 'file',
            name: 'file',
            "x-mimetype": 'application/zip',
            description: 'The request should contain zip-arch with index.html (opt. css, pics)'
        }
        #swagger.responses[200] = {
            description: 'Convertation ended successfully',
            content: {
                'application/pdf': {
                    schema: {
                        type: 'file',
                        format: 'binary',
                    }
                }
            }
        }
        #swagger.responses[400] = {
            schema: {
                msg: 'Upload a file || Upload a zip-file || Uploaded file is too big'
            },
            description: 'File upload failure',
        }
        #swagger.responses[404] = {
            schema: {
                msg: 'File index.html not found'
            },
            description: 'File index.html not found',
        }
        #swagger.responses[500] = {
            schema: {
                msg: 'Something went wrong. Please try again later'
            },
            description: 'Internal server error',
        } 
    */
];

export { getAllTasks, deleteTask, createTask };
