import api from "../services/api";

// ======================================================
// OFFLINE OUTBOX
// Mutations that fail with NO server response (device
// offline) are queued in localStorage and replayed FIFO
// when the connection returns — user taps Sync or the
// browser fires "online". Auth, push, AI, backup and
// payments are NEVER queued (live response or money risk).
// FormData (receipt images) can't be serialized — skipped.
// ======================================================

const STORAGE_KEY = "velora-outbox";

const EXCLUDED_PREFIXES = [
  "/auth",
  "/push",
  "/ai",
  "/backup",
  "/payments",
];

const listeners = new Set();

const notify = () => {
  const items = peekAll();
  listeners.forEach((fn) => {
    try {
      fn(items);
    } catch {
      // ignore listener errors
    }
  });
};

export function onOutboxChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function peekAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch {
    return [];
  }
}

const persist = (items) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // storage full — drop oldest until it fits
    try {
      const trimmed = items.slice(-20);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
    } catch {
      // give up silently
    }
  }
  notify();
};

export function isQueueable(config = {}) {
  const method = String(config.method || "get").toLowerCase();

  if (!["post", "put", "patch", "delete"].includes(method)) {
    return false;
  }

  const url = String(config.url || "");

  if (EXCLUDED_PREFIXES.some((p) => url.startsWith(p))) {
    return false;
  }

  if (
    typeof FormData !== "undefined" &&
    config.data instanceof FormData
  ) {
    return false;
  }

  if (config.__replay) return false;

  return true;
}

export function enqueue(config) {
  const items = peekAll();

  items.push({
    id: `${Date.now()}-${Math.floor(Math.random() * 1e9)}`,
    method: String(config.method).toLowerCase(),
    url: config.url,
    data: config.data ?? null,
    params: config.params ?? null,
    ts: Date.now(),
  });

  // Cap the queue so one offline week can't overflow storage
  persist(items.slice(-50));
}

export async function flushOutbox() {
  if (
    typeof navigator !== "undefined" &&
    navigator.onLine === false
  ) {
    return { done: 0, failed: 0, remaining: peekAll().length };
  }

  let done = 0;
  let failed = 0;

  let items = peekAll();

  while (items.length > 0) {
    const [head, ...rest] = items;

    try {
      await api.request({
        method: head.method,
        url: head.url,
        data: head.data,
        params: head.params || undefined,
        __replay: true,
      });
      done += 1;
      items = rest;
      persist(items);
    } catch (err) {
      // Network still down → keep the rest queued, stop here
      if (!err?.response) break;

      // Server answered (validation etc.) → drop it, continue
      failed += 1;
      items = rest;
      persist(items);
    }
  }

  return { done, failed, remaining: items.length };
}

export function pendingCount() {
  return peekAll().length;
}
