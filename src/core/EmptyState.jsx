import React from "react";
import Icon from "./Icon.jsx";

export default function EmptyState({
  icon = "leaf",
  title = "暂无数据",
  description = "当前没有可显示的内容",
  action,
}) {
  return (
    <div style={{
      display: "grid", placeItems: "center", gap: 12, padding: 48,
      color: "var(--muted)", textAlign: "center",
    }}>
      <div style={{
        width: 64, height: 64, borderRadius: 999,
        background: "rgba(53,195,107,0.1)",
        display: "grid", placeItems: "center",
      }}>
        <Icon name={icon} size={30} />
      </div>
      <div>
        <strong style={{ display: "block", color: "var(--text)", fontSize: "1rem", marginBottom: 4 }}>{title}</strong>
        <span style={{ fontSize: "0.82rem" }}>{description}</span>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}
