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
            url: "http://localhost:5000/", // correct after deploy
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
            $userId: "666fbbdf920afbf5214e090d",
        },
        VerifyUser: {
            $verificationToken:
                "11288272cbdfa0abbee5fe7c3f9b8f4341c929b8456b37a0d192a738ade388d4a747177d360ceba2",
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
            $_id: "666fce256418f7901f1e2d56",
            $name: "success.arch.pdf",
            $status: true,
            $createdBy: "666fbbdf920afbf5214e090d",
            $file: "https://res.cloudinary.com/dx1bfr5u6/image/upload/v1718603301/converter-upload/ufaufilqlpmb3ct0bsbx.pdf",
            $cloudId: "converter-upload/ufaufilqlpmb3ct0bsbx",
            $createdAt: "2024-06-17T05:48:21.086Z",
            $updatedAt: "2024-06-17T05:48:21.086Z",
        },
        DeleteTask: "666fcfb52f9a835cf4740880",
        CurrentUser: {
            $name: "Shura",
            $email: "shura@example.com",
        },
        UpdateUser: {
            $name: "Shurochka",
        },
        TokenUpdatedUser: {
            $name: "Shurochka",
            $userId: "666fbbdf920afbf5214e090d",
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
