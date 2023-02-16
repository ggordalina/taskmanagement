const express = require('express');
const bodyParser = require('body-parser');
const tasksRouter = require('./http/tasks-routing');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Default content type - application/json
app.use((_, response, next) => {
    response.header("Content-Type", "application/json");
    next();
});

// Application routes
app.use('/task', tasksRouter)

//If everything fails
app.get('*', (_, response) => {
    response.header("Content-Type", "text/plain");
    response.status(404).send("Ups!");
});

app.listen(port, () => console.log(`Task Management is running on ${port}`));