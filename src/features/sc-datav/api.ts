import { getAdminFarmOverview, getFarmerDashboard } from "@/services/api";

export type FarmMetricValue = number | null;

export interface ChartPoint {
  label: string;
  value: number;
  type?: string;
}

export interface MetricCard {
  label: string;
  value: FarmMetricValue;
  unit: string;
}

export interface WeatherForecastItem {
  label: string;
  temperatureCelsius: number;
  humidityPercent: number;
  condition: string;
}

export interface WeatherForecast {
  location: string;
  summary: string;
  temperatureCelsius: number;
  humidityPercent: number;
  rainProbability: number;
  wind: string;
  soilMoisture?: FarmMetricValue;
  tip: string;
  source?: string;
  updatedAt?: string;
  hourlyForecast: WeatherForecastItem[];
  dailyForecast: WeatherForecastItem[];
}

export interface FarmAssetOverview {
  id: string;
  name: string;
  type: "greenhouse" | "plot";
  crop: string;
  growthStage: string;
  status: string;
  areaMu: FarmMetricValue;
  position: { x: number; y: number; z: number };
  size: { width: number; height: number; length: number };
  metrics: {
    temperature: FarmMetricValue;
    humidity: FarmMetricValue;
    soilMoisture: FarmMetricValue;
  };
  openAlertCount: number;
  activeTaskCount: number;
  taskStatusChart: ChartPoint[];
  taskTypeChart: ChartPoint[];
  latestGrowthDetection?: {
    modelStage?: string;
    modelConfidence?: FarmMetricValue;
    calendarStage?: string;
    decisionStage?: string;
    decisionStatus?: string;
    imageUrl?: string;
  } | null;
  latestDisease?: {
    result?: string;
    confidence?: FarmMetricValue;
    status?: string;
  } | null;
}

export interface FarmOverview {
  farmId: string;
  farmName: string;
  region: string;
  updatedAt?: string;
  mapFallbackEnabled?: boolean;
  mapAssets?: FarmAssetOverview[];
  interactiveMapAssetIds?: string[];
  summary: {
    assetCount: number;
    greenhouseCount: number;
    plotCount: number;
    openAlertCount: number;
    activeTaskCount: number;
    averageTemperature: FarmMetricValue;
    averageHumidity: FarmMetricValue;
    averageSoilMoisture: FarmMetricValue;
  };
  assets: FarmAssetOverview[];
  permanentCharts: {
    growthStages: ChartPoint[];
    cropTypes: ChartPoint[];
    taskTypes: ChartPoint[];
    taskStatuses: ChartPoint[];
    environment: MetricCard[];
    riskOverview: ChartPoint[];
    weather: WeatherForecast;
  };
}

interface FarmerWorkbench {
  farm?: {
    id?: string;
    name?: string;
    region?: string;
    address?: string;
  };
  profile?: {
    userId?: string;
    displayName?: string;
  };
  stats?: {
    assignedAssetCount?: number;
    warningAssetCount?: number;
    activeTaskCount?: number;
    urgentTaskCount?: number;
  };
  weather?: any;
  todayTasks?: any[];
  attentionAssets?: any[];
  latestAlerts?: any[];
  recentDiagnoses?: any[];
  farmMap?: {
    assets?: any[];
  };
}

const taskLabels: Record<string, string> = {
  irrigation: "灌溉任务",
  inspection: "环境巡检",
  growth_anomaly: "生长异常",
  disease_detection: "病害检测",
};

const statusLabels: Record<string, string> = {
  active: "正常",
  normal: "正常",
  warning: "需关注",
  offline: "离线",
  pending: "待处理",
  accepted: "已接收",
  submitted: "已提交",
  done: "已完成",
  mismatch: "异常",
  matched: "一致",
};

