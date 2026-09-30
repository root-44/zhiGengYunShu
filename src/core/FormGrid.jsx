import React from "react";
export default function FormGrid({ items }) {
  return (
    <div className="form-grid">
      {items.map((item) => <span key={item}>{item}</span>)}
    </div>
  );
}
