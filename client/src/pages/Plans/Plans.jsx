
import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Check,
  Sparkles,
  Users,
  Crown,
  Zap,
  ArrowRight,
  LoaderCircle,
  CreditCard,
  RefreshCw,
  X,
} from "lucide-react";
import api from "../../services/api";
import { useNavigate } from "react-router-dom";

import "./Plans.css";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";
import LanguageToggle from "../../components/LanguageToggle/LanguageToggle";

// ======================================================
// API
// ======================================================

const API_URL = "/plans";
const PAYMENT_URL = "/payments/create";

// ======================================================
// COMPONENT
// ======================================================

const Plans = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { currency } = useCurrency();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedBilling, setSelectedBilling] = useState("monthly");

  const [paymentLoading, setPaymentLoading] = useState(false);
  const [message, setMessage] = useState(null);

  // ======================================================
  // FETCH PLANS
  // ======================================================

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const response = await api.get(API_URL);

      setPlans(response.data?.plans || []);
    } catch (error) {
      console.error(
        "Plans Error:",
        error.response?.data || error.message
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          "Unable to load plans.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  // ======================================================
  // HELPERS
  // ======================================================

  const normalizePlanName = (plan) => {
    if (!plan) return "";
    return plan.name || "Plan";
  };

  const getPlanDescription = (plan) => {
    if (!plan) return "";

    return (
      plan.description ||
      "Choose the plan that fits your financial needs."
    );
  };

  const getPlanIcon = (plan) => {
    const name = normalizePlanName(plan).toLowerCase();

    if (name === "family") {
      return Users;
    }

    if (
      name === "premium" ||
      name === "pro" ||
      name === "primer"
    ) {
      return Crown;
    }

    return Zap;
  };

  const getFeatures = (plan) => {
    if (!plan) return [];

    return Array.isArray(plan.features)
      ? plan.features
      : [];
  };

  const getMonthlyPrice = (plan) => {
    if (!plan) return 0;

    return Number(plan.monthlyPrice) || 0;
  };

  const getYearlyPrice = (plan) => {
    if (!plan) return 0;

    return Number(plan.yearlyPrice) || 0;
  };

  const getPrice = (plan) => {
    return selectedBilling === "yearly"
      ? getYearlyPrice(plan)
      : getMonthlyPrice(plan);
  };

  const isFreePlan = (plan) => {
    return getMonthlyPrice(plan) === 0;
  };

  const isPopular = (plan) => {
    const name = normalizePlanName(plan).toLowerCase();

    return (
      plan?.isPopular === true ||
      name === "premium" ||
      name === "pro" ||
      name === "primer"
    );
  };

  // ======================================================
  // YEARLY SAVING
  // ======================================================

  const getYearlySaving = (plan) => {
    const monthly = getMonthlyPrice(plan);
    const yearly = getYearlyPrice(plan);

    if (!monthly || !yearly) return 0;

    const normalYearly = monthly * 12;

    return Math.round(
      ((normalYearly - yearly) / normalYearly) * 100
    );
  };

  // ======================================================
  // SORT PLANS
  // ======================================================

  const sortedPlans = useMemo(() => {
    const order = {
      free: 1,
      premium: 2,
      primer: 2,
      pro: 2,
      family: 3,
    };

    return [...plans].sort((a, b) => {
      const aName =
        normalizePlanName(a).toLowerCase();

      const bName =
        normalizePlanName(b).toLowerCase();

      return (
        (order[aName] || 99) -
        (order[bName] || 99)
      );
    });
  }, [plans]);

  // ======================================================
  // SELECT PLAN
  // ======================================================

  const handleSubscribe = (plan) => {
    setMessage(null);

    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", {
        state: {
          from: "/plans",
        },
      });

      return;
    }

    if (isFreePlan(plan)) {
      setMessage({
        type: "success",
        text: t("plans.alreadyFree"),
      });

      return;
    }

    setSelectedPlan(plan);
  };

  // ======================================================
  // CLOSE MODAL
  // ======================================================

  const closePaymentModal = () => {
    if (paymentLoading) return;

    setSelectedPlan(null);
    setMessage(null);
  };

  // ======================================================
  // PAYMOB PAYMENT
  // ======================================================

  const handleContinuePayment = async () => {
    if (!selectedPlan) return;

    try {
      setPaymentLoading(true);
      setMessage(null);

      // ------------------------------------------
      // TOKEN
      // ------------------------------------------

      const token = localStorage.getItem("token");

      if (!token) {
        navigate("/login", {
          state: {
            from: "/plans",
          },
        });

        return;
      }

      // ------------------------------------------
      // CREATE PAYMENT
      // ------------------------------------------

      const response = await api.post(
        PAYMENT_URL,
        {
          planId: selectedPlan._id,
          billingCycle: selectedBilling,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log(
        "Payment Response:",
        response.data
      );

      // ------------------------------------------
      // CLIENT SECRET
      // ------------------------------------------

      const clientSecret =
        response.data?.clientSecret;

      if (!clientSecret) {
        throw new Error(
          "Paymob client secret was not returned."
        );
      }

      // ------------------------------------------
      // PUBLIC KEY
      // ------------------------------------------

      const publicKey =
        import.meta.env.VITE_PAYMOB_PUBLIC_KEY;

      if (!publicKey) {
        throw new Error(
          "VITE_PAYMOB_PUBLIC_KEY is missing from frontend .env"
        );
      }

      // ------------------------------------------
      // PAYMOB CHECKOUT
      // ------------------------------------------

      const checkoutUrl =
        "https://accept.paymob.com/unifiedcheckout/" +
        `?publicKey=${encodeURIComponent(publicKey)}` +
        `&clientSecret=${encodeURIComponent(clientSecret)}`;

      console.log(
        "Paymob Checkout:",
        checkoutUrl
      );

      // ------------------------------------------
      // REDIRECT
      // ------------------------------------------

      window.location.href = checkoutUrl;
    } catch (error) {
      console.error(
        "Payment Error:",
        error.response?.data || error.message
      );

      setMessage({
        type: "error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Something went wrong while creating the payment.",
      });
    } finally {
      setPaymentLoading(false);
    }
  };

  // ======================================================
  // LOADING
  // ======================================================

  if (loading) {
    return (
      <div className="plans-loader">
        <div className="flex flex-col items-center gap-4">
          <LoaderCircle
            size={38}
            className="animate-spin"
          />

          <p>{t("plans.loading")}</p>
        </div>
      </div>
    );
  }

  // ======================================================
  // PAGE
  // ======================================================

  return (
    <div className="plans-page">

      {/* ================================================
          HEADER
      ================================================= */}

      <motion.div
        className="plans-header"
        initial={{
          opacity: 0,
          y: 25,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.6,
        }}
      >
        <div className="plans-header-info">
          <span className="plans-eyebrow">
            {t("plans.eyebrow")}
          </span>

          <h1>
            {t("plans.title")}
          </h1>

          <p>
            {t("plans.subtitle")}
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <LanguageToggle variant="dashboard" />
        <button
          className="plans-back-btn"
          onClick={() => navigate(-1)}
        >
          <ArrowRight size={15} />
          {t("plans.back")}
        </button>
        </div>
      </motion.div>

      {/* ================================================
          BILLING
      ================================================= */}

      <motion.div
        className="plans-billing"
        initial={{
          opacity: 0,
          y: 15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.5,
          delay: 0.15,
        }}
      >
        <button
          className={`plans-billing-btn ${
            selectedBilling === "monthly"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setSelectedBilling("monthly")
          }
        >
          {t("plans.monthly")}
        </button>

        <button
          className={`plans-billing-btn ${
            selectedBilling === "yearly"
              ? "active"
              : ""
          }`}
          onClick={() =>
            setSelectedBilling("yearly")
          }
        >
          {t("plans.yearly")}

          <span className="plans-save">
            {t("plans.save")}
          </span>
        </button>
      </motion.div>

      {/* ================================================
          MESSAGE
      ================================================= */}

      {message && !selectedPlan && (
        <motion.div
          className="plans-message"
          initial={{
            opacity: 0,
            y: -10,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >
          <div
            className={
              message.type === "error"
                ? "plans-message-error"
                : "plans-message-success"
            }
          >
            {message.text}
          </div>
        </motion.div>
      )}

      {/* ================================================
          PLANS
      ================================================= */}

      {sortedPlans.length === 0 ? (
        <div className="plans-empty">
          <RefreshCw size={40} />

          <h2>
            {t("plans.noPlans")}
          </h2>

          <p>
            {t("plans.tryLater")}
          </p>

          <button onClick={fetchPlans}>
            {t("plans.tryAgain")}
          </button>
        </div>
      ) : (
        <div className="plans-grid">

          {sortedPlans.map((plan, index) => {
            const Icon = getPlanIcon(plan);

            const price = getPrice(plan);

            const popular = isPopular(plan);

            const features = getFeatures(plan);

            const yearlySaving =
              getYearlySaving(plan);

            const free = isFreePlan(plan);

            return (
              <motion.div
                key={
                  plan._id ||
                  plan.id ||
                  index
                }
                className={`plan-card ${
                  popular ? "premium" : ""
                }`}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  duration: 0.55,
                  delay: index * 0.1,
                }}
              >

                {/* POPULAR */}

                {popular && (
                  <div className="plan-popular">
                    <Sparkles size={11} />
                    {t("plans.popular")}
                  </div>
                )}

                {/* ICON */}

                <div className="plan-icon">
                  <Icon size={22} />
                </div>

                {/* NAME */}

                <div className="plan-label">
                  Velora
                </div>

                <h2>
                  {normalizePlanName(plan)}
                </h2>

                {/* DESCRIPTION */}

                <p className="plan-description">
                  {getPlanDescription(plan)}
                </p>

                {/* PRICE */}

                <div className="plan-price">
                  <div className="plan-price-row">
                    <strong>
                      {price}
                    </strong>

                    <span>
                      {currency} /{" "}
                      {selectedBilling ===
                      "yearly"
                        ? t("plans.perYear")
                        : t("plans.perMonth")}
                    </span>
                  </div>

                  {selectedBilling ===
                    "yearly" &&
                    yearlySaving > 0 && (
                      <div className="plan-yearly-note">
                        {t("plans.saveYearly")} {yearlySaving}% {t("plans.comparedMonthly")}
                      </div>
                    )}
                </div>

                {/* FEATURES */}

                <div className="plan-features">
                  <div className="plan-features-title">
                    {t("plans.included")}
                  </div>

                  {features.map(
                    (
                      feature,
                      featureIndex
                    ) => (
                      <div
                        className="plan-feature"
                        key={featureIndex}
                      >
                        <Check />

                        <span>
                          {feature}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {/* CTA */}

                <button
                  onClick={() =>
                    handleSubscribe(plan)
                  }
                  disabled={paymentLoading}
                  className={`plan-btn ${
                    free
                      ? "free"
                      : popular
                      ? "premium"
                      : "family"
                  }`}
                >
                  {free
                    ? t("plans.getStarted")
                    : t("plans.subscribe")}

                  <ArrowRight size={16} />
                </button>

                {free && (
                  <div className="plan-current">
                    {t("plans.noCard")}
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ================================================
          FOOTER
      ================================================= */}

      <div className="plans-footer-note">
        {t("plans.footer")}
      </div>

      {/* ================================================
          PAYMENT MODAL
      ================================================= */}

      <AnimatePresence>
        {selectedPlan && (
          <motion.div
            className="payment-overlay"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={closePaymentModal}
          >
            <motion.div
              className="payment-modal"
              initial={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: 20,
              }}
              onClick={(e) =>
                e.stopPropagation()
              }
            >

              {/* MODAL HEADER */}

              <div className="payment-header">
                <div>
                  <div className="payment-icon">
                    <CreditCard size={20} />
                  </div>

                  <h2>
                    {t("plans.completeSub")}
                  </h2>

                  <p>
                    {t("plans.paymobRedirect")}
                  </p>
                </div>

                <button
                  className="payment-close"
                  onClick={
                    closePaymentModal
                  }
                  disabled={paymentLoading}
                >
                  <X size={19} />
                </button>
              </div>

              {/* PLAN SUMMARY */}

              <div className="payment-summary">

                <div className="payment-summary-top">
                  <div>
                    <span>
                      {t("plans.selectedPlan")}
                    </span>

                    <h3>
                      {normalizePlanName(
                        selectedPlan
                      )}
                    </h3>
                  </div>

                  <div className="payment-billing">
                    <span>
                      {t("plans.billing")}
                    </span>

                    <strong>
                      {selectedBilling}
                    </strong>
                  </div>
                </div>

                <div className="payment-divider" />

                <div className="payment-total">
                  <span>
                    {t("plans.total")}
                  </span>

                  <strong>
                    {getPrice(selectedPlan)} {currency}
                  </strong>
                </div>
              </div>

              {/* ERROR */}

              {message?.type === "error" && (
                <div className="payment-error">
                  {message.text}
                </div>
              )}

              {/* PAY */}

              <button
                className="payment-button"
                onClick={
                  handleContinuePayment
                }
                disabled={paymentLoading}
              >
                {paymentLoading ? (
                  <>
                    <LoaderCircle
                      size={18}
                      className="animate-spin"
                    />

                    {t("plans.creatingPay")}
                  </>
                ) : (
                  <>
                    <CreditCard size={18} />

                    {t("plans.continuePay")}

                    <ArrowRight size={17} />
                  </>
                )}
              </button>

              <p className="payment-secure">
                {t("plans.securePay")}
              </p>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Plans;
