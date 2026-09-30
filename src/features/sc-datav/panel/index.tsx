import { useEffect, useLayoutEffect, useRef, useState } from "react";
import styled from "styled-components";
import useMoveTo from "@/hooks/useMoveTo";
import { useConfigStore } from "../stores";
import {
  displayStatus,
  displayTaskType,
  type ChartPoint,
  type FarmAssetOverview,
  type FarmOverview,
  type MetricCard,
} from "../api";

import Headder from "./headder";
import Footer from "./footer";
import WeatherForecastChart from "@/core/WeatherForecastChart";
import RiskRadarChart from "./RadarChart";
import TaskTypePieChart from "./TaskTypePieChart";

const DESIGN_W = 1920;
const DESIGN_H = 929;

const GridWrapper = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  grid-template-rows: repeat(6, minmax(0, 1fr));
  gap: 20px;
  padding: 20px;
`;

const Card = styled.div`
  position: relative;
  background: rgba(248, 252, 248, 0.94);
  border: 1px solid rgba(104, 184, 124, 0.22);
  padding: 15px;
  backdrop-filter: blur(4px);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  z-index: 9999;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: -1px;
    left: -1px;
    width: 10px;
    height: 10px;
    border-top: 2px solid #68b87c;
    border-left: 2px solid #68b87c;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  &::after {
    content: "";
    position: absolute;
    bottom: -1px;
    right: -1px;
    width: 10px;
    height: 10px;
    border-bottom: 2px solid #68b87c;
    border-right: 2px solid #68b87c;
    transition: all 0.3s ease;
    pointer-events: none;
  }

  &:hover::before,
  &:hover::after {
    width: 100%;
    height: 100%;
    opacity: 0.5;
  }
`;

const CardTitle = styled.div`
  font-size: 18px;
  margin-bottom: 10px;
  padding-left: 10px;
  border-left: 4px solid #68b87c;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #3b7f50;

  span {
    font-size: 10px;
    color: rgba(59, 127, 80, 0.52);
    font-weight: normal;
    letter-spacing: 0;
  }
`;

const SummaryStrip = styled.div`
  grid-area: 1 / 2 / 2 / 4;
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  align-items: stretch;
  gap: 14px;
  pointer-events: auto;
  z-index: 9999;
`;

const CARD_TONES: Record<string, { accent: string; bg: string; bar: string; glow: string }> = {
  asset:     { accent: "#68b87c", bg: "rgba(104,184,124,0.06)", bar: "linear-gradient(90deg, #68b87c, #a3d8ae)", glow: "rgba(104,184,124,0.22)" },
  greenhouse:{ accent: "#4da86c", bg: "rgba(77,168,108,0.05)",  bar: "linear-gradient(90deg, #4da86c, #8dd4a0)", glow: "rgba(77,168,108,0.20)" },
  plot:      { accent: "#5b9e6f", bg: "rgba(91,158,111,0.05)",  bar: "linear-gradient(90deg, #5b9e6f, #9ccca8)", glow: "rgba(91,158,111,0.18)" },
  task:      { accent: "#e0a040", bg: "rgba(224,160,64,0.06)",  bar: "linear-gradient(90deg, #e0a040, #f0c878)", glow: "rgba(224,160,64,0.22)" },
  alert:     { accent: "#e07050", bg: "rgba(224,112,80,0.06)",  bar: "linear-gradient(90deg, #e07050, #f0a090)", glow: "rgba(224,112,80,0.20)" },
};

const SummaryItem = styled.div<{ $tone: string }>`
  position: relative;
  border: 1px solid ${(p) => `${CARD_TONES[p.$tone]?.accent || "#68b87c"}33`};
  border-radius: 6px;
  background: ${(p) => CARD_TONES[p.$tone]?.bg || "rgba(104,184,124,0.06)"};
  box-shadow: 0 8px 22px ${(p) => CARD_TONES[p.$tone]?.glow || "rgba(104,184,124,0.12)"};
  padding: 14px 16px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  overflow: hidden;

  /* ── top‑left accent dot ── */
  &::before {
    content: "";
    position: absolute;
    top: 10px;
    left: 10px;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${(p) => CARD_TONES[p.$tone]?.accent || "#68b87c"};
    box-shadow: 0 0 8px ${(p) => CARD_TONES[p.$tone]?.glow || "rgba(104,184,124,0.3)"};
  }

  /* ── bottom accent bar ── */
  &::after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 12px;
    right: 12px;
    height: 3px;
    border-radius: 3px 3px 0 0;
    background: ${(p) => CARD_TONES[p.$tone]?.bar || "linear-gradient(90deg, #68b87c, #a3d8ae)"};
    opacity: 0.55;
  }
