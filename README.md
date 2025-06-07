
---

# 📧 Resilient Email Sending Service

A production-grade **Node.js** service designed for **robust and fault-tolerant email delivery**. This system ensures high reliability through retry mechanisms, fallback providers, idempotency handling, rate limiting, circuit breaking, and comprehensive status tracking — all built **without third-party APIs**.

---

## 🚀 Key Features

* ✅ **Retry Mechanism** – Automatically retries failed emails with exponential backoff
* 🔁 **Failover Support** – Switches providers after multiple failures
* 🚦 **Rate Limiting** – Prevents abuse by enforcing per-client limits
* ♻️ **Idempotency** – Avoids duplicate emails on repeated requests
* 📝 **Detailed Logging** – Tracks all attempts with timestamps and statuses
* 🧪 **Unit Tests** – Ensures reliability and extensibility
* 🔧 **Queue System** – Handles multiple email requests smoothly

### 🧠 Bonus Features

* 🔌 **Circuit Breaker** – Blocks a failing provider for 60s after 3 consecutive failures
* 🧵 **In-Memory Queue System** – Manages concurrent requests and ensures sequential processing
* 🕵️ **Extended Logging** – Logs retries, provider switches, rate limit violations, and final delivery status

---

## 📂 Project Structure

```
email-service/
├── src/
│   ├── index.js             # Server bootstrap
│   ├── emailService.js      # Email logic (retry, fallback, queue)
│   ├── providers/           # Mock providers
│   ├── utils/               # Circuit breaker, logger, rate limiter
│   └── middleware/          # Idempotency and validation
├── tests/                   # Jest test cases
├── package.json
└── README.md
```

---

## 🧰 Tech Stack

| Tool             | Description                 |
| ---------------- | --------------------------- |
| **Node.js**      | Backend runtime             |
| **Express**      | API framework               |
| **Jest**         | Unit testing framework      |
| **In-Memory DB** | Queue, status, and tracking |

---

## ⚙️ Setup Instructions

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/yourusername/email-service.git
cd email-service
```

### 2️⃣ Install Dependencies

```bash
npm install
```

### 3️⃣ Start the Server

```bash
npm start
```

🔗 Server will be available at: `http://localhost:3000`

---

## 🧪 Run Tests

```bash
npm test
```

---

## 📬 Postman Setup

**Endpoint**: `POST /send`
**URL**: `http://localhost:3000/send`

### 🔐 Headers:

| Key               | Value                                     |
| ----------------- | ----------------------------------------- |
| `Content-Type`    | `application/json`                        |
| `Idempotency-Key` | `<unique-key>` (optional but recommended) |

### 📨 Body:

```json
{
  "to": "example@gmail.com",
  "subject": "Test Email",
  "body": "This is a sample email from our service"
}
```

### ✅ Sample Success Response:

```json
{
  "status": "success",
  "provider": "Provider1",
  "attempts": [...],
  "statistics": {
    "totalAttempts": 3,
    "successCount": 1,
    "failureCount": 2
  },
  "timings": {
    "duration": "3013ms"
  }
}
```

---

## 📊 Observed Logs (Live Behavior Summary)

* 🔁 Retry failure logs:

  ```
  ERROR: Attempt 1 failed: Provider 1: Email sending failed. Retrying in 1000ms
  ```
* ⛔ Circuit breaker activation:

  ```
  Circuit breaker activated: Provider1 blocked for 60s
  ```
* 🚫 Rate limit exceeded:

  ```
  ERROR: Rate limit exceeded for client fail-test
  ```
* ✅ Final success log:

  ```
  Email sent via Provider1: msg_1749273630836
  ```

---

## 📎 Future Improvements

* 🔌 Integrate real providers (SendGrid, Mailgun)
* 🗃️ Use Redis/PostgreSQL for persistent state
* 📊 Dashboard UI for monitoring
* 🐳 Add Docker support

---

## 👨‍💻 Author

**Tarun Kumar**
📂 [GitHub – TARUNKASHYAP03](https://github.com/TARUNKASHYAP03)
✉️ *Always happy to connect and collaborate!*

---