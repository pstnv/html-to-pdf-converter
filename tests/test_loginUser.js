import { expect} from "chai";

import puppeteer from "puppeteer";
import {  seed_db, testUserPassword } from "../utils/index.js";
import { server } from "../app.js";

describe("Test: get user tasks", function () {
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
        server.close(); // stop server only when all tests are over
        return;
    });
    describe("got to site", function () {
        this.timeout(10000);
        it("should have completed a connection", function (done) {
            done();
        });
    });
    // testing index page
    describe("Test: index page", function () {
        this.timeout(15000);
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
    describe("Test: login page", function () {
        this.timeout(25000);
        it("should have login form with various elements", async () => {
            this.emailField = await page.waitForSelector('input[name="email"]');
            this.passwordField = await page.waitForSelector(
                'input[name="password"]'
            );
            this.btnLogin = await page.waitForSelector("button.btnSubmit");
        });
        it("should login the user", async () => {
            // create 1 test user
            const testUser = await seed_db();
            this.user = testUser;
            this.user.password = testUserPassword;
            // fill the register form
            await this.emailField.type(this.user.email);
            await this.passwordField.type(this.user.password);
            // wait for form submit returns result and innerHtml message
            await Promise.all([
                this.btnLogin.click(),
                page.waitForSelector("p::-p-text(Welcome to PDFConverter)"),
            ]);
            // get element with greet message "Welcome to PDFConverter,Name"
            this.greet = await page.waitForSelector(
                "p::-p-text(Welcome to PDFConverter)"
            );
            // get text from the greet message
            const greetMessage = await this.greet.evaluate(
                (elem) => elem.textContent
            );
            expect(greetMessage).to.include(this.user.name);
        });
    });
});
