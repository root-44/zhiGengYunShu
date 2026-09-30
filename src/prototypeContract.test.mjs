import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";
import { screens } from "./prototypeData.js";

const mainSource = await readFile(new URL("./main.jsx", import.meta.url), "utf8");
const styles = await readFile(new URL("./styles.css", import.meta.url), "utf8");
const apiSource = await readFile(new URL("./services/api.js", import.meta.url), "utf8");
const prototypeDataSource = await readFile(new URL("./prototypeData.js", import.meta.url), "utf8");
const helpersSource = await readFile(new URL("./utils/helpers.js", import.meta.url), "utf8");
const scDatavDemoSource = await readFile(new URL("./features/sc-datav/demo.tsx", import.meta.url), "utf8");
const scDatavApiSource = await readFile(new URL("./features/sc-datav/api.ts", import.meta.url), "utf8");
const scDatavMapSource = await readFile(new URL("./features/sc-datav/map/index.tsx", import.meta.url), "utf8");
const scDatavMapSceneSource = await readFile(new URL("./features/sc-datav/map/scene.tsx", import.meta.url), "utf8");
const scDatavMapBaseSource = await readFile(new URL("./features/sc-datav/map/base.tsx", import.meta.url), "utf8");
const scDatavMapCitySource = await readFile(new URL("./features/sc-datav/map/city.tsx", import.meta.url), "utf8");
const scDatavMapTooltipSource = await readFile(new URL("./features/sc-datav/map/tooltip.tsx", import.meta.url), "utf8");
const scDatavPanelSource = await readFile(new URL("./features/sc-datav/panel/index.tsx", import.meta.url), "utf8");
const scDatavHeaderSource = await readFile(new URL("./features/sc-datav/panel/headder.tsx", import.meta.url), "utf8");
const scDatavFarmMapAdapterSource = await readFile(new URL("./features/sc-datav/farmMapAdapter.ts", import.meta.url), "utf8").catch(() => "");

test("farmer product UI keeps the current route hierarchy", () => {
  assert.deepEqual(
    screens.map((screen) => screen.id),
    [
      "notes",
      "dashboard",
      "greenhouse-list",
      "greenhouse-detail",
      "greenhouse-tasks",
      "plot-list",
      "plot-detail",
      "plot-tasks",
      "tasks",
      "irrigation-task",
      "inspection-task",
      "growth-anomaly-task",
      "disease-detection-task",
      "disease-detection",
      "disease-report",
      "expert-context-chat",
      "expert-direct-chat",
      "community",
      "community-category-disease",
      "community-category-irrigation",
      "community-category-fertilization",
      "community-category-greenhouse",
      "community-category-device",
      "community-publish",
      "community-help",
      "community-detail",
      "supply-demand",
      "supply-publish",
    ]
  );
});

test("task routes are limited to the four smart agriculture task types", () => {
  const operationScreens = screens.filter((screen) => screen.layout === "operation");
  assert.deepEqual(operationScreens.map((screen) => screen.id), [
    "irrigation-task",
    "inspection-task",
    "growth-anomaly-task",
    "disease-detection-task",
  ]);
  assert.deepEqual(operationScreens.map((screen) => screen.operation), [
    "irrigation",
    "inspection",
    "growth_anomaly",
    "disease_detection",
  ]);
  assert.doesNotMatch(mainSource + prototypeDataSource, /"device-check"|"fertilization-task"/);
});

test("front-end demo data uses wheat and strawberry instead of legacy crops", () => {
  const productionDemoSources = [mainSource, prototypeDataSource].join("\n");
  assert.match(productionDemoSources, /草莓/);
  assert.match(productionDemoSources, /小麦/);
  assert.doesNotMatch(productionDemoSources, /番茄|水稻|玉米/);
});

test("runtime app imports only route metadata from prototype data", () => {
  assert.match(mainSource, /import \{ screens \} from "\.\/prototypeData\.js"/);
  assert.doesNotMatch(mainSource, /historyRows|taskRows/);
  assert.doesNotMatch(mainSource, /from "\.\/data\/mockData\.js"/);
  assert.doesNotMatch(helpersSource, /from "\.\.\/data\/mockData\.js"/);
  assert.doesNotMatch(prototypeDataSource, /export const taskRows|export const historyRows/);
});

test("runtime source tree does not keep stale mock data fixtures", async () => {
  await assert.rejects(access(new URL("./data/mockData.js", import.meta.url)));
});

