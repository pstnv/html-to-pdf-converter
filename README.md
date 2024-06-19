# HTML to PDF Conversion Microservice

This microservice provides the capability to convert HTML files to PDF format. It is developed using Node.js and Express.js, along with other libraries for file processing, working with archives, and HTML to PDF conversion.

## Prerequisites

Before running code, ensure you have the following prerequisites installed:

- **Node.js**: You can download and install Node.js from the official website: [Node.js Downloads](https://nodejs.org/en/download/).

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
- **Express.js**:  a web application framework for Node.js.
- **Multer**: middleware for handling multipart forms in Node.js.
- **Puppeteer**: Library for controlling headless browsers programmatically.
- **Adm-Zip**: a module for working with ZIP archives.
- **swagger-autogen**: Library for auto-generating Swagger documentation based on JSDoc comments.

## Live Demo

You can explore a live demo of the HTML to PDF Conversion Microservice hosted on Render.com:

- **App:** [HTML to PDF Conversion Microservice](http://localhost:5000/)
- **Swagger-documentation:** [Swagger-docs](http://localhost:5000/)