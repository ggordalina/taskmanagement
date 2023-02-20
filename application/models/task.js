class Task {
    constructor(code, summary, hasSensitiveData, closedDate, userId) {
        this.code = code;
        this.summary = summary;
        this.hasSensitiveData = hasSensitiveData ?? false;
        this.closedDate = closedDate;
        this.userId = userId;
    }

    obfuscateSensitiveData() {
        this.summary = 'This content cannot be diplayed because it contains sensitive data.';
    }

    isClosed() {
        return this.closedDate != null;
    }

    static map(dbTaskObjectArray) {
        return dbTaskObjectArray.map((obj) =>
            new Task(obj.Code, obj.Summary, obj.HasSensitiveData, obj.ClosedDate, obj.UserId));
    }

    static validate(taskToCreate) {
        const errorsMap = {};
        let isValid = true;

        if (!taskToCreate.code) {
            errorsMap['task.code'] = 'property cannot be empty.';
            isValid = false;
        }

        if (taskToCreate.code && taskToCreate.code.length > 16) {
            errorsMap['task.code'] = 'property exceeds allowed length of 16 characters.';
            isValid = false;
        }

        if (taskToCreate.summary?.length > 2500) {
            errorsMap['task.summary'] = 'property exceeds allowed length of 2500 characters.';
            isValid = false;
        }

        if (taskToCreate.hasSensitiveData && typeof taskToCreate.hasSensitiveData !== 'boolean') {
            errorsMap['task.hasSensitiveData'] = 'property must be of type boolean.';
            isValid = false;
        }

        return [errorsMap, isValid];
    }

    static patchValidate(taskToCreate) {
        let errorsMap = {};
        let isValid = true;

        if (taskToCreate.summary?.length > 2500) {
            errorsMap['task.summary'] = 'property exceeds allowed length of 2500 characters.';
            isValid = false;
        }

        if (taskToCreate.hasSensitiveData && typeof taskToCreate.hasSensitiveData !== 'boolean') {
            errorsMap['task.hasSensitiveData'] = 'property must be of type boolean.';
            isValid = false;
        }

        return [errorsMap, isValid];
    }
}

module.exports = Task;