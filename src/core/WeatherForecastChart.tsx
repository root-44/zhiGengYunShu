import { useMemo, useState } from "react";

// Weather forecast line chart — plots temperature (℃) and humidity (%) across
// the hourly forecast horizon. Self-contained: pure SVG (vector, so it stays
// crisp inside the sc-datav 综合大屏 `transform: scale(...)` canvas), an SVG
// hover tooltip positioned at the hovered point's viewBox coordinates (immune
// to the canvas scale), and only global CSS variables for theming.

export interface WeatherForecastPoint {
  label: string;
  temperature: number;
  humidity: number;
  condition: string;
}

interface WeatherForecastChartProps {
  points: WeatherForecastPoint[];
  width?: number;
  height?: number;
}

const SERIES = [
  {
    key: "temperature" as const,
    label: "温度",
    unit: "℃",
    min: 0,
    max: 40,
    color: "#f59e0b",
    strokeWidth: 2.2,
    dash: "",
  },
  {
    key: "humidity" as const,
    label: "湿度",
    unit: "%",
    min: 0,
    max: 100,
    color: "#2da9dc",
    strokeWidth: 2,
    dash: "6 5",
  },
];

function formatValue(value: number) {
  const n = Number(value);
  if (!Number.isFinite(n)) return "--";
  return n.toFixed(n % 1 === 0 ? 0 : 1);
}

export default function WeatherForecastChart({
  points,
  width = 420,
  height = 120,
}: WeatherForecastChartProps) {
  const [hover, setHover] = useState<number | null>(null);

  const data = useMemo(
    () =>
      (Array.isArray(points) ? points : [])
        .map((point) => ({
          label: point?.label || "",
          temperature: Number(point?.temperature),
          humidity: Number(point?.humidity),
          condition: point?.condition || "",
        }))
        .filter(
          (point) => Number.isFinite(point.temperature) && Number.isFinite(point.humidity)
        ),
    [points]
  );

  const pad = { top: 22, right: 12, bottom: 22, left: 30 };
  const w = Math.max(width - pad.left - pad.right, 1);
  const h = Math.max(height - pad.top - pad.bottom, 1);
  const hasData = data.length >= 2;

  const toX = (i: number) =>
    data.length <= 1 ? pad.left + w / 2 : pad.left + (i / (data.length - 1)) * w;
  const toY = (value: number, config: { min: number; max: number }) => {
    const normalized = Math.min(
      Math.max((value - config.min) / (config.max - config.min), 0),
      1
    );
    return pad.top + h - normalized * h;
  };
  const buildPath = (config: (typeof SERIES)[number]) =>
    data
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${toX(index).toFixed(1)},${toY(
            point[config.key],
            config
          ).toFixed(1)}`
      )
      .join(" ");

  const labelStep = data.length > 7 ? 2 : 1;
  const bandHalf = data.length > 1 ? w / (data.length - 1) / 2 : w / 2;

  const tipW = 122;
  const tipH = 42;
  const hoverPoint = hover != null ? data[hover] : null;
  const tipX =
    hover != null
      ? Math.max(pad.left, Math.min(toX(hover) - tipW / 2, width - pad.right - tipW))
      : 0;
  const tempY = hoverPoint ? toY(hoverPoint.temperature, SERIES[0]) : 0;
  const humY = hoverPoint ? toY(hoverPoint.humidity, SERIES[1]) : 0;
  const tipY = hoverPoint ? Math.max(Math.min(tempY, humY) - 8 - tipH, pad.top) : 0;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      width="100%"
      height={height}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block" }}
      role="img"
      aria-label="逐时温度与湿度预报趋势"
      onMouseLeave={() => setHover(null)}
    >
      {/* legend */}
      <g>
        <line
          x1={width - 116}
          y1={12}
          x2={width - 100}
          y2={12}
          stroke={SERIES[0].color}
          strokeWidth={SERIES[0].strokeWidth}
        />
        <text x={width - 96} y={15} fontSize="10" fill="var(--muted)">
          {SERIES[0].label}
        </text>
        <line
          x1={width - 64}
          y1={12}
          x2={width - 48}
          y2={12}
          stroke={SERIES[1].color}
          strokeWidth={SERIES[1].strokeWidth}
          strokeDasharray={SERIES[1].dash}
        />
        <text x={width - 44} y={15} fontSize="10" fill="var(--muted)">
          {SERIES[1].label}
        </text>
      </g>

      {/* grid */}
      {[0, 25, 50, 75, 100].map((value) => {
        const y = pad.top + h - (value / 100) * h;
        return (
          <g key={`grid-${value}`}>
            <line
              x1={pad.left}
              x2={pad.left + w}
              y1={y}
              y2={y}
              stroke="var(--line)"
              strokeWidth="0.5"
            />
            <text x={pad.left - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--muted)">
              {value}
            </text>
          </g>
        );
      })}

      {/* x-axis labels */}
      {data.map((point, index) => {
        if (index % labelStep !== 0 && index !== data.length - 1) return null;
        return (
          <text
            key={`xlabel-${index}`}
            x={toX(index)}
            y={height - 6}
            textAnchor="middle"
            fontSize="9"
            fill="var(--muted)"
          >
            {point.label}
          </text>
        );
      })}

      {/* series lines + markers */}
      {hasData &&
        SERIES.map((config) => (
          <g key={config.key}>
            <path
              d={buildPath(config)}
              fill="none"
              stroke={config.color}
              strokeWidth={config.strokeWidth}
              strokeDasharray={config.dash}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {data.map((point, index) => (
              <circle
                key={`${config.key}-${index}`}
                cx={toX(index).toFixed(1)}
                cy={toY(point[config.key], config).toFixed(1)}
                r="2.6"
                fill="#fff"
                stroke={config.color}
                strokeWidth="1.8"
                pointerEvents="none"
              />
            ))}
          </g>
        ))}

      {/* hover hit areas */}
      {hasData &&
        data.map((point, index) => (
          <rect
            key={`hit-${index}`}
            x={toX(index) - bandHalf}
            y={pad.top}
            width={bandHalf * 2}
            height={h}
            fill="transparent"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHover(index)}
            onMouseMove={() => setHover(index)}
          />
        ))}

      {/* tooltip (SVG, positioned at the hovered point — scale-immune) */}
      {hasData && hoverPoint && (
        <g pointerEvents="none">
          <rect x={tipX} y={tipY} width={tipW} height={tipH} rx="5" fill="rgba(22,49,40,0.92)" />
          <text x={tipX + 8} y={tipY + 13} fontSize="9" fontWeight="bold" fill="#bfe9c8">
            {hoverPoint.label || "预报"}
          </text>
          <text x={tipX + 8} y={tipY + 25} fontSize="9" fill="#fff">
            <tspan>温度 </tspan>
            <tspan fill={SERIES[0].color} fontWeight="bold">
              {formatValue(hoverPoint.temperature)}℃
            </tspan>
            <tspan> · 湿度 </tspan>
            <tspan fill={SERIES[1].color} fontWeight="bold">
              {formatValue(hoverPoint.humidity)}%
            </tspan>
          </text>
          {hoverPoint.condition && (
            <text x={tipX + 8} y={tipY + 36} fontSize="8" fill="rgba(255,255,255,0.82)">
              {hoverPoint.condition}
            </text>
          )}
        </g>
      )}

      {!hasData && (
        <text
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
          fontSize="12"
          fontWeight="800"
          fill="var(--muted)"
        >
          暂无天气预报数据
        </text>
      )}
    </svg>
  );
}
