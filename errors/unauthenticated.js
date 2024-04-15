import StatusCodes from "http-status-codes";
import CustomError from "./custom.js";

export default class UnauthenticatedError extends CustomError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.UNAUTHORIZED;
    }
}
