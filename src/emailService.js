const { MockProvider1, MockProvider2 } = require("./mockProviders");
const CircuitBreaker = require("./circuitBreaker");
const Queue = require("./queue");
const Logger = require("./logger");
const RateLimiter = require("./rateLimiter");
const Idempotency = require("./idempotency");

class EmailService {
  constructor() {
    this.providers = [
      {
        name: "Provider1",
        instance: new MockProvider1(),
        breaker: new CircuitBreaker(),
      },
      {
        name: "Provider2",
        instance: new MockProvider2(),
        breaker: new CircuitBreaker(),
      },
    ];
    this.statuses = new Map();
    this.queue = new Queue();
    this.logger = new Logger();
    this.rateLimiter = new RateLimiter();
    this.idempotencyManager = new Idempotency();
  }

  // Exponential backoff retry
  async retryWithBackoff(fn, maxRetries = 3, baseDelay = 1000) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt === maxRetries) throw error;
        const delay = baseDelay * Math.pow(2, attempt - 1);
        this.logger.error(
          `Attempt ${attempt} failed: ${error.message}. Retrying in ${delay}ms`
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  // Send email with retry, fallback, and idempotency
  async sendEmail(emailData, idempotencyKey, clientId) {
    if (!this.rateLimiter.isAllowed(clientId)) {
      this.logger.error(`Rate limit exceeded for client ${clientId}`);
      throw new Error("Rate limit exceeded");
    }

    if (idempotencyKey && this.idempotencyManager.isDuplicate(idempotencyKey)) {
      this.logger.log(
        `Duplicate request detected for idempotency key: ${idempotencyKey}`
      );
      return this.idempotencyManager.getResult(idempotencyKey);
    }

    const statusId = `status_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2)}`;
    this.statuses.set(statusId, {
      status: "pending",
      attempts: [],
      timestamp: new Date(),
    });

    return new Promise((resolve, reject) => {
      this.queue.enqueue({
        fn: async () => {
          for (const provider of this.providers) {
            try {
              const result = await this.retryWithBackoff(async () => {
                const attempt = {
                  provider: provider.name,
                  timestamp: new Date(),
                };
                this.statuses.get(statusId).attempts.push(attempt);

                const response = await provider.breaker.execute(() =>
                  provider.instance.sendEmail(emailData)
                );

                attempt.success = true;
                this.statuses.get(statusId).status = "success";
                this.logger.log(
                  `Email sent via ${provider.name}: ${response.messageId}`
                );

                if (idempotencyKey) {
                  this.idempotencyManager.markAsSent(idempotencyKey, response);
                }

                return response;
              });
              return result;
            } catch (error) {
              this.statuses.get(statusId).attempts[
                this.statuses.get(statusId).attempts.length - 1
              ].success = false;
              this.logger.error(
                `Failed with ${provider.name}: ${error.message}`
              );
            }
          }
          this.statuses.get(statusId).status = "failed";
          throw new Error("All providers failed");
        },
        resolve: (result) => resolve({ statusId, ...result }),
        reject: (error) => {
          this.statuses.get(statusId).status = "failed";
          reject({ statusId, error: error.message });
        },
      });
    });
  }

  getStatus(statusId) {
    // Validate statusId format
    if (
      !statusId ||
      typeof statusId !== "string" ||
      !statusId.startsWith("status_")
    ) {
      return {
        error: "Invalid status ID format",
        code: 400,
      };
    }

    const status = this.statuses.get(statusId);

    if (!status) {
      return {
        error: "Status not found",
        code: 404,
        suggestion: "Status IDs expire after 1 hour or when server restarts",
      };
    }

    // Calculate additional metrics
    const failureCount = status.attempts.filter((a) => !a.success).length;
    const successCount = status.attempts.filter((a) => a.success).length;
    const lastAttempt = status.attempts[status.attempts.length - 1];

    // Enhanced response format
    return {
      status: status.status,
      provider: lastAttempt?.provider,
      messageId: status.messageId,
      attempts: status.attempts.map((attempt) => ({
        provider: attempt.provider,
        timestamp: attempt.timestamp,
        status: attempt.success ? "success" : "failed",
        ...(attempt.error && { error: attempt.error }),
        ...(attempt.messageId && { messageId: attempt.messageId }),
      })),
      statistics: {
        totalAttempts: status.attempts.length,
        successCount,
        failureCount,
        successRate:
          ((successCount / status.attempts.length) * 100).toFixed(2) + "%",
      },
      timings: {
        startedAt: status.timestamp,
        completedAt: lastAttempt.timestamp,
        duration:
          new Date(lastAttempt.timestamp) - new Date(status.timestamp) + "ms",
      },
    };
  }
}

module.exports = new EmailService();
