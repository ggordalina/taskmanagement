const ApplicationExceptions = Object.freeze({
    DataAccess: 101,
    TaskNotFound: 201,
    TaskAlreadyExists: 202,
    TaskAlreadyClosed: 203,
    UserNotFound: 301,
});

class AppError {
    constructor(exception, content) {
        this.exception = exception;
        this.content = content;
    }
}

module.exports = {
    AppError,
    ApplicationExceptions
};