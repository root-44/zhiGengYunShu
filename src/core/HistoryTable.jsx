import React from "react";

export default function HistoryTable({ rows, onAction }) {
  const raw = Array.isArray(rows) ? rows : [];
  const data = raw.map((row) =>
    Array.isArray(row)
      ? { time: row[0], crop: row[1], image: row[2], result: row[3], advice: row[4], action: row[5] }
      : row
  );
  return (
    <table className="data-table">
      <thead>
        <tr>{["时间", "作物", "图片", "识别结果", "建议", "操作"].map((column) => <th key={column}>{column}</th>)}</tr>
      </thead>
      <tbody>
        {data.length === 0 ? (
          <tr>
            <td colSpan="6">暂无识别历史</td>
          </tr>
        ) : data.map((row, i) => (
          <tr key={i}>
            {["time", "crop", "image", "result", "advice"].map((key) => (
              <td key={key}>{row[key]}</td>
            ))}
            <td>
              {onAction ? (
                <button
                  type="button"
                  className="history-action-btn"
                  onClick={() => onAction(i, row.action || row.advice)}
                >
                  {row.action || row.advice}
                </button>
              ) : (
                row.action || row.advice
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
