import swaggerAutogen from "swagger-autogen";

const doc = {
    info: {
        title: "Convert HTML to PDF",
        description: "HTML to PDF Conversion Microservice",
    },
    host: "localhost:5000",
    servers: [
        {
            url: "http://localhost:5000/",
            description: "local server",
        },
        {
            url: "https://html-to-pdf-converter-eng.onrender.com/",
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
            $userId: "667b0a719e769a42b5b65aa5",
        },
        VerifyUser: {
            $verificationToken:
                "4c9e56062a68de7f08b07b73f150cacfddd9f8a2ff43561e9974e06dfee2d0416dc2b1e4bd28829f",
            $email: "shura@example.com",
        },
        ForgotUserPassword: {
            $email: "shura@example.com",
        },
        ResetUserPassword: {
            $token: "f8d598b8bf2e20e551ce67b01c87453da1eb8840b0953e50be3b78b1ab79eadf173b27b50f041a2c96cbeff52c1b6d281617b0be6319d7c36c1c639446489690e3bccce88800",
            $email: "shura@example.com",
            $password: "newsecret",
        },
        Conversion: {
            $_id: "667b0b45d08fb7df2d511d3c",
            $name: "success.arch.pdf",
            $status: true,
            $createdBy: "667b0a719e769a42b5b65aa5",
            $file: "https://res.cloudinary.com/dx1bfr5u6/image/upload/v1719339843/converter-upload/czynm1fe0wy0nzlwis5n.pdf",
            $cloudId: "converter-upload/czynm1fe0wy0nzlwis5n",
            $createdAt: "2024-06-25T18:24:05.700Z",
            $updatedAt: "2024-06-25T18:24:05.700Z",
        },
        DeleteTask: "667b0b7cd08fb7df2d511d3e",
        CurrentUser: {
            $name: "Shura",
            $email: "shura@example.com",
        },
        UpdateUser: {
            $name: "Shurochka",
        },
        TokenUpdatedUser: {
            $name: "Shurochka",
            $userId: "667b0a719e769a42b5b65aa5",
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
            $verificationToken:
                "cec59c244be8b6512bd12bd04a5312c3bb9fda29f5057eee43dfbd72219e7caec038a74fe8f235858a3a6a47db9d2507eece6fd218e9d68d9a0b850cdec17c7624223b8979da",
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
