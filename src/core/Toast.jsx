import React from "react";
import { useState, useEffect, useCallback } from "react";

// ---- Module-level toast state ----
let _toasts = [];
let _id = 0;
const _listeners = new Set();
function notify() { _listeners.forEach((fn) => fn()); }

export function toast(message, { type = "success", duration = 3000 } = {}) {
  const id = ++_id;
  _toasts = [..._toasts, { id, message, type }];
  notify();
  if (duration > 0) {
    setTimeout(() => { dismissToast(id); }, duration);
  }
  return id;
}

export function dismissToast(id) {
  _toasts = _toasts.filter((t) => t.id !== id);
  notify();
}

// ---- Toast Container Component ----
export function ToastContainer() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }, []);

  if (_toasts.length === 0) return null;

  return (
    <div style={{
      position: "fixed", bottom: 24, right: 24, zIndex: 200,
      display: "grid", gap: 8, maxWidth: 380,
    }}>
      {_toasts.map((t) => (
        <div
          key={t.id}
          onClick={() => dismissToast(t.id)}
          style={{
            padding: "12px 16px", borderRadius: "var(--radius)",
            color: "#fff", fontWeight: 900, fontSize: "0.86rem",
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
            animation: "toast-slide-in 0.25s ease",
            background:
              t.type === "success" ? "linear-gradient(135deg, #35c36b, #77d86d)" :
              t.type === "error" ? "linear-gradient(135deg, #e24d57, #f0626e)" :
              t.type === "warn" ? "linear-gradient(135deg, #c98a10, #e0a020)" :
              "linear-gradient(135deg, #2da9dc, #5cc0e8)",
          }}
        >
          {t.type === "success" && "✓ "}
          {t.type === "error" && "✕ "}
          {t.type === "warn" && "⚠ "}
          {t.message}
        </div>
      ))}
    </div>
  );
}
