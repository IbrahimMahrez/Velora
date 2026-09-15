# Velora — Smart Financial Space

> **Read in Arabic:** [README.ar.md](./README.ar.md)

Velora is a full-featured **personal finance management platform** built with the **MERN stack**. It brings expenses, bills, subscriptions, installments, savings goals, budgets, family finances, AI-powered insights, and payments into one unified bilingual workspace.

Velora supports **Arabic and English**, **light and dark themes**, **offline-first functionality**, and **Progressive Web App (PWA)** installation.

---

## ✨ Features

### 📊 Dashboard

* Comprehensive financial overview
* Financial statistics and summary cards
* Recent expenses
* Upcoming bills
* **6-month expense trend chart**
* Notification center with:

  * Read notifications
  * Delete individual notifications
  * Delete all notifications
  * Mark all as read
* AI assistant banner
* Current subscription plan badge
* Browser notification activation
* **Onboarding wizard** for new users

---

### 💸 Expenses

* Create, edit, and delete expenses
* 7 expense categories
* Search and filtering
* **AI-powered automatic categorization**

  * Example: entering `"Koshary"` can suggest `"Food"`
* CSV export with Arabic/Excel compatibility
* Offline operation support

---

### 🧾 Bills

* Complete bill management
* Bill statuses:

  * Paid
  * Pending
  * Overdue
* Due-date tracking
* **Bill image upload**

  * Image preview
  * Maximum size: 8 MB
  * JPG, PNG, WebP, GIF, and HEIC support
* **AI-powered receipt scanning**

  * Upload or capture a bill image
  * Automatically extract information and populate the form
* CSV export
* Payment reminders

---

### 🔁 Subscriptions

* Complete subscription management
* Renewal cycles and renewal dates
* **Automatic expense posting**

  * Renewals can automatically create expenses
  * Automatically calculates the next renewal date
  * Can be enabled or disabled per subscription
* **"Mark as Used"** action
* **Abandoned subscription detection**

  * Automatic notifications for subscriptions unused for 60+ days
* CSV export

---

### 📦 Installments

* Installment management
* Payment schedules
* Remaining amount tracking
* Progress percentages
* Installment status tracking

---

### 🎯 Savings Goals

* Create and manage savings goals
* Track progress toward each goal
* **Quick contributions**

  * Add a predefined amount with one click
  * Contribution history
* Automatic goal completion when the target is reached

---

### 💰 Budgets

* Monthly budgets
* Budget limits per category
* Visual progress indicators
* Automatic alerts at:

  * 80% usage
  * 100% usage
* Real-time budget progress

---

### 👨‍👩‍👧 Family Space

* Create or join a family using an invitation code
* Support for up to 10 members
* Monthly financial totals per member
* Member management
* Leave or delete a family
* **Shared family budget**
* Live family budget progress

---

### 📅 Financial Calendar

A dedicated monthly financial calendar displaying:

* Bills
* Installments
* Subscription renewals
* Savings goal dates
* Selected-day details
* Monthly totals
* Arabic and English support

---

### 🤖 Velora AI

Powered primarily by **Google Gemini**.

* AI financial assistant
* Conversational AI
* Spending analysis
* Automatic expense categorization
* **AI receipt scanning**
* Local fallback for expense categorization when the AI service is unavailable
* Retry and fallback handling

---

### 💳 Plans & Payments

Powered by **Paymob**.

* Free plan
* Premium plan
* Family plan
* Monthly and yearly billing
* Real subscription state displayed throughout the application
* Subscription status shown in:

  * Dashboard
  * Profile
  * Settings
  * Membership card

> Paymob is currently configured with test credentials for development.

---

### 🔔 Notifications

Velora supports three notification channels:

#### In-App Notifications

* Read notifications
* Delete individual notifications
* Delete all notifications
* Mark all as read

#### Email Notifications

* Email reminders
* Configurable notification preferences

#### Browser Push Notifications

* Web Push API
* VAPID authentication
* Notifications can be delivered even when the application is closed
* Custom Service Worker integration

---

### ⚙️ Settings & Profile

Users can manage:

* Language
* Currency:

  * EGP
  * USD
  * EUR
* Month start day
* Notification preferences
* Light/Dark theme
* Accent color
* Password changes
* Active sessions
* JSON data backup export
* JSON data restoration
* Account deletion

### 👤 Profile

* Membership card
* Profile image upload
* Structured profile sections
* Current plan information

---

## 🌍 User Experience

### 🌐 Bilingual

Full **Arabic ⇄ English** support with:

* RTL support
* Cairo font
* Localized UI
* Persistent language preference

### 🌓 Theme System

* Light mode
* Dark mode
* Theme preference persists between sessions

