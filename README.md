# Velora Backend 💰

Velora is a SaaS platform for personal finance and life management that helps users manage subscriptions, bills, expenses, installments, savings goals, and payments in one place.

The platform aims to simplify financial management and provide users with smart tools to track their spending and organize their lives.

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

- User Profile
- User Plans (Free / Premium / Family)
- Occupation Selection
- Avatar Upload

---

## Subscription Management

Users can:

- Add subscriptions
- Update subscriptions
- Delete subscriptions
- Track renewal dates
- Manage reminder settings

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
- Upload bill images
- Update bills
- Delete bills
- Track due dates
- Filter bills by status

Examples:

- Electricity
- Water
- Gas
- Internet
- Mobile Bills

---

## Expense Tracking

Users can:

- Add expenses
- Categorize expenses
- Analyze spending habits
- View monthly reports

---

## Installments Management

Users can:

- Track installment plans
- Calculate remaining amount
- Monitor payment dates
- Manage monthly payments

---

## Financial Goals

Users can:

- Create goals
- Track progress
- Update savings
- Mark goals as completed

---

## Notifications System 🔔

Automatic notifications for:

- Subscription renewals
- Bill due dates
- Installment payments
- Monthly summaries

---

## Dashboard 📊

Dashboard provides:

- Total monthly expenses
- Active subscriptions
- Upcoming bills
- Installments overview
- Goals progress
- Notifications summary

---

## Payment System 💳

Supported plans:

### Free Plan

- Up to 5 subscriptions
- Basic analytics
- Limited reminders

### Premium Plan

- Unlimited subscriptions
- Advanced analytics
- Smart insights
- Priority support

### Family Plan

- Family accounts
- Shared subscriptions
- Advanced features

---

## File Upload 📁

Users can upload:

- Bill images
- Receipts
- Profile avatars

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
- Validation with Joi

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

## Scheduled Jobs

- Node Cron

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
PORT=5000

MONGO_URI=

JWT_SECRET=

EMAIL=

EMAIL_PASSWORD=
```

---

# 📦 Installation

Clone the repository:

```bash
git clone https://github.com/your-username/velora-backend.git
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
- React Native Mobile App
- AI Financial Assistant
- PDF Reports
- Cloudinary Integration
- Advanced Analytics

---

# 👨‍💻 Author

Developed by Ibrahim Mahrez.

Faculty of Science — Software Industry and Multimedia Department.

Alexandria University.
