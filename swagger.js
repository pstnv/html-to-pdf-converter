import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Convert HTML to PDF",
        description: "Микросервис конвертирования HTML-файлов в PDF",
    },
    consumes: ["application/zip"],
    produces: ["application/pdf"],
    host: "localhost:5000",
    servers: [
        {
            url: "http://localhost:5000/",
            description: "local server",
        },
        {
            url: "http://localhost:5000/", // исправить
            description: "production server",
        },
    ],
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/index.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen()(outputFile, routes, doc);
