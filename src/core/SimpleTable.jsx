import React from "react";
export default function SimpleTable({ columns }) {
  return (
    <table className="data-table">
      <thead><tr>{columns.map((column) => <th key={column}>{column}</th>)}</tr></thead>
      <tbody>
        {[1, 2, 3].map((item) => (
          <tr key={item}>{columns.map((column) => <td key={column}>{column} {item}</td>)}</tr>
        ))}
      </tbody>
    </table>
  );
}
