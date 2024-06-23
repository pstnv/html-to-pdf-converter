import { expect } from "chai";
import puppeteer from "puppeteer";
import { testUserPassword, seed_db } from "../utils/index.js";
import { server } from "../app.js";

describe("Тест: залогинить пользователя", function () {
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
            // создаем одного тестового пользователя
            const testUser = await seed_db();
            this.user = testUser;
            this.user.password = testUserPassword;
            // заполняем форму
            await this.emailField.type(this.user.email);
            await this.passwordField.type(this.user.password);
            // ждем, когда после сабмита формы придет сообщение об успешной аутентификации
            await Promise.all([
                this.btnLogin.click(),
                page.waitForSelector(
                    "p::-p-text(Добро пожаловать в PDFConverter)"
                ),
            ]);
            // получить элемент с приветственным сообщением "Добро пожаловать в PDFConverter,Имя"
            this.greet = await page.waitForSelector(
                "p::-p-text(Добро пожаловать в PDFConverter)"
            );
            // получить текст приветственного сообщения
            const greetMessage = await this.greet.evaluate(
                (elem) => elem.textContent
            );
            // должен содержать имя вошедшего пользователя
            expect(greetMessage).to.include(this.user.name);
        });
    });
});
