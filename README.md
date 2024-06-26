# HTML to PDF Conversion Microservice

This microservice provides the capability to convert HTML files to PDF format. It is developed using Node.js and Express.js, along with other libraries for file processing, working with archives, and HTML to PDF conversion.

## Prerequisites

Before running code, ensure you have the following prerequisites installed:

-   **Node.js**: You can download and install Node.js from the official website: [Node.js Downloads](https://nodejs.org/en/download/).

## Installation

To install the application, follow these steps:

1. Clone the repository to your local machine:

```bash
git clone https://github.com/pstnv/html-to-pdf-converter
```

2. Navigate to the project directory:

```bash
cd html-to-pdf-converter
```

3. Install the project dependencies:

```bash
npm install
```

4. Generate the API documentation using the provided script:

```bash
npm run swagger
```

5. Start the API server:

```bash
npm run dev
```

or

```bash
npm start
```

6. The API documentation should now be running locally at http://localhost:5000/api/v1/docs

### Dependencies

-   **adm-zip**: a module for working with ZIP archives
-   **bcryptjs**: is a password-hashing function (optimized) with zero dependencies
-   **cloudinary**: allows you to quickly and easily integrate your application with Cloudinary
-   **cookie-parser**: parse Cookie header and populate req.cookies with an object keyed by the cookie names
-   **cors**: package for providing a Connect/Express middleware that can be used to enable CORS with various options
-   **dotenv**: module that loads environment variables from a .env file into process.env
-   **express**: a web application framework for Node.js
-   **express-async-errors**: a dead simple ES6 async/await support hack for ExpressJS
-   **express-fileupload**: simple express file upload middleware that wraps around Busboy
-   **express-mongo-sanitize**: a package that provides middleware to sanitize user input before it is used in a database query
-   **express-rate-limit**: an npm library that provides a rate limiting middleware for Express
-   **glob**: is used to return all file paths that match a specific pattern
-   **helmet**: package that offers middleware capabilities to secure HTTP headers in HTTP responses
-   **http-status-codes**: access the status codes you need, with the protocol being used
-   **jsonwebtoken**: is a standard for creating access tokens that are used to authenticate users and secure information
-   **mongoose**: a Object Data Modeling (ODM) library for MongoDB distributed as an npm package
-   **morgan**: simplifies the process of logging requests to your application
-   **nodemailer**: provides a high-level API for sending emails in JavaScript, built on top of the SMTP protoco
-   **puppeteer**: offers a robust high-level API for controlling Chrome/Chromium browsers through the DevTools Protocol
-   **streamifier**: converts a Buffer/String into a readable stream
-   **swagger-autogen**: performs automatic construction of Swagger documentation
-   **swagger-jsdoc**: this library reads your JSDoc-annotated source code and generates an OpenAPI (Swagger) specification
-   **swagger-ui-express**: allows you to serve auto-generated swagger-ui generated API docs from express, based on a swagger. json fil
-   **validator**: a library for string validation and sanitization

### Dev-Dependencies

-   **@faker-js/faker**: a library that generates fake (but reasonable) data that can be used for testing
-   **chai**: a library for node and the browser that can be delightfully paired with any javascript testing framework
-   **cross-env**: run scripts that set and use environment variables across platforms
-   **factory-bot**: is a factory library for Node. js. It works asynchronously and supports associations and the use of functions for generating attributes
-   **mocha**: a testing library for Node. js, created to be a simple, extensible, and fast (for unit and integration testing)
-   **nodemon**: is a tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected.

## Live Demo

You can explore a live demo of the HTML to PDF Conversion Microservice hosted on Render.com:

-   **App:** [HTML to PDF Conversion Microservice](https://html-to-pdf-converter-eng.onrender.com/)
-   **Swagger-documentation:** [Swagger-docs](http://localhost:5000/api/v1/docs)
