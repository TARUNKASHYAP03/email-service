const EmailService = require("../src/emailService.js");
const { MockProvider1, MockProvider2 } = require("../src/mockProviders.js");
const logger = require("../src/logger");

jest.mock("../src/mockProviders");
jest.mock("../src/logger");

describe("EmailService", () => {
  let emailService;

  beforeEach(() => {
    emailService = new EmailService();
    MockProvider1.prototype.sendEmail.mockReset();
    MockProvider2.prototype.sendEmail.mockReset();
    logger.log.mockReset();
    logger.error.mockReset();
  });

  test("should send email successfully with Provider1", async () => {
    MockProvider1.prototype.sendEmail.mockResolvedValue({ success: true, provider: "Provider1", messageId: "msg_123" });
    const result = await emailService.sendEmail(
      { to: "test@example.com", subject: "Test", body: "Hello" },
      "key1",
      "client1"
    );
    expect(result.success).toBe(true);
    expect(result.provider).toBe("Provider1");
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining("Email sent via Provider1"));
  });

  test("should fallback to Provider2 if Provider1 fails", async () => {
    MockProvider1.prototype.sendEmail.mockRejectedValue(new Error("Provider1: Failed"));
    MockProvider2.prototype.sendEmail.mockResolvedValue({ success: true, provider: "Provider2", messageId: "msg_456" });
    const result = await emailService.sendEmail(
      { to: "test@example.com", subject: "Test", body: "Hello" },
      "key2",
      "client1"
    );
    expect(result.success).toBe(true);
    expect(result.provider).toBe("Provider2");
    expect(logger.error).toHaveBeenCalledWith(expect.stringContaining("Failed with Provider1"));
  });

  test("should handle idempotency", async () => {
    MockProvider1.prototype.sendEmail.mockResolvedValue({ success: true, provider: "Provider1", messageId: "msg_123" });
    const emailData = { to: "test@example.com", subject: "Test", body: "Hello" };
    const idempotencyKey = "key3";
    const result1 = await emailService.sendEmail(emailData, idempotencyKey, "client1");
    const result2 = await emailService.sendEmail(emailData, idempotencyKey, "client1");
    expect(result1).toEqual(result2);
    expect(logger.log).toHaveBeenCalledWith(expect.stringContaining("Duplicate request detected"));
  });

  test("should enforce rate limiting", async () => {
    MockProvider1.prototype.sendEmail.mockResolvedValue({ success: true, provider: "Provider1", messageId: "msg_123" });
    for (let i = 0; i < 10; i++) {
      await emailService.sendEmail(
        { to: `test${i}@example.com`, subject: "Test", body: "Hello" },
        `key${i}`,
        "client1"
      );
    }
    await expect(
      emailService.sendEmail(
        { to: "test@example.com", subject: "Test", body: "Hello" },
        "key11",
        "client1"
      )
    ).rejects.toThrow("Rate limit exceeded");
  });

  test("should track status", async () => {
    MockProvider1.prototype.sendEmail.mockResolvedValue({ success: true, provider: "Provider1", messageId: "msg_123" });
    const result = await emailService.sendEmail(
      { to: "test@example.com", subject: "Test", body: "Hello" },
      "key4",
      "client1"
    );
    const status = emailService.getStatus(result.statusId);
    expect(status.status).toBe("success");
    expect(status.attempts).toHaveLength(1);
    expect(status.attempts[0].success).toBe(true);
  });
});