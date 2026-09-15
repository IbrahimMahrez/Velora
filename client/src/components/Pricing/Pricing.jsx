
import { useState } from "react";
import { motion } from "motion/react";
import {
  Check,
  Sparkles,
  Users,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useCurrency } from "../../hooks/useCurrency";

const planMeta = [
  { monthly: 0, yearly: 0, icon: Zap, popular: false },
  { monthly: 150, yearly: 120, icon: Sparkles, popular: true },
  { monthly: 200, yearly: 160, icon: Users, popular: false },
];

function Pricing() {
  const { t } = useLanguage();
  const { currency } = useCurrency();
  const [billing, setBilling] = useState("monthly");

  const plansData = t("pricing.plans");
  const plans = Array.isArray(plansData)
    ? plansData.map((plan, i) => ({ ...plan, ...planMeta[i] }))
    : [];

  return (
    <section
      id="pricing"
      className="relative overflow-hidden bg-black px-6 py-32 md:py-40"
    >
      {/* Purple background glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.08, 0.14, 0.08],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600 blur-[160px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-4 py-2 text-xs text-violet-200/70"
          >
            <Sparkles size={13} />
            {t("pricing.badge")}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-6 text-4xl font-medium tracking-tight text-white md:text-6xl"
          >
            {t("pricing.titleA")}
            <br />
            <span className="font-serif italic text-purple-400">
              {t("pricing.titleB")}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/40"
          >
            {t("pricing.description")}
          </motion.p>

          {/* Billing toggle */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25 }}
            className="mx-auto mt-9 inline-flex rounded-full border border-white/[0.08] bg-white/[0.03] p-1"
          >
            <button
              onClick={() => setBilling("monthly")}
              className={`cursor-pointer rounded-full px-5 py-2 text-xs transition-all duration-300 ${
                billing === "monthly"
                  ? "bg-white text-black"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {t("pricing.monthly")}
            </button>

            <button
              onClick={() => setBilling("yearly")}
              className={`flex cursor-pointer items-center gap-2 rounded-full px-5 py-2 text-xs transition-all duration-300 ${
                billing === "yearly"
                  ? "bg-white text-black"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {t("pricing.yearly")}
              <span className="rounded-full bg-violet-500/15 px-2 py-0.5 text-[9px] text-violet-300">
                {t("pricing.save")}
              </span>
            </button>
          </motion.div>
        </div>

        {/* Plans */}
        <div className="mt-16 grid gap-5 lg:grid-cols-3">
          {plans.map((plan, index) => {
            const Icon = plan.icon;
            const price =
              billing === "monthly" ? plan.monthly : plan.yearly;

            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.12,
                }}
                whileHover={{ y: plan.popular ? -8 : -5 }}
                className={`relative flex flex-col overflow-hidden rounded-[2rem] p-7 transition-all duration-500 ${
                  plan.popular
                    ? "border border-violet-400/30 bg-violet-500/[0.07] shadow-[0_0_80px_rgba(139,92,246,0.08)]"
                    : "border border-white/[0.07] bg-white/[0.025] hover:border-white/[0.12]"
                }`}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute right-6 top-6 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5 text-[9px] uppercase tracking-[0.15em] text-violet-200">
                    {t("pricing.mostPopular")}
                  </div>
                )}

                {/* Icon */}
                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-2xl ${
                    plan.popular
                      ? "bg-violet-400/15 text-violet-300"
                      : "bg-white/[0.05] text-white/50"
                  }`}
                >
                  <Icon size={19} />
                </div>

                {/* Plan info */}
                <div className="mt-7">
                  <h3 className="text-xl font-medium text-white">
                    {plan.name}
                  </h3>

                  <p className="mt-2 min-h-[48px] text-xs leading-6 text-white/35">
                    {plan.description}
                  </p>
                </div>

                {/* Price */}
                <div className="mt-8 flex items-end gap-2">
                  <motion.span
                    key={`${plan.name}-${billing}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-4xl font-medium tracking-tight text-white"
                  >
                    {price === 0 ? t("pricing.freePrice") : `${price} ${currency}`}
                  </motion.span>

                  {price !== 0 && (
                    <span className="mb-1 text-xs text-white/30">
                      {t("pricing.perMonth")}
                    </span>
                  )}
                </div>

                {billing === "yearly" && price !== 0 && (
                  <p className="mt-2 text-[10px] text-violet-300/70">
                    {t("pricing.billedAnnually")}
                  </p>
                )}

                {/* Divider */}
                <div className="my-8 h-px bg-white/[0.07]" />

                {/* Features */}
                <div className="flex-1 space-y-4">
                  {plan.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-3"
                    >
                      <div
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                          plan.popular
                            ? "bg-violet-400/15 text-violet-300"
                            : "bg-white/[0.06] text-white/50"
                        }`}
                      >
                        <Check size={10} />
                      </div>

                      <span className="text-xs leading-5 text-white/55">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button
                  className={`group mt-9 flex w-full cursor-pointer items-center justify-center gap-2 rounded-full py-3.5 text-xs font-medium transition-all duration-300 ${
                    plan.popular
                      ? "bg-white text-black hover:bg-violet-100"
                      : "border border-white/[0.1] bg-white/[0.04] text-white hover:bg-white/[0.08]"
                  }`}
                >
                  {plan.button}

                  <ArrowRight
                    size={14}
                    className="transition-transform duration-300 group-hover:translate-x-1"
                  />
                </button>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-8 text-center text-[10px] text-white/25"
        >
          {t("pricing.note")}
        </motion.p>
      </div>
    </section>
  );
}

export default Pricing;
