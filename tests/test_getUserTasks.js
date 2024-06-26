import { expect } from "chai";

import puppeteer from "puppeteer";
import { seed_db, testUserPassword, tasksCount } from "../utils/index.js";
import { server } from "../app.js";
import Conversion from "../models/Conversion.js";

// create 1 test user (is used in login page and tasks page)
const testUser = await seed_db();
testUser.password = testUserPassword;

describe("Test: login user", function () {
    let browser = null;
    let page = null;

    before(async function () {
        this.timeout(15000);
        // Launch the browser and open a new blank page
        // add {headless: false, slowMo: 30} to brackets .launch() to watch how puppeteer works
        browser = await puppeteer.launch();
        page = await browser.newPage();
        // Navigate the page to a URL
        const port = process.env.PORT || 8000;
        await page.goto(`http://localhost:${port}`);
    });
    after(async function () {
        this.timeout(15000);
        // close browser after testing
        await browser.close();
        //stop server after testing
        // server.close(); // stop server only when all tests are over
        return;
    });
    describe("got to site", function () {
        this.timeout(15000);
        it("should have completed a connection", function (done) {
            done();
        });
    });
    // testing index page
    describe("Test: index page", function () {
        this.timeout(40000);
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
        this.timeout(50000);
        it("should have login form with various elements", async () => {
            this.emailField = await page.waitForSelector('input[name="email"]');
            this.passwordField = await page.waitForSelector(
                'input[name="password"]'
            );
            this.btnLogin = await page.waitForSelector("button.btnSubmit");
        });
        it("should login the user", async () => {
            // fill the register form
            await this.emailField.type(testUser.email);
            await this.passwordField.type(testUser.password);
            // wait for form submit returns result and innerHtml message
            await Promise.all([
                this.btnLogin.click(),
                page.waitForSelector("p::-p-text(Welcome to PDFConverter)"),
                page.waitForNavigation(),
            ]);
        });
    });
    // testing index page after login
    describe("Test: index page after login", function () {
        this.timeout(40000);
        it("should have dropdown menu", async () => {
            this.dropdownLink = await page.waitForSelector("a.btnDropdown");
        });
        it("should open dropdown menu", async () => {
            await this.dropdownLink.click();
        });
        it("should have link for user tasks", async () => {
            this.tasksLink = await page.waitForSelector(
                'a[href="history.html"]'
            );
        });
        it("should open tasks page", async () => {
            await this.tasksLink.click();
            await page.waitForNavigation();
            // wait until table with user tasks is loaded
            await page.waitForSelector("tr.task");
        });
    });
    // testing tasks page
    describe("Test: tasks page", function () {
        this.timeout(60000);
        it("should have tasks list and various elements", async () => {
            // header with text 'Latest tasks'
            await page.waitForSelector("h1::-p-text(Latest tasks)");
            // table with tasks
            await page.waitForSelector("table");
        });
        it(`should have ${tasksCount} entries in the tasks list`, async () => {
            // verify that 10(tasksCount) entries returned -
            // check how many times <trclass="task"> appears on the page
            const tableRowsCount = await page.evaluate(() => {
                return document.querySelectorAll("tr.task").length;
            });
            // get tasks entries from MongoDB
            const tasks = await Conversion.find({
                createdBy: testUser._id,
            });
            // count tasks
            const tasksCount = tasks.length;
            // expect rows in table equal to array (of tasks) length
            expect(tableRowsCount).to.equal(tasksCount);
        });
    });
});
