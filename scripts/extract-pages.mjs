import fs from "fs";

const lines = fs.readFileSync("src/main.jsx", "utf8").split("\n");

// (startLine, endLine, outputPath, isPage)
// startLine/endLine are 1-indexed
const extractions = [
  // Admin page components
  [585, 637, "src/features/admin/AdminConsole.jsx"],
  [638, 654, "src/features/admin/AdminGreenhouseManagement.jsx"],
  [655, 671, "src/features/admin/AdminPlotManagement.jsx"],
  [672, 1128, "src/features/admin/AdminDeviceManagement.jsx"],
  [1153, 1291, "src/features/admin/AdminTaskDispatchManagement.jsx"],
  [1292, 1373, "src/features/admin/AdminExperienceAudit.jsx"],
  [1374, 1453, "src/features/admin/AdminSupplyAudit.jsx"],
  [1454, 1480, "src/features/admin/AdminRelatedTasks.jsx"],
  [1481, 1529, "src/features/admin/AdminOverview.jsx"],
  [1530, 1592, "src/features/admin/AdminAssetDetail.jsx"],
  [1970, 2006, "src/features/admin/AdminAssetTable.jsx"],
  // Farmer page components
  [1864, 1882, "src/features/farmer/ScreenView.jsx"],
  [1883, 1898, "src/features/farmer/NotesScreen.jsx"],
  [1899, 1922, "src/features/farmer/DashboardScreen.jsx"],
  [1923, 1969, "src/features/farmer/AssetListScreen.jsx"],
  [2012, 2106, "src/features/farmer/DetailScreen.jsx"],
  [2107, 2134, "src/features/farmer/RelatedTasksScreen.jsx"],
  [2135, 2146, "src/features/farmer/TaskTableScreen.jsx"],
  [2147, 2171, "src/features/farmer/OperationScreen.jsx"],
  [2172, 2200, "src/features/farmer/DetectionScreen.jsx"],
  [2201, 2285, "src/features/farmer/ChatScreen.jsx"],
  [2286, 2369, "src/features/farmer/CommunityScreen.jsx"],
  [2370, 2409, "src/features/farmer/CommunityCategoryScreen.jsx"],
  [2410, 2440, "src/features/farmer/CommunityPublishScreen.jsx"],
  [2441, 2471, "src/features/farmer/CommunityHelpScreen.jsx"],
  [2472, 2537, "src/features/farmer/CommunityDetailScreen.jsx"],
  [2538, 2615, "src/features/farmer/SupplyScreen.jsx"],
  [2616, 2694, "src/features/farmer/SupplyPublishScreen.jsx"],
];

const importMap = {
  admin: `import React, { useState } from "react";
import { screens } from "../../prototypeData.js";
import { getGreenhouseAssetsForRole, getPlotAssetsForRole } from "../../utils/helpers.js";
import { greenhouseAssets, plotAssets, adminDeviceCenterDevices, adminTaskStats, adminDispatchTasks, adminExperienceReviews, adminSupplyReviews, adminGreenhouseScreen, adminPlotScreen } from "../../data/mockData.js";
import { adminNavSections } from "../../data/navigation.js";
import ScreenHead from "../../core/ScreenHead.jsx";
import StatStrip from "../../core/StatStrip.jsx";
import Panel from "../../core/Panel.jsx";
import MiniPanel from "../../core/MiniPanel.jsx";
import TaskTable from "../../core/TaskTable.jsx";
import DeviceStatusTag from "../../core/DeviceStatusTag.jsx";
import DeviceOpsTable from "../../core/DeviceOpsTable.jsx";
import LineChart from "../../core/LineChart.jsx";
import FarmThreeMap from "../three-map/FarmThreeMap.jsx";
import ScreenView from "../farmer/ScreenView.jsx";
import AssetListScreen from "../farmer/AssetListScreen.jsx";\n\n`,
  farmer: `import React, { useState } from "react";
import { screens, taskRows, historyRows } from "../../prototypeData.js";
import { taskTargetForName, operationFields, assetRouteFor } from "../../utils/helpers.js";
import { greenhouseAssets, plotAssets } from "../../data/mockData.js";
import { farmerNavSections } from "../../data/navigation.js";
import ScreenHead from "../../core/ScreenHead.jsx";
import StatStrip from "../../core/StatStrip.jsx";
import Panel from "../../core/Panel.jsx";
import MiniPanel from "../../core/MiniPanel.jsx";
import TaskTable from "../../core/TaskTable.jsx";
import HistoryTable from "../../core/HistoryTable.jsx";
import SimpleTable from "../../core/SimpleTable.jsx";
import FormGrid from "../../core/FormGrid.jsx";
import Checklist from "../../core/Checklist.jsx";
import Timeline from "../../core/Timeline.jsx";
import Gauge from "../../core/Gauge.jsx";
import LineChart from "../../core/LineChart.jsx";
import FarmThreeMap from "../three-map/FarmThreeMap.jsx";\n\n`,
};

for (const [start, end, path] of extractions) {
  const code = lines.slice(start - 1, end).join("\n");
  const role = path.includes("/admin/") ? "admin" : "farmer";
  const preamble = importMap[role];

  // Ensure directory exists
  const dir = path.split("/").slice(0, -1).join("/");
  fs.mkdirSync(dir, { recursive: true });

  fs.writeFileSync(path, preamble + "export default " + code + ";\n");
  console.log(`Created: ${path} (${end - start + 1} lines)`);
}
