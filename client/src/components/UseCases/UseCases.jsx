
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  GraduationCap,
  Briefcase,
  Laptop,
  Users,
  ArrowUpRight,
  Wallet,
  Target,
  Receipt,
} from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const baseCases = [
  {
    id: "students",
    icon: GraduationCap,
    accent: "text-cyan-300",
    bg: "bg-cyan-400/10",
    glow: "bg-cyan-400/10",
    balance: "$1,240",
    income: "$1,850",
    spending: "$610",
    goal: "68%",
  },
  {
    id: "employees",
    icon: Briefcase,
    accent: "text-violet-300",
    bg: "bg-violet-400/10",
    glow: "bg-violet-400/10",
    balance: "$4,820",
    income: "$6,400",
    spending: "$2,140",
    goal: "76%",
  },
  {
    id: "freelancers",
    icon: Laptop,
    accent: "text-amber-300",
    bg: "bg-amber-400/10",
    glow: "bg-amber-400/10",
    balance: "$7,360",
    income: "$8,920",
    spending: "$3,480",
    goal: "54%",
  },
  {
    id: "families",
    icon: Users,
    accent: "text-emerald-300",
    bg: "bg-emerald-400/10",
    glow: "bg-emerald-400/10",
    balance: "$12,840",
    income: "$15,200",
    spending: "$6,420",
    goal: "82%",
  },
];

function UseCases() {
  const { t } = useLanguage();
  const translatedItems = t("useCases.items");
  const useCases = baseCases.map((c, i) => ({
    ...c,
    ...(Array.isArray(translatedItems) ? translatedItems[i] : {}),
  }));

  const [activeId, setActiveId] = useState(baseCases[0].id);
  const active = useCases.find((u) => u.id === activeId) ?? useCases[0];

  const Icon = active.icon;

  return (
    <section className="relative overflow-hidden bg-black px-6 py-32 md:py-40">
      {/* Background glow */}
      <motion.div
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -40, 60, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute left-1/3 top-1/4 h-96 w-96 rounded-full blur-[140px] ${active.glow}`}
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-center gap-16 lg:grid-cols-[0.8fr_1.2fr]">

          {/* Left */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-xs uppercase tracking-[0.25em] text-white/40"
            >
              {t("useCases.badge")}
            </motion.span>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-6 max-w-xl text-4xl font-medium leading-tight tracking-tight text-white md:text-6xl"
            >
              {t("useCases.titleA")}
              <span className="font-serif italic text-purple-400">
                {" "}{t("useCases.titleB")}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-6 max-w-md text-sm leading-7 text-white/45"
            >
              {t("useCases.description")}
            </motion.p>

            {/* Use case selector */}
            <div className="mt-10 space-y-2">
              {useCases.map((item) => {
                const ItemIcon = item.icon;
                const isActive = active.id === item.id;

                return (
                  <motion.button
                    key={item.id}
                    onClick={() => setActiveId(item.id)}
                    whileHover={{ x: 5 }}
                    className={`group flex w-full max-w-sm cursor-pointer items-center justify-between rounded-2xl px-4 py-3 text-left transition-all duration-300 ${
                      isActive
                        ? "bg-white/[0.06]"
                        : "bg-transparent hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-xl ${
                          isActive ? item.bg : "bg-white/[0.03]"
                        }`}
                      >
                        <ItemIcon
                          size={17}
                          className={
                            isActive ? item.accent : "text-white/35"
                          }
                        />
                      </div>

                      <span
                        className={`text-sm transition-colors ${
                          isActive ? "text-white" : "text-white/40"
                        }`}
                      >
                        {item.label}
                      </span>
                    </div>

                    <ArrowUpRight
                      size={16}
                      className={`transition-all ${
                        isActive
                          ? "translate-x-0 text-white/60 opacity-100"
                          : "text-white/20 opacity-0 group-hover:opacity-100"
                      }`}
                    />
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Right visual */}
          <motion.div
            layout
            className="relative"
          >
            <div className="liquid-glass relative min-h-[480px] rounded-[2rem] p-6 md:p-8">

              <AnimatePresence mode="wait">
                <motion.div
                  key={active.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.98 }}
                  transition={{ duration: 0.4 }}
                  className="h-full"
                >
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-11 w-11 items-center justify-center rounded-2xl ${active.bg}`}
                      >
                        <Icon size={20} className={active.accent} />
                      </div>

                      <div>
                        <p className="text-sm font-medium text-white">
                          {active.label}
                        </p>
                        <p className="text-xs text-white/35">
                          {t("useCases.card.overview")}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] text-white/40">
                      {t("useCases.card.thisMonth")}
                    </div>
                  </div>

                  {/* Main balance */}
                  <div className="mt-12">
                    <p className="text-xs text-white/35">{t("useCases.card.availableBalance")}</p>

                    <div className="mt-2 flex items-end gap-3">
                      <h3 className="text-5xl font-medium tracking-tight text-white md:text-6xl">
                        {active.balance}
                      </h3>

                      <span className="mb-2 flex items-center gap-1 text-xs text-emerald-300">
                        <ArrowUpRight size={13} />
                        12.8%
                      </span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="mt-10 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-white/[0.035] p-5">
                      <div className="flex items-center gap-2 text-white/35">
                        <Wallet size={14} />
                        <span className="text-xs">{t("useCases.card.income")}</span>
                      </div>

                      <p className="mt-4 text-xl text-white">
                        {active.income}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-white/[0.035] p-5">
                      <div className="flex items-center gap-2 text-white/35">
                        <Receipt size={14} />
                        <span className="text-xs">{t("useCases.card.spending")}</span>
                      </div>

                      <p className="mt-4 text-xl text-white">
                        {active.spending}
                      </p>
                    </div>
                  </div>

                  {/* Goal */}
                  <div className="mt-3 rounded-2xl bg-white/[0.035] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Target size={14} className="text-white/40" />
                        <span className="text-xs text-white/40">
                          {t("useCases.card.savingsGoal")}
                        </span>
                      </div>

                      <span className={`text-xs ${active.accent}`}>
                        {active.goal}
                      </span>
                    </div>

                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: active.goal }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className={`h-full rounded-full ${active.bg.replace(
                          "/10",
                          "/70"
                        )}`}
                      />
                    </div>
                  </div>

                  {/* Bottom insight */}
                  <div className="mt-5 flex items-center justify-between">
                    <p className="text-xs text-white/30">
                      {t("useCases.card.poweredBy")}
                    </p>

                    <span className="flex h-2 w-2 animate-pulse rounded-full bg-emerald-300" />
                  </div>
                </motion.div>
              </AnimatePresence>

            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default UseCases;
