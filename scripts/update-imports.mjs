import fs from "fs";

let content = fs.readFileSync("src/main.jsx", "utf8");

// Remove inline data definitions
const removePatterns = [
  [/const iconPaths = \{[\s\S]*?\};/, "// iconPaths → data/icons.js"],
  [/const farmerNavSections = \[[\s\S]*?\];/, "// farmerNavSections → data/navigation.js"],
  [/const adminNavSections = \[[\s\S]*?\];/, "// adminNavSections → data/navigation.js"],
  [/const greenhouseAssets = \[[\s\S]*?\];/, "// greenhouseAssets → data/mockData.js"],
  [/const plotAssets = \[[\s\S]*?\];/, "// plotAssets → data/mockData.js"],
  [/const adminDeviceCenterDevices = \[[\s\S]*?\];/, "// adminDeviceCenterDevices → data/mockData.js"],
  [/const adminTaskStats = \[[\s\S]*?\];/, "// adminTaskStats → data/mockData.js"],
  [/const adminDispatchTasks = \[[\s\S]*?\];/, "// adminDispatchTasks → data/mockData.js"],
  [/const adminExperienceReviews = \[[\s\S]*?\];/, "// adminExperienceReviews → data/mockData.js"],
  [/const adminSupplyReviews = \[[\s\S]*?\];/, "// adminSupplyReviews → data/mockData.js"],
  [/const farmMapAssets = \[[\s\S]*?\];/, "// farmMapAssets → data/mockData.js"],
  [/const adminGreenhouseScreen = \{[\s\S]*?\};/, "// adminGreenhouseScreen → data/mockData.js"],
  [/const adminPlotScreen = \{[\s\S]*?\};/, "// adminPlotScreen → data/mockData.js"],
  [/const taskTargetsByName = \{[\s\S]*?\};/, "// taskTargetsByName → utils/helpers.js"],
  // UI components
  [/^function Icon\([\s\S]*?\n\}/m, "// Icon → core/Icon.jsx"],
  [/^function ScreenHead\([\s\S]*?\n\}/m, "// ScreenHead → core/ScreenHead.jsx"],
  [/^function StatStrip\([\s\S]*?\n\}/m, "// StatStrip → core/StatStrip.jsx"],
  [/^function Panel\([\s\S]*?\n\}/m, "// Panel → core/Panel.jsx"],
  [/^function MiniPanel\([\s\S]*?\n\}/m, "// MiniPanel → core/MiniPanel.jsx"],
  [/^function TaskTable\([\s\S]*?\n\}/m, "// TaskTable → core/TaskTable.jsx"],
  [/^function HistoryTable\([\s\S]*?\n\}/m, "// HistoryTable → core/HistoryTable.jsx"],
  [/^function SimpleTable\([\s\S]*?\n\}/m, "// SimpleTable → core/SimpleTable.jsx"],
  [/^function FormGrid\([\s\S]*?\n\}/m, "// FormGrid → core/FormGrid.jsx"],
  [/^function Checklist\([\s\S]*?\n\}/m, "// Checklist → core/Checklist.jsx"],
  [/^function Timeline\([\s\S]*?\n\}/m, "// Timeline → core/Timeline.jsx"],
  [/^function Gauge\([\s\S]*?\n\}/m, "// Gauge → core/Gauge.jsx"],
  [/^function LineChart\([\s\S]*?\n\}/m, "// LineChart → core/LineChart.jsx"],
  [/^function DeviceStatusTag\([\s\S]*?\n\}/m, "// DeviceStatusTag → core/DeviceStatusTag.jsx"],
  [/^function DeviceOpsTable\([\s\S]*?\n\}/m, "// DeviceOpsTable → core/DeviceOpsTable.jsx"],
  // Layouts
  [/^function FarmerSidebar\([\s\S]*?\n\}/m, "// FarmerSidebar → layouts/FarmerSidebar.jsx"],
  [/^function ProfileModal\([\s\S]*?\n\}/m, "// ProfileModal → layouts/ProfileModal.jsx"],
  // Auth
  [/^function AuthShell\([\s\S]*?\n\}/m, "// AuthShell → features/auth/AuthShell.jsx"],
  [/^function LoginScreen\([\s\S]*?\n\}/m, "// LoginScreen → features/auth/LoginScreen.jsx"],
  [/^function RegisterScreen\([\s\S]*?\n\}/m, "// RegisterScreen → features/auth/RegisterScreen.jsx"],
  // 3D Map
  [/^function FarmThreeMap\([\s\S]*?\n\}/m, "// FarmThreeMap → features/three-map/FarmThreeMap.jsx"],
  // Utils
  [/^function resolveRoleFromAccount\([\s\S]*?\n\}/m, "// resolveRoleFromAccount → utils/helpers.js"],
  [/^function getGreenhouseAssetsForRole\([\s\S]*?\n\}/m, "// getGreenhouseAssetsForRole → utils/helpers.js"],
  [/^function getPlotAssetsForRole\([\s\S]*?\n\}/m, "// getPlotAssetsForRole → utils/helpers.js"],
  [/^function taskTargetForName\([\s\S]*?\n\}/m, "// taskTargetForName → utils/helpers.js"],
  [/^function operationFields\([\s\S]*?\n\}/m, "// operationFields → utils/helpers.js"],
  [/^function assetRouteFor\([\s\S]*?\n\}/m, "// assetRouteFor → utils/helpers.js"],
  [/^function getActiveNavSectionId\([\s\S]*?\n\}/m, "// getActiveNavSectionId → data/navigation.js"],
  [/^function matchesNavTarget\([\s\S]*?\n\}/m, "// matchesNavTarget → data/navigation.js"],
];

