class MockProvider1 {
  async sendEmail(emailData) {
    if (Math.random() < 0.3)
      throw new Error("Provider 1: Email sending failed");
    return {
      success: true,
      provider: "Provider 1",
      messageId: `msg_${Date.now()}`,
    };
  }
}

class MockProvider2 {
  async sendEmail(emailData) {
    if (Math.random() < 0.2)
      throw new Error("Provider 2: Email sending failed");
    return {
      success: true,
      provider: "Provider 2",
      messageId: `msg_${Date.now()}`,
    };
  }
}

module.exports = { MockProvider1, MockProvider2 };