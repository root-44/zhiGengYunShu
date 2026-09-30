import React from "react";
export default function Checklist({ items, numbered = false }) {
  return (
    <div className="check-list">
      {items.map((item, index) => (
        <span key={item}><b>{numbered ? index + 1 : "•"}</b>{item}</span>
      ))}
    </div>
  );
}
