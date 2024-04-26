import { StatusCodes } from "http-status-codes";
import CustomError from "./custom.js";

export default class ContentTooLargeError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.REQUEST_TOO_LONG;
    }
}