const stageLabels: Record<string, string> = {
  Green: "草莓绿果期",
  White: "草莓白果期",
  Turning: "草莓转色期",
  "Early-Turning": "草莓初转色",
  "Late-Turning": "草莓后转色",
  Red: "草莓红熟期",
  stage_1: "小麦出苗期",
  stage_2: "小麦分蘖期",
  stage_3: "小麦拔节期",
  stage_4: "小麦孕穗期",
  stage_5: "小麦抽穗期",
  stage_6: "小麦灌浆期",
  stage_7: "小麦成熟期",
};

const cropLabels: Record<string, string> = {
  strawberry: "草莓",
  wheat: "小麦",
  草莓: "草莓",
  小麦: "小麦",
};

function numberValue(value: unknown, fallback = 0): number {
  const next = Number(value ?? fallback);
  return Number.isFinite(next) ? next : fallback;
}

function nullableNumber(value: unknown): FarmMetricValue {
  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

function normalizeForecastItems(items: any[] | undefined, fallbackLabel: string, fallbackCondition: string): WeatherForecastItem[] {
  return Array.isArray(items)
    ? items.map((item) => ({
        label: item?.label || fallbackLabel,
        temperatureCelsius: numberValue(item?.temperatureCelsius, 0),
        humidityPercent: numberValue(item?.humidityPercent, 0),
        condition: item?.condition || fallbackCondition,
      }))
    : [];
}

export function displayCrop(value = "") {
  return cropLabels[value] || value || "未知作物";
}

export function displayStage(value = "") {
  return stageLabels[value] || value || "未识别";
}

export function displayTaskType(value = "") {
  return taskLabels[value] || value || "任务";
}

export function displayStatus(value = "") {
  return statusLabels[value] || value || "未知";
}

function normalizeChart(items: any[] = []): ChartPoint[] {
  return items.map((item, index) => ({
    label: displayTaskType(item?.label || item?.type || `chart-${index + 1}`),
    value: numberValue(item?.value),
    type: item?.type || item?.label || "",
  }));
}

function normalizeStageChart(items: any[] = []): ChartPoint[] {
  return items.map((item, index) => ({
    label: displayStage(item?.label || item?.type || `stage-${index + 1}`),
    value: numberValue(item?.value),
    type: item?.type || item?.label || "",
  }));
}

function normalizeCropChart(items: any[] = []): ChartPoint[] {
  return items.map((item, index) => ({
    label: displayCrop(item?.label || item?.type || `crop-${index + 1}`),
    value: numberValue(item?.value),
    type: item?.type || item?.label || "",
  }));
}

function normalizeStatusChart(items: any[] = []): ChartPoint[] {
  return items.map((item, index) => ({
    label: displayStatus(item?.label || item?.type || `status-${index + 1}`),
    value: numberValue(item?.value),
    type: item?.type || item?.label || "",
  }));
}

function normalizeAsset(item: any, index: number): FarmAssetOverview {
  const isPlot = item?.type === "plot";
  return {
    id: item?.id || `asset-${index + 1}`,
    name: item?.name || (isPlot ? `地块 ${index + 1}` : `大棚 ${index + 1}`),
    type: isPlot ? "plot" : "greenhouse",
    crop: displayCrop(item?.crop),
    growthStage: displayStage(item?.growthStage),
    status: item?.status || "active",
    areaMu: nullableNumber(item?.areaMu),
    position: {
      x: numberValue(item?.position?.x, (index % 6) * 12 - 30),
      y: numberValue(item?.position?.y, 0),
      z: numberValue(item?.position?.z, Math.floor(index / 6) * 14 - 20),
    },
    size: {
      width: numberValue(item?.size?.width ?? item?.size?.x, isPlot ? 12 : 8),
      height: numberValue(item?.size?.height ?? item?.size?.y, isPlot ? 0.15 : 3.2),
      length: numberValue(item?.size?.length ?? item?.size?.z, isPlot ? 14 : 16),
    },
    metrics: {
      temperature: nullableNumber(item?.metrics?.temperature),
      humidity: nullableNumber(item?.metrics?.humidity),
      soilMoisture: nullableNumber(item?.metrics?.soilMoisture),
    },
    openAlertCount: numberValue(item?.openAlertCount),
    activeTaskCount: numberValue(item?.activeTaskCount),
    taskStatusChart: normalizeStatusChart(item?.taskStatusChart || []),
    taskTypeChart: normalizeChart(item?.taskTypeChart || []),
    latestGrowthDetection: item?.latestGrowthDetection || null,
    latestDisease: item?.latestDisease || null,
  };
}

function normalizeOverview(raw: any): FarmOverview {
  const assets = Array.isArray(raw?.assets) ? raw.assets.map(normalizeAsset) : [];
  const summary = raw?.summary || {};
  const charts = raw?.permanentCharts || {};
  const weather = charts.weather || {};
  return {
    farmId: raw?.farmId || "farm-demo",
    farmName: raw?.farmName || "智慧农业示范农场",
    region: raw?.region || "Smart Agriculture",
    updatedAt: raw?.updatedAt || "",
    mapFallbackEnabled: true,
    mapAssets: assets,
    interactiveMapAssetIds: assets.map((asset) => asset.id),
    summary: {
      assetCount: numberValue(summary.assetCount, assets.length),
      greenhouseCount: numberValue(summary.greenhouseCount, assets.filter((item) => item.type === "greenhouse").length),
      plotCount: numberValue(summary.plotCount, assets.filter((item) => item.type === "plot").length),
      openAlertCount: numberValue(summary.openAlertCount),
      activeTaskCount: numberValue(summary.activeTaskCount),
      averageTemperature: nullableNumber(summary.averageTemperature),
      averageHumidity: nullableNumber(summary.averageHumidity),
      averageSoilMoisture: nullableNumber(summary.averageSoilMoisture),
    },
    assets,
    permanentCharts: {
      growthStages: normalizeStageChart(charts.growthStages || []),
      cropTypes: normalizeCropChart(charts.cropTypes || []),
      taskTypes: normalizeChart(charts.taskTypes || []),
      taskStatuses: normalizeStatusChart(charts.taskStatuses || []),
      environment: (charts.environment || []).map((item: any) => ({
        label: item?.label || "环境指标",
        value: nullableNumber(item?.value),
        unit: item?.unit || "",
      })),
      riskOverview: normalizeChart(charts.riskOverview || []),
      weather: {
        location: weather.location || raw?.farmName || "智慧农业示范农场",
        summary: weather.summary || "多云",
        temperatureCelsius: numberValue(weather.temperatureCelsius, numberValue(summary.averageTemperature, 26)),
        humidityPercent: numberValue(weather.humidityPercent, numberValue(summary.averageHumidity, 68)),
        rainProbability: numberValue(weather.rainProbability, 30),
        wind: weather.wind || "东南风 2 级",
        soilMoisture: nullableNumber(weather.soilMoisture ?? summary.averageSoilMoisture),
        tip: weather.tip || "适合巡检作物长势与墒情。",
        source: weather.source || "",
        updatedAt: weather.updatedAt || raw?.updatedAt || "",
        hourlyForecast: normalizeForecastItems(weather.hourlyForecast, "现在", "晴"),
        dailyForecast: normalizeForecastItems(weather.dailyForecast, "今天", "晴"),
      },
    },
  };
}

export async function loadAdminFarmOverview(): Promise<FarmOverview> {
  const response = await getAdminFarmOverview();
  return normalizeOverview(response?.data?.data || response?.data || {});
}

function averageAssetMetric(assets: FarmAssetOverview[], metricKey: keyof FarmAssetOverview["metrics"]): FarmMetricValue {
  const values = assets
    .map((asset) => asset.metrics[metricKey])
    .filter((value): value is number => value !== null && value !== undefined && Number.isFinite(Number(value)))
    .map(Number);
  if (!values.length) return null;
  return Number((values.reduce((total, value) => total + value, 0) / values.length).toFixed(1));
}

function chartFromCounts(counts: Map<string, number>, normalizer: (value: string) => string): ChartPoint[] {
  return [...counts.entries()]
    .filter(([, value]) => value > 0)
    .map(([label, value]) => ({ label: normalizer(label), value, type: label }));
}

function increment(counts: Map<string, number>, key = "unknown", value = 1) {
  const nextKey = key || "unknown";
  counts.set(nextKey, (counts.get(nextKey) || 0) + value);
}

function positionFromFarmerMapAsset(item: any, index: number) {
  const position = item?.transform?.position || {};
  return {
    x: numberValue(position.x, (index % 5) * 12 - 24),
    y: numberValue(position.y, 0),
    z: numberValue(position.z, Math.floor(index / 5) * 14 - 18),
  };
}

function sizeFromFarmerMapAsset(item: any, isPlot: boolean) {
  const size = item?.transform?.size || {};
  return {
    width: numberValue(size.x ?? size.width, isPlot ? 12 : 8),
    height: numberValue(size.y ?? size.height, isPlot ? 0.15 : 3.2),
    length: numberValue(size.z ?? size.length, isPlot ? 14 : 16),
  };
}

function farmerAssetFromMapItem(item: any, index: number): FarmAssetOverview {
  const summary = item?.summary || {};
  const isPlot = item?.type === "plot";
  const status = item?.visualState?.tone === "alert" ? "warning" : item?.visualState?.tone || "active";
  const openAlertCount = numberValue(summary.activeAlertCount);
  const activeTaskCount = numberValue(summary.activeTaskCount);
  return {
    id: item?.assetId || item?.id || `farmer-asset-${index + 1}`,
    name: item?.name || item?.assetId || `个人资产 ${index + 1}`,
    type: isPlot ? "plot" : "greenhouse",
    crop: displayCrop(summary.cropName || item?.crop),
    growthStage: displayStage(summary.growthStage || item?.growthStage),
    status: openAlertCount > 0 || status === "warning" ? "warning" : status || "active",
    areaMu: nullableNumber(item?.areaMu),
    position: positionFromFarmerMapAsset(item, index),
    size: sizeFromFarmerMapAsset(item, isPlot),
    metrics: {
      temperature: nullableNumber(summary.temperature),
      humidity: nullableNumber(summary.humidity),
      soilMoisture: nullableNumber(summary.soilMoisture),
    },
    openAlertCount,
    activeTaskCount,
    taskStatusChart: activeTaskCount > 0 ? [{ label: "pending", value: activeTaskCount, type: "pending" }] : [],
    taskTypeChart: [],
    latestGrowthDetection: null,
    latestDisease: null,
  };
}

function farmerAssetFromAttention(item: any, index: number): FarmAssetOverview {
  const isPlot = item?.type === "plot";
  const openAlertCount = numberValue(item?.activeAlertCount);
  const activeTaskCount = numberValue(item?.activeTaskCount);
  return {
    id: item?.id || `farmer-attention-${index + 1}`,
    name: item?.name || item?.id || `个人资产 ${index + 1}`,
    type: isPlot ? "plot" : "greenhouse",
    crop: displayCrop(item?.crop),
    growthStage: displayStage(item?.growthStage),
    status: openAlertCount > 0 || item?.status === "warning" ? "warning" : item?.status || "active",
    areaMu: nullableNumber(item?.areaMu),
    position: { x: -24 + (index % 4) * 14, y: 0, z: -12 + Math.floor(index / 4) * 16 },
    size: { width: isPlot ? 12 : 8, height: isPlot ? 0.15 : 3.2, length: isPlot ? 14 : 16 },
    metrics: {
      temperature: nullableNumber(item?.temperature),
      humidity: nullableNumber(item?.humidity),
      soilMoisture: nullableNumber(item?.soilMoisture),
    },
    openAlertCount,
    activeTaskCount,
    taskStatusChart: activeTaskCount > 0 ? [{ label: "pending", value: activeTaskCount, type: "pending" }] : [],
    taskTypeChart: [],
    latestGrowthDetection: null,
    latestDisease: null,
  };
}

function mergeFarmerAssets(workbench: FarmerWorkbench): FarmAssetOverview[] {
  const personalMapAssets = (workbench.farmMap?.assets || [])
    .filter((asset) => asset?.visualState?.highlighted === true)
    .map(farmerAssetFromMapItem);
  const byId = new Map(personalMapAssets.map((asset) => [asset.id, asset]));
  (workbench.attentionAssets || []).forEach((item, index) => {
    const id = item?.id;
    if (!id) return;
    const mapped = farmerAssetFromAttention(item, index);
    byId.set(id, { ...(byId.get(id) || mapped), ...mapped });
  });
  return [...byId.values()];
}

function mapFarmerMapAssets(workbench: FarmerWorkbench): FarmAssetOverview[] {
  return (workbench.farmMap?.assets || []).map(farmerAssetFromMapItem);
}

function attachFarmerTaskCharts(assets: FarmAssetOverview[], tasks: any[] = []) {
  const byId = new Map(assets.map((asset) => [asset.id, asset]));
  const typeCounts = new Map<string, number>();
  const statusCounts = new Map<string, number>();
  tasks.forEach((task) => {
    const assetId = task?.asset?.id;
    const asset = assetId ? byId.get(assetId) : null;
    if (!asset) return;
    const type = task?.type || "inspection";
    const status = task?.status || "pending";
    increment(typeCounts, type);
    increment(statusCounts, status);

    const taskTypeChart = [...(asset.taskTypeChart || [])];
    const typeRow = taskTypeChart.find((item) => item.type === type || item.label === type);
    if (typeRow) {
      typeRow.value += 1;
    } else {
      taskTypeChart.push({ label: displayTaskType(type), value: 1, type });
    }
    const taskStatusChart = [...(asset.taskStatusChart || [])];
    const statusRow = taskStatusChart.find((item) => item.type === status || item.label === status);
    if (statusRow) {
      statusRow.value += 1;
    } else {
      taskStatusChart.push({ label: displayStatus(status), value: 1, type: status });
    }
    asset.taskTypeChart = taskTypeChart;
    asset.taskStatusChart = taskStatusChart;
  });
  return { typeCounts, statusCounts };
}

function attachFarmerDiagnoses(assets: FarmAssetOverview[], diagnoses: any[] = []) {
  const byId = new Map(assets.map((asset) => [asset.id, asset]));
  const personalDiagnoses: any[] = [];
  diagnoses.forEach((diagnosis) => {
    const assetId = diagnosis?.asset?.id;
    const asset = assetId ? byId.get(assetId) : null;
    if (!asset) return;
    personalDiagnoses.push(diagnosis);
    if (!asset.latestDisease) {
      asset.latestDisease = {
        result: diagnosis?.result || diagnosis?.status || "",
        confidence: nullableNumber(diagnosis?.confidence),
        status: diagnosis?.status || "",
      };
    }
  });
  return personalDiagnoses;
}

function buildWeatherFromFarmer(workbench: FarmerWorkbench, assets: FarmAssetOverview[]): WeatherForecast {
  const weather = workbench.weather || {};
  const fallbackTemperature = numberValue(averageAssetMetric(assets, "temperature"), 26);
  const fallbackHumidity = numberValue(averageAssetMetric(assets, "humidity"), 68);
  const temperature = numberValue(weather.temperatureCelsius, fallbackTemperature);
  const humidity = numberValue(weather.humidityPercent, fallbackHumidity);
  const condition = weather.summary || "多云";
  const hourlyForecast = normalizeForecastItems(weather.hourlyForecast, "现在", condition);
  const dailyForecast = normalizeForecastItems(weather.dailyForecast, "今天", condition);
  return {
    location: weather.location || workbench.farm?.name || "个人责任区",
    summary: condition,
    temperatureCelsius: temperature,
    humidityPercent: humidity,
    rainProbability: numberValue(weather.rainProbability, 30),
    wind: weather.wind || "东南风 2 级",
    soilMoisture: nullableNumber(weather.soilMoisture ?? averageAssetMetric(assets, "soilMoisture")),
    tip: weather.tip || "适合复查个人负责资产的长势与墒情。",
    source: weather.source || "",
    updatedAt: weather.updatedAt || "",
    hourlyForecast: hourlyForecast.length ? hourlyForecast : [
      { label: "现在", temperatureCelsius: temperature, humidityPercent: humidity, condition },
      { label: "2小时后", temperatureCelsius: temperature + 1, humidityPercent: Math.max(0, humidity - 3), condition },
      { label: "4小时后", temperatureCelsius: temperature + 0.4, humidityPercent: Math.max(0, humidity - 5), condition },
    ],
    dailyForecast: dailyForecast.length ? dailyForecast : [
      { label: "今天", temperatureCelsius: temperature, humidityPercent: humidity, condition },
      { label: "明天", temperatureCelsius: temperature + 1.2, humidityPercent: Math.max(0, humidity - 4), condition: "晴" },
      { label: "后天", temperatureCelsius: temperature - 0.8, humidityPercent: humidity + 3, condition: "多云" },
    ],
  };
}

function normalizeFarmerWorkbench(raw: FarmerWorkbench = {}): FarmOverview {
  const assets = mergeFarmerAssets(raw);
  const mapAssets = mapFarmerMapAssets(raw);
  const { typeCounts, statusCounts } = attachFarmerTaskCharts(assets, raw.todayTasks || []);
  const personalDiagnoses = attachFarmerDiagnoses(assets, raw.recentDiagnoses || []);

  const growthCounts = new Map<string, number>();
  const cropCounts = new Map<string, number>();
  assets.forEach((asset) => {
    increment(growthCounts, asset.growthStage || "未识别");
    increment(cropCounts, asset.crop || "未知作物");
  });

  const warningAssetCount = numberValue(raw.stats?.warningAssetCount, assets.filter((asset) => asset.status === "warning" || asset.openAlertCount > 0).length);
  const activeTaskCount = numberValue(raw.stats?.activeTaskCount, assets.reduce((total, asset) => total + asset.activeTaskCount, 0));
  const diagnosisRiskCount = personalDiagnoses.filter((diagnosis) => {
    const status = String(diagnosis?.status || "").toLowerCase();
    const result = String(diagnosis?.result || "").toLowerCase();
    return status.includes("risk") || (!result.includes("healthy") && !result.includes("健康"));
  }).length;

  return {
    farmId: raw.farm?.id || "farmer-personal-farm",
    farmName: `${raw.profile?.displayName || "农户"}个人综合大屏`,
    region: raw.farm?.name || raw.farm?.region || "个人责任区",
    updatedAt: "",
    mapFallbackEnabled: false,
    mapAssets,
    interactiveMapAssetIds: assets.map((asset) => asset.id),
    summary: {
      assetCount: numberValue(raw.stats?.assignedAssetCount, assets.length),
      greenhouseCount: assets.filter((asset) => asset.type === "greenhouse").length,
      plotCount: assets.filter((asset) => asset.type === "plot").length,
      openAlertCount: warningAssetCount,
      activeTaskCount,
      averageTemperature: averageAssetMetric(assets, "temperature"),
      averageHumidity: averageAssetMetric(assets, "humidity"),
      averageSoilMoisture: averageAssetMetric(assets, "soilMoisture"),
    },
    assets,
    permanentCharts: {
      growthStages: chartFromCounts(growthCounts, displayStage),
      cropTypes: chartFromCounts(cropCounts, displayCrop),
      taskTypes: chartFromCounts(typeCounts, displayTaskType),
      taskStatuses: chartFromCounts(statusCounts, displayStatus),
      environment: [
        { label: "空气温度", value: averageAssetMetric(assets, "temperature"), unit: "C" },
        { label: "空气湿度", value: averageAssetMetric(assets, "humidity"), unit: "%" },
        { label: "土壤湿度", value: averageAssetMetric(assets, "soilMoisture"), unit: "%" },
      ],
      riskOverview: [
        { label: "个人告警资产", value: warningAssetCount, type: "alerts" },
        { label: "紧急任务", value: numberValue(raw.stats?.urgentTaskCount), type: "urgent" },
        { label: "病害风险", value: diagnosisRiskCount, type: "disease" },
      ],
      weather: buildWeatherFromFarmer(raw, assets),
    },
  };
}

export async function loadFarmerFarmOverview(): Promise<FarmOverview> {
  const response = await getFarmerDashboard();
  return normalizeFarmerWorkbench(response?.data?.data || response?.data || {});
}

export const fallbackFarmerFarmOverview: FarmOverview = normalizeFarmerWorkbench({
  farm: { id: "farmer-personal-farm", name: "个人责任区", region: "个人资产" },
  profile: { displayName: "农户" },
  stats: { assignedAssetCount: 0, warningAssetCount: 0, activeTaskCount: 0, urgentTaskCount: 0 },
  weather: { location: "个人责任区", summary: "暂无数据", temperatureCelsius: 26, humidityPercent: 68, tip: "登录后同步个人资产数据。" },
  todayTasks: [],
  attentionAssets: [],
  latestAlerts: [],
  recentDiagnoses: [],
  farmMap: { assets: [] },
});

export const fallbackFarmOverview: FarmOverview = normalizeOverview({
  farmId: "farm-south-demo",
  farmName: "智慧农业示范农场",
  region: "小麦与草莓自动检测示范区",
  summary: {
    assetCount: 6,
    greenhouseCount: 3,
    plotCount: 3,
    openAlertCount: 3,
    activeTaskCount: 9,
    averageTemperature: 24.8,
    averageHumidity: 68.5,
    averageSoilMoisture: 47.2,
  },
  assets: [
    { id: "asset-greenhouse-a01", name: "大棚 A-01", type: "greenhouse", crop: "草莓", growthStage: "Red", status: "warning", areaMu: 6.5, position: { x: -22, y: 0, z: -12 }, size: { width: 8, height: 3.2, length: 16 }, metrics: { temperature: 25.6, humidity: 74, soilMoisture: 43 }, openAlertCount: 1, activeTaskCount: 2, taskTypeChart: [{ label: "irrigation", value: 1 }, { label: "disease_detection", value: 1 }], taskStatusChart: [{ label: "pending", value: 1 }, { label: "accepted", value: 1 }], latestGrowthDetection: { modelStage: "Red", calendarStage: "Red", decisionStatus: "matched", modelConfidence: 0.92 }, latestDisease: { result: "healthy", confidence: 0.88, status: "healthy" } },
    { id: "asset-greenhouse-a02", name: "大棚 A-02", type: "greenhouse", crop: "草莓", growthStage: "White", status: "active", areaMu: 5.9, position: { x: -9, y: 0, z: -12 }, size: { width: 8, height: 3.2, length: 16 }, metrics: { temperature: 23.4, humidity: 69, soilMoisture: 49 }, openAlertCount: 0, activeTaskCount: 1, taskTypeChart: [{ label: "inspection", value: 1 }], taskStatusChart: [{ label: "pending", value: 1 }] },
    { id: "asset-greenhouse-c03", name: "大棚 C-03", type: "greenhouse", crop: "草莓", growthStage: "Turning", status: "warning", areaMu: 4.2, position: { x: 4, y: 0, z: -12 }, size: { width: 8, height: 3.2, length: 16 }, metrics: { temperature: 26.1, humidity: 72, soilMoisture: 45 }, openAlertCount: 1, activeTaskCount: 2, taskTypeChart: [{ label: "growth_anomaly", value: 1 }, { label: "inspection", value: 1 }], taskStatusChart: [{ label: "submitted", value: 1 }, { label: "pending", value: 1 }], latestGrowthDetection: { modelStage: "White", calendarStage: "Turning", decisionStatus: "mismatch", modelConfidence: 0.9 } },
    { id: "asset-plot-p07", name: "地块 P-07", type: "plot", crop: "小麦", growthStage: "stage_4", status: "active", areaMu: 12.3, position: { x: -18, y: 0, z: 12 }, size: { width: 14, height: 0.15, length: 16 }, metrics: { temperature: 24.3, humidity: 63, soilMoisture: 44 }, openAlertCount: 1, activeTaskCount: 2, taskTypeChart: [{ label: "irrigation", value: 1 }, { label: "inspection", value: 1 }], taskStatusChart: [{ label: "accepted", value: 1 }, { label: "pending", value: 1 }] },
    { id: "asset-plot-p08", name: "地块 P-08", type: "plot", crop: "小麦", growthStage: "stage_5", status: "active", areaMu: 13.1, position: { x: 0, y: 0, z: 12 }, size: { width: 14, height: 0.15, length: 16 }, metrics: { temperature: 23.8, humidity: 61, soilMoisture: 51 }, openAlertCount: 0, activeTaskCount: 1, taskTypeChart: [{ label: "inspection", value: 1 }], taskStatusChart: [{ label: "pending", value: 1 }] },
    { id: "asset-plot-n01", name: "地块 N-01", type: "plot", crop: "小麦", growthStage: "stage_6", status: "active", areaMu: 18, position: { x: 18, y: 0, z: 12 }, size: { width: 14, height: 0.15, length: 16 }, metrics: { temperature: 25.1, humidity: 58, soilMoisture: 53 }, openAlertCount: 0, activeTaskCount: 1, taskTypeChart: [{ label: "irrigation", value: 1 }], taskStatusChart: [{ label: "done", value: 1 }] },
  ],
  permanentCharts: {
    growthStages: [{ label: "Red", value: 1 }, { label: "White", value: 1 }, { label: "Turning", value: 1 }, { label: "stage_4", value: 1 }, { label: "stage_5", value: 1 }, { label: "stage_6", value: 1 }],
    cropTypes: [{ label: "草莓", value: 3 }, { label: "小麦", value: 3 }],
    taskTypes: [{ label: "irrigation", value: 3 }, { label: "inspection", value: 4 }, { label: "growth_anomaly", value: 1 }, { label: "disease_detection", value: 1 }],
    taskStatuses: [{ label: "pending", value: 5 }, { label: "accepted", value: 2 }, { label: "submitted", value: 1 }, { label: "done", value: 1 }],
    environment: [{ label: "空气温度", value: 24.8, unit: "C" }, { label: "空气湿度", value: 68.5, unit: "%" }, { label: "土壤湿度", value: 47.2, unit: "%" }],
    riskOverview: [{ label: "待处理告警", value: 3 }, { label: "生长异常", value: 1 }, { label: "病害风险", value: 1 }],
    weather: {
      location: "智慧农业示范农场",
      summary: "多云",
      temperatureCelsius: 24.8,
      humidityPercent: 68,
      rainProbability: 30,
      wind: "东南风 2 级",
      soilMoisture: 47.2,
      tip: "适合巡检作物长势与墒情。",
      updatedAt: "2026-05-20T09:00:00",
      hourlyForecast: [
        { label: "现在", temperatureCelsius: 24.8, humidityPercent: 68, condition: "多云" },
        { label: "2小时后", temperatureCelsius: 26.1, humidityPercent: 64, condition: "晴" },
        { label: "4小时后", temperatureCelsius: 25.4, humidityPercent: 60, condition: "多云" },
      ],
      dailyForecast: [
        { label: "今天", temperatureCelsius: 24.8, humidityPercent: 68, condition: "多云" },
        { label: "明天", temperatureCelsius: 26.2, humidityPercent: 62, condition: "晴" },
        { label: "后天", temperatureCelsius: 23.9, humidityPercent: 71, condition: "小雨" },
      ],
    },
  },
});
