import { app, connectDB } from "./expressServer.js";

// start server
const port = process.env.PORT || 8000;
// dev && prod
let mongoURI = process.env.MONGO_URI;
if (process.env.NODE_ENV?.trim() === "test") {
    // test
    mongoURI = process.env.MONGO_URI_TEST;
}
const start = async () => {
    try {
        await connectDB(mongoURI);
        return app.listen(port, () => {
            console.log(`Server is listening on port ${port}`);
        });
    } catch (error) {
        console.log(error);
    }
};

const server = await start();

export { app, server };
