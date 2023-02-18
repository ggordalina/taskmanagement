class Task {
    constructor(code, summary, hasSensitiveData, closedDate, userId) {
        this.code = code;
        this.summary = summary;
        this.hasSensitiveData = hasSensitiveData;
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
        
}

module.exports = Task;