test("main app keeps the current componentized console shell", () => {
  [
    /import AuthShell/,
    /import FarmThreeMap/,
    /import FarmerSidebar/,
    /import ProfileModal/,
    /import ScDatavDemo1/,
    /resolveRoleFromAccount/,
    /getGreenhouseAssetsForRole/,
    /getPlotAssetsForRole/,
    /openSectionIds/,
    /adminOpenSectionIds/,
    /isProfileOpen/,
    /<ScreenView screen=\{activeScreen\}/,
    /function ScreenView/,
    /function DetailScreen/,
    /function RelatedTasksScreen/,
    /function CommunityDetailScreen/,
    /className="chat-shell"/,
  ].forEach((pattern) => assert.match(mainSource, pattern));

  assert.match(mainSource, /authBootstrapped/);
  assert.match(mainSource, /bootstrapAuth\(\)/);
  assert.match(mainSource, /getCurrentUser\(\)/);
  assert.match(mainSource, /localStorage\.setItem\("user", JSON\.stringify\(user\)\)/);

  [
    /\.dashboard-layout/,
    /\.asset-layout/,
    /\.detail-layout/,
    /\.related-layout/,
    /\.tasks-layout/,
    /\.operation-layout/,
    /\.detection-layout/,
    /\.chat-shell/,
    /\.community-layout/,
    /\.supply-layout/,
  ].forEach((pattern) => assert.match(styles, pattern));
});

