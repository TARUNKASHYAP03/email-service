class Idempotency {
    constructor() {
        this.sentEmails =new Map(); // Store sent emails with their unique IDs
    }

    isDuplicate(IdempotencyKey) {
        // Check if the IdempotencyKey already exists in the sent emails map
        return this.sentEmails.has(IdempotencyKey);
    }

    markAsSent(IdempotencyKey, emailData) {
        // Store the email data with the IdempotencyKey
        this.sentEmails.set(IdempotencyKey, emailData);
    }

    getResult(IdempotencyKey) {
        // Retrieve the email data for the given IdempotencyKey
        return this.sentEmails.get(IdempotencyKey);
    }
}

module.exports = Idempotency;