class RateLimiter {
  constructor(limit = 10, windowMs = 60000) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.requests = new Map();
  }

  isAllowed(clientId) {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const clientRequests = this.requests.get(clientId) || [];

    this.requests.set(
      clientId,
      clientRequests.filter((timestamp) => timestamp > windowStart)
    );

    if (this.requests.get(clientId).length >= this.limit) {
      return false;
    }

    this.requests.get(clientId).push(now);
    return true;
  }
}

module.exports = RateLimiter;