`;

const SummaryNumber = styled.strong<{ $tone: string }>`
  display: block;
  padding-left: 14px;
  color: ${(p) => CARD_TONES[p.$tone]?.accent || "#3b7f50"};
  font-size: 38px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
`;

const SummaryLabel = styled.span<{ $tone: string }>`
  display: block;
  margin-top: 4px;
  padding-left: 14px;
  color: ${(p) => CARD_TONES[p.$tone]?.accent || "rgba(59,127,80,0.72)"};
  font-size: 13px;
  font-weight: 600;
  opacity: 0.8;
  letter-spacing: 0.03em;
`;

const BarList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
  overflow: hidden;
`;

const BarRow = styled.div`
  display: grid;
  grid-template-columns: 98px minmax(0, 1fr) 46px;
  align-items: center;
  gap: 10px;
  color: #5a4a42;
  font-size: 13px;

  span:first-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: #2f9d57;
    text-align: right;
  }
`;

const BarTrack = styled.div`
  height: 9px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(104, 184, 124, 0.12);
`;

const BarFill = styled.div<{ $ratio: number; $tone?: string }>`
  height: 100%;
  width: ${(props) => Math.max(5, Math.min(100, props.$ratio * 100))}%;
  border-radius: inherit;
  background: ${(props) =>
    props.$tone === "green"
      ? "linear-gradient(90deg, #68b87c, #c5e8cb)"
      : props.$tone === "red"
      ? "linear-gradient(90deg, #7bc48d, #d7efdd)"
      : "linear-gradient(90deg, #68b87c, #bfe8c9)"};
  box-shadow: 0 0 16px rgba(104, 184, 124, 0.14);
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
`;

const MetricBox = styled.div`
  border: 1px solid rgba(104, 184, 124, 0.16);
  background: rgba(255, 255, 255, 0.64);
  border-radius: 4px;
  padding: 12px;
  min-width: 0;

  strong {
    display: block;
    color: #3b7f50;
    font-size: 24px;
  }

  span {
    display: block;
    margin-top: 4px;
    color: rgba(59, 127, 80, 0.72);
    font-size: 12px;
  }
`;

const HoverShell = styled.div`
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 12px;
  min-height: 0;
`;

const AssetHead = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 10px;
  align-items: start;

  strong {
    display: block;
    color: #315d3f;
    font-size: 22px;
  }

  span {
    display: block;
    margin-top: 4px;
    color: rgba(59, 127, 80, 0.72);
    font-size: 13px;
  }
`;

const StatusPill = styled.div<{ $tone?: string }>`
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  color: ${(props) => (props.$tone === "warning" ? "#8a5b12" : "#2f6f47")};
  border: 1px solid ${(props) => (props.$tone === "warning" ? "rgba(104, 184, 124, 0.28)" : "rgba(104, 184, 124, 0.22)")};
  background: ${(props) => (props.$tone === "warning" ? "rgba(246, 251, 241, 0.96)" : "rgba(226, 243, 229, 0.7)")};
`;

const GaugeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
`;

const Gauge = styled.div`
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(104, 184, 124, 0.14);
  padding: 9px;
  min-width: 0;

  strong {
    display: block;
    color: #3b7f50;
    font-size: 20px;
  }

  span {
    display: block;
    color: rgba(59, 127, 80, 0.66);
    font-size: 11px;
    margin-top: 2px;
  }
`;

