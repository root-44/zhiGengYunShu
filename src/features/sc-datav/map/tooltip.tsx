import { Html } from "@react-three/drei";
import { useImperativeHandle, useState, type Ref } from "react";
import styled from "styled-components";
import { displayStatus } from "../api";
import type { FarmMapRegion } from "../farmMapAdapter";

const TooltipBox = styled.div`
  background: rgba(255, 245, 232, 0.7);
  backdrop-filter: blur(10px);
  border-radius: 8px;
  padding: 12px 16px;
  color: #656565;
  font-size: 12px;
  pointer-events: none;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  min-width: 120px;
`;

const AssetName = styled.div`
  font-weight: bold;
  margin-bottom: 8px;
  color: #ea580c;
`;

const DataItem = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;

  &:last-child {
    margin-bottom: 0;
  }
`;

interface TooltipProps {
  ref?: Ref<{ open: () => void; close: () => void }>;
  data: FarmMapRegion;
  position: [number, number, number];
  visible: boolean;
}

function fmt(value: number | null | undefined, unit = "") {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return "--";
  const next = Number(value);
  return `${next.toFixed(next % 1 === 0 ? 0 : 1)}${unit}`;
}

export default function Tooltip(props: TooltipProps) {
  const { ref, data, position } = props;
  const [visible, setVisible] = useState(false);
  const { asset } = data;
  const growth = asset.latestGrowthDetection;
  const disease = asset.latestDisease;

  useImperativeHandle(ref, () => ({
    open: () => setVisible(true),
    close: () => setVisible(false),
  }));

  return (
    visible && (
      <Html
        center
        position={position}
        distanceFactor={100}
        zIndexRange={[1001 - 1500]}
        style={{ pointerEvents: "none" }}>
        <TooltipBox>
          <AssetName>{data.label}</AssetName>
          <DataItem>
            <span>作物</span>
            <span>{data.cropLabel}</span>
          </DataItem>
          <DataItem>
            <span>生长状态</span>
            <span>{data.stageLabel}</span>
          </DataItem>
          <DataItem>
            <span>温度/湿度</span>
            <span>{fmt(asset.metrics.temperature, "℃")} / {fmt(asset.metrics.humidity, "%")}</span>
          </DataItem>
          <DataItem>
            <span>土壤湿度</span>
            <span>{fmt(asset.metrics.soilMoisture, "%")}</span>
          </DataItem>
          <DataItem>
            <span>任务/告警</span>
            <span>{asset.activeTaskCount} / {asset.openAlertCount}</span>
          </DataItem>
          <DataItem>
            <span>生长检测</span>
            <span>{growth ? displayStatus(growth.decisionStatus || "") : "暂无"}</span>
          </DataItem>
          <DataItem>
            <span>病害检测</span>
            <span>{disease?.result || "暂无"}</span>
          </DataItem>
        </TooltipBox>
      </Html>
    )
  );
}
