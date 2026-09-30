import React from "react";
export default function MiniPanel({ title, value }) {
  return (
    <article className="mini-panel">
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}
