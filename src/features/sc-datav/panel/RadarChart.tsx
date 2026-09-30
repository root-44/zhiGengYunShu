import { RadarChart as ECRadar, type RadarSeriesOption } from "echarts/charts";
import Chart from "@/components/chart";
import type { ComposeOption } from "echarts/core";
import {
  TooltipComponent,
  LegendComponent,
  type TooltipComponentOption,
  type LegendComponentOption,
} from "echarts/components";

type RadarOption = ComposeOption<
  RadarSeriesOption | TooltipComponentOption | LegendComponentOption
>;

const FILL_COLOR = "rgba(255, 140, 80, 0.32)";
const STROKE_COLOR = "#e8874a";
const AXIS_COLOR = "rgba(104, 184, 124, 0.42)";
const SPLIT_COLOR = "rgba(104, 184, 124, 0.14)";
const LABEL_COLOR = "#5a4a42";

interface Props {
  data: { label: string; value: number }[];
  style?: React.CSSProperties;
}

export default function RiskRadarChart({ data, style }: Props) {
  const indicators = data.map((item) => ({
    name: item.label,
    max: Math.max(...data.map((d) => d.value), 1) * 1.4,
  }));

  const seriesData = data.map((item) => item.value);

  return (
    <Chart<RadarOption>
      use={[ECRadar, TooltipComponent, LegendComponent]}
      style={style}
      option={{
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(255,255,255,0.94)",
          borderColor: "rgba(104,184,124,0.22)",
          textStyle: { color: "#5a4a42", fontSize: 12 },
        },
        radar: {
          center: ["50%", "52%"],
          radius: "68%",
          indicator: indicators,
          axisName: {
            color: LABEL_COLOR,
            fontSize: 12,
            fontWeight: 600,
          },
          axisLine: {
            lineStyle: { color: AXIS_COLOR, width: 1 },
          },
          splitLine: {
            lineStyle: { color: SPLIT_COLOR, width: 1 },
          },
          splitArea: {
            areaStyle: {
              color: [
                "rgba(104,184,124,0.04)",
                "rgba(104,184,124,0.01)",
              ],
            },
          },
        },
        series: [
          {
            name: "风险指标",
            type: "radar",
            data: [
              {
                value: seriesData,
                name: "当前风险",
                areaStyle: { color: FILL_COLOR },
                lineStyle: { color: STROKE_COLOR, width: 2 },
                itemStyle: { color: STROKE_COLOR },
                symbol: "circle",
                symbolSize: 6,
              },
            ],
          },
        ],
      }}
    />
  );
}
