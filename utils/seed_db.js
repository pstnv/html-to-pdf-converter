import Conversion from "../models/Conversion.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { fakerEN_US as faker } from "@faker-js/faker";

// solution for factory using CommonJS(ES 6 doesn't work in factory)
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const factoryBot = require("factory-bot"); // use the require method

const tasksCount = 10;

const factory = factoryBot.factory;

const factoryAdapter = new factoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);

factory.define("user", User, {
    name: () => faker.person.firstName(),
    email: () => faker.internet.email(),
    password: () => faker.internet.password({ length: 6 }),
});
factory.define("conversion", Conversion, {
    name: () => faker.commerce.productName(),
    status: true,
    file: "https://res.cloudinary.com/dx1bfr5u6/image/upload/v1718873498/testConverion_ifrepz.pdf",
    cloudId: () =>
        faker.internet.password({
            length: 20,
            pattern: /[a-z]/,
            prefix: "converter-upload/",
        }),
});

const testUserPassword = faker.internet.password({ length: 6 });
const seed_db = async () => {
    let testUser = null;
    try {
        // delete all conversions in MongoDB (TEST)
        await Conversion.deleteMany({});
        // delete all tokens in MongoDB (TEST)
        await Token.deleteMany({});
        // delete all users in MongoDB (TEST)
        await User.deleteMany({});
        // create verified user in MongoDB
        testUser = await factory.create("user", {
            password: testUserPassword,
            isVerified: true,
            verified: Date.now(),
            verificationToken: null,
            verificationTokenExpirationDate: null,
        });
        // put tasksCount=10 conversion entries in MongoDB
        await factory.createMany("conversion", tasksCount, {
            createdBy: testUser._id,
        });
    } catch (error) {
        console.log("Database error");
        console.log(error.message);
        throw error;
    }
    return testUser;
};

export { testUserPassword, factory, tasksCount, seed_db };
