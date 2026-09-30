import React from "react";
export default function Panel({ title, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
