export function formatAlertTime(value, fallback = "-") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 19);
  return date.toLocaleString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).replace(/\//g, "-");
}

export function normalizeSysadminAlert(item = {}, index = 0) {
  return {
    id: item.id || `sys-alert-${index + 1}`,
    level: item.level || "info",
    type: item.type || item.title || "设备告警",
    source: item.source || item.deviceId || item.deviceName || "-",
    location: item.location || item.assetName || item.farmName || "-",
    time: formatAlertTime(item.time || item.createdAt),
    message: item.message || item.content || item.title || "暂无告警说明",
    status: item.status === "resolved" ? "resolved" : "pending",
    operator: item.operator || item.resolvedBy || "",
    resolveTime: item.resolveTime ? formatAlertTime(item.resolveTime) : "",
  };
}

export function statsFromLogs(logs = []) {
  return {
    totalDevices: 0,
    onlineDevices: 0,
    offlineDevices: 0,
    pendingAlerts: logs.filter((log) => log.status === "pending").length,
    criticalAlerts: logs.filter((log) => log.level === "error").length,
    resolvedAlerts: logs.filter((log) => log.status === "resolved").length,
  };
}

export function apiErrorMessage(error, fallback) {
  return error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback;
}
