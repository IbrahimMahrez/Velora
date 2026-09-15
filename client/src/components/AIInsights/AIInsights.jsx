import { motion } from "motion/react";
import {
  Sparkles,
  ArrowUpRight,
  TrendingDown,
  Lightbulb,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function AIInsights() {
  const { t, isRTL } = useLanguage();
  return (
    <section className="relative bg-black px-6 py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mb-16"
        >
          <p className="flex items-center gap-2 text-violet-300/70 text-xs tracking-[0.2em] uppercase mb-5">
            <Sparkles size={13} />
            {t("aiInsightsSection.badge")}
          </p>

          <h2 className="text-4xl md:text-6xl text-white font-medium leading-[1.05] tracking-tight">
            {t("aiInsightsSection.titleA")}
            <br />
            <span className="font-serif italic text-purple-400">
              {t("aiInsightsSection.titleB")}
            </span>
          </h2>

          <p className="mt-6 text-white/40 text-sm md:text-base leading-7">
            {t("aiInsightsSection.description")}
          </p>
        </motion.div>

        {/* AI Interface */}
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="relative rounded-[2rem] border border-white/[0.08] bg-white/[0.025] overflow-hidden"
        >
          {/* Background Glow */}
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.4, 0.7, 0.4],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-40 left-1/2 -translate-x-1/2 w-[500px] h-[350px] rounded-full bg-violet-500/[0.08] blur-[120px]"
          />

          <div className="relative grid grid-cols-1 lg:grid-cols-2">

            {/* Left */}
            <div className="p-8 md:p-12 lg:border-r border-white/[0.07]">

              <div className="flex items-center justify-between mb-12">
                <div className="flex items-center gap-3">
                  <motion.div
                    animate={{
                      rotate: [0, 10, -10, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                    }}
                    className="w-11 h-11 rounded-2xl bg-violet-400/10 border border-violet-400/10 flex items-center justify-center"
                  >
                    <Sparkles
                      size={20}
                      className="text-violet-300"
                    />
                  </motion.div>

                  <div>
                    <p className="text-white text-sm font-medium">
                      Velora AI
                    </p>
                    <p className="text-white/30 text-xs">
                      {t("aiInsightsSection.assistant")}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] text-emerald-300/70 uppercase tracking-wider">
                  {t("aiInsightsSection.analyzing")}
                </span>
              </div>

              {/* Insight */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6"
              >
                <div className="flex items-center gap-2 mb-5">
                  <Lightbulb
                    size={16}
                    className="text-amber-300"
                  />

                  <span className="text-xs text-white/40">
                    {t("aiInsightsSection.smartInsight")}
                  </span>
                </div>

                <p className="text-xl md:text-2xl text-white leading-relaxed">
                  {t("aiInsightsSection.insightLead")}
                  <span className="text-violet-300">
                    {t("aiInsightsSection.insightValue")}
                  </span>
                  {t("aiInsightsSection.insightTail")}
                </p>

                <p className="mt-4 text-sm text-white/35 leading-6">
                  {t("aiInsightsSection.insightDescLead")}
                  <span className="text-white/70">
                    {t("aiInsightsSection.insightDescValue")}
                  </span>
                </p>

                <button className="mt-7 flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors cursor-pointer">
                  {t("aiInsightsSection.review")}
                  <ArrowUpRight size={15} className={isRTL ? "rtl:rotate-180" : ""} />
                </button>
              </motion.div>

            </div>

            {/* Right */}
            <div className="p-8 md:p-12">

              <p className="text-white/35 text-xs uppercase tracking-[0.18em] mb-8">
                {t("aiInsightsSection.spendingAnalysis")}
              </p>

              {/* Categories */}
              <div className="space-y-6">

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white/60">
                      {t("aiInsightsSection.housing")}
                    </span>

                    <span className="text-sm text-white">
                      $1,240
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "78%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1 }}
                      className="h-full rounded-full bg-violet-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white/60">
                      {t("aiInsightsSection.food")}
                    </span>

                    <span className="text-sm text-white">
                      $520
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "46%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.1 }}
                      className="h-full rounded-full bg-cyan-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white/60">
                      {t("aiInsightsSection.subscriptions")}
                    </span>

                    <span className="text-sm text-white">
                      $184
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "28%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="h-full rounded-full bg-pink-300"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-white/60">
                      {t("aiInsightsSection.entertainment")}
                    </span>

                    <span className="text-sm text-white">
                      $96
                    </span>
                  </div>

                  <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: "18%" }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, delay: 0.3 }}
                      className="h-full rounded-full bg-amber-300"
                    />
                  </div>
                </div>

              </div>

              {/* Bottom stat */}
              <div className="mt-12 pt-7 border-t border-white/[0.07] flex items-center justify-between">
                <div>
                  <p className="text-white/30 text-xs">
                    {t("aiInsightsSection.potentialSavings")}
                  </p>

                  <p className="text-3xl text-white font-medium mt-2">
                    $286
                  </p>
                </div>

                <div className="w-11 h-11 rounded-full bg-emerald-400/10 flex items-center justify-center">
                  <TrendingDown
                    size={18}
                    className="text-emerald-300"
                  />
                </div>
              </div>

            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export default AIInsights;