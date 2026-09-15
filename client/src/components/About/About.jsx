import { motion } from "motion/react";
import { Mail, Globe, AtSign, ShieldCheck, Languages, Cpu } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const valueIcons = [ShieldCheck, Languages, Cpu];

function About() {
  const { t } = useLanguage();

  const stats = t("about.stats");
  const values = t("about.values");

  return (
    <section
      id="about"
      className="relative overflow-hidden bg-black px-6 py-32 md:py-40"
    >
      {/* Glow */}
      <motion.div
        animate={{
          x: [0, -80, 60, 0],
          y: [0, 60, -40, 0],
        }}
        transition={{
          duration: 14,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="pointer-events-none absolute right-1/4 top-1/4 h-[420px] w-[420px] rounded-full bg-violet-600/10 blur-[150px]"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <div className="grid items-start gap-14 lg:grid-cols-[1.5fr_1fr]">
          {/* Story */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 rounded-full border border-violet-400/20 bg-violet-400/[0.06] px-4 py-2 text-xs text-violet-200/70"
            >
              {t("about.badge")}
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="mt-6 text-4xl font-medium tracking-tight text-white md:text-6xl"
            >
              {t("about.titleA")}
              <br />
              <span className="font-serif italic text-purple-400">
                {t("about.titleB")}
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="mt-6 max-w-xl text-sm leading-7 text-white/40"
            >
              {t("about.description")}
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.22 }}
              className="mt-4 max-w-xl text-sm leading-7 text-white/40"
            >
              {t("about.story")}
            </motion.p>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4">
              {(Array.isArray(stats) ? stats : []).map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5"
                >
                  <p className="text-2xl font-medium text-white">
                    {s.value}
                  </p>
                  <p className="mt-1 text-[11px] leading-5 text-white/35">
                    {s.label}
                  </p>
                </motion.div>
              ))}
            </div>

            {/* Values */}
            <div className="mt-8 space-y-4">
              {(Array.isArray(values) ? values : []).map((v, i) => {
                const Icon = valueIcons[i % valueIcons.length];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08 }}
                    className="flex items-start gap-4"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-400/10 text-violet-300">
                      <Icon size={17} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">
                        {v.title}
                      </p>
                      <p className="mt-1 text-xs leading-6 text-white/35">
                        {v.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Founder card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="lg:sticky lg:top-10 overflow-hidden rounded-[2rem] border border-white/[0.07] bg-white/[0.025] p-8"
          >
            <div className="pointer-events-none absolute -top-20 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-violet-500/10 blur-[80px]" />

            <div className="relative flex flex-col items-center text-center">
              <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-violet-400 to-violet-700 text-2xl font-semibold text-white shadow-[0_0_50px_rgba(139,92,246,0.25)]">
                {t("about.initials")}
                <img
                  src="/founder.jpg"
                  alt={t("about.name")}
                  className="absolute inset-0 h-full w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                />
              </div>

              <p className="mt-5 text-xl font-medium text-white">
                {t("about.name")}
              </p>

              <p className="mt-1 text-xs text-violet-300/80">
                {t("about.role")}
              </p>

              <p className="mt-4 text-xs leading-6 text-white/35">
                {t("about.cardBio")}
              </p>

              <div className="mt-6 flex items-center gap-2">
                <motion.a
                  href="mailto:ibrahimmahrez726@gmail.com"
                  aria-label="Email"
                  whileHover={{ y: -3 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-white/50 transition-colors duration-300 hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
                >
                  <Mail size={16} />
                </motion.a>

                <motion.a
                  href="https://github.com/IbrahimMahrez"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="GitHub"
                  whileHover={{ y: -3 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-white/50 transition-colors duration-300 hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
                >
                  <Globe size={16} />
                </motion.a>

                <motion.a
                  href="https://www.linkedin.com/in/ibrahim-mohamed-haraz-95114a2ab/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="LinkedIn"
                  whileHover={{ y: -3 }}
                  className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-white/50 transition-colors duration-300 hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
                >
                  <AtSign size={16} />
                </motion.a>
              </div>

              <p className="mt-6 text-[10px] text-white/25">
                {t("about.contactHint")}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

export default About;
