import { motion } from "motion/react";
import {
  CreditCard,
  Receipt,
  Wallet,
  Target,
  Bell,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const featureStyles = [
  {
    icon: Wallet,
    accent: "from-cyan-400/20 via-cyan-400/5 to-transparent",
    iconColor: "text-cyan-300",
  },
  {
    icon: CreditCard,
    accent: "from-violet-400/20 via-violet-400/5 to-transparent",
    iconColor: "text-violet-300",
  },
  {
    icon: Receipt,
    accent: "from-amber-400/20 via-amber-400/5 to-transparent",
    iconColor: "text-amber-300",
  },
  {
    icon: Target,
    accent: "from-emerald-400/20 via-emerald-400/5 to-transparent",
    iconColor: "text-emerald-300",
  },
  {
    icon: Bell,
    accent: "from-pink-400/20 via-pink-400/5 to-transparent",
    iconColor: "text-pink-300",
  },
  {
    icon: Sparkles,
    accent: "from-blue-400/20 via-blue-400/5 to-transparent",
    iconColor: "text-blue-300",
    featured: true,
  },
];

function Features() {
  const { t } = useLanguage();
  const items = t("features.items");
  const features = featureStyles.map((style, i) => ({
    ...style,
    title: items[i]?.title ?? "",
    description: items[i]?.description ?? "",
  }));
  return (
    <section
      id="features"
      className="relative bg-black px-6 py-32 overflow-hidden"
    >
      {/* Background Glow */}
      <motion.div
        animate={{
          x: [0, 120, -80, 0],
          y: [0, -60, 80, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[300px] rounded-full bg-white/[0.025] blur-[120px] pointer-events-none"
      />

      <div className="relative max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-2xl mb-16"
        >
          <motion.p
            initial={{ opacity: 0, letterSpacing: "0.05em" }}
            whileInView={{ opacity: 1, letterSpacing: "0.2em" }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-white/40 text-xs uppercase mb-5"
          >
            {t("features.eyebrow")}
          </motion.p>

          <h2 className="text-4xl md:text-6xl font-medium leading-[1.05] text-white">
            {t("features.titleA")}
            <br />
            <span className="font-serif italic text-purple-400">
              {t("features.titleB")}
            </span>
          </h2>

          <p className="mt-6 text-white/40 text-sm md:text-base leading-7">
            {t("features.description")}
          </p>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.div
                key={feature.title || index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{
                  duration: 0.7,
                  delay: index * 0.1,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{
                  y: -8,
                  scale: 1.015,
                }}
                className={`group relative min-h-[250px] rounded-3xl border border-white/[0.08] bg-white/[0.025] backdrop-blur-xl p-7 overflow-hidden ${
                  feature.featured
                    ? "lg:col-span-1 border-blue-400/20"
                    : ""
                }`}
              >
                {/* Animated Gradient */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileHover={{
                    opacity: 1,
                    scale: 1.4,
                  }}
                  transition={{ duration: 0.6 }}
                  className={`absolute -top-24 -right-24 w-64 h-64 rounded-full bg-gradient-to-br ${feature.accent} blur-3xl pointer-events-none`}
                />

                {/* Moving Shine */}
                <motion.div
                  initial={{ x: "-120%" }}
                  whileHover={{ x: "120%" }}
                  transition={{ duration: 0.8, ease: "easeInOut" }}
                  className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/[0.04] to-transparent -skew-x-12 pointer-events-none"
                />

                {/* Icon */}
                <motion.div
                  whileHover={{
                    rotate: [0, -8, 8, 0],
                    scale: 1.1,
                  }}
                  transition={{ duration: 0.5 }}
                  className="relative w-12 h-12 rounded-2xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center mb-8"
                >
                  <Icon
                    size={21}
                    className={`${feature.iconColor} transition-all duration-300`}
                  />
                </motion.div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-medium text-white mb-3 group-hover:text-white transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm leading-6 text-white/40 group-hover:text-white/60 transition-colors duration-500">
                    {feature.description}
                  </p>
                </div>

                {/* Bottom Accent */}
                <motion.div
                  initial={{ width: "20%" }}
                  whileHover={{ width: "70%" }}
                  transition={{ duration: 0.5 }}
                  className={`absolute bottom-0 left-0 h-[2px] bg-gradient-to-r ${feature.accent.replace(
                    "via-",
                    ""
                  )} opacity-70`}
                />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default Features;