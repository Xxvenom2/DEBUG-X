 🛠️ Debug-X
**A Professional MERN Stack Debugging Dashboard**

Debug-X is a specialized web application designed for real-time tracking, logging, and resolution of software bugs. Built with the MERN stack (MongoDB, Express, React, Node.js), it provides a centralized administrative dashboard to manage development workflows and system health.

---

## 🚀 Live Demo
Check out the live application hosted on Render:
[View Debug-X Live](https://debug-x.onrender.com) 
*(Note: Initial load may take a moment as Render wakes up the free-tier server)*

---

## 💻 Tech Stack
- **Frontend:** React.js (State Management, UI/UX)
- **Backend:** Node.js & Express.js (REST API, Middleware)
- **Database:** MongoDB (NoSQL data persistence)
- **Styling:** CSS3 / Styled Components
- **Hosting:** Render (Cloud deployment)

---

## 🛡️ Security Features
As a security-focused developer, I’ve implemented several layers of protection:
- **Environment Safety:** All API keys and MongoDB strings are managed via `.env` files (excluded from Git).
- **CORS Configuration:** Restricted access to ensure only authorized origins can interact with the API.
- **Data Sanitization:** Input validation to prevent basic injection attacks.
- **Secure Headers:** Implementation of security best practices for a production environment.

---

## 📂 Project Structure
```text
DEBUG-X/
├── client/          # Frontend React files
├── server/          # Backend Node/Express files
│   ├── models/      # MongoDB Schema definitions
│   ├── routes/      # API Endpoints
│   └── middleware/  # Custom security & logging logic
└── .env             # Environment variables (Local only)