for (const [pattern, replacement] of removePatterns) {
  content = content.replace(pattern, replacement);
}

const importBlock = `
// ---- Extracted Module Imports ----
import iconPaths from "./data/icons.js";
import { farmerNavSections, adminNavSections, getActiveNavSectionId, matchesNavTarget } from "./data/navigation.js";
import { greenhouseAssets, plotAssets, adminDeviceCenterDevices, adminTaskStats, adminDispatchTasks, adminExperienceReviews, adminSupplyReviews, farmMapAssets, adminGreenhouseScreen, adminPlotScreen } from "./data/mockData.js";
import { resolveRoleFromAccount, getGreenhouseAssetsForRole, getPlotAssetsForRole, taskTargetForName, operationFields, assetRouteFor } from "./utils/helpers.js";
import Icon from "./core/Icon.jsx";
import ScreenHead from "./core/ScreenHead.jsx";
import StatStrip from "./core/StatStrip.jsx";
import Panel from "./core/Panel.jsx";
import MiniPanel from "./core/MiniPanel.jsx";
import TaskTable from "./core/TaskTable.jsx";
import HistoryTable from "./core/HistoryTable.jsx";
import SimpleTable from "./core/SimpleTable.jsx";
import FormGrid from "./core/FormGrid.jsx";
import Checklist from "./core/Checklist.jsx";
import Timeline from "./core/Timeline.jsx";
import Gauge from "./core/Gauge.jsx";
import LineChart from "./core/LineChart.jsx";
import DeviceStatusTag from "./core/DeviceStatusTag.jsx";
import DeviceOpsTable from "./core/DeviceOpsTable.jsx";
import FarmerSidebar from "./layouts/FarmerSidebar.jsx";
import ProfileModal from "./layouts/ProfileModal.jsx";
import AuthShell from "./features/auth/AuthShell.jsx";
import FarmThreeMap from "./features/three-map/FarmThreeMap.jsx";
// ----------------------------------------`;

content = content.replace('import "./styles.css";', 'import "./styles.css";' + importBlock);

fs.writeFileSync("src/main.jsx", content);
console.log("Done: main.jsx updated with module imports");
