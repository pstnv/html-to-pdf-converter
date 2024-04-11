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
import { notFound as notFoundMiddleware } from "./middleware/not-found.js";
// routes
app.use("/api/v1/convertion", convertionRouter);

// вернуть 404
app.use(notFoundMiddleware);



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
