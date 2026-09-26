# Velora — Smart Personal Finance Workspace

> **Read in Arabic:** [README.ar.md](./README.ar.md)

Velora is a full-stack (MERN) personal finance platform that brings all your financial life into one intelligent workspace. Track expenses, manage bills & subscriptions, track installments, set savings goals, budget by category, share finances with family, visualize your financial calendar, leverage AI insights, and manage payments — all in a beautiful bilingual (English/Arabic) interface that works offline and installs as a PWA.

---

## ✨ Features

### 📊 Dashboard
- Financial overview with stat cards (expenses, bills, subscriptions, savings goals)
- 6-month spending trend chart (Recharts AreaChart)
- Recent expenses, upcoming bills, AI insights banner
- Notification center (mark read, delete single/all, mark all read)
- AI assistant banner, current plan badge
- Push notification opt-in + first-run onboarding wizard

### 💸 Expenses
- Full CRUD with 7 categories (Food, Transport, Shopping, Entertainment, Health, Education, Other)
- **AI auto-categorization** — type "koshary" and get "Food" suggested
- CSV export (Arabic-safe with BOM)
- Search & filters

### 🧾 Bills
- Full CRUD + due-date tracking + paid/pending/overdue states
- **Receipt photo upload** (preview, 8 MB limit, JPG/PNG/WebP/GIF/HEIC)
- **AI receipt scanning** — snap a receipt and the form auto-fills title, amount, date
- CSV export, payment reminders

### 🔁 Subscriptions
- Full CRUD with renewal cycles and renewal dates
- **Auto-post**: renewals automatically become expenses + advance the renewal date (toggle per subscription)
- **Mark as used** tracking + automatic **unused-subscription alerts** (60+ days idle)
- CSV export

### 📦 Installments · 🎯 Savings Goals · 💰 Budgets
- Installments with schedules, progress and completion flow
- Goals with **one-tap contributions** (+500 tap, history tracked, auto-complete on target)
- Monthly **budgets per category** with progress bars and **80% / 100% warning notifications**

### 👨‍👩‍👧 Family Workspace
- Create / join via 6-letter invite code (up to 10 members)
- Per-member monthly totals, member management, leave/disband
- **Shared family budget** with live progress

### 📅 Financial Calendar
- Bills, installments, renewals and goal deadlines on one month grid
- Day details, month totals, EN/AR localized

### 🤖 Velora AI (Google Gemini)
- Chat assistant + spending insights
- Expense auto-categorization endpoint with offline keyword fallback
- Receipt understanding (vision)

### 💳 Plans & Payments (Paymob)
- Free / Premium / Family plans, monthly/yearly billing
- Real plan reflected everywhere (dashboard, profile, settings)

### 🔔 Notifications (3 channels)
- In-app dropdown (read/delete), **email** (respects user prefs), **browser push** (VAPID, works with app closed)

### ⚙️ Settings & Profile
- Language, currency (EGP/USD/EUR — applied everywhere), month start
- Notification preferences, dark/light theme, accent color
- Password change, sessions, **JSON backup export / import**, delete account
- Profile with membership card, avatar upload, stacked sections

### 🌍 Experience
- Full **English ⇄ Arabic** with RTL layout and Cairo font
- **Dark + light themes**, persisted across reloads
- **Offline-first**: mutation outbox queue, IndexedDB snapshots of last data, offline banner, sync badge
- **PWA**: manifest.webmanifest + generated icons, offline-capable service worker (production)
- Privacy Policy / Terms pages, custom 404, admin route guards

### 🛡️ Admin Panel (`/admin`)
- Dashboard stats, users management + details, payments, plans CRUD, revenue analytics
- **Broadcast announcements** to all users (in-app + push) with delivery counts

### 🔒 Security
- Helmet, env-based CORS, rate limiting on auth endpoints
- JWT (1h) with global 401 handling, bcrypt passwords
- Email verification codes (TTL + attempt limits), role-based admin guard
- Restricted uploads (type + size filtered, sanitized filenames, friendly errors)
- Fail-fast DB boot (clear message instead of buffered-operation crashes)

---

## 🧱 Tech Stack

| Layer    | Tech |
|----------|------|
| Frontend | React 19 + Vite 8 + Tailwind CSS 4, Ant Design, Recharts, Framer Motion, lucide-react |
| Backend  | Node.js, Express 5, Mongoose 9, JWT, bcrypt, Multer, Nodemailer, express-rate-limit |
| AI       | Google Gemini (`@google/genai`) with model fallback + retries |
| Payments | Paymob (test-ready keys) |
| Push     | `web-push` (VAPID) + custom service worker |
| DB       | MongoDB Atlas (fails fast with clear message if unreachable) |

---

## 📁 Project Structure

```
Velora/
├── client/                  # React + Vite frontend
│   ├── public/              # logo, favicons, PWA icons, manifest, sw.js
│   └── src/
│       ├── components/      # Navbar, Footer, LanguageToggle, SyncBadge, OfflineBanner, AdminRoute, ProtectedRoute…
│       ├── pages/           # Dashboard, Expenses, Bills, Subscriptions, Installments, Goals, Plans, Profile, Settings, Calendar, Family, Admin/*, Legal, NotFound
│       ├── context/         # AuthContext, LanguageContext
│       ├── hooks/           # useCurrency
│       ├── services/        # central axios client (token, 401, offline)
│       ├── utils/           # offlineQueue, offlineCache, pushClient, exportCsv
│       ├── i18n/            # en + ar dictionaries (1000+ keys)
│       └── light-theme.css  # full light theme
└── server/                  # Express API
    ├── controllers/         # 15+ domain controllers
    ├── routes/              # REST routes (auth, plans, budgets, family, backup, push, ai, admin, notifications…)
    ├── models/              # User, Expenses, Bills, Subscriptions, Installments, Goal, Budget, Family, Plan, UserPlan, Notification, PushSubscription, VerificationCode, UserSettings…
    ├── services/            # email, notifications, scheduler, recurringExpenses
    ├── jobs/                # reminder cron jobs
    ├── middlewares/         # auth, admin guard, uploads, errors
    └── utils/               # push (VAPID), tokens, validators
```

