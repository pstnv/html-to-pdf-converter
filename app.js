import dotenv from "dotenv";
dotenv.config();

import express from "express";
const app = express();

import fileUpload from "express-fileupload";

import { router as convertionRouter } from "./routes/convertionRoutes.js";

app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use("/api/v1/convertion", convertionRouter);

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
