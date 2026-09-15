
import { motion } from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function FinalCTA() {
  const { t } = useLanguage();

  return (
    <section className="relative overflow-hidden bg-black px-6 py-32 md:py-40">
      {/* Purple atmosphere */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.08, 0.16, 0.08],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-violet-600 blur-[180px]"
      />

      <div className="relative z-10 mx-auto max-w-5xl">
        <div className="liquid-glass relative overflow-hidden rounded-[2.5rem] px-6 py-20 text-center md:px-12 md:py-28">
          {/* Inner purple glow */}
          <div className="pointer-events-none absolute left-1/2 top-0 h-64 w-64 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[100px]" />

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="relative inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.07] px-4 py-2 text-xs text-violet-200/70"
          >
            <Sparkles size={13} />
            {t("finalCta.badge")}
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="relative mx-auto mt-7 max-w-3xl text-4xl font-medium leading-tight tracking-tight text-white md:text-6xl"
          >
            {t("finalCta.titleA")}
            <br />
            <span className="font-serif italic text-purple-400">
              {t("finalCta.titleB")}
            </span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="relative mx-auto mt-6 max-w-xl text-sm leading-7 text-white/40"
          >
            {t("finalCta.description")}
          </motion.p>

          {/* Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <button className="group flex cursor-pointer items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-medium text-black transition-all duration-300 hover:bg-violet-100">
              {t("finalCta.getStarted")}

              <ArrowRight
                size={16}
                className="transition-transform duration-300 group-hover:translate-x-1"
              />
            </button>

            <button className="cursor-pointer rounded-full border border-white/[0.1] bg-white/[0.04] px-7 py-3.5 text-sm font-medium text-white transition-all duration-300 hover:bg-white/[0.08]"
            >
              {t("finalCta.explore")}
            </button>
          </motion.div>

          {/* Bottom note */}
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.45 }}
            className="relative mt-7 text-[10px] text-white/25"
          >
            {t("finalCta.note")}
          </motion.p>
        </div>
      </div>
    </section>
  );
}

export default FinalCTA;
