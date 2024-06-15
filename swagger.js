import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Convert HTML to PDF",
        description: "Микросервис конвертирования HTML-файлов в PDF",
    },
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
    // Here we can define objects to use in our swagger documentation
    // These can be used as examples for request bodies, response bodies, etc
    definitions: {
        AddUser: {
            $name: "Shura",
            $email: "shura@example.com",
            $password: "secret",
        },
        User: {
            $email: "shura@example.com",
            $password: "secret",
        },
        TokenUser: {
            $name: "Shura",
            $userId: "666be590c71440513405199c",
        },
        VerifyUser: {
            $verificationToken: "verificationToken",
            $email: "shura@example.com",
        },
        ForgotUserPassword: {
            $email: "shura@example.com",
        },
        ResetUserPassword: {
            $token: "token",
            $email: "shura@example.com",
            $password: "secret",
        },
    },
};

const outputFile = "./swagger-output.json";
const routes = ["./routes/index.js"];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

/*
To build the documentation before the project starts and immediately start it, rewrite the swaggerAutogen(...) function in your swagger.js file as follows:
swaggerAutogen()(outputFile, routes, doc).then(async () => {
    await import("./app.js"); // Your project's root file
});

*/

swaggerAutogen()(outputFile, routes, doc);
