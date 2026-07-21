# Velora Backend 💰

Velora is a complete SaaS platform for personal finance and life management that helps users manage subscriptions, bills, installments, expenses, savings goals, and payments in one place.

The platform combines a premium user experience with smart financial tools to help users understand where their money goes, organize their finances, and avoid missing recurring payments.

Velora is designed to be more than a finance app — it is a complete financial hub.

---
## ✨ Overview

Velora is a complete SaaS platform for personal finance management that allows users to manage subscriptions, expenses, bills, installments, financial goals, and premium memberships through an integrated payment system.

The platform provides smart analytics, automated reminders, and multiple pricing plans designed for individuals and families.


---
# 🚀 Features

## Authentication & Authorization

- User Registration
- User Login
- Logout
- Forgot Password
- Reset Password
- JWT Authentication
- Role-Based Authorization
- Protected Routes
- Email Verification

---

## User Management

- User Profiles
- Avatar Upload
- Occupation Selection
- Account Verification

---

## Subscription Management

Users can:

- Add subscriptions
- Update subscriptions
- Delete subscriptions
- Track renewal dates
- Manage reminders

Examples:

- Netflix
- Spotify
- Gym Membership
- Internet Services
- Educational Platforms

---

## Bills Management

Users can:

- Add bills
- Upload bill images and receipts
- Update bills
- Delete bills
- Track due dates
- Filter bills by status

Examples:

- Electricity Bills
- Water Bills
- Gas Bills
- Internet Bills
- Mobile Plans

---

## Expense Tracking

Users can:

- Add expenses
- Categorize spending
- Analyze habits
- View reports and statistics

---

## Installments Management

Users can:

- Track installment plans
- Monitor payment dates
- Calculate remaining amounts
- Manage monthly payments

---

## Financial Goals

Users can:

- Create savings goals
- Track progress
- Update savings
- Complete goals

---

## Notifications System 🔔

Automatic notifications for:

- Subscription renewals
- Bill due dates
- Installment payments
- Monthly summaries

---

## Dashboard & Analytics 📊

Dashboard provides:

- Monthly spending overview
- Active subscriptions
- Upcoming bills
- Installments tracker
- Goals progress
- Notifications summary
- Financial analytics

---

## Payment Gateway Integration 💳

Integrated payment system for upgrading plans and managing memberships.

Features:

- Secure payment processing
- Subscription upgrades
- Payment history
- Membership activation
- Premium access management

---

# 💎 Membership Plans

### Free Plan

- Up to 5 subscriptions
- Basic analytics
- Limited reminders
- Standard support

### Premium Plan — 150 EGP / Month

- Unlimited subscriptions
- Advanced analytics
- Unlimited reminders
- Smart insights
- Priority support

### Family Plan — 200 EGP / Month

- Shared family accounts
- Family subscription management
- Premium analytics
- Exclusive features
- VIP support

---

## File Upload 📁

Users can upload:

- Bills
- Receipts
- Profile images

---

## Email System 📧

Implemented using Nodemailer:

- Password reset emails
- Reminder emails
- Notifications

---

## Security 🔐

- JWT Authentication
- Password Hashing
- Helmet
- CORS
- Joi Validation
- Protected APIs

---

## Pagination

Implemented on:

- Bills
- Expenses
- Notifications
- Subscriptions

---

# 🛠️ Tech Stack

## Backend

- Node.js
- Express.js

## Database

- MongoDB
- Mongoose

## Authentication

- JWT
- bcrypt

## Validation

- Joi

## File Upload

- Multer

## Emails

- Nodemailer

## Scheduling

- Node Cron

## Payments

- Payment Gateway Integration

---

# 📂 Project Structure

```bash
Velora/
│
├── controllers/
├── models/
├── routes/
├── middlewares/
├── validations/
├── utils/
├── services/
├── uploads/
├── config/
├── app.js
└── package.json
```

---

# ⚙️ Environment Variables

Create a `.env` file:

```env
PORT=7000

MONGO_URI=

JWT_SECRET=

EMAIL=

EMAIL_PASSWORD=

PAYMENT_API_KEY=
```

---

# 📦 Installation

Clone the repository:

```bash
git clone https://github.com/IbrahimMahrez/velora-backend.git
```

Install dependencies:

```bash
npm install
```

Run the server:

```bash
npm run dev
```

---

# 📌 API Modules

- Authentication API
- Users API
- Subscriptions API
- Bills API
- Expenses API
- Installments API
- Goals API
- Notifications API
- Dashboard API
- Payments API

---

# 🔮 Future Features

- React Frontend
- React Native Application
- AI Financial Assistant
- PDF Reports
- Cloudinary Integration
- Advanced Analytics
- Family Sharing

---

# 👨‍💻 Author

Developed by **Ibrahim Mahrez**

**Full Stack Developer**
