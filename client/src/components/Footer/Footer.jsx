import { motion } from "motion/react";
import {
  ArrowUpRight,
  Mail,
} from "lucide-react";
import logo from "../../assets/logo.png";
import { useLanguage } from "../../context/LanguageContext";

const footerLinks = {
  Product: ["Features", "How it works", "Pricing", "AI Insights"],
  Company: ["About", "Use Cases", "Security", "Contact"],
  Resources: ["FAQ", "Help Center", "Privacy", "Terms"],
};

function Footer() {
  const { t } = useLanguage();

  const groups = [
    { title: t("footer.product"), links: footerLinks.Product },
    { title: t("footer.company"), links: footerLinks.Company },
    { title: t("footer.resources"), links: footerLinks.Resources },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.06] bg-black px-6 pt-20">
      {/* Purple glow */}
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-600/10 blur-[140px]" />

      <div className="relative z-10 mx-auto max-w-6xl">

        {/* Main footer */}
        <div className="grid gap-14 pb-16 md:grid-cols-[1.4fr_2fr]">

          {/* Brand */}
          <div>
            <motion.a
              href="#"
              whileHover={{ y: -2 }}
              className="inline-flex items-center gap-2"
            >
              <img
                src={logo}
                alt="Velora"
                className="h-11 w-auto object-contain brightness-0 invert"
              />
            </motion.a>

            <p className="mt-6 max-w-sm text-sm leading-7 text-white/35">
              {t("footer.description")}
            </p>

            {/* Social */}
            <div className="mt-7 flex items-center gap-2">
              <motion.a
                href="#"
                aria-label="Email"
                whileHover={{ y: -3 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-white/35 transition-colors duration-300 hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
              >
                <Mail size={15} />
              </motion.a>

              <motion.a
                href="#"
                aria-label="Twitter"
                whileHover={{ y: -3 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-xs font-semibold text-white/35 transition-colors duration-300 hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
              >
                X
              </motion.a>

              <motion.a
                href="#"
                aria-label="LinkedIn"
                whileHover={{ y: -3 }}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.07] bg-white/[0.03] text-[11px] font-semibold text-white/35 transition-colors duration-300 hover:border-violet-400/20 hover:bg-violet-400/10 hover:text-violet-300"
              >
                in
              </motion.a>
            </div>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="text-xs font-medium text-white">
                  {group.title}
                </p>

                <div className="mt-5 space-y-3.5">
                  {group.links.map((link) => (
                    <a
                      key={link}
                      href={
                        link === "About" ||
                        link === t("nav.about")
                          ? "#about"
                          : "#"
                      }
                      className="group flex items-center gap-1 text-xs text-white/35 transition-colors duration-300 hover:text-white"
                    >
                      {link}

                      <ArrowUpRight
                        size={11}
                        className="opacity-0 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-60"
                      />
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Newsletter */}
        <div className="relative overflow-hidden rounded-3xl border border-violet-400/10 bg-violet-400/[0.035] px-6 py-8 md:flex md:items-center md:justify-between md:px-8">
          <div>
            <p className="text-sm font-medium text-white">
              {t("footer.newsletterTitle")}
            </p>

            <p className="mt-1 text-xs text-white/30">
              {t("footer.newsletterDesc")}
            </p>
          </div>

          <div className="mt-5 flex w-full max-w-sm gap-2 md:mt-0">
            <input
              type="email"
              placeholder={t("footer.emailPlaceholder")}
              className="min-w-0 flex-1 rounded-full border border-white/[0.08] bg-black/30 px-4 py-3 text-xs text-white outline-none placeholder:text-white/20 focus:border-violet-400/30"
            />

            <button className="group flex shrink-0 cursor-pointer items-center gap-2 rounded-full bg-white px-5 py-3 text-xs font-medium text-black transition-all duration-300 hover:bg-violet-100">
              {t("footer.join")}

              <ArrowUpRight
                size={13}
                className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </button>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col gap-4 border-t border-white/[0.06] py-7 text-[10px] text-white/25 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Velora. {t("footer.rights")}
          </p>

          <div className="flex items-center gap-5">
            <a
              href="#"
              className="transition-colors hover:text-white/50"
            >
              {t("footer.privacy")}
            </a>

            <a
              href="#"
              className="transition-colors hover:text-white/50"
            >
              {t("footer.terms")}
            </a>
          </div>

          <p className="flex items-center gap-1">
            {t("footer.builtWith")}
            <span className="text-violet-300">♥</span>
            {t("footer.builtFor")}
          </p>
        </div>

      </div>
    </footer>
  );
}

export default Footer;
