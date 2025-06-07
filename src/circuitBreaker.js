class circuitBreaker {
    constructor(failedThreshold =3,resetTimeout = 60000) {
        this.failedThreshold = failedThreshold;
        this.resetTimeout = resetTimeout;
        this.failureCount = 0;
        this.state="CLOSED";
        this.lastFailureTime = null;
    }

    async execute(fn) {
        if (this.state === "OPEN") {
            if (Date.now() - this.lastFailureTime > this.resetTimeout) {
                this.state = "HALF_OPEN";
            } else {
                throw new Error("Circuit is OPEN. Cannot execute function.");
            }
        }

        try {
            const result = await fn();
            this.reset();
            return result;
        } catch (error) {
            this.failureCount++;
            if (this.failureCount >= this.failedThreshold) {
                this.state = "OPEN";
                this.lastFailureTime = Date.now();
            }
            throw error;
        }
    }
    reset() {
        this.failureCount = 0;
        this.state = "CLOSED";
        this.lastFailureTime = null;
    }
}

module.exports = circuitBreaker;