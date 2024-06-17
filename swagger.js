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
        Conversion: {
            $_id: "6669fa927fee84f72b3c2282",
            $name: "success.arch.pdf",
            $status: true,
            $createdBy: "6666aff21c2e29132a56f32f",
            $file: "https://res.cloudinary.com/dx1bfr5u6/image/upload/v1718221457/converte…",
            $cloudId: "converter-upload/fpjwsfcbmzd63kyzhhtb",
            $createdAt: "2024-06-12T19:44:18.649+00:00",
            $updatedAt: "2024-06-12T19:44:18.649+00:00",
        },
        DeleteTask: "6669fa927fee84f72b3c2282",
        UserWithId: {
            $userId: "6666aff21c2e29132a56f32f",
        },
        CurrentUser: {
            $name: "Shura",
            $email: "shura@example.com",
        },
        UpdateUser: {
            $name: "Shurochka",
        },
        TokenUpdatedUser: {
            $name: "Shurochka",
            $userId: "666be590c71440513405199c",
        },
        UpdateUserPassword: {
            $oldPassword: "secret",
            $newPassword: "newsecret",
        },
        UpdateUserEmail: {
            $newEmail: "newshura@example.com",
            $newEmailRepeat: "newshura@example.com",
            $password: "secret",
        },
        VerifyNewUserEmail: {
            $verificationToken: "verificationToken",
            $email: "newshura@example.com",
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
