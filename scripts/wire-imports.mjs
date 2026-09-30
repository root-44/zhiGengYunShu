import fs from "fs";

const content = fs.readFileSync("src/main.jsx", "utf8");

// List of functions/data to remove (they exist as extracted modules)
const toRemove = [
  "iconPaths",
  "farmerNavSections",
  "adminNavSections",
  "greenhouseAssets",
  "plotAssets",
  "adminDeviceCenterDevices",
  "adminTaskStats",
  "adminDispatchTasks",
  "adminExperienceReviews",
  "adminSupplyReviews",
  "farmMapAssets",
  "adminGreenhouseScreen",
  "adminPlotScreen",
  "taskTargetsByName",
  // Helper functions
  "resolveRoleFromAccount",
  "getGreenhouseAssetsForRole",
  "getPlotAssetsForRole",
  "taskTargetForName",
  "operationFields",
  "assetRouteFor",
  "getActiveNavSectionId",
  "matchesNavTarget",
  // Core UI components
  "Icon",
  "ScreenHead",
  "StatStrip",
  "Panel",
  "MiniPanel",
  "TaskTable",
  "HistoryTable",
  "SimpleTable",
  "FormGrid",
  "Checklist",
  "Timeline",
  "Gauge",
  "LineChart",
  "DeviceStatusTag",
  "DeviceOpsTable",
  // Layouts
  "FarmerSidebar",
  "ProfileModal",
  // Auth
  "AuthShell",
  "LoginScreen",
  "RegisterScreen",
  // 3D Map
  "FarmThreeMap",
];

// Find function/const definition boundaries
// This properly tracks brace depth including JSX braces
function findDefinitionEnd(content, startIdx) {
  let braceDepth = 0;
  let started = false;
  // Track JSX expression context
  let inJSX = false;
  let inString = false;
  let stringChar = '';

  for (let i = startIdx; i < content.length; i++) {
    const ch = content[i];
    const prev = i > 0 ? content[i - 1] : '';

    // String handling
    if (!inString && (ch === '"' || ch === "'" || ch === '`')) {
      inString = true;
      stringChar = ch;
    } else if (inString && ch === stringChar && prev !== '\\') {
      inString = false;
    }

    if (inString) continue;

    // Track JSX context: JSX starts with < and ends with >
    // But we mainly care about braces inside JSX expressions like {foo}
    // For brace counting purposes, we just count ALL braces outside strings

    if (ch === '{') {
      braceDepth++;
      started = true;
    } else if (ch === '}') {
      braceDepth--;
    }

    if (started && braceDepth === 0) {
      return i + 1;
    }
  }
  return content.length;
}

let modified = content;

// Process each removal
for (const name of toRemove) {
  // Try function definition first
  let pattern = `function ${name}(`;
  let idx = modified.indexOf(pattern);
  let isConst = false;

  if (idx === -1) {
    // Try const definition
    pattern = `const ${name} =`;
    idx = modified.indexOf(pattern);
    isConst = true;
  }

  if (idx === -1) {
    console.log(`NOT FOUND: ${name}`);
    continue;
  }

  // Backtrack to start of line
  while (idx > 0 && modified[idx - 1] !== '\n') {
    idx--;
  }

  // Find end
  const endIdx = findDefinitionEnd(modified, idx);

  // Get the removed code for logging
  const removed = modified.slice(idx, endIdx).trim();
  const firstLine = removed.split('\n')[0];

  // Replace with comment
  const comment = `// ${name} → ${isConst ? 'imported' : 'extracted module'}`;
  modified = modified.slice(0, idx) + comment + modified.slice(endIdx);

  console.log(`Removed: ${name} (${removed.length} chars, ends with ${removed.slice(-20).trim()})`);
}

// Add imports after the existing imports
const importBlock = `
// ===== Extracted Module Imports =====
import iconPaths from "./data/icons.js";
import { farmerNavSections, adminNavSections } from "./data/navigation.js";
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
// ======================================
`;

modified = modified.replace('import "./styles.css";', 'import "./styles.css";' + importBlock);

// Clean up double blank lines and remove comment-only lines that are empty
modified = modified.replace(/\n{3,}/g, '\n\n');
modified = modified.replace(/^\/\/ [\w]+ → .+\n\n\/\/ [\w]+ → .+/gm, (match) => match.replace(/\n\n/g, '\n'));

fs.writeFileSync("src/main.jsx", modified);
console.log("\nDone! main.jsx now imports from extracted modules.");
console.log(`Original size: ${content.length}, New size: ${modified.length}`);
