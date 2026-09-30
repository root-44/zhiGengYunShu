import { screens } from "../prototypeData.js";

function resolveRoleFromAccount(account) {
  const normalized = account.trim().toLowerCase();
  const accountName = normalized.split("@")[0];
  if (accountName.includes("sysadmin") || accountName.includes("system")) {
    return "sysadmin";
  }
  if (accountName.includes("admin") || accountName.includes("manager")) {
    return "admin";
  }
  return "farmer";
}

function getGreenhouseAssetsForRole() {
  return [];
}

function getPlotAssetsForRole() {
  return [];
}

const taskTargetsByName = {
  "灌溉任务": "irrigation-task",
  "灌溉操作": "irrigation-task",
  "环境巡检": "inspection-task",
  "生长异常": "growth-anomaly-task",
  "病害检测": "disease-detection-task",
  "病虫检测": "disease-detection-task"
};

function taskTargetForName(name) {
  return taskTargetsByName[name] ?? "tasks";
}

function operationFields(operation) {
  if (operation === "irrigation") return ["灌溉区域", "绑定设备", "控制模式（手动控制/定时执行/阈值联动）", "目标水分"];
  if (operation === "inspection") return ["巡检区域", "温湿度记录", "现场照片", "设备状态"];
  if (operation === "growth_anomaly") return ["关联区域", "模型阶段", "经验阶段", "异常原因"];
  if (operation === "disease_detection") return ["关联区域", "病害结果", "风险等级", "防治措施"];
  return ["任务区域", "处理内容", "现场凭证", "处理结果"];
}

function assetRouteFor(screen, route) {
  const screenId = screen.id;
  if (route === "list") {
    if (screenId.startsWith("greenhouse")) return "greenhouse-list";
    if (screenId.startsWith("plot")) return "plot-list";
    return "tasks";
  }
  if (route === "tasks") {
    if (screenId.startsWith("greenhouse")) return "greenhouse-tasks";
    if (screenId.startsWith("plot")) return "plot-tasks";
    return "tasks";
  }
  if (route === "detail") {
    if (screenId.startsWith("greenhouse")) return "greenhouse-detail";
    if (screenId.startsWith("plot")) return "plot-detail";
    return screenId;
  }
  return screenId;
}

export {
  resolveRoleFromAccount,
  getGreenhouseAssetsForRole,
  getPlotAssetsForRole,
  taskTargetForName,
  operationFields,
  assetRouteFor
};