test("admin smart farm big screen keeps GeoJSON 3D map visual while using farm assets", () => {
  assert.match(apiSource, /export function getAdminFarmOverview/);
  assert.match(apiSource, /api\.get\("\/admin\/dashboard\/farm-overview"\)/);
  assert.match(apiSource, /export function getFarmerDashboard/);
  assert.match(apiSource, /api\.get\("\/farmer\/dashboard"\)/);
  assert.match(scDatavApiSource, /loadAdminFarmOverview/);
  assert.match(scDatavApiSource, /loadFarmerFarmOverview/);
  assert.match(scDatavApiSource, /visualState\?\.highlighted === true/);
  assert.match(scDatavApiSource, /if \(!asset\) return;/);
  assert.match(scDatavApiSource, /diagnosisRiskCount = personalDiagnoses\.filter/);
  assert.match(scDatavApiSource, /mapFallbackEnabled: false/);
  assert.match(scDatavApiSource, /mapAssets/);
  assert.match(scDatavApiSource, /interactiveMapAssetIds/);
  assert.match(scDatavFarmMapAdapterSource, /interactiveAssetIds/);
  assert.match(scDatavFarmMapAdapterSource, /prioritizeInteractiveAssets/);
  assert.match(scDatavFarmMapAdapterSource, /return geoRegionNames\.map/);
  assert.match(scDatavFarmMapAdapterSource, /interactive \? asset\.name : ""/);
  assert.match(scDatavMapCitySource, /if \(!interactive\) return;/);
  assert.match(scDatavMapCitySource, /\{interactive && \(/);
  assert.match(scDatavDemoSource, /loadAdminFarmOverview\(\)/);
  assert.match(scDatavDemoSource, /loadFarmerFarmOverview\(\)/);
  assert.match(mainSource, /<ScDatavDemo1 scope="farmer" \/>/);
  assert.match(scDatavDemoSource, /fallbackFarmOverview/);
  assert.match(scDatavMapSource, /from "\.\/scene"/);
  assert.match(scDatavMapSource, /<Scene[\s\S]*overview=\{overview\}/);
  assert.doesNotMatch(scDatavMapSource, /FarmScene/);
  assert.match(scDatavMapSceneSource, /sc\.json/);
  assert.match(scDatavMapSceneSource, /sc_outline\.json/);
  assert.match(scDatavMapBaseSource, /mapFarmAssetsToGeoRegions/);
  assert.match(scDatavFarmMapAdapterSource, /FarmAssetOverview/);
  assert.match(scDatavFarmMapAdapterSource, /geoRegionName/);
  assert.match(scDatavMapCitySource, /assetId/);
  assert.match(scDatavMapCitySource, /onHoverAsset/);
  assert.match(scDatavMapCitySource, /onSelectAsset/);
  assert.doesNotMatch(scDatavMapCitySource, /cityData|population|gdp|city:/);
  assert.doesNotMatch(scDatavMapTooltipSource, /population|gdp|area|GDP/);
  assert.match(scDatavPanelSource, /生长状态分布/);
  assert.match(scDatavPanelSource, /四类任务结构/);
  assert.match(scDatavPanelSource, /悬浮区域图表/);
  assert.match(scDatavPanelSource, /WeatherForecastPanel/);
  assert.match(scDatavPanelSource, /天气预报/);
  assert.match(scDatavPanelSource, /overview\.permanentCharts\.weather/);
  assert.match(scDatavPanelSource, /WeatherForecastChart/);
  assert.match(scDatavHeaderSource, /智慧农业综合大屏/);
  assert.doesNotMatch(
    scDatavDemoSource + scDatavMapSource + scDatavMapBaseSource + scDatavMapCitySource + scDatavMapTooltipSource + scDatavPanelSource + scDatavApiSource + scDatavHeaderSource,
    /cityData|四川省智慧城市|SICHUAN/
  );
});

test("asset detail renders automatic growth detection evidence", () => {
  assert.match(apiSource, /listAdminGrowthRecords/);
  assert.match(apiSource, /createAdminGrowthRecord/);
  assert.match(mainSource, /detection: item\.detection \|\| null/);
  assert.match(mainSource, /function formatDetectionConfidence/);
  assert.match(mainSource, /function detectionDecisionLabel/);
  assert.match(mainSource, /record\.detection\.modelStage/);
  assert.match(mainSource, /record\.detection\.calendarStage/);
  assert.match(mainSource, /record\.detection\.decisionStage/);
  assert.match(mainSource, /record\.detection\.agentAnalysis/);
  assert.match(styles, /\.growth-detection-badge/);
  assert.match(styles, /\.growth-detection-detail/);
});

test("community and supply runtime data comes from backend while fixtures keep smart farm crops", () => {
  assert.match(mainSource, /搜索草莓叶斑病、小麦灌溉、大棚湿度、设备离线等经验/);
  assert.match(apiSource, /getCommunityPost/);
  assert.match(apiSource, /getSupplyDemand/);
  assert.doesNotMatch(mainSource, /const communityPosts = \[/);
  assert.doesNotMatch(mainSource, /const supplyRows = \[/);
  assert.doesNotMatch(mainSource, /草莓红熟期叶斑病处理经验/);
  assert.match(mainSource, /buildSupplyPublishSummary/);
  assert.match(mainSource, /listSupplyDemands\(\{ page: 1, pageSize: 20, mine: true \}\)/);
  assert.doesNotMatch(mainSource, /草莓采收期临时用工需求/);
});

test("dev server wrapper bypasses Vite net use spawn in restricted Windows shells", async () => {
  const packageJson = JSON.parse(await readFile(new URL("../package.json", import.meta.url), "utf8"));
  const { createViteNetUseSafeExec } = await import("../scripts/vite-dev-safe.mjs");

  let spawned = false;
  const safeExec = createViteNetUseSafeExec(() => {
    spawned = true;
    throw new Error("net use should not spawn in this test");
  });

  const result = await new Promise((resolve, reject) => {
    const child = safeExec("net use", (error, stdout, stderr) => {
      if (error) reject(error);
      resolve({ child, stdout, stderr });
    });
  });

  assert.equal(spawned, false);
  assert.equal(result.stdout, "");
  assert.equal(result.stderr, "");
  assert.equal(typeof result.child.kill, "function");
  assert.match(packageJson.scripts.dev, /vite-dev-safe\.mjs/);
  assert.match(packageJson.scripts.preview, /vite-dev-safe\.mjs preview/);
});

test("dev server wrapper makes Vite skip Windows net use realpath optimization", async () => {
  const originalNodeVersion = Object.getOwnPropertyDescriptor(process.versions, "node");
  const { installViteWindowsRealpathBypass, VITE_REALPATH_BYPASS_NODE_VERSION } = await import("../scripts/vite-dev-safe.mjs");

  try {
    installViteWindowsRealpathBypass();
    if (process.platform === "win32") {
      assert.equal(process.versions.node, VITE_REALPATH_BYPASS_NODE_VERSION);
    }
  } finally {
    Object.defineProperty(process.versions, "node", originalNodeVersion);
  }
});

test("auth bootstrap restores cached sessions before falling back to login", () => {
  assert.match(mainSource, /function buildCurrentUser/);
  assert.match(mainSource, /function readStoredCurrentUser/);
  assert.match(mainSource, /function clearStoredAuth/);
  assert.match(mainSource, /const \[currentUser, setCurrentUser\] = useState\(null\)/);
  assert.match(mainSource, /const hasStoredAuth = Boolean\(accessToken \|\| refreshToken\)/);
  assert.match(mainSource, /if \(cachedUser && hasStoredAuth\)/);
  assert.match(mainSource, /clearStoredAuth\(\)/);
});

test("admin overview renders backend weather forecast and light green theme", () => {
  const overviewStart = mainSource.indexOf("function AdminOverview");
  const detailStart = mainSource.indexOf("function DetailBasicInfoPanel", overviewStart);
  assert.ok(overviewStart > -1 && detailStart > overviewStart, "AdminOverview source should be found");
  const overviewSource = mainSource.slice(overviewStart, detailStart);

  assert.match(mainSource, /function buildAdminOverviewWeather/);
  assert.match(overviewSource, /const weatherData = buildAdminOverviewWeather\(farmOverview\)/);
  assert.match(overviewSource, /Panel title="天气预报"/);
  assert.match(overviewSource, /weatherData\.forecastRows\.map/);
  assert.match(overviewSource, /weatherData\.updatedAt/);
  assert.doesNotMatch(overviewSource, /Panel title="环境实时监测"/);
  assert.match(styles, /admin-overview light-green override/);
  assert.match(styles, /#edf7f0/);
  assert.match(styles, /#3b7f50/);
});
