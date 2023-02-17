class Task {
    constructor(id, code, summary, hasSensitiveData, closedDate, userId) {
        this.id = id;
        this.code = code;
        this.summary = summary;
        this.hasSensitiveData = hasSensitiveData;
        this.closedDate = closedDate;
        this.userId = userId;
    }

    obfuscateSensitiveData() {
        this.summary = "This content cannot be diplayed because it contains sensitive data";
    }

    isClosed() {
        return this.closedDate != null;
    }
}