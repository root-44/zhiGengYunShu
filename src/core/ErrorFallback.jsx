import React from "react";
export default function ErrorFallback({
  message = "数据加载失败",
  detail = "请检查网络连接后重试",
  onRetry,
}) {
  return (
    <div style={{
      display: "grid", placeItems: "center", gap: 12, padding: 48,
      color: "var(--muted)", textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 999,
        background: "rgba(226,77,87,0.1)",
        display: "grid", placeItems: "center",
        fontSize: "1.6rem",
      }}>
        !
      </div>
      <div>
        <strong style={{ display: "block", color: "var(--danger)", fontSize: "1rem", marginBottom: 4 }}>{message}</strong>
        <span style={{ fontSize: "0.82rem" }}>{detail}</span>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          style={{
            minHeight: 38, border: "1px solid var(--line)", borderRadius: "var(--radius)",
            padding: "0 16px", color: "var(--accent)", background: "#f2f8f3",
            fontWeight: 900, cursor: "pointer",
          }}
        >
          重新加载
        </button>
      )}
    </div>
  );
}
