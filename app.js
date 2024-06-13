import { app, connectDB } from "./expressServer.js";

// запустить сервер
const port = process.env.PORT || 8000;
const mongoURI = process.env.MONGO_URI;
const start = async () => {
    try {
        await connectDB(mongoURI);
        app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};
start();
