import { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import './light-theme.css'
import App from './App.jsx'

// ======================================================
// ERROR BOUNDARY
// A render crash (e.g. a bad date value in a picker) must
// never leave the user staring at a black screen — show a
// recoverable fallback with a reload action instead.
// ======================================================

class RootErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { crashed: false };
  }

  static getDerivedStateFromError() {
    return { crashed: true };
  }

  componentDidCatch(error) {
    console.error("Uncaught render error:", error);
  }

  render() {
    if (this.state.crashed) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#050505",
            color: "#f5f5f5",
            fontFamily: "Inter, Cairo, sans-serif",
            padding: 24,
            textAlign: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: 22, marginBottom: 8 }}>
              Something went wrong
            </h1>
            <p style={{ color: "#999", fontSize: 13, marginBottom: 20 }}>
              Please reload the page to continue.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 28px",
                borderRadius: 999,
                border: 0,
                background: "#fff",
                color: "#050505",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// ======================================================
// Apply saved appearance BEFORE first paint so the theme
// (dark/light + accent color from Settings) survives reload
// instead of always starting dark.
// ======================================================

try {
  const saved = JSON.parse(
    localStorage.getItem('velora-settings') || '{}'
  );

  if (saved.theme === 'light' || saved.theme === 'dark') {
    document.documentElement.setAttribute('data-theme', saved.theme);
  }

  if (typeof saved.accentColor === 'string' && saved.accentColor) {
    document.documentElement.style.setProperty(
      '--velora-accent',
      saved.accentColor
    );
  }
} catch {
  // corrupted storage — boot with defaults
}

// Register service worker in production only so dev
// never serves stale modules from cache.
if (
  import.meta.env.PROD &&
  typeof window !== "undefined" &&
  "serviceWorker" in navigator
) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .catch(() => {});
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RootErrorBoundary>
      <App />
    </RootErrorBoundary>
  </StrictMode>,
)
