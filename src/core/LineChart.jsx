import React, { useMemo, useState } from "react";

const SERIES_CONFIG = {
  temperature: {
    label: "温度",
    unit: "℃",
    min: 0,
    max: 40,
    color: "#f59e0b",
    strokeWidth: 2.4,
    strokeDasharray: "",
  },
  humidity: {
    label: "空气湿度",
    unit: "%",
    min: 0,
    max: 100,
    color: "#2da9dc",
    strokeWidth: 2.2,
    strokeDasharray: "6 5",
  },
  soilMoisture: {
    label: "土壤湿度",
    unit: "%",
    min: 0,
    max: 100,
    color: "#35c36b",
    strokeWidth: 2.4,
    strokeDasharray: "",
  },
};

function normalizePoint(point = {}) {
  const value = Number(point.value ?? point.metricValue ?? point);
  if (!Number.isFinite(value) || value <= 0) return null;
  return {
    value,
    collectedAt: point.collectedAt || point.time || point.createdAt || "",
  };
}

function downSample(points = []) {
  if (points.length <= 7) return points;
  return Array.from({ length: 7 }, (_, index) => {
    const sourceIndex = Math.round((index * (points.length - 1)) / 6);
    return points[sourceIndex];
  });
}

function formatNumber(value) {
  return Number(value).toFixed(Number(value) % 1 === 0 ? 0 : 1);
}

function formatTimeLabel(value, fallback) {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(5, 10);
  return date.toLocaleDateString("zh-CN", { month: "2-digit", day: "2-digit" });
}

function normalizeSeries(series = []) {
  const result = {
    temperature: [],
    humidity: [],
    soilMoisture: [],
  };

  series.forEach((item) => {
    const key = item?.metricKey;
    if (!Object.prototype.hasOwnProperty.call(result, key)) return;
    const points = Array.isArray(item?.points) ? item.points : [];
    result[key] = downSample(points.map(normalizePoint).filter(Boolean));
  });

  return result;
}

export default function LineChart({ series = [], width = 620, height = 180 }) {
  const [tip, setTip] = useState(null);
  const data = useMemo(() => normalizeSeries(series), [series]);
  const pad = { top: 10, right: 6, bottom: 24, left: 24 };
  const w = Math.max(width - pad.left - pad.right, 1);
  const h = Math.max(height - pad.top - pad.bottom, 1);
  const hasData = data.temperature.length >= 2 || data.humidity.length >= 2 || data.soilMoisture.length >= 2;

  function toX(index, count = 7) {
    return pad.left + (index / Math.max(count - 1, 1)) * w;
  }

  function toY(value, config) {
    const normalized = Math.min(Math.max((value - config.min) / (config.max - config.min), 0), 1);
    return pad.top + h - normalized * h;
  }

  function buildPath(points, config) {
    return points
      .map((point, index) => `${index === 0 ? "M" : "L"}${toX(index, points.length).toFixed(1)},${toY(point.value, config).toFixed(1)}`)
      .join(" ");
  }

  function handleMouseMove(event, key, index, point, count) {
    const config = SERIES_CONFIG[key];
    const rect = event.currentTarget.closest("svg").getBoundingClientRect();
    setTip({
      x: event.clientX - rect.left + 8,
      y: event.clientY - rect.top - 10,
      label: config.label,
      value: `${formatNumber(point.value)}${config.unit}`,
      date: formatTimeLabel(point.collectedAt, index === 0 ? "7天前" : index === count - 1 ? "今天" : ""),
    });
  }

  return (
    <svg
      className="line-chart"
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      style={{ display: "block" }}
      role="img"
      aria-label="最近7天温度、空气湿度与土壤湿度趋势"
      onMouseLeave={() => setTip(null)}
    >
      {[0, 25, 50, 75, 100].map((value) => {
        const y = pad.top + h - (value / 100) * h;
        return (
          <g key={`grid-${value}`}>
            <line x1={pad.left} x2={pad.left + w} y1={y.toFixed(1)} y2={y.toFixed(1)} stroke="var(--line)" strokeWidth="0.5" />
            <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="var(--muted)">
              {value}
            </text>
          </g>
        );
      })}

      {Array.from({ length: 7 }, (_, index) => (
        <text
          key={`label-${index}`}
          x={pad.left + (index / 6) * w}
          y={height - 5}
          textAnchor="middle"
          fontSize="9"
          fill="var(--muted)"
        >
          {index === 0 ? "7天前" : index === 6 ? "今天" : ""}
        </text>
      ))}

      {Object.entries(SERIES_CONFIG).map(([key, config]) => {
        const points = data[key] || [];
        if (points.length < 2) return null;
        return (
          <g key={key}>
            <path
              d={buildPath(points, config)}
              fill="none"
              stroke={config.color}
              strokeWidth={config.strokeWidth}
              strokeDasharray={config.strokeDasharray}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {points.map((point, index) => (
              <g key={`${key}-${index}`}>
                <rect
                  x={toX(index, points.length) - 16}
                  y={pad.top}
                  width="32"
                  height={h}
                  fill="transparent"
                  style={{ cursor: "pointer" }}
                  onMouseMove={(event) => handleMouseMove(event, key, index, point, points.length)}
                />
                <circle
                  cx={toX(index, points.length).toFixed(1)}
                  cy={toY(point.value, config).toFixed(1)}
                  r="3.2"
                  fill="#fff"
                  stroke={config.color}
                  strokeWidth="2"
                  pointerEvents="none"
                />
              </g>
            ))}
          </g>
        );
      })}

      {!hasData ? (
        <text x={width / 2} y={height / 2} textAnchor="middle" fontSize="12" fontWeight="800" fill="var(--muted)">
          暂无趋势数据
        </text>
      ) : null}

      {tip ? (
        <g>
          <rect x={tip.x} y={tip.y - 26} width="96" height="32" rx="5" fill="rgba(22,49,40,0.88)" />
          <text x={tip.x + 7} y={tip.y - 11} fontSize="9" fontWeight="bold" fill="#fff">
            {tip.label}: {tip.value}
          </text>
          <text x={tip.x + 7} y={tip.y + 2} fontSize="8" fill="rgba(255,255,255,0.72)">
            {tip.date}
          </text>
        </g>
      ) : null}
    </svg>
  );
}
