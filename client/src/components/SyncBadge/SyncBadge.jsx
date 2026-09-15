import { useEffect, useState } from "react";
import { RefreshCw, WifiOff } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";
import {
  onOutboxChange,
  peekAll,
  flushOutbox,
} from "../../utils/offlineQueue";
import "./SyncBadge.css";

// Floating badge: pending offline mutations + one-tap sync.
// Hidden when the queue is empty or nobody is logged in.
function SyncBadge() {
  const { t } = useLanguage();
  const [count, setCount] = useState(() => peekAll().length);
  const [syncing, setSyncing] = useState(false);
  const [authed, setAuthed] = useState(() => {
    try {
      return Boolean(localStorage.getItem("token"));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const syncAuth = () => {
      try {
        setAuthed(Boolean(localStorage.getItem("token")));
      } catch {
        setAuthed(false);
      }
    };

    syncAuth();

    const off = onOutboxChange((items) =>
      setCount(items.length)
    );

    const handleOnline = async () => {
      syncAuth();
      if (!localStorage.getItem("token")) return;
      setSyncing(true);
      try {
        const result = await flushOutbox();
        // New server data arrived -> refresh the view once.
        if (result && result.done > 0) {
          window.location.reload();
        }
      } finally {
        setSyncing(false);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("storage", syncAuth);

    return () => {
      off();
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("storage", syncAuth);
    };
  }, []);

  if (!authed || count === 0) return null;

  const handleSync = async () => {
    if (syncing) return;
    setSyncing(true);
    try {
      const result = await flushOutbox();
      if (result && result.done > 0) {
        window.location.reload();
      }
    } finally {
      setSyncing(false);
    }
  };

  return (
    <button
      type="button"
      className="sync-badge"
      onClick={handleSync}
      title={t("common.syncNow")}
    >
      {syncing ? (
        <RefreshCw size={15} className="sync-spin" />
      ) : (
        <WifiOff size={15} />
      )}
      <span>
        {count} • {t("common.offlinePending")}
      </span>
    </button>
  );
}

export default SyncBadge;
