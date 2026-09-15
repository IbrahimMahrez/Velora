import { motion } from "motion/react";
import {
  Plus,
  Layers3,
  BrainCircuit,
  TrendingUp,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const stepStyles = [
  {
    number: "01",
    icon: Plus,
  },
  {
    number: "02",
    icon: Layers3,
  },
  {
    number: "03",
    icon: BrainCircuit,
  },
  {
    number: "04",
    icon: TrendingUp,
  },
];

function HowItWorks() {
  const { t } = useLanguage();
  const translatedSteps = t("howItWorks.steps");
  const steps = stepStyles.map((style, i) => ({
    ...style,
    title: translatedSteps[i]?.title ?? "",
    description: translatedSteps[i]?.description ?? "",
  }));
  return (
    <section className="relative bg-black px-6 py-32 overflow-hidden">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-2xl mx-auto mb-20"
        >
          <p className="text-white/35 text-xs tracking-[0.2em] uppercase mb-5">
            {t("howItWorks.badge")}
          </p>

          <h2 className="text-4xl md:text-6xl text-white font-medium leading-tight">
            {t("howItWorks.titleA")}
            <br />
            <span className="font-serif italic text-purple-400">
              {t("howItWorks.titleB")}
            </span>
          </h2>

          <p className="mt-6 text-white/40 text-sm md:text-base leading-7">
            {t("howItWorks.description")}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="relative">

          {/* Connection Line */}
          <div className="hidden md:block absolute top-10 left-[12%] right-[12%] h-px bg-white/[0.08]" />

          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: "76%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="hidden md:block absolute top-10 left-[12%] h-px bg-gradient-to-r from-cyan-400/50 via-violet-400/50 to-emerald-400/50"
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.7,
                    delay: index * 0.15,
                  }}
                  className="relative text-center"
                >
                  {/* Icon */}
                  <motion.div
                    whileHover={{
                      scale: 1.1,
                      y: -5,
                    }}
                    className="relative z-10 mx-auto w-20 h-20 rounded-full border border-white/10 bg-black flex items-center justify-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                      <Icon
                        size={22}
                        className="text-white/70"
                      />
                    </div>
                  </motion.div>

                  {/* Number */}
                  <p className="mt-7 text-[10px] tracking-[0.25em] text-white/25">
                    {step.number}
                  </p>

                  {/* Title */}
                  <h3 className="mt-3 text-xl text-white font-medium">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mt-3 text-sm text-white/35 leading-6 max-w-[220px] mx-auto">
                    {step.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Bottom Statement */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-24 text-center"
        >
          <p className="text-white/20 text-xs uppercase tracking-[0.2em]">
            {t("howItWorks.footer")}
          </p>
        </motion.div>

      </div>
    </section>
  );
}

export default HowItWorks;