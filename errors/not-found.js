import StatusCodes from "http-status-codes";
import CustomError from "./custom.js";

export default class NotFoundError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.NOT_FOUND;
    }
}
