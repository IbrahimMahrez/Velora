import { motion } from "motion/react";
import {
  ArrowUpRight,
  Brain,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const baseTestimonials = [
  { name: "Alex Morgan", initials: "AM" },
  { name: "Sarah Chen", initials: "SC" },
  { name: "Daniel Reed", initials: "DR" },
];

const trustIcons = [ShieldCheck, Brain, Sparkles];

function SocialProof() {
  const { t } = useLanguage();

  const translatedItems = t("socialProof.items");
  const testimonials = baseTestimonials.map((base, i) => ({
    ...base,
    ...(Array.isArray(translatedItems) ? translatedItems[i] : {}),
  }));

  const stats = t("socialProof.stats");
  const trust = t("socialProof.trust");

  return (
    <section className="relative overflow-hidden bg-black px-6 py-32 md:py-40">
      {/* Purple atmosphere */}
      <motion.div
        animate={{
          x: [0, 100, -60, 0],
          y: [0, -50, 70, 0],
          scale: [1, 1.15, 0.95, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute left-1/2 top-1/3 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-violet-600/10 blur-[150px]"
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
            {t("socialProof.badge")}
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="mt-6 text-4xl font-medium tracking-tight text-white md:text-6xl"
          >
            {t("socialProof.titleA")}
            <br />
            <span className="font-serif italic text-purple-400">
              {t("socialProof.titleB")}
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="mx-auto mt-6 max-w-xl text-sm leading-7 text-white/40"
          >
            {t("socialProof.description")}
          </motion.p>
        </div>

        {/* Trust stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.25 }}
          className="mx-auto mt-16 grid max-w-4xl grid-cols-2 overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] md:grid-cols-4"
        >
          {Array.isArray(stats) &&
            stats.map((stat, index) => (
              <div
                key={stat.label}
                className={`px-5 py-7 text-center ${
                  index !== 3
                    ? "border-b border-white/[0.06] md:border-b-0 md:border-r"
                    : ""
                }`}
              >
                <p className="text-2xl font-medium tracking-tight text-white">
                  {stat.value}
                </p>
                <p className="mx-auto mt-2 max-w-[130px] text-[10px] leading-4 text-white/30">
                  {stat.label}
                </p>
              </div>
            ))}
        </motion.div>

        {/* Testimonials */}
        <div className="mt-20 grid gap-4 md:grid-cols-3">
          {testimonials.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.12 }}
              whileHover={{ y: -6 }}
              className="group relative overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.025] p-6 transition-colors duration-500 hover:border-violet-400/20"
            >
              {/* Purple hover glow */}
              <div className="absolute -right-16 -top-16 h-32 w-32 rounded-full bg-violet-500/10 blur-3xl opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Stars */}
              <div className="relative flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={12}
                    className="fill-violet-300 text-violet-300"
                  />
                ))}
              </div>

              {/* Quote */}
              <p className="relative mt-7 min-h-[100px] text-sm leading-7 text-white/65">
                &ldquo;{item.quote}&rdquo;
              </p>

              {/* User */}
              <div className="relative mt-8 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-violet-400/10 text-[10px] font-medium text-violet-200">
                    {item.initials}
                  </div>
                  <div>
                    <p className="text-xs font-medium text-white">
                      {item.name}
                    </p>
                    <p className="mt-1 text-[10px] text-white/30">
                      {item.role}
                    </p>
                  </div>
                </div>
                <ArrowUpRight
                  size={15}
                  className="text-white/20 transition-all duration-300 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-violet-300"
                />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[10px] uppercase tracking-[0.18em] text-white/25"
        >
          {Array.isArray(trust) &&
            trust.map((label, index) => {
              const TrustIcon = trustIcons[index] ?? Sparkles;
              return (
                <span key={label} className="flex items-center gap-2">
                  <TrustIcon size={14} className="text-violet-300/60" />
                  {label}
                </span>
              );
            })}
        </motion.div>
      </div>
    </section>
  );
}

export default SocialProof;
