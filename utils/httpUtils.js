const { ApplicationExceptions } = require('./applicationExceptions');

const getFormatedResponseBody = (error, data) => { return { error: error, data: data }};

const mapApplicationErrorToHttpStatusCode = (applicationError) => {
    switch(applicationError) {
        case ApplicationExceptions.DataAccess: return 500;
        case ApplicationExceptions.UserNotFound: return 404;
        case ApplicationExceptions.TaskNotFound: return 404;
        case ApplicationExceptions.TaskAlreadyExists: return 400;
        case ApplicationExceptions.TaskAlreadyClosed: return 400;
        default: return 500;
    };
}

module.exports = {
    getFormatedResponseBody,
    mapApplicationErrorToHttpStatusCode
}