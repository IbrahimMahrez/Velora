
import { BrowserRouter, Routes, Route } from "react-router-dom";

// ================= COMPONENTS =================
import BackgroundVideo from "./components/BackgroundVideo/BackgroundVideo";
import Navbar from "./components/Navbar/Navbar";
import Hero from "./components/Hero/Hero";
import Features from "./components/Features/Features";
import HowItWorks from "./components/HowItWorks/HowItWorks";
import FinancialOverview from "./components/FinancialOverview/FinancialOverview";
import AIInsights from "./components/AIInsights/AIInsights";
import UseCases from "./components/UseCases/UseCases";
import SocialProof from "./components/SocialProof/SocialProof";
import Pricing from "./components/Pricing/Pricing";
import FAQ from "./components/FAQ/FAQ";
import FinalCTA from "./components/FinalCTA/FinalCTA";
import Footer from "./components/Footer/Footer";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import AdminRoute from "./components/AdminRoute/AdminRoute";
import SyncBadge from "./components/SyncBadge/SyncBadge";
import OfflineBanner from "./components/OfflineBanner/OfflineBanner";
import Privacy from "./pages/Legal/Privacy";
import Terms from "./pages/Legal/Terms";
import NotFound from "./pages/NotFound/NotFound";

// ================= PAGES =================
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

import ForgotPassword from "./pages/Auth/ForgotPassword";
import ResetPassword from "./pages/Auth/ResetPassword";
import VerifyEmail from "./pages/Auth/VerifyEmail";

import Dashboard from "./pages/Dashboard/Dashboard";
import Expenses from "./pages/Expenses/Expenses";
import Subscriptions from "./pages/Subscriptions/Subscriptions";
import SavingGoals from "./pages/goals/SavingGoalCard";
import Budgets from "./pages/Budgets/Budgets";
import Family from "./pages/Family/Family";
import Calendar from "./pages/Calendar/Calendar";
import Bills from "./pages/Bills/Bills";
import Installments from "./pages/Installments/Installments";
import AIInsightss from "./pages/AIInsights/AIInsights";
import Settings from "./pages/Settings/Settings";
import Profile from "./pages/Profile/Profile";
import Plans from "./pages/Plans/Plans";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminUserDetails from "./pages/admin/AdminUserDetails";
import AdminPayments from "./pages/admin/AdminPayments";
import AdminPlans from "./pages/admin/AdminPlans";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminBroadcast from "./pages/Admin/AdminBroadcast";
// ================= CONTEXT =================
import { AuthProvider } from "./context/AuthContext";
import { LanguageProvider } from "./context/LanguageContext";


// ======================================================
// LANDING PAGE
// ======================================================

function LandingPage() {
  return (
    <main className="bg-black text-white">

      {/* Hero Section */}
      <div className="relative h-screen w-screen overflow-hidden flex flex-col">
        <BackgroundVideo />
        <Navbar />
        <Hero />
      </div>

      {/* Landing Sections */}
      <Features />
      <HowItWorks />
      <FinancialOverview />
      <AIInsights />
      <UseCases />
      <SocialProof />
      <Pricing />
      <FAQ />
      <FinalCTA />
      <Footer />

    </main>
  );
}


// ======================================================
// APP
// ======================================================

function App() {
  return (
    <LanguageProvider>
    <AuthProvider>

      <BrowserRouter>

        <Routes>

          {/* ==================================================
              PUBLIC ROUTES
          ================================================== */}

          {/* Landing Page */}
          <Route
            path="/"
            element={<LandingPage />}
          />

          {/* Login */}
          <Route
            path="/login"
            element={<Login />}
          />

          {/* Register */}
          <Route
            path="/register"
            element={<Register />}
          />

          {/* ==================================================
              PASSWORD RECOVERY ROUTES
              IMPORTANT:
              These MUST stay outside ProtectedRoute
          ================================================== */}

          {/* Forgot Password */}
          <Route
            path="/forgot-password"
            element={<ForgotPassword />}
          />

          {/* Reset Password */}
          <Route
            path="/reset-password/:userId/:token"
            element={<ResetPassword />}
          />

          {/* Verify Email (public — needs token in storage, component redirects if missing) */}
          <Route
            path="/verify-email"
            element={<VerifyEmail />}
          />


          {/* ==================================================
              PROTECTED ROUTES
              User MUST be authenticated
          ================================================== */}

          <Route element={<ProtectedRoute />}>

            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={<Dashboard />}
            />

            {/* Expenses */}
            <Route
              path="/expenses"
              element={<Expenses />}
            />

            {/* Subscriptions */}
            <Route
              path="/subscriptions"
              element={<Subscriptions />}
            />

            {/* Saving Goals */}
            <Route
              path="/saving-goals"
              element={<SavingGoals />}
            />

            {/* Bills */}
            <Route
              path="/bills"
              element={<Bills />}
            />

            {/* Budgets */}
            <Route
              path="/budgets"
              element={<Budgets />}
            />

            {/* Family */}
            <Route
              path="/family"
              element={<Family />}
            />

            {/* Calendar */}
            <Route
              path="/calendar"
              element={<Calendar />}
            />

            {/* Installments */}
            <Route
              path="/installments"
              element={<Installments />}
            />

            {/* AI Insights */}
            <Route
              path="/ai"
              element={<AIInsightss />}
            />

            {/* Settings */}
            <Route
              path="/settings"
              element={<Settings />}
            />

            {/* Profile */}
            <Route
              path="/profile"
              element={<Profile />}
            />

            {/* Plans */}
            <Route
              path="/plans"
              element={<Plans />}
            />
          </Route>

          {/* ==================================================
              ADMIN ROUTES
              Admin users only (backend also enforces this)
          ================================================== */}

          <Route element={<AdminRoute />}>

            <Route
              path="/admin"
              element={<AdminDashboard />}
            />

            <Route
              path="/admin/users"
              element={<AdminUsers />}
            />

            <Route
              path="/admin/users/:id"
              element={<AdminUserDetails />}
            />

            <Route
              path="/admin/payments"
              element={<AdminPayments />}
            />

            <Route
              path="/admin/plans"
              element={<AdminPlans />}
            />

            <Route
              path="/admin/analytics"
              element={<AdminAnalytics />}
            />

            <Route
              path="/admin/broadcast"
              element={<AdminBroadcast />}
            />

          </Route>

          {/* ==================================================
              LEGAL + 404
          ================================================== */}

          <Route
            path="/privacy"
            element={<Privacy />}
          />

          <Route
            path="/terms"
            element={<Terms />}
          />

          <Route
            path="*"
            element={<NotFound />}
          />

        </Routes>

        <SyncBadge />
        <OfflineBanner />

      </BrowserRouter>

    </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
