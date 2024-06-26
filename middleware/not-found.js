import getPage from "../utils/getPagePath.js";
import { StatusCodes } from "http-status-codes";

const notFoundMiddleware = (req, res) => {
    // полный путь до страницы
    const page = getPage("not-found.html");
    res.status(StatusCodes.NOT_FOUND).sendFile(page);
};

export default notFoundMiddleware;