const DetectionBox = styled.div`
  margin-top: 10px;
  border-radius: 4px;
  border: 1px solid rgba(104, 184, 124, 0.16);
  background: rgba(255, 255, 255, 0.62);
  padding: 10px;

  p {
    margin: 0;
    color: rgba(59, 127, 80, 0.76);
    font-size: 12px;
    line-height: 1.55;
  }
`;

const EmptyHover = styled.div`
  margin: auto;
  width: 100%;
  color: rgba(36, 83, 59, 0.68);
  font-size: 15px;
  text-align: center;
  line-height: 1.8;
`;

const LoadingText = styled.div`
  position: absolute;
  top: 92px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10000;
  color: rgba(59, 127, 80, 0.72);
  background: rgba(247, 252, 248, 0.94);
  border: 1px solid rgba(104, 184, 124, 0.18);
  border-radius: 4px;
  padding: 6px 12px;
  font-size: 12px;
`;

function fmt(value: number | null | undefined, unit = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  const next = Number(value);
  return `${next.toFixed(next % 1 === 0 ? 0 : 1)}${unit}`;
}

function totalValue(items: ChartPoint[] = []) {
  return items.reduce((total, item) => total + Number(item.value || 0), 0) || 1;
}

function BarChartList({ items, tone }: { items: ChartPoint[]; tone?: string }) {
  const total = totalValue(items);
  return (
    <BarList>
      {items.slice(0, 6).map((item) => (
        <BarRow key={`${item.label}-${item.type || ""}`}>
          <span>{item.label}</span>
          <BarTrack><BarFill $ratio={Number(item.value || 0) / total} $tone={tone} /></BarTrack>
          <strong>{item.value}</strong>
        </BarRow>
      ))}
    </BarList>
  );
}

function EnvironmentMetrics({ items }: { items: MetricCard[] }) {
  return (
    <MetricGrid>
      {items.slice(0, 3).map((item) => (
        <MetricBox key={item.label}>
          <strong>{fmt(item.value, item.unit === "C" ? "℃" : item.unit)}</strong>
          <span>{item.label}</span>
        </MetricBox>
      ))}
    </MetricGrid>
  );
}

function WeatherForecastPanel({ weather }: { weather: FarmOverview["permanentCharts"]["weather"] }) {
  // Forecast points feed the line chart (temperature + humidity across the
  // horizon). Prefer the hourly forecast; fall back to daily when the backend
  // has no hourly rows. Data comes straight from the /admin/dashboard/
  // farm-overview API via overview.permanentCharts.weather.
  const source = weather?.hourlyForecast?.length ? weather.hourlyForecast : weather?.dailyForecast || [];
  const points = source
    .map((item) => ({
      label: item?.label || "预报",
      temperature: Number(item?.temperatureCelsius),
      humidity: Number(item?.humidityPercent),
      condition: item?.condition || "",
    }))
    .filter((item) => Number.isFinite(item.temperature) && Number.isFinite(item.humidity));

  const rain = weather?.rainProbability == null ? "--" : `${weather.rainProbability}%`;
  const wind = weather?.wind || "--";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1, minHeight: 0 }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <strong style={{ color: "#3b7f50", fontSize: 14, lineHeight: 1.2 }}>{weather?.summary || "--"}</strong>
        <span style={{ color: "rgba(59,127,80,0.7)", fontSize: 11, lineHeight: 1.3 }}>
          {weather?.location || "--"} · 降雨 {rain} · {wind}
        </span>
      </div>
      <div style={{ height: 120, width: "100%" }}>
        <WeatherForecastChart points={points} height={120} />
      </div>
      <p style={{ margin: 0, fontSize: 11, color: "rgba(59,127,80,0.72)", lineHeight: 1.5 }}>{weather?.tip || "--"}</p>
    </div>
  );
}

