import api from "../services/api";

// ======================================================
// WEB PUSH CLIENT
// Subscribes the browser for payment reminders that arrive
// even with the app closed (via the service worker).
// ======================================================

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; i++) {
    output[i] = raw.charCodeAt(i);
  }

  return output;
}

export function pushSupport() {
  if (
    typeof window === "undefined" ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window) ||
    !("Notification" in window)
  ) {
    return "unsupported";
  }
  return Notification.permission; // granted | denied | default
}

// Sync (or create) the subscription with the backend.
// Returns: subscribed | prompt | denied | unsupported | error
export async function ensurePushSubscribed() {
  try {
    const support = pushSupport();

    if (support === "unsupported" || support === "denied") {
      return support;
    }

    if (support === "default") {
      return "prompt";
    }

    const reg = await navigator.serviceWorker.ready;

    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      const { data } = await api.get("/push/vapid-key");
      if (!data?.key) return "error";

      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(data.key),
      });
    }

    await api.post("/push/subscribe", {
      subscription: sub.toJSON(),
    });

    return "subscribed";
  } catch {
    return "error";
  }
}

// Ask for permission, then subscribe. Returns final state.
export async function requestPushPermission() {
  try {
    if (pushSupport() === "unsupported") return "unsupported";

    const permission = await Notification.requestPermission();

    if (permission !== "granted") return permission;

    return await ensurePushSubscribed();
  } catch {
    return "error";
  }
}