## 🚀 Getting Started

### Prerequisites
- Node.js 20+, MongoDB Atlas URI (or local MongoDB), Gmail app-password (for emails), Gemini API key (for AI)

### 1. Backend
```bash
cd server
npm install
# create .env (see variables below)
npm run dev        # nodemon on http://localhost:7000
```

### 2. Frontend
```bash
cd client
npm install
# create .env (see variables below)
npm run dev        # vite on http://localhost:5173 (or next free port)
npm run build      # production build (+ PWA service worker registration)
```

> If Vite picks port `5174`, the backend already accepts both — just use the URL it prints.

## 🔑 Environment Variables

### `server/.env`
| Key | Purpose |
|-----|---------|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | API port (default `7000`) |
| `JWT_SECRET` | Token signing secret |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated |
| `USER_EMAIL` / `USER_APP` | Gmail sender + app password (emails) |
| `GEMINI_API_KEY` | Google Gemini key (AI features) |
| `OPENAI_API_KEY` | Optional alternate AI provider |
| `PAYMOB_API_KEY` / `PAYMOB_SECRET_KEY` / `PAYMOB_INTEGRATION_ID` / `PAYMOB_HMAC_SECRET` | Paymob payments |
| `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | Web-push keys (`node -e "console.log(require('web-push').generateVAPIDKeys())"`) |
| `NODE_ENV` | `development` / `production` |

### `client/.env`
| Key | Purpose |
|-----|---------|
| `VITE_API_URL` | Backend base URL (default `http://localhost:7000`) |
| `VITE_PAYMOB_PUBLIC_KEY` | Paymob public key for checkout |

## 🔌 Key API Endpoints

| Method & path | Auth | Purpose |
|---|---|---|
| `POST /auth/register` · `POST /auth/login` | – | Auth + email-verification flag |
| `POST /auth/send-verification` · `POST /auth/verify-email` | token | 6-digit email verification |
| `GET /dashboard` · `GET /dashboard/monthly` | token | Overview + 6-month series |
| CRUD `/expenses` `/bills` `/subscription` `/installments` `/goal` `/budgets` | token | Core domains |
| `PATCH /subscription/:id/used` · `PATCH /subscription/:id/autopost` | token | Usage + auto-post toggle |
| `PATCH /goal/:id/contribute` | token | Quick contribution |
| `GET /family` · `POST /family` `/join` `/leave` `/remove` · `PUT /family/budget` · `DELETE /family` | token | Family workspace |
| `POST /ai/chat` · `GET /ai/insights` · `POST /ai/categorize` · `POST /ai/scan-receipt` | token | AI features |
| `GET /backup/export` · `POST /backup/import` | token | Full JSON backup |
| `GET /push/vapid-key` · `POST /push/subscribe` · `DELETE /push/unsubscribe` | mixed | Web push |
| `GET|PATCH|DELETE /notifications…` · `PATCH /notifications/read-all` | token | Notifications |
| `GET /admin/*` · `POST /admin/broadcast` | admin | Admin + broadcasts |
| `GET /plans` · `POST /payments/create` | mixed | Plans & checkout |

## 🧪 Verification Highlights
- Production build passes (`npm run build`), ESLint clean on touched areas
- End-to-end API verified: auth → verify → budgets/family/goals/push/backup/broadcast round-trips, validation rejections (400), role guards (403)
- 1000+ i18n keys resolving in both languages, RTL layout, persisted theme/currency/language
- Daily 9 AM (Africa/Cairo) scheduler: bill/installment/goal reminders, unused-subscription checks, subscription auto-posting
- Notifications dedup by `(user, relatedId, reminderType, reminderDate)` — monthly alerts re-arm automatically
- Service worker registers in production builds only, so dev never serves stale modules
- Server logs auth anomalies to `server/logs/auth-errors.log` (1 MB rotation)

## 📝 Notes
- Daily 9 AM (Africa/Cairo) scheduler: bill/installment/goal reminders, unused-subscription checks, subscription auto-posting
- Notifications dedup by `(user, relatedId, reminderType, reminderDate)` — monthly alerts re-arm automatically
- Service worker registers in production builds only, so dev never serves stale modules
- Server logs auth anomalies to `server/logs/auth-errors.log` (1 MB rotation)

---

## 🤝 Contributing
PRs welcome. Please follow the existing code style (ESLint + Prettier), add tests for new features, and update translations in `src/i18n/translations.js` (both `en` and `ar`).

---

## 📄 License
MIT License — see [LICENSE](LICENSE) for details.

---

## 🌐 Links
- **GitHub:** https://github.com/IbrahimMahrez
- **LinkedIn:** https://www.linkedin.com/in/ibrahim-mohamed-haraz-95114a2ab/
- **Live Demo:** https://velora-24z.pages.dev/

---

*Built with ❤️ by Ibrahim Mahrez — Full-Stack Developer (MERN)*