function TaskTypeChart({ items }: { items: ChartPoint[] }) {
  const normalized = items.map((item) => ({ ...item, label: displayTaskType(item.type || item.label) }));
  return <TaskTypePieChart data={normalized} />;
}

function HoverAssetChart({ asset }: { asset: FarmAssetOverview | null }) {
  if (!asset) {
    return (
      <EmptyHover>
        悬浮到任一地块或大棚
        <br />
        查看该区域的环境、任务、病害与生长检测图表
      </EmptyHover>
    );
  }
  const warning = asset.status === "warning" || asset.openAlertCount > 0;
  const growth = asset.latestGrowthDetection;
  const disease = asset.latestDisease;
  const diseaseConfidence = disease?.confidence == null ? "--" : `${Math.round(Number(disease.confidence) * 100)}%`;

  return (
    <HoverShell>
      <AssetHead>
        <div>
          <strong>{asset.name}</strong>
          <span>{asset.crop} / {asset.growthStage} / {asset.areaMu ? `${asset.areaMu}亩` : "面积未录入"}</span>
        </div>
        <StatusPill $tone={warning ? "warning" : "active"}>{displayStatus(asset.status)}</StatusPill>
      </AssetHead>
      <GaugeGrid>
        <Gauge><strong>{fmt(asset.metrics.temperature, "℃")}</strong><span>空气温度</span></Gauge>
        <Gauge><strong>{fmt(asset.metrics.humidity, "%")}</strong><span>空气湿度</span></Gauge>
        <Gauge><strong>{fmt(asset.metrics.soilMoisture, "%")}</strong><span>土壤湿度</span></Gauge>
      </GaugeGrid>
      <div>
        <BarChartList items={asset.taskTypeChart.map((item) => ({ ...item, label: displayTaskType(item.type || item.label) }))} />
        <DetectionBox>
          <p>告警 {asset.openAlertCount} 条，待处理任务 {asset.activeTaskCount} 条。</p>
          <p>
            生长检测：{growth ? `${displayStatus(growth.decisionStatus || "")}，视觉 ${growth.modelStage || "--"} / 日历 ${growth.calendarStage || "--"}` : "暂无自动检测记录"}。
          </p>
          <p>
            病害检测：{disease ? `${disease.result || "--"}，置信度 ${diseaseConfidence}` : "暂无病害风险记录"}。
          </p>
        </DetectionBox>
      </div>
    </HoverShell>
  );
}

interface ContentProps {
  overview: FarmOverview;
  activeAsset: FarmAssetOverview | null;
  loading?: boolean;
  loadError?: string;
}

