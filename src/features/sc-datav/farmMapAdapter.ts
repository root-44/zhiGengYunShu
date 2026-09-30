import {
  displayStage,
  displayStatus,
  type FarmAssetOverview,
  type FarmOverview,
  type FarmMetricValue,
} from "./api";

export interface FarmMapRegion {
  geoRegionName: string;
  assetId: string;
  label: string;
  value: number;
  asset: FarmAssetOverview;
  cropLabel: string;
  stageLabel: string;
  statusLabel: string;
  warning: boolean;
  interactive: boolean;
}

function metricScore(value: FarmMetricValue, ideal: number, range: number) {
  if (value == null) return 0;
  const distance = Math.abs(Number(value) - ideal);
  return Math.max(0, 1 - distance / range);
}

function regionValue(asset: FarmAssetOverview) {
  const area = Number(asset.areaMu || 0);
  const alertWeight = asset.openAlertCount * 180;
  const taskWeight = asset.activeTaskCount * 120;
  const moistureScore = metricScore(asset.metrics.soilMoisture, 50, 40) * 120;
  const healthWeight = asset.status === "warning" ? 220 : asset.status === "offline" ? 80 : 150;

  return Math.max(120, Math.round(260 + area * 12 + alertWeight + taskWeight + moistureScore + healthWeight));
}

function fallbackAsset(index: number): FarmAssetOverview {
  const isPlot = index % 2 === 1;
  return {
    id: `farm-map-asset-${index + 1}`,
    name: isPlot ? `地块 P-${String(index + 1).padStart(2, "0")}` : `大棚 A-${String(index + 1).padStart(2, "0")}`,
    type: isPlot ? "plot" : "greenhouse",
    crop: isPlot ? "小麦" : "草莓",
    growthStage: isPlot ? "小麦拔节期" : "草莓转色期",
    status: "active",
    areaMu: isPlot ? 12 : 6,
    position: { x: 0, y: 0, z: 0 },
    size: { width: 8, height: 3, length: 12 },
    metrics: {
      temperature: 24,
      humidity: 68,
      soilMoisture: 48,
    },
    openAlertCount: 0,
    activeTaskCount: 0,
    taskStatusChart: [],
    taskTypeChart: [],
    latestGrowthDetection: null,
    latestDisease: null,
  };
}

function prioritizeInteractiveAssets(
  sourceAssets: FarmAssetOverview[],
  interactiveAssetIds: Set<string>,
  visibleCount: number
) {
  if (!sourceAssets.length || interactiveAssetIds.size === 0 || visibleCount <= 0) {
    return sourceAssets;
  }

  const visibleAssets = sourceAssets.slice(0, visibleCount);
  const visibleAssetIds = new Set(visibleAssets.map((asset) => asset.id));
  const missingInteractiveAssets = sourceAssets.filter(
    (asset) => interactiveAssetIds.has(asset.id) && !visibleAssetIds.has(asset.id)
  );

  if (!missingInteractiveAssets.length) {
    return sourceAssets;
  }

  const nextVisibleAssets = [...visibleAssets];
  let missingIndex = 0;
  for (let index = 0; index < nextVisibleAssets.length && missingIndex < missingInteractiveAssets.length; index += 1) {
    if (!interactiveAssetIds.has(nextVisibleAssets[index].id)) {
      nextVisibleAssets[index] = missingInteractiveAssets[missingIndex];
      missingIndex += 1;
    }
  }

  const usedAssetIds = new Set(nextVisibleAssets.map((asset) => asset.id));
  const remainingAssets = sourceAssets.filter((asset) => !usedAssetIds.has(asset.id));
  return [...nextVisibleAssets, ...remainingAssets];
}

export function mapFarmAssetsToGeoRegions(
  overview: FarmOverview,
  geoRegionNames: string[]
): FarmMapRegion[] {
  const personalOnly = overview.mapFallbackEnabled === false;
  const sourceAssets = overview.mapAssets?.length ? overview.mapAssets : overview.assets;
  const assets = sourceAssets.length
    ? sourceAssets
    : personalOnly
      ? []
      : geoRegionNames.map((_, index) => fallbackAsset(index));
  if (!assets.length) {
    return [];
  }
  const interactiveAssetIds = new Set(
    personalOnly
      ? overview.interactiveMapAssetIds || overview.assets.map((asset) => asset.id)
      : assets.map((asset) => asset.id)
  );
  const visibleAssets = personalOnly
    ? prioritizeInteractiveAssets(assets, interactiveAssetIds, geoRegionNames.length)
    : assets;

  return geoRegionNames.map((geoRegionName, index) => {
    const asset = visibleAssets[index % visibleAssets.length] || fallbackAsset(index);
    const interactive = interactiveAssetIds.has(asset.id);
    return {
      geoRegionName,
      assetId: asset.id,
      label: interactive ? asset.name : "",
      value: regionValue(asset),
      asset,
      cropLabel: interactive ? asset.crop : "",
      stageLabel: interactive ? displayStage(asset.growthStage) : "",
      statusLabel: interactive ? displayStatus(asset.status) : "",
      warning: interactive && (asset.status === "warning" || asset.openAlertCount > 0),
      interactive,
    };
  });
}
