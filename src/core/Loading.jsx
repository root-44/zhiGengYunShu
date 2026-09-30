import React from "react";
// Skeleton loading placeholders for different content types

function SkeletonBlock({ width = "100%", height = 16, style }) {
  return (
    <div style={{
      width, height,
      borderRadius: "var(--radius)",
      background: "linear-gradient(90deg, #e8f5e9 25%, #c8e6c9 50%, #e8f5e9 75%)",
      backgroundSize: "200% 100%",
      animation: "skeleton-shimmer 1.5s infinite",
      ...style,
    }} />
  );
}

export function CardSkeleton() {
  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 18, display: "grid", gap: 10 }}>
      <SkeletonBlock width="60%" height={20} />
      <SkeletonBlock width="80%" height={14} />
      <SkeletonBlock width="40%" height={14} />
      <SkeletonBlock width="100%" height={32} style={{ marginTop: 8 }} />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {/* Header */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, paddingBottom: 8, borderBottom: "2px solid var(--line)" }}>
        {Array.from({ length: cols }, (_, i) => <SkeletonBlock key={i} height={14} width="70%" />)}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12, padding: "10px 0", borderBottom: "1px solid var(--line)" }}>
          {Array.from({ length: cols }, (_, c) => <SkeletonBlock key={c} height={12} width={`${50 + Math.random() * 40}%`} />)}
        </div>
      ))}
    </div>
  );
}

export function StatSkeleton({ count = 4 }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${count}, 1fr)`, gap: 10 }}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ border: "1px solid var(--line)", borderRadius: "var(--radius)", padding: 14, display: "grid", gap: 6, justifyItems: "center" }}>
          <SkeletonBlock width="50%" height={12} />
          <SkeletonBlock width="30%" height={22} />
        </div>
      ))}
    </div>
  );
}

export default function Loading({ type = "card", ...props }) {
  if (type === "table") return <TableSkeleton {...props} />;
  if (type === "stat") return <StatSkeleton {...props} />;
  return <CardSkeleton />;
}