### 📡 Offline-First

Velora is designed to remain usable when the user temporarily loses their internet connection.

Features include:

* Offline operation queue
* Cached data
* Synchronization handling
* Offline status banner
* Sync status badge

### 📱 Progressive Web App

Velora can be installed as a **PWA** with:

* Web App Manifest
* Generated application icons
* Service Worker
* Offline capabilities
* Production-only Service Worker registration

Additional platform features include:

* Privacy Policy
* Terms of Service
* Custom 404 page
* Protected admin routes

---

## 🛡️ Admin Dashboard

Available at:

```text
/admin
```

The administration dashboard provides:

* Platform statistics
* User management
* Detailed user information
* Payment management
* Plan management
* Revenue analytics
* **Global announcement broadcasting**

  * In-app notifications
  * Browser push notifications
  * Delivery counters

---

## 🔒 Security

Velora implements several security mechanisms:

* **Helmet** security headers
* Configurable CORS
* Login rate limiting
* JWT authentication
* 1-hour JWT expiration
* Global 401 handling
* Password hashing with bcrypt
* Email verification codes
* Verification-code expiration
* Verification attempt limits
* Role-based access control
* Restricted file uploads
* File type and size validation
* Sanitized upload filenames
* Clear validation error messages
* Strict database startup handling
* Clear database connection failure messages

---

## 🧱 Tech Stack

| Layer             | Technologies                                                                        |
| ----------------- | ----------------------------------------------------------------------------------- |
| **Frontend**      | React 19, Vite 8, Tailwind CSS 4, Ant Design, Recharts, Framer Motion, lucide-react |
| **Backend**       | Node.js, Express 5, Mongoose 9, JWT, bcrypt, Multer, Nodemailer, express-rate-limit |
| **AI**            | Google Gemini with retry and fallback handling                                      |
| **Payments**      | Paymob                                                                              |
| **Notifications** | web-push, VAPID, Custom Service Worker                                              |
| **Database**      | MongoDB Atlas                                                                       |

---

## 📁 Project Structure

```text
Velora/
│
├── client/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── server/
│   ├── config/
│   ├── controllers/
│   ├── jobs/
│   ├── middlewares/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── utils/
│   ├── validations/
│   ├── views/
│   ├── package.json
│   └── app.js
│
├── .github/
│   └── workflows/
│
├── README.md
└── .gitignore
```

---

# 🚀 Getting Started

## Requirements

Make sure you have:

* Node.js 20+
* MongoDB Atlas connection string
* Gmail account + App Password
* Google Gemini API key
* Paymob credentials for payment functionality
* VAPID keys for browser push notifications

---

## 1. Clone the Repository

```bash
git clone https://github.com/IbrahimMahrez/velora-backend.git
cd velora-backend
```

---

## 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file inside the `server` directory.

Then start the development server:

```bash
npm run dev
```

Backend:

```text
http://localhost:7000
```

---

## 3. Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create a `.env` file inside the `client` directory.

Start the development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

If Vite automatically selects another available port such as `5174`, use the URL displayed in the terminal.

### Production Build

```bash
npm run build
```

The production build also enables Service Worker registration.

---

# 🔑 Environment Variables

## Server — `server/.env`

| Variable                | Purpose                                               |
| ----------------------- | ----------------------------------------------------- |
| `MONGO_URI`             | MongoDB connection string                             |
| `PORT`                  | API server port, default: `7000`                      |
| `JWT_SECRET`            | JWT signing secret                                    |
| `FRONTEND_URL`          | Allowed frontend origin(s), comma-separated if needed |
| `USER_EMAIL`            | Email address used for sending emails                 |
| `USER_APP`              | Gmail App Password                                    |
| `GEMINI_API_KEY`        | Google Gemini API key                                 |
| `OPENAI_API_KEY`        | Optional AI fallback                                  |
| `PAYMOB_API_KEY`        | Paymob API key                                        |
| `PAYMOB_SECRET_KEY`     | Paymob secret key                                     |
| `PAYMOB_INTEGRATION_ID` | Paymob integration ID                                 |
| `PAYMOB_HMAC_SECRET`    | Paymob HMAC secret                                    |
| `VAPID_PUBLIC_KEY`      | Web Push public key                                   |
| `VAPID_PRIVATE_KEY`     | Web Push private key                                  |
| `VAPID_SUBJECT`         | Web Push subject                                      |
| `NODE_ENV`              | `development` or `production`                         |

---

## Client — `client/.env`

| Variable                 | Purpose                                           |
| ------------------------ | ------------------------------------------------- |
| `VITE_API_URL`           | Backend API URL, default: `http://localhost:7000` |
| `VITE_PAYMOB_PUBLIC_KEY` | Public Paymob key used by the frontend            |

