const express = require("express");
const emailService = require("./emailService");
const Logger = require("./logger");

const logger = new Logger();
const app = express();
app.use(express.json());

app.post("/send-email", async (req, res) => {
  const { to, subject, body, idempotencyKey, clientId } = req.body;
  try {
    const result = await emailService.sendEmail({ to, subject, body }, idempotencyKey, clientId);
    res.json(result);
  } catch (error) {
    logger.error(`API error: ${error.message}`);
    res.status(500).json(error);
  }
});

app.get("/status/:statusId", (req, res) => {
  const status = emailService.getStatus(req.params.statusId);
  res.json(status);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  logger.log(`Server running on port ${PORT}`);
});