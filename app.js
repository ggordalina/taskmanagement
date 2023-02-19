const express = require('express');
const bodyParser = require('body-parser');
const webApi = require('./web-api/webApi');

const app = express();
const port = process.env.APP_PORT;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Default content type - application/json
app.use((_, response, next) => {
    response.header("Content-Type", "application/json");
    next();
});

// Web Application Layer
webApi(app);

//If everything fails
app.get('*', (_, response) => {
    response.header("Content-Type", "text/plain");
    response.status(404).send("Ups!");
});

app.listen(port, () => console.log(`Task Management is running on ${port}`));