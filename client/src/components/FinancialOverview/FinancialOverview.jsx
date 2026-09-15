import { motion } from "motion/react";
import {
  TrendingDown,
  TrendingUp,
  Wallet,
  CreditCard,
  Target,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function FinancialOverview() {
  const { t } = useLanguage();
  const weeks = t("financialOverview.weeks");
  return (
    <section className="relative bg-black px-6 py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-start mb-16">

          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-white/35 text-xs tracking-[0.2em] uppercase mb-5">
              {t("financialOverview.badge")}
            </p>

            <h2 className="text-4xl md:text-5xl font-medium text-white leading-tight tracking-[-0.03em]">
              {t("financialOverview.titleA")}
              <br />
              <span className="font-serif italic text-purple-400">
                {t("financialOverview.titleB")}
              </span>
            </h2>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-white/45 text-xl md:text-2xl leading-relaxed"
          >
            {t("financialOverview.description")}
          </motion.p>
        </div>

        {/* Dashboard Preview */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative rounded-[2rem] border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl overflow-hidden"
        >
          {/* Glow */}
          <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-violet-500/[0.08] blur-[120px] rounded-full pointer-events-none" />

          <div className="relative p-6 md:p-10">

            {/* Top bar */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-white/35 text-xs mb-2">
                  {t("financialOverview.totalBalance")}
                </p>

                <motion.h3
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="text-3xl md:text-4xl font-medium text-white"
                >
                  $24,580.00
                </motion.h3>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/10">
                <TrendingUp size={14} className="text-emerald-300" />
                <span className="text-xs text-emerald-300">
                  +12.8%
                </span>
              </div>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

              {/* Spending */}
              <motion.div
                whileHover={{ y: -4 }}
                className="lg:col-span-2 rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6"
              >
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-cyan-400/10 flex items-center justify-center">
                      <Wallet size={18} className="text-cyan-300" />
                    </div>

                    <div>
                      <p className="text-white/70 text-sm">
                        {t("financialOverview.monthlySpending")}
                      </p>
                      <p className="text-white/30 text-xs">
                        {t("financialOverview.monthLabel")}
                      </p>
                    </div>
                  </div>

                  <p className="text-white text-lg font-medium">
                    $2,840
                  </p>
                </div>

                {/* Chart */}
                <div className="h-32 flex items-end gap-2">
                  {[35, 50, 42, 68, 55, 76, 62, 88, 72, 94, 80, 100].map(
                    (height, index) => (
                      <motion.div
                        key={index}
                        initial={{ height: 0 }}
                        whileInView={{ height: `${height}%` }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.7,
                          delay: index * 0.04,
                        }}
                        className="flex-1 rounded-t-lg bg-gradient-to-t from-cyan-400/10 to-cyan-300/50"
                      />
                    )
                  )}
                </div>

                <div className="flex justify-between mt-3 text-[10px] text-white/25">
                  {weeks.map((week, i) => (
                    <span key={i}>{week}</span>
                  ))}
                </div>
              </motion.div>

              {/* Savings */}
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6"
              >
                <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 flex items-center justify-center mb-6">
                  <Target size={18} className="text-emerald-300" />
                </div>

                <p className="text-white/40 text-xs">
                  {t("financialOverview.savingsGoal")}
                </p>

                <p className="text-white text-2xl font-medium mt-2">
                  $8,420
                </p>

                <p className="text-emerald-300 text-xs mt-2">
                  {t("financialOverview.completed")}
                </p>

                <div className="mt-8 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: "68%" }}
                    viewport={{ once: true }}
                    transition={{ duration: 1 }}
                    className="h-full rounded-full bg-emerald-300"
                  />
                </div>
              </motion.div>

              {/* Expenses */}
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-2xl bg-violet-400/10 flex items-center justify-center">
                    <CreditCard size={18} className="text-violet-300" />
                  </div>

                  <p className="text-white/60 text-sm">
                    {t("financialOverview.expenses")}
                  </p>
                </div>

                <p className="text-2xl font-medium text-white">
                  $1,920
                </p>

                <div className="flex items-center gap-1 mt-2">
                  <TrendingDown size={13} className="text-emerald-300" />
                  <span className="text-xs text-emerald-300">
                    {t("financialOverview.less")}
                  </span>
                </div>
              </motion.div>

              {/* Subscriptions */}
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6"
              >
                <p className="text-white/35 text-xs mb-5">
                  {t("financialOverview.activeSubscriptions")}
                </p>

                <p className="text-3xl text-white font-medium">
                  12
                </p>

                <p className="text-white/30 text-xs mt-2">
                  {t("financialOverview.perMonth")}
                </p>
              </motion.div>

              {/* Bills */}
              <motion.div
                whileHover={{ y: -4 }}
                className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6"
              >
                <p className="text-white/35 text-xs mb-5">
                  {t("financialOverview.upcomingBills")}
                </p>

                <p className="text-3xl text-white font-medium">
                  $640
                </p>

                <p className="text-amber-300/80 text-xs mt-2">
                  {t("financialOverview.paymentsCount")}
                </p>
              </motion.div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default FinancialOverview;