---

# 🔌 API Endpoints

| Method & Endpoint                   | Access        | Description                         |
| ----------------------------------- | ------------- | ----------------------------------- |
| `POST /auth/register`               | Public        | Register a new user                 |
| `POST /auth/login`                  | Public        | User login                          |
| `POST /auth/send-verification`      | Authenticated | Send email verification code        |
| `POST /auth/verify-email`           | Authenticated | Verify email                        |
| `GET /dashboard`                    | Authenticated | Financial dashboard                 |
| `GET /dashboard/monthly`            | Authenticated | Six-month financial data            |
| `CRUD /expenses`                    | Authenticated | Expense management                  |
| `CRUD /bills`                       | Authenticated | Bill management                     |
| `CRUD /subscription`                | Authenticated | Subscription management             |
| `CRUD /installments`                | Authenticated | Installment management              |
| `CRUD /goal`                        | Authenticated | Savings goal management             |
| `CRUD /budgets`                     | Authenticated | Budget management                   |
| `PATCH /subscription/:id/used`      | Authenticated | Mark subscription as used           |
| `PATCH /subscription/:id/autopost`  | Authenticated | Toggle automatic expense posting    |
| `PATCH /goal/:id/contribute`        | Authenticated | Add a quick savings contribution    |
| `GET /family`                       | Authenticated | Get family information              |
| `POST /family`                      | Authenticated | Create a family                     |
| `POST /family/join`                 | Authenticated | Join a family                       |
| `POST /family/leave`                | Authenticated | Leave a family                      |
| `POST /family/remove`               | Authenticated | Remove a family member              |
| `PUT /family/budget`                | Authenticated | Update family budget                |
| `DELETE /family`                    | Authenticated | Delete family                       |
| `POST /ai/chat`                     | Authenticated | AI assistant                        |
| `GET /ai/insights`                  | Authenticated | AI financial insights               |
| `POST /ai/categorize`               | Authenticated | AI expense categorization           |
| `POST /ai/scan-receipt`             | Authenticated | AI receipt scanning                 |
| `GET /backup/export`                | Authenticated | Export account backup               |
| `POST /backup/import`               | Authenticated | Restore account backup              |
| `GET /push/vapid-key`               | Public        | Get VAPID public key                |
| `POST /push/subscribe`              | Authenticated | Subscribe to push notifications     |
| `DELETE /push/unsubscribe`          | Authenticated | Unsubscribe from push notifications |
| `GET/PATCH/DELETE /notifications/*` | Authenticated | Notification management             |
| `PATCH /notifications/read-all`     | Authenticated | Mark all notifications as read      |
| `GET /admin/*`                      | Admin         | Administration APIs                 |
| `POST /admin/broadcast`             | Admin         | Broadcast an announcement           |
| `GET /plans`                        | Public        | Get available plans                 |
| `POST /payments/create`             | Authenticated | Create a payment                    |

---

# 🧪 Validation & Testing

The project has been tested across several core workflows, including:

* Production frontend build
* ESLint validation
* Authentication
* Email verification
* Budgets
* Family management
* Savings goals
* Browser push notifications
* Data backup and restoration
* Admin broadcasts
* Invalid input handling
* Authorization checks

The application includes **1,000+ translation keys** supporting both Arabic and English, including RTL layout, theme, language, and currency persistence.

---

# ⏰ Automated Jobs

Velora includes scheduled background tasks.

### Daily — 9:00 AM Cairo Time

The scheduler handles:

* Bill reminders
* Installment reminders
* Savings goal reminders
* Abandoned subscription checks
* Automatic subscription expense posting

The notification system prevents duplicate reminders using a combination of:

```text
user
relatedId
reminderType
reminderDate
```

Monthly reminders are automatically regenerated for future cycles.

---

# 📋 Additional Notes

* The Service Worker is registered only in production to prevent stale development assets.
* Authentication errors are logged to:

```text
server/logs/auth-errors.log
```

* The authentication log is automatically rotated when it exceeds 1 MB.
* Sensitive environment variables should never be committed to Git.
* Paymob credentials should be replaced with production credentials before deploying real payments.

---

# 🚧 Project Status

**Velora is currently under active development.**

The core financial management, authentication, AI, family, notification, payment, offline, and PWA features are implemented and integrated into the application.

---

# 👨‍💻 Author

**Ibrahim Mohamed Haraz**

Computer Science Student & MERN Full-Stack Developer

GitHub: [IbrahimMahrez](https://github.com/IbrahimMahrez)

---

## ⭐ Support

If you find Velora useful or interesting, consider giving the repository a ⭐ on GitHub.
