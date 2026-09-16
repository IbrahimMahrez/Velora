import { motion } from "motion/react";
import { ArrowRight, Play } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

function Hero() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  return (
    <section className="relative flex-1 flex items-center justify-center px-6">
      <div className="relative z-10 w-full max-w-5xl mx-auto text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.04] backdrop-blur-md text-white/70 text-xs mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
          {t("hero.badge")}
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.9,
            delay: 0.1,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="text-5xl md:text-7xl font-medium leading-[1.05] tracking-tight text-white"
        >
          {t("hero.titleA")}
          <br />
          <span className="font-serif italic text-purple-400">
            {t("hero.titleB")}
          </span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="max-w-2xl mx-auto mt-7 text-white/55 text-sm md:text-base leading-7"
        >
          {t("hero.description")}
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-9"
        >
          <button 
            onClick={() => navigate("/dashboard")}
            className="group flex items-center gap-2 px-7 py-3 rounded-full bg-white text-black text-sm font-medium hover:bg-white/90 transition-all cursor-pointer"
          >
            {t("hero.getStarted")}
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform rtl:rotate-180"
            />
          </button>

          <button className="flex items-center gap-2 px-7 py-3 rounded-full border border-white/15 bg-white/[0.04] backdrop-blur-md text-white text-sm font-medium hover:bg-white/[0.08] transition-all cursor-pointer">
            <Play size={14} />
            {t("hero.explore")}
          </button>
        </motion.div>

        {/* Mini Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="flex items-center justify-center gap-8 mt-12 text-white/40 text-xs"
        >
          <span>{t("hero.statsExpenses")}</span>
          <span>{t("hero.statsSubscriptions")}</span>
          <span>{t("hero.statsSavings")}</span>
          <span>{t("hero.statsInsights")}</span>
        </motion.div>

      </div>
    </section>
  );
}

export default Hero;