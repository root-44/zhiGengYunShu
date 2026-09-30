import fs from "fs";
let c = fs.readFileSync("src/main.jsx", "utf8");
const importBlock = `
import ScreenHead from "./core/ScreenHead.jsx";
import StatStrip from "./core/StatStrip.jsx";
import Panel from "./core/Panel.jsx";
import MiniPanel from "./core/MiniPanel.jsx";
import DeviceStatusTag from "./core/DeviceStatusTag.jsx";
import DeviceOpsTable from "./core/DeviceOpsTable.jsx";
import Timeline from "./core/Timeline.jsx";
import Gauge from "./core/Gauge.jsx";
import LineChart from "./core/LineChart.jsx";
import { resolveRoleFromAccount, getGreenhouseAssetsForRole, getPlotAssetsForRole, taskTargetForName, operationFields, assetRouteFor } from "./utils/helpers.js";
import { getActiveNavSectionId, matchesNavTarget } from "./data/navigation.js";`;
c = c.replace('import Icon from "./core/Icon.jsx";', 'import Icon from "./core/Icon.jsx";' + importBlock);
fs.writeFileSync("src/main.jsx", c);
console.log("Imports added");
