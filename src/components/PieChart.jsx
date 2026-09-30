import React from 'react';

export default function PieChart({ data = [], size = 120 }) {
  const total = data.reduce((s, d) => s + (d.value || 0), 0) || 1;
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  function polarToCartesian(cx, cy, r, deg) {
    const rad = (deg * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function contrastColor(hex) {
    if (!hex) return '#000';
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#000' : '#fff';
  }

  const parts = [];
  let acc = -90;
  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const portion = (d.value / total) * 360;
    const startAngle = acc;
    const endAngle = acc + portion;
    const startP = polarToCartesian(cx, cy, r, startAngle);
    const endP = polarToCartesian(cx, cy, r, endAngle);
    const large = portion > 180 ? 1 : 0;
    const pathData = `M ${cx} ${cy} L ${startP.x} ${startP.y} A ${r} ${r} 0 ${large} 1 ${endP.x} ${endP.y} Z`;
    parts.push({ d: pathData, color: d.color, label: d.label, mid: (startAngle + endAngle) / 2, percent: Math.round((d.value / total) * 100) });
    acc += portion;
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label="设备类型占比">
      {parts.map((p) => (
        <path key={p.label} d={p.d} fill={p.color} />
      ))}

      <g fontSize={10} fontWeight={700}>
        {parts.map((p) => {
          const pos = polarToCartesian(cx, cy, r * 0.65, p.mid);
          const fill = contrastColor(p.color);
          return (
            <text key={p.label} x={pos.x} y={pos.y} textAnchor="middle" dominantBaseline="middle" fill={fill}>
              {p.percent}%
            </text>
          );
        })}
      </g>
    </svg>
  );
}
