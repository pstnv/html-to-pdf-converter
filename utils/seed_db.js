import Conversion from "../models/Conversion.js";
import Token from "../models/Token.js";
import User from "../models/User.js";
import { fakerEN_US as faker } from "@faker-js/faker";
// solution
import { createRequire } from "module"; // Bring in the ability to create the 'require' method
const require = createRequire(import.meta.url); // construct the require method
const factoryBot = require("factory-bot"); // use the require method

const factory = factoryBot.factory;

const factoryAdapter = new factoryBot.MongooseAdapter();
factory.setAdapter(factoryAdapter);

factory.define("user", User, {
    name: () => faker.person.firstName(),
    email: () => faker.internet.email(),
    password: () => faker.internet.password({ length: 6 }),
});

const testUserPassword = faker.internet.password({ length: 6 });
const mongoURL = process.env.MONGO_URI_TEST;
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
    } catch (error) {
        console.log("Database error");
        console.log(error.message);
        throw error;
    }
    return testUser;
};

export { testUserPassword, factory, seed_db };
