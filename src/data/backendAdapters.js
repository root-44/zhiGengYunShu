export function pageItems(response) {
  const data = response?.data?.data ?? response?.data ?? response ?? {};
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.records)) return data.records;
  return [];
}

export function apiItem(response) {
  return response?.data?.data ?? response?.data ?? response ?? null;
}

export function normalizeAssetStatus(status, openAlertCount = 0) {
  if (Number(openAlertCount) > 0) return "需关注";
  if (status === "active") return "正常";
  if (status === "warning") return "需关注";
  if (status === "offline") return "离线";
  return status || "正常";
}

function normalizeFallbackAssetType(fallbackType = "greenhouse") {
  if (typeof fallbackType === "boolean") return fallbackType ? "greenhouse" : "plot";
  return fallbackType || "greenhouse";
}

function greenhouseTypeLabel(asset = {}) {
  const key = `${asset.id || ""} ${asset.name || ""}`.toLowerCase();
  const stage = String(asset.growthStage || "").toLowerCase();
  if (key.includes("a03") || key.includes("a04") || stage.includes("turning")) return "连栋棚";
  if (key.includes("a05") || key.includes("a06") || key.includes("c03") || stage.includes("white")) return "育苗棚";
  if (key.includes("a01") || key.includes("a02") || stage.includes("red")) return "日光温室";
  return "温室";
}

export function mapFarmerAssetForScreen(asset = {}, fallbackType = "greenhouse") {
  const metrics = asset.metrics || {};
  const deviceSummary = asset.deviceSummary || {};
  const deviceTotal = Number(deviceSummary.total ?? 0);
  const deviceOnline = Number(deviceSummary.online ?? 0);
  const openAlertCount = Number(asset.openAlertCount ?? 0);
  const activeTaskCount = Number(asset.activeTaskCount ?? 0);
  const type = asset.type || normalizeFallbackAssetType(fallbackType);

  return {
    id: asset.id,
    backendId: asset.id,
    name: asset.name || asset.id || "--",
    type,
    typeLabel: type === "greenhouse" ? greenhouseTypeLabel(asset) : "地块",
    crop: [asset.crop, asset.growthStage].filter(Boolean).join(" / ") || asset.crop || "--",
    cropName: asset.crop || "--",
    growthStage: asset.growthStage || "",
    owner: asset.ownerName || "当前用户",
    ownerId: asset.ownerId || "",
    deviceText: deviceTotal > 0 ? `在线 ${deviceOnline}/${deviceTotal} 台` : "暂无设备",
    status: normalizeAssetStatus(asset.status, openAlertCount),
    warningText: openAlertCount > 0 ? `${openAlertCount} 条告警` : "无",
    todayTaskText: activeTaskCount > 0 ? `待办 ${activeTaskCount} 项` : "无",
    metrics,
    deviceSummary,
    openAlertCount,
    activeTaskCount,
    updatedAt: asset.updatedAt || "",
  };
}

export function mapAdminAssetForScreen(asset = {}, fallbackType = "greenhouse") {
  return {
    ...mapFarmerAssetForScreen(asset, fallbackType),
    owner: asset.ownerName || "未分配",
  };
}

export function dashboardStatsFromWorkbench(workbench = {}) {
  const stats = workbench.stats || {};
  return [
    ["我的地块/大棚", String(stats.assignedAssetCount ?? 0), "已分配资产"],
    ["预警资产", String(stats.warningAssetCount ?? 0), "需要关注"],
    ["待办任务", String(stats.activeTaskCount ?? 0), "待处理与进行中"],
    ["社区/供需", String((stats.pendingCommunityReplies ?? 0) + (stats.activeSupplyCount ?? 0)), "最新动态"],
  ];
}

export function weatherCardsFromWorkbench(workbench = {}) {
  const weather = workbench.weather || {};
  return [
    ["今日天气", weather.summary || "--"],
    ["降雨概率", weather.rainProbability || "--"],
    ["空气湿度", weather.humidityPercent == null ? "--" : `${weather.humidityPercent}%`],
    ["农事建议", weather.tip || "--"],
  ];
}

export function mapCardsFromWorkbench(workbench = {}) {
  return (workbench.attentionAssets || []).slice(0, 4).map((asset) => [
    asset.name || "--",
    [asset.crop, asset.growthStage].filter(Boolean).join(" / ") || "--",
    asset.attentionReason || asset.statusLabel || "需关注",
  ]);
}

export function mapAssetsFromWorkbench(workbench = {}) {
  const farmMapItems = Array.isArray(workbench.farmMap?.assets) ? workbench.farmMap.assets : [];
  if (farmMapItems.length > 0) {
    return farmMapItems.map((asset, index) => {
      const summary = asset.summary || {};
      const position = asset.transform?.position || {};
      return {
        id: asset.assetId || asset.id || `asset-${index + 1}`,
        backendId: asset.assetId || asset.id || "",
        name: asset.name || asset.assetId || "--",
        type: asset.type || "greenhouse",
        x: Number(position.x ?? index * 12) / 10,
        z: Number(position.z ?? 0) / 10,
        crop: [summary.cropName, summary.growthStage].filter(Boolean).join(" / ") || "--",
        owner: "current farmer",
      };
    });
  }

  return (workbench.attentionAssets || []).slice(0, 6).map((asset, index) => ({
    id: asset.id || `asset-${index + 1}`,
    backendId: asset.id || "",
    name: asset.name || asset.id || "--",
    type: asset.type || "greenhouse",
    x: -2.4 + (index % 3) * 1.9,
    z: index < 3 ? -1.1 : 1.05,
    crop: [asset.crop, asset.growthStage].filter(Boolean).join(" / ") || "--",
    owner: "current farmer",
  }));
}
