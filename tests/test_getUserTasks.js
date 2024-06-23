import { expect } from "chai";

import puppeteer from "puppeteer";
import { testUserPassword, tasksCount, seed_db } from "../utils/index.js";
import { server } from "../app.js";
import Conversion from "../models/Conversion.js";

// create 1 test user (is used in login page and tasks page)
const testUser = await seed_db();
testUser.password = testUserPassword;

describe("Тест: получить задачи пользователя", function () {
    let browser = null;
    let page = null;

    before(async function () {
        this.timeout(15000);
        // Открыть браузер и новую вкладку
        // добавить {headless: false, slowMo: 30} в скобки .launch() чтобы наблюдать за работой puppeteer
        browser = await puppeteer.launch();
        page = await browser.newPage();
        // открыть стартовую страницу
        const port = process.env.PORT || 8000;
        await page.goto(`http://localhost:${port}`);
    });
    after(async function () {
        this.timeout(15000);
        // закрыть браузер после тестирования
        await browser.close();
        // остановить сервер после тестирования
        // server.close(); // останавливать сервер необходимо после всех тестов, иначе следующие тесты в папке не будут выполняться
        return;
    });
    describe("перейти на сайт", function () {
        this.timeout(15000);
        it("должен установить соединение", function (done) {
            done();
        });
    });
    // тестируем стартовую страницу index.html
    describe("Тест: главная страница", function () {
        this.timeout(20000);
        it("должно присутствовать выпадающее меню", async () => {
            this.dropdownLink = await page.waitForSelector("a.btnDropdown");
        });
        it("должен открыть выпадающее меню", async () => {
            await this.dropdownLink.click();
        });
        it("должен отобразить ссылку вход/регистрация или выйти", async () => {
            this.logLink = await page.waitForSelector("a.logLink");
        });
        it("должен разлогиниться перед входом пользователя", async () => {
            // получаем текст со ссылки
            const logLinkText = await this.logLink.evaluate(
                (elem) => elem.textContent
            );
            // если текст if text is "Выйти", выходим из учетной записи и продолжаем регистрацию
            if (logLinkText === "Выйти") {
                await this.logLink.click(); // выходим из учетной записи
                await this.dropdownLink.click(); // открываем выпадающее меню
                this.logLink = await page.waitForSelector("a.logLink"); // после выхода из уч.записи ссылка меняет href, ее необходимо обновить
            }
        });
        it("должен открыть страницу входа в учетную запись", async () => {
            await this.logLink.click();
            await page.waitForNavigation();
            // заголовок с текстом 'Вход в учетную запись'
            await page.waitForSelector("h2::-p-text(Вход в учетную запись)");
        });
    });
    // тестируем страницу входа login.html
    describe("Тест: страница входа в учетную запись", function () {
        this.timeout(30000);
        it("должна присутствовать форма входа с различными элементами", async () => {
            this.emailField = await page.waitForSelector('input[name="email"]');
            this.passwordField = await page.waitForSelector(
                'input[name="password"]'
            );
            this.btnLogin = await page.waitForSelector("button.btnSubmit");
        });
        it("должен залогинить пользователя", async () => {
            // заполняем форму
            await this.emailField.type(testUser.email);
            await this.passwordField.type(testUser.password);
            // ждем, когда после сабмита формы придет сообщение об успешной аутентификации
            await Promise.all([
                this.btnLogin.click(),
                page.waitForSelector(
                    "p::-p-text(Добро пожаловать в PDFConverter)"
                ),
                page.waitForNavigation(),
            ]);
        });
    });
    // тестируем главную страницу index.html после входа
    describe("Тест: главная страница после входа пользователя", function () {
        this.timeout(20000);
        it("должно присутствовать выпадающее меню", async () => {
            this.dropdownLink = await page.waitForSelector("a.btnDropdown");
        });
        it("должен открыть выпадающее меню", async () => {
            await this.dropdownLink.click();
        });
        it("должен отображать ссылку на страницу с задачами пользователя", async () => {
            this.tasksLink = await page.waitForSelector(
                'a[href="history.html"]'
            );
        });
        it("должен открыть страницу с задачами пользователя", async () => {
            await this.tasksLink.click();
            await page.waitForNavigation();
            // ждем, когда таблица с задачами пользователя загрузится
            await page.waitForSelector("tr.task");
        });
    });
    // тестируем страницу с задачами history.html
    describe("Тест: страница с задачами пользователя", function () {
        this.timeout(40000);
        it("должна иметь список задач и различные элементы", async () => {
            // заголовок с текстом 'Последние задачи'
            await page.waitForSelector("h1::-p-text(Последние задачи)");
            // таблица с задачами
            await page.waitForSelector("table");
        });
        it(`должна отображать ${tasksCount} записей в списке задач`, async () => {
            // убедиться, что возвращено 10 задач -
            // посчитать, сколько раз <trclass="task"> повяляется на странице
            const tableRowsCount = await page.evaluate(() => {
                return document.querySelectorAll("tr.task").length;
            });
            // получить задачи пользователя из MongoDB
            const tasks = await Conversion.find({
                createdBy: testUser._id,
            });
            // посчитать задачи
            const tasksCount = tasks.length;
            // количество строк таблицы должно совпадать с количеством задач из MongoDB (10)
            expect(tableRowsCount).to.equal(tasksCount);
        });
    });
});
