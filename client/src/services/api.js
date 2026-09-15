import axios from "axios";
import { saveSnapshot, readSnapshot } from "../utils/offlineCache";
import { isQueueable, enqueue } from "../utils/offlineQueue";

// ======================================================
// CENTRAL API CLIENT
// All frontend API calls should go through this instance.
// Base URL comes from VITE_API_URL (production) with a
// local-dev fallback. Token is attached automatically and
// an expired/invalid session (401) logs the user out once.
// ======================================================

export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:7000";

export const SERVER_URL = API_BASE_URL;

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Attach auth token to every request
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // storage unavailable — send request without token
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// GET endpoints whose last successful response is snapshotted
// to IndexedDB so pages render offline from cache.
const CACHEABLE_PREFIXES = [
  "/dashboard",
  "/expenses",
  "/bills",
  "/subscription",
  "/goal",
  "/installments",
  "/budgets",
  "/family",
  "/notifications",
  "/plans",
  "/users/profile",
  "/settings",
];

const cacheKeyOf = (config = {}) => {
  const url = String(config.url || "");
  let params = "";
  try {
    params = JSON.stringify(config.params ?? null);
  } catch {
    params = "";
  }
  return `GET|${url}|${params}`;
};

const isCacheable = (config = {}) => {
  if (String(config.method || "get").toLowerCase() !== "get") {
    return false;
  }
  if (config.__replay) return false;
  const url = String(config.url || "");
  return CACHEABLE_PREFIXES.some((p) => url.startsWith(p));
};

// Global expired-session handling (backend JWT lives 1h)
let redirectingToLogin = false;

api.interceptors.response.use(
  (response) => {
    // Snapshot successful reads for offline use (fire-and-forget)
    try {
      if (
        isCacheable(response?.config) &&
        response?.data !== undefined
      ) {
        saveSnapshot(
          cacheKeyOf(response.config),
          response.data
        ).catch(() => {});
      }
    } catch {
      // never break responses
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || "";

    // Don't loop on auth endpoints themselves
    const isAuthCall =
      url.includes("/auth/login") ||
      url.includes("/auth/register");

    if (status === 401 && !isAuthCall && !redirectingToLogin) {
      redirectingToLogin = true;

      try {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      } catch {
        // ignore
      }

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.startsWith("/login")
      ) {
        window.location.href = "/login";
      }

      setTimeout(() => {
        redirectingToLogin = false;
      }, 3000);
    }

    // No server response at all (device offline): queue safe
    // mutations synchronously so the caller's catch sees
    // error.isQueued and can report "saved, will sync".
    if (!error?.response && error?.config) {
      // Reads fall back to the last snapshot so pages still
      // render offline. The banner tells the user it's cached.
      if (isCacheable(error.config)) {
        return readSnapshot(cacheKeyOf(error.config)).then(
          (entry) => {
            if (entry && entry.data !== undefined) {
              return {
                data: entry.data,
                status: 200,
                statusText: "OK (cached)",
                headers: {},
                config: error.config,
                __fromCache: true,
              };
            }
            return Promise.reject(error);
          },
          () => Promise.reject(error)
        );
      }

      try {
        if (isQueueable(error.config)) {
          enqueue(error.config);
          error.isQueued = true;
        }
      } catch {
        // queue is best-effort
      }
    }

    return Promise.reject(error);
  }
);

export default api;