export default function Content({ overview, activeAsset, loading = false, loadError = "" }: ContentProps) {
  const scaleRef = useRef<HTMLDivElement | null>(null);
  const [scale, setScale] = useState(1);

  useLayoutEffect(() => {
    const el = scaleRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width > 0 && height > 0) {
        const s = Math.min(width / DESIGN_W, height / DESIGN_H);
        setScale(s);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useLayoutEffect(() => {
    const el = scaleRef.current;
    if (!el) return;
    const { clientWidth, clientHeight } = el;
    if (clientWidth > 0 && clientHeight > 0) {
      setScale(Math.min(clientWidth / DESIGN_W, clientHeight / DESIGN_H));
    }
  }, []);

  const topBox = useMoveTo("toBottom", 0.6);
  const leftBox = useMoveTo("toRight", 0.8, 0.5);
  const leftBox1 = useMoveTo("toRight", 0.8, 0.6);
  const leftBox2 = useMoveTo("toRight", 0.8, 0.7);
  const rightBox = useMoveTo("toLeft", 0.8, 0.5);
  const rightBox1 = useMoveTo("toLeft", 0.8, 0.6);
  const rightBox2 = useMoveTo("toLeft", 0.8, 0.7);
  const bottomBox = useMoveTo("toTop", 0.8, 0.5);

  useEffect(() => {
    const unMapPlaySub = useConfigStore.subscribe(
      (s) => s.mapPlayComplete,
      (v) => {
        if (v) {
          topBox.restart();
          bottomBox.restart();
          leftBox.restart();
          leftBox1.restart();
          leftBox2.restart();
          rightBox.restart();
          rightBox1.restart();
          rightBox2.restart();
        }
      }
    );

    const unModeSub = useConfigStore.subscribe(
      (s) => s.mode,
      (v) => {
        if (v) {
          topBox.restart();
          leftBox.restart();
          leftBox1.restart();
          leftBox2.restart();
          rightBox.restart();
          rightBox1.restart();
          rightBox2.restart();
        } else {
          topBox.reverse();
          leftBox.reverse();
          leftBox1.reverse();
          leftBox2.reverse();
          rightBox.reverse();
          rightBox1.reverse();
          rightBox2.reverse();
        }
      }
    );

    return () => {
      unMapPlaySub();
      unModeSub();
    };
  }, []);

  const summaryItems = [
    ["资产总数", overview.summary.assetCount, "asset"],
    ["大棚", overview.summary.greenhouseCount, "greenhouse"],
    ["地块", overview.summary.plotCount, "plot"],
    ["待处理任务", overview.summary.activeTaskCount, "task"],
    ["告警", overview.summary.openAlertCount, "alert"],
  ] as const;

  return (
    <div
      ref={scaleRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 100,
      }}
    >
      {(loading || loadError) && (
        <LoadingText>{loading ? "正在同步农场数据库..." : "后端暂不可用，已显示演示数据"}</LoadingText>
      )}
      <div
        style={{
          width: DESIGN_W,
          height: DESIGN_H,
          transform: "scale(" + scale + ")",
          transformOrigin: "0 0",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Headder ref={topBox.ref} farmName={overview.farmName} region={overview.region} />
        <GridWrapper>
          <SummaryStrip>
            {summaryItems.map(([label, value, tone]) => (
              <SummaryItem key={label} $tone={tone}>
                <SummaryNumber $tone={tone}>{value}</SummaryNumber>
                <SummaryLabel $tone={tone}>{label}</SummaryLabel>
              </SummaryItem>
            ))}
          </SummaryStrip>
          <Card ref={leftBox.ref} style={{ gridArea: "1 / 1 / 3 / 2" }}>
            <CardTitle>生长状态分布<span>GROWTH STAGES</span></CardTitle>
            <BarChartList items={overview.permanentCharts.growthStages} tone="green" />
          </Card>
          <Card ref={leftBox1.ref} style={{ gridArea: "3 / 1 / 5 / 2" }}>
            <CardTitle>天气预报<span>WEATHER FORECAST</span></CardTitle>
            <WeatherForecastPanel weather={overview.permanentCharts.weather} />
          </Card>
          <Card ref={leftBox2.ref} style={{ gridArea: "5 / 1 / 7 / 2" }}>
            <CardTitle>四类任务结构<span>TASK AUTOMATION</span></CardTitle>
            <TaskTypeChart items={overview.permanentCharts.taskTypes} />
          </Card>
          <Card ref={rightBox.ref} style={{ gridArea: "1 / 4 / 4 / 5" }}>
            <CardTitle>悬浮区域图表<span>HOVER ASSET CHARTS</span></CardTitle>
            <HoverAssetChart asset={activeAsset} />
          </Card>
          <Card ref={rightBox1.ref} style={{ gridArea: "4 / 4 / 5 / 5" }}>
            <CardTitle>作物结构<span>CROP MIX</span></CardTitle>
            <BarChartList items={overview.permanentCharts.cropTypes} tone="green" />
          </Card>
          <Card ref={rightBox2.ref} style={{ gridArea: "5 / 4 / 7 / 5" }}>
            <CardTitle>风险雷达<span>RISK OVERVIEW</span></CardTitle>
            <RiskRadarChart data={overview.permanentCharts.riskOverview} />
          </Card>
        </GridWrapper>
        <Footer ref={bottomBox.ref} />
      </div>
    </div>
  );
}
