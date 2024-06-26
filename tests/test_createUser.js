import { expect } from "chai";
import puppeteer from "puppeteer";
import { factory } from "../utils/index.js";
import { fakerEN_US as faker } from "@faker-js/faker";
import { server } from "../app.js";
import User from "../models/User.js";

describe("Тест: зарегистрировать нового пользователя", function () {
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
        this.timeout(40000);
        it("должно присутствовать выпадающее меню", async () => {
            this.dropdownLink = await page.waitForSelector("a.btnDropdown");
        });
        it("должен открыть выпадающее меню", async () => {
            await this.dropdownLink.click();
        });
        it("должен отобразить ссылку вход/регистрация или выйти", async () => {
            this.logLink = await page.waitForSelector("a.logLink");
        });
        it("должен разлогиниться перед регистрацией нового пользователя", async () => {
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
            // await page.waitForNavigation();
            // заголовок с текстом 'Вход в учетную запись'
            await page.waitForSelector("h2::-p-text(Вход в учетную запись)");
        });
    });
    // тестируем страницу входа login.html
    describe("Тест: страница входа в учетную запись", function () {
        this.timeout(50000);
        it("должна присутствовать ссылка регистрации", async () => {
            this.registerLink = await page.waitForSelector(
                'a[href="register.html"]'
            );
        });
        it("должен открыть страницу регистрации", async () => {
            await this.registerLink.click();
            await page.waitForNavigation();
            // заголовок с текстом 'Создать учетную запись'
            await page.waitForSelector("h2::-p-text(Создать учетную запись)");
        });
    });
    // тестируем страницу регистрации register.html
    describe("Тест: страница регистрации", function () {
        this.timeout(50000);
        it("должна присуствовать форма регистрации с различными полями", async () => {
            this.nameField = await page.waitForSelector('input[name="name"]');
            this.emailField = await page.waitForSelector('input[name="email"]');
            this.passwordField = await page.waitForSelector(
                'input[name="password"]'
            );
            this.btnRegister = await page.waitForSelector(
                "button::-p-text(Регистрация)"
            );
        });
        it("должен зарегистрировать пользователя", async () => {
            // создать пользователя
            // пароль используем новый, т.к. он будет хэширован
            this.password = faker.internet.password({ length: 6 });
            this.user = await factory.build("user", {
                password: this.password,
            });
            // заполнить форму регистрации
            await this.nameField.type(this.user.name);
            await this.emailField.type(this.user.email);
            await this.passwordField.type(this.password);
            // дождаться, чтобы после сабмита формы вернулся результат и обновилось содержимое страницы
            await Promise.all([
                this.btnRegister.click(),
                page.waitForSelector("h2::-p-text(Завершите регистрацию)"),
            ]);
            // найти пользователя в MongoDB по email
            const newUser = await User.findOne({ email: this.user.email });
            // должен вернуть пользователя
            expect(newUser).to.not.be.null;
        });
    });
});
