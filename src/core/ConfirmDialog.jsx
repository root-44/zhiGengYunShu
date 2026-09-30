import React, { useState, useEffect } from "react";

let _pending = null;
const _listeners = new Set();
function notify() { _listeners.forEach((fn) => fn()); }

export function confirm(message, { title = "确认操作", confirmText = "确认", danger = false } = {}) {
  return new Promise((resolve) => {
    _pending = { message, title, confirmText, danger, resolve };
    notify();
  });
}

export function ConfirmContainer() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    _listeners.add(fn);
    return () => _listeners.delete(fn);
  }, []);

  if (!_pending) return null;

  function handleConfirm() {
    _pending.resolve(true);
    _pending = null;
    notify();
  }
  function handleCancel() {
    _pending.resolve(false);
    _pending = null;
    notify();
  }

  return (
    <div
      onClick={handleCancel}
      style={{
        position: "fixed", inset: 0, zIndex: 300,
        display: "grid", placeItems: "center", padding: 20,
        background: "rgba(15,38,28,0.25)", backdropFilter: "blur(4px)",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "min(420px, 100%)", padding: 24, borderRadius: "var(--radius)",
          background: "#fff", boxShadow: "0 28px 80px rgba(32,79,59,0.18)",
          display: "grid", gap: 16,
        }}
      >
        <div>
          <strong style={{ fontSize: "1.1rem", display: "block", marginBottom: 6 }}>{_pending.title}</strong>
          <p style={{ margin: 0, color: "var(--text-2)", fontSize: "0.9rem", lineHeight: 1.5 }}>{_pending.message}</p>
        </div>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            onClick={handleCancel}
            className="ghost-button"
            style={{ minHeight: 40, padding: "0 18px" }}
          >
            取消
          </button>
          <button
            onClick={handleConfirm}
            style={{
              minHeight: 40, padding: "0 18px", border: 0, borderRadius: "var(--radius)",
              color: "#fff", fontWeight: 900, cursor: "pointer",
              background: _pending.danger
                ? "linear-gradient(135deg, #e24d57, #f0626e)"
                : "linear-gradient(135deg, var(--accent), #77d86d)",
            }}
          >
            {_pending.confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
