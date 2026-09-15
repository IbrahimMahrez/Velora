import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import { lastSyncAt } from "../../utils/offlineCache";
import "./OfflineBanner.css";

// Shown whenever the device is offline. Cached pages keep
// rendering from the last snapshot; this banner says so.
function OfflineBanner() {
  const { t, lang } = useLanguage();
  const [online, setOnline] = useState(() =>
    typeof navigator === "undefined" ? true : navigator.onLine
  );
  const [savedAt, setSavedAt] = useState(null);

  useEffect(() => {
    const update = () => {
      setOnline(navigator.onLine);
      if (!navigator.onLine) {
        setSavedAt(lastSyncAt());
      }
    };

    update();

    window.addEventListener("online", update);
    window.addEventListener("offline", update);

    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  if (online) return null;

  let when = "";
  try {
    if (savedAt) {
      when = new Date(savedAt).toLocaleString(
        lang === "ar" ? "ar-EG" : "en-EG",
        {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        }
      );
    }
  } catch {
    when = "";
  }

  return (
    <div className="offline-banner" role="status">
      <WifiOff size={14} />
      <span>
        {t("common.offlineBanner")}
        {when ? ` • ${when}` : ""}
      </span>
    </div>
  );
}

export default OfflineBanner;
