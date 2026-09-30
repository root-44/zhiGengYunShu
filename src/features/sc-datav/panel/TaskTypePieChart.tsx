import { PieChart as ECPie, type PieSeriesOption } from "echarts/charts";
import Chart from "@/components/chart";
import type { ComposeOption } from "echarts/core";
import {
  TooltipComponent,
  LegendComponent,
  type TooltipComponentOption,
  type LegendComponentOption,
} from "echarts/components";

type PieOption = ComposeOption<
  PieSeriesOption | TooltipComponentOption | LegendComponentOption
>;

const COLORS = [
  "#68b87c",
  "#f0a050",
  "#5b9bd5",
  "#e07060",
  "#8b9e70",
  "#c0a060",
];

interface Props {
  data: { label: string; value: number }[];
}

export default function TaskTypePieChart({ data }: Props) {
  const total = data.reduce((sum, item) => sum + item.value, 0) || 1;

  return (
    <Chart<PieOption>
      use={[ECPie, TooltipComponent, LegendComponent]}
      option={{
        color: COLORS,
        tooltip: {
          trigger: "item",
          backgroundColor: "rgba(255,255,255,0.94)",
          borderColor: "rgba(104,184,124,0.22)",
          textStyle: { color: "#5a4a42", fontSize: 12 },
          formatter: (params: any) =>
            `${params.name}: ${params.value} 条 (${Math.round((params.value / total) * 100)}%)`,
        },
        legend: {
          orient: "vertical",
          right: "4%",
          top: "middle",
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 12,
          textStyle: {
            color: "#5a4a42",
            fontSize: 12,
          },
        },
        series: [
          {
            name: "任务类型",
            type: "pie",
            center: ["35%", "50%"],
            radius: ["52%", "78%"],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 6,
              borderColor: "#fff",
              borderWidth: 2,
            },
            label: {
              show: false,
            },
            emphasis: {
              label: {
                show: true,
                fontSize: 14,
                fontWeight: "bold",
              },
              scaleSize: 8,
            },
            data: data.map((item) => ({
              name: item.label,
              value: item.value,
            })),
          },
        ],
      }}
    />
  );
}
