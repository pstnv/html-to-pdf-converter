# HTML to PDF микросервис

Микросервис используется для конвертации HTML файлов в PDF формат. Разработан с использованием Node.js и Express.js наряду с другими библиотеками для загрузки и работы с архивами, а также конвертации HTML в PDF.

## Требования

Прежде чем запустить приложение, убедитесь, что у вас установлены следующие пакеты:

- **Node.js**: вы можете скачать и установить Node.js с официального сайта: [Node.js Downloads](https://nodejs.org/en/download/).

## Установка

Чтобы установить приложение, проделайте следующие шаги:

1. Клонируйте репозиторий на ваш компьютер:

```bash
git clone https://github.com/pstnv/html-to-pdf-converter
```

2. Перейдите в папку проекта:

```bash
cd html-to-pdf-converter
```

3. Установите все зависимости:

```bash
npm install
```

4. Сгенерируйте API-документация, используя следующий скрипт:

```bash
npm run swagger
```

5. Запустите сервер:

```bash
npm run dev
```
or 
```bash
npm start
```

6. API-документация расположена по адресу http://localhost:5000/api/v1/docs

### Dependencies
- **adm-zip**: a module for working with ZIP archives
- **bcryptjs**: is a password-hashing function (optimized) with zero dependencies
- **cloudinary**: allows you to quickly and easily integrate your application with Cloudinary
- **cookie-parser**: parse Cookie header and populate req.cookies with an object keyed by the cookie names
- **cors**: package for providing a Connect/Express middleware that can be used to enable CORS with various options
- **dotenv**:  module that loads environment variables from a .env file into process.env
- **express**:  a web application framework for Node.js
- **express-async-errors**:  a dead simple ES6 async/await support hack for ExpressJS
- **express-fileupload**:  simple express file upload middleware that wraps around Busboy
- **express-mongo-sanitize**: a package that provides middleware to sanitize user input before it is used in a database query
- **express-rate-limit**: an npm library that provides a rate limiting middleware for Express
- **glob**: is used to return all file paths that match a specific pattern
- **helmet**: package that offers middleware capabilities to secure HTTP headers in HTTP responses
- **http-status-codes**: access the status codes you need, with the protocol being used
- **jsonwebtoken**: is a standard for creating access tokens that are used to authenticate users and secure information
- **mongoose**: a Object Data Modeling (ODM) library for MongoDB distributed as an npm package
- **morgan**: simplifies the process of logging requests to your application
- **nodemailer**:  provides a high-level API for sending emails in JavaScript, built on top of the SMTP protoco
- **puppeteer**: offers a robust high-level API for controlling Chrome/Chromium browsers through the DevTools Protocol
- **streamifier**: converts a Buffer/String into a readable stream
- **swagger-autogen**: performs automatic construction of Swagger documentation
- **swagger-jsdoc**: this library reads your JSDoc-annotated source code and generates an OpenAPI (Swagger) specification
- **swagger-ui-express**: allows you to serve auto-generated swagger-ui generated API docs from express, based on a swagger. json fil
- **validator**: a library for string validation and sanitization
### Dev-Dependencies
- **@faker-js/faker**: a library that generates fake (but reasonable) data that can be used for testing
- **chai**: a library for node and the browser that can be delightfully paired with any javascript testing framework
- **cross-env**: run scripts that set and use environment variables across platforms
- **factory-bot**: is a factory library for Node. js. It works asynchronously and supports associations and the use of functions for generating attributes
- **mocha**: a testing library for Node. js, created to be a simple, extensible, and fast (for unit and integration testing)
- **nodemon**: is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

## Демонстрация

Вы можете ознакомиться с проектом по ссылке, расположенном на Render.com:

- **App:** [HTML to PDF Микросервис](https://html-to-pdf-converter-rus.onrender.com)
- **Swagger-documentation:** [Swagger-docs](http://localhost:5000/api/v1/docs/)

## Тесты

<img src="public/assets/tests/tests log_rus.png" alt="Test Documentation" />