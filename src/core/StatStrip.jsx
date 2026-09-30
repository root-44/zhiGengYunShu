import React from "react";
export default function StatStrip({ stats }) {
  return (
    <section className="stat-strip">
      {stats.map(([label, value, note]) => (
        <article key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
          <small>{note}</small>
        </article>
      ))}
    </section>
  );
}
