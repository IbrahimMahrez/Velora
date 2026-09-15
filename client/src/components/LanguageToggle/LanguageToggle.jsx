import { Languages } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

function LanguageToggle({ variant = "glass" }) {
  const { lang, toggle } = useLanguage();

  const label = lang === "en" ? "عربي" : "EN";

  if (variant === "dashboard") {
    return (
      <button
        type="button"
        onClick={toggle}
        title={lang === "en" ? "Switch to Arabic" : "التبديل للإنجليزية"}
        className="dashboard-icon-button"
        style={{
          width: "auto",
          minWidth: "40px",
          padding: "0 12px",
          borderRadius: "999px",
          gap: "6px",
          fontSize: "12px",
          fontWeight: 600,
        }}
      >
        <Languages size={15} />
        <span>{label}</span>
      </button>
    );
  }

  // default: glass pill for navbar / landing
  return (
    <button
      type="button"
      onClick={toggle}
      title={lang === "en" ? "Switch to Arabic" : "التبديل للإنجليزية"}
      className="flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 text-xs font-medium text-white/80 backdrop-blur-md transition-all hover:bg-white/[0.08] hover:text-white cursor-pointer"
    >
      <Languages size={14} />
      <span>{label}</span>
    </button>
  );
}

export default LanguageToggle;
