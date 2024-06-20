import { expect } from "chai";
import puppeteer from "puppeteer";
import { factory } from "../utils/seed_db.js";
import { fakerEN_US as faker } from "@faker-js/faker";
import { server } from "../app.js";
import User from "../models/User.js";

describe("Test create user with Puppeteer", function () {
    let browser = null;
    let page = null;

    before(async function () {
        this.timeout(10000);
        // Launch the browser and open a new blank page
        // add {headless: false, slowMo: 30} to brackets .launch() to watch how puppeteer works
        browser = await puppeteer.launch();
        page = await browser.newPage();
        // Navigate the page to a URL
        const port = process.env.PORT || 8000;
        await page.goto(`http://localhost:${port}`);
    });
    after(async function () {
        this.timeout(10000);
        // close browser after testing
        await browser.close();
        //stop server after testing
        // server.close(); // stop server only when all tests in a folder are over
        return;
    });
    describe("got to site", function () {
        this.timeout(10000);
        it("should have completed a connection", function (done) {
            done();
        });
    });
    // testing index page
    describe("testing index page", function () {
        this.timeout(20000);
        it("should have dropdown menu", async () => {
            this.dropdownLink = await page.waitForSelector("a.btnDropdown");
        });
        it("should open dropdown menu", async () => {
            await this.dropdownLink.click();
        });
        it("should have link for login or logout", async () => {
            this.logLink = await page.waitForSelector("a.logLink");
        });
        it("should logout user before registration if user logged in", async () => {
            // get text from the link
            const logLinkText = await this.logLink.evaluate(
                (elem) => elem.textContent
            );
            // if text is "Logout", logout user and continue registration
            if (logLinkText === "Logout") {
                await this.logLink.click(); // logout user
                await this.dropdownLink.click(); // open dropdown menu
                this.logLink = await page.waitForSelector("a.logLink"); // logLink after logout change it's href so need to renew it
            }
        });
        it("should open login page", async () => {
            await this.logLink.click();
            await page.waitForNavigation();
            // header with text 'Login to your account'
            await page.waitForSelector("h2::-p-text(Login to your account)");
        });
    });
    // testing login page
    describe("testing login page", function () {
        this.timeout(25000);
        it("should have register link", async () => {
            this.registerLink = await page.waitForSelector(
                'a[href="register.html"]'
            );
        });
        it("should open register page", async () => {
            await this.registerLink.click();
            await page.waitForNavigation();
            // a header with text 'Create an account'
            await page.waitForSelector("h2::-p-text(Create an account)");
        });
    });
    // testing register page
    describe("testing register page", function () {
        this.timeout(30000);
        it("should have register form with various elements", async () => {
            this.nameField = await page.waitForSelector('input[name="name"]');
            this.emailField = await page.waitForSelector('input[name="email"]');
            this.passwordField = await page.waitForSelector(
                'input[name="password"]'
            );
            this.btnRegister = await page.waitForSelector(
                "button::-p-text(Sign up)"
            );
        });
        it("should register the user", async () => {
            // create user
            this.password = faker.internet.password({ length: 6 });
            this.user = await factory.build("user", {
                password: this.password,
            });
            // fill the register form
            await this.nameField.type(this.user.name);
            await this.emailField.type(this.user.email);
            await this.passwordField.type(this.password);
            // wait for form submit returns result and innerHtml message
            await Promise.all([
                this.btnRegister.click(),
                page.waitForSelector("h2::-p-text(Complete registration)"),
            ]);
            // find user in a database with user email
            const newUser = await User.findOne({ email: this.user.email });
            expect(newUser).to.not.be.null;
        });
    });
});
