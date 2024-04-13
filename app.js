import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

import fileUpload from "express-fileupload";


app.use(express.static("./public"));
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));

// routers
import { router as convertionRouter } from "./routes/convertionRoutes.js";
// error handler
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
// routes
app.use("/api/v1/convertion", convertionRouter);

// 404 page not found
app.use(notFoundMiddleware);
// обработка ошибок
app.use(errorHandlerMiddleware);



const port = process.env.PORT;
const start = () => {
    try {
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};
start();
