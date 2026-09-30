import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile("src/main.jsx", "utf8");
const styles = await readFile("src/styles.css", "utf8");
const apiSource = await readFile("src/services/api.js", "utf8");
const lineChartSource = await readFile("src/core/LineChart.jsx", "utf8");
const scDatavDemoSource = await readFile("src/features/sc-datav/demo.tsx", "utf8");
const scDatavMapSource = await readFile("src/features/sc-datav/map/index.tsx", "utf8");
const scDatavMapSceneSource = await readFile("src/features/sc-datav/map/scene.tsx", "utf8");
const scDatavMapBaseSource = await readFile("src/features/sc-datav/map/base.tsx", "utf8");
const scDatavMapCitySource = await readFile("src/features/sc-datav/map/city.tsx", "utf8");
const scDatavMapTooltipSource = await readFile("src/features/sc-datav/map/tooltip.tsx", "utf8");
const scDatavPanelSource = await readFile("src/features/sc-datav/panel/index.tsx", "utf8");
const scDatavApiSource = await readFile("src/features/sc-datav/api.ts", "utf8");
const scDatavHeaderSource = await readFile("src/features/sc-datav/panel/headder.tsx", "utf8");
const scDatavFarmMapAdapterSource = await readFile("src/features/sc-datav/farmMapAdapter.ts", "utf8").catch(() => "");
const floatingAssistantSource = await readFile("src/core/FloatingAssistant.jsx", "utf8").catch(() => "");
const navigationSource = await readFile("src/data/navigation.js", "utf8");
const taskTableSource = await readFile("src/core/TaskTable.jsx", "utf8");
const historyTableSource = await readFile("src/core/HistoryTable.jsx", "utf8");
const sysadminOverviewSource = await readFile("src/features/sysadmin/SysadminOverview.jsx", "utf8");
const sysadminAlertLogSource = await readFile("src/features/sysadmin/AlertLogScreen.jsx", "utf8");
const farmThreeMapSource = await readFile("src/features/three-map/FarmThreeMap.jsx", "utf8");

function assertContains(name) {
  assert.match(source, new RegExp(`\\b${name}\\b`), `src/main.jsx should use ${name}`);
}

test("web pages use shared backend adapters for API response shaping", async () => {
  const adapterSource = await readFile("src/data/backendAdapters.js", "utf8");
  assert.match(source, /from "\.\/data\/backendAdapters\.js"/);
  assert.match(adapterSource, /export function mapFarmerAssetForScreen/);
  assert.match(adapterSource, /export function dashboardStatsFromWorkbench/);
  assert.doesNotMatch(source, /function mapAdminAssetForScreen\(asset = \{\}/);
});

test("web src excludes stale static admin overview backup code", async () => {
  assert.doesNotMatch(source, /OptimizedAdminOverview/);
  await assert.rejects(access("src/main.jsx.backup"));
  await assert.rejects(access("src/features/optimized-overview/OptimizedAdminOverview.jsx"));
});

test("farmer dashboard renders the scoped comprehensive big screen", () => {
  const dashboardStart = source.indexOf("function DashboardScreen");
  const assetListStart = source.indexOf("function AssetListScreen", dashboardStart);
  assert.ok(dashboardStart > -1 && assetListStart > dashboardStart, "DashboardScreen source should be found");
  const dashboardSource = source.slice(dashboardStart, assetListStart);
  assert.match(dashboardSource, /<ScDatavDemo1 scope="farmer" \/>/);
  assert.match(apiSource, /export function getFarmerDashboard/);
  assert.match(apiSource, /api\.get\("\/farmer\/dashboard"\)/);
  assert.match(scDatavApiSource, /loadFarmerFarmOverview/);
  assert.match(scDatavApiSource, /getFarmerDashboard\(\)/);
  assert.match(scDatavApiSource, /visualState\?\.highlighted === true/);
  assert.match(scDatavApiSource, /if \(!asset\) return;/);
  assert.match(scDatavApiSource, /const personalDiagnoses = attachFarmerDiagnoses/);
  assert.match(scDatavApiSource, /diagnosisRiskCount = personalDiagnoses\.filter/);
  assert.match(scDatavApiSource, /mapFallbackEnabled: false/);
  assert.match(scDatavFarmMapAdapterSource, /overview\.mapFallbackEnabled === false/);
  assert.match(scDatavApiSource, /mapAssets/);
  assert.match(scDatavApiSource, /interactiveMapAssetIds/);
  assert.match(scDatavFarmMapAdapterSource, /interactiveAssetIds/);
  assert.match(scDatavFarmMapAdapterSource, /prioritizeInteractiveAssets/);
  assert.match(scDatavFarmMapAdapterSource, /return geoRegionNames\.map/);
  assert.match(scDatavFarmMapAdapterSource, /interactive \? asset\.name : ""/);
  assert.match(scDatavMapCitySource, /if \(!interactive\) return;/);
  assert.match(scDatavMapCitySource, /\{interactive && \(/);
  assert.match(scDatavDemoSource, /scope === "farmer"/);
  assert.doesNotMatch(dashboardSource, /screen\.stats\.map/);
  assert.doesNotMatch(dashboardSource, /screen\.mapCards\.map/);
  assert.doesNotMatch(dashboardSource, /FarmThreeMap/);
  assert.doesNotMatch(farmThreeMapSource, /from "\.\.\/\.\.\/data\/mockData\.js"/);
  assert.doesNotMatch(farmThreeMapSource, /\bfarmMapAssets\b/);
});

test("admin overview renders backend farm overview instead of static dashboard metrics", () => {
  const overviewStart = source.indexOf("function AdminOverview");
  const detailStart = source.indexOf("function DetailBasicInfoPanel", overviewStart);
  assert.ok(overviewStart > -1 && detailStart > overviewStart, "AdminOverview source should be found");
  const overviewSource = source.slice(overviewStart, detailStart);

  assert.match(apiSource, /export function getAdminFarmOverview/);
  assert.match(overviewSource, /getAdminFarmOverview\(\)/);
  assert.match(overviewSource, /const \[farmOverview, setFarmOverview\] = useState\(null\)/);
  assert.match(overviewSource, /listAdminDevices\(\{ page: 1, pageSize: 200 \}\)/);
  assert.match(overviewSource, /const \[adminOverviewDevices, setAdminOverviewDevices\] = useState\(\[\]\)/);
  assert.match(overviewSource, /buildAdminOverviewTopStats\(farmOverview, adminOverviewDevices\)/);
  assert.match(overviewSource, /buildAdminOverviewDeviceStatus\(farmOverview, adminOverviewDevices\)/);
  assert.match(overviewSource, /buildAdminOverviewWeather\(farmOverview\)/);
  assert.match(overviewSource, /buildAdminOverviewAlerts\(farmOverview\)/);
  assert.match(overviewSource, /buildAdminOverviewDevicePie\(farmOverview, adminOverviewDevices\)/);
  assert.match(overviewSource, /mapAdminOverviewAssetsForMap\(farmOverview\)/);
  assert.match(overviewSource, /<FarmThreeMap[\s\S]*assets=\{adminMapAssets\}/);
  assert.doesNotMatch(overviewSource, /<FarmThreeMap role="admin" onSelectAsset=\{setSelectedAsset\} \/>/);
  assert.match(overviewSource, /farmOverview\.permanentCharts\.growthStages/);
  assert.match(overviewSource, /farmOverview\.permanentCharts\.riskOverview/);
  assert.doesNotMatch(overviewSource, /86台|79 \/ 86|26℃|12 klx|label:'传感器',value:60/);
});

test("community and supply pages are wired to the shared backend API client", () => {
  [
    "listCommunityPosts",
    "createCommunityPost",
    "favoriteCommunityPost",
    "unfavoriteCommunityPost",
    "commentCommunityPost",
    "listSupplyDemands",
    "createSupplyDemand",
  ].forEach(assertContains);
});

test("disease detection upload opens a real image picker and sends files to backend", () => {
  ["uploadFile", "createDiagnosis", "createAdminDiagnosis", "createDiagnosisReport", "createAdminDiagnosisReport"].forEach(assertContains);
  assert.match(source, /const fileInputRef = useRef\(null\)/);
  assert.match(source, /fileInputRef\.current\?\.click\(\)/);
  assert.match(source, /async function handleFileSelected/);
  assert.match(source, /type="file"/);
  assert.match(source, /accept="image\/\*"/);
  assert.match(source, /uploadFile\(file, "diagnosis"\)/);
  assert.match(source, /imageFileIds: \[uploadedFile\.id\]/);
  assert.match(source, /const createDiagnosisApi = role === "admin" \? createAdminDiagnosis : createDiagnosis/);
  assert.match(source, /const createReportApi = role === "admin" \? createAdminDiagnosisReport : createDiagnosisReport/);
  assert.match(source, /createReportApi\(detectionResult\.id\)/);
  assert.doesNotMatch(source, /setUploadedFile\(".*new Date\(\)\.toISOString/);
});

test("disease detection history loads backend diagnoses instead of static rows", () => {
  const detectionStart = source.indexOf("function DetectionScreen");
  const chatStart = source.indexOf("function ChatScreen");
  assert.ok(detectionStart > -1 && chatStart > detectionStart, "DetectionScreen source should be found");
  const detectionSource = source.slice(detectionStart, chatStart);

  ["listDiagnoses", "listAdminDiagnoses"].forEach(assertContains);
  assert.match(detectionSource, /listDiagnoses\(\{ page: 1, pageSize: 20 \}\)/);
  assert.match(detectionSource, /listAdminDiagnoses\(\{ page: 1, pageSize: 20 \}\)/);
  assert.match(detectionSource, /const \[history, setHistory\] = useState\(\[\]\)/);
  assert.match(source, /function normalizeDiagnosisHistoryRow/);
  assert.doesNotMatch(source, /const MOCK_RESULTS = \[/);
  assert.doesNotMatch(historyTableSource, /from "\.\.\/prototypeData\.js"/);
  assert.doesNotMatch(historyTableSource, /\bhistoryRows\b/);
  assert.doesNotMatch(detectionSource, /useState\(\[\s*\{\s*time: "09:10"/);
  assert.doesNotMatch(detectionSource, /result: "锈病疑似"|result: "叶斑病疑似"|result: "虫咬损伤"/);
});

test("disease detection report renders a detailed exportable report panel", () => {
  assert.match(source, /function buildDiagnosisReportDetail/);
  assert.match(source, /function buildDiagnosisReportText/);
  assert.match(source, /function downloadDiagnosisReport/);
  assert.match(source, /const \[reportDetail, setReportDetail\]/);
  assert.match(source, /Panel title=\{showReport \? "防治建议" : "识别结果"\} className="result-panel"/);
  assert.match(source, /导出报告/);
  assert.match(source, /downloadDiagnosisReport\(reportDetail\)/);
  assert.match(source, /URL\.createObjectURL/);
  assert.doesNotMatch(source, /detection-layout \$\{showReport \? "has-report" : ""\}/);
});

test("disease detection expert chat carries current diagnosis context", () => {
  assert.match(source, /function buildDiagnosisChatContext/);
  assert.match(source, /function diagnosisReportFileName\(reportDetail\)/);
  assert.match(source, /buildDiagnosisChatContext\(\{ detectionResult, uploadedFile, reportDetail \}\)/);
  assert.match(source, /onNavigate\?\.\("expert-context-chat", buildDiagnosisChatContext/);
  assert.match(source, /imageName: uploadedFile\?\.name/);
  assert.match(source, /reportSummary: reportDetail\?\.summary/);
  assert.match(source, /reportFileName: reportDetail \? diagnosisReportFileName\(reportDetail\) : ""/);
  assert.match(source, /reportText: reportDetail \? buildDiagnosisReportText\(reportDetail\) : ""/);
  assert.match(source, /\["报告文件", chatContext\?\.reportFileName \|\| "未生成报告"\]/);
  assert.match(source, /className="chat-composer-context"/);
  assert.match(source, /const contextAttachment = shouldSendContext/);
  assert.match(source, /attachment: contextAttachment/);
  assert.match(source, /className="message-attachment-card"/);
  assert.match(source, /setSentContextIds/);
  assert.doesNotMatch(source, /className="chat-context-card"/);
  assert.doesNotMatch(source, /已携带病害识别上下文/);
  assert.doesNotMatch(source, /已携带报告文件：\$\{chatContext\.reportFileName\}/);
  assert.doesNotMatch(source, /role: "farmer",\s*text: `我刚刚通过病害识别/);
});

test("expert chat uses a doubao-style layout and diagnosis history opens the matching conversation", () => {
  assert.match(source, /function diagnosisConversationId\(entry\)/);
  assert.match(source, /conversationId: diagnosisConversationId\(entry\)/);
  assert.match(source, /chatContext\?\.conversationId/);
  assert.match(source, /function handleNewConversation/);
  assert.match(source, /className="chat-shell"/);
  assert.match(source, /className="chat-sidebar"/);
  assert.match(source, /className="chat-new-button"/);
  assert.match(source, /setActiveConvId\(nextConversation\.id\)/);
  assert.match(styles, /\.chat-shell\s*\{/);
  assert.match(styles, /\.chat-sidebar\s*\{/);
  assert.match(styles, /\.chat-composer\s*\{/);
  assert.match(styles, /\.chat-composer-context\s*\{/);
  assert.match(styles, /\.message-attachment-card\s*\{/);
});

test("expert chat loads persistent backend sessions instead of bundled conversations", () => {
  const chatStart = source.indexOf("function ChatScreen");
  const chatEnd = source.indexOf("const COMMUNITY_CATEGORY_MAP", chatStart);
  assert.ok(chatStart > -1 && chatEnd > chatStart, "ChatScreen source should be found");
  const chatSource = source.slice(chatStart, chatEnd);

  ["listExpertChatSessions", "createExpertChatSession", "listExpertChatMessages", "sendExpertChatMessage"].forEach(assertContains);
  assert.match(source, /function normalizeChatSession/);
  assert.match(source, /function normalizeExpertChatMessage/);
  assert.match(chatSource, /listExpertChatSessions\(\{ page: 1, pageSize: 20 \}\)/);
  assert.match(chatSource, /pageItems\(response\)\.map\(normalizeChatSession\)/);
  assert.match(chatSource, /listExpertChatMessages\(sessionId\)/);
  assert.match(chatSource, /createExpertChatSession\(/);
  assert.match(chatSource, /sendExpertChatMessage\(targetConvId,/);
  assert.doesNotMatch(source, /const CHAT_CONVERSATIONS = \[/);
  assert.doesNotMatch(source, /const AI_REPLIES = \{/);
});

test("expert chat send path keeps context state initialized before use", () => {
  const chatStart = source.indexOf("function ChatScreen");
  const chatEnd = source.indexOf("const COMMUNITY_CATEGORY_MAP", chatStart);
  assert.ok(chatStart > -1 && chatEnd > chatStart, "ChatScreen source should be found");
  const chatSource = source.slice(chatStart, chatEnd);

  const contextItemsIndex = chatSource.indexOf("const contextItems =");
  const activeContextIdIndex = chatSource.indexOf("const activeContextId =");
  const shouldSendContextIndex = chatSource.indexOf("const shouldSendContext =");
  const sendMessageIndex = chatSource.indexOf("async function sendMessage");

  assert.ok(contextItemsIndex > -1, "contextItems should be declared");
  assert.ok(activeContextIdIndex > -1, "activeContextId should be declared");
  assert.ok(shouldSendContextIndex > -1, "shouldSendContext should be declared");
  assert.ok(sendMessageIndex > -1, "sendMessage should be declared");
  assert.ok(contextItemsIndex < sendMessageIndex, "sendMessage must not read contextItems before initialization");
  assert.ok(activeContextIdIndex < sendMessageIndex, "sendMessage must not read activeContextId before initialization");
  assert.ok(shouldSendContextIndex < sendMessageIndex, "sendMessage must not read shouldSendContext before initialization");
  assert.match(source, /function isChatPendingText/);
  assert.match(chatSource, /isChatPendingText\(msg\.text\) \? "后端暂未返回内容。"/);
  assert.match(chatSource, /updated\.add\(activeContextId\)/);
  assert.doesNotMatch(chatSource, /key=\{i\}/);
});

test("expert chat exposes visible error messages", () => {
  assert.match(source, /isError: true/);
  assert.match(source, /className=\{`message-row \$\{msg\.role\}\$\{msg\.isError \? " error" : ""\}`\}/);
  assert.match(styles, /\.message-row\.error\s*\{/);
  assert.match(styles, /\.message-row\.error span\s*\{/);
});

test("expert chat voice input uses browser speech recognition instead of demo prompts", () => {
  const chatStart = source.indexOf("function ChatScreen");
  const chatEnd = source.indexOf("const COMMUNITY_CATEGORY_MAP", chatStart);
  assert.ok(chatStart > -1 && chatEnd > chatStart, "ChatScreen source should be found");
  const chatSource = source.slice(chatStart, chatEnd);

  assert.match(chatSource, /SpeechRecognition/);
  assert.match(chatSource, /webkitSpeechRecognition/);
  assert.match(chatSource, /recognition\.start\(\)/);
  assert.doesNotMatch(chatSource, /const demos = \[/);
  assert.doesNotMatch(chatSource, /Math\.random/);
  assert.doesNotMatch(chatSource, /当前大棚湿度偏高|草莓叶片背面|今天需要给小麦补水/);
});

test("global floating AI assistant calls the backend agent chat endpoint", () => {
  assert.match(source, /import FloatingAssistant from "\.\/core\/FloatingAssistant\.jsx"/);
  assert.match(source, /<FloatingAssistant currentUser=\{currentUser\} \/>/);
  assert.match(apiSource, /export function chatWithAssistant/);
  assert.match(apiSource, /api\.post\("\/farmer\/assistant\/chat"/);
  assert.match(floatingAssistantSource, /function FloatingAssistant/);
  assert.match(floatingAssistantSource, /chatWithAssistant\(\{/);
  assert.match(floatingAssistantSource, /className="floating-assistant-trigger"/);
  assert.match(floatingAssistantSource, /className="floating-assistant-panel"/);
  assert.match(floatingAssistantSource, /className="floating-assistant-composer"/);
  assert.match(styles, /\.floating-assistant-trigger\s*\{/);
  assert.match(styles, /\.floating-assistant-panel\s*\{/);
  assert.match(styles, /\.floating-assistant-composer\s*\{/);
});

test("community pages use polished header and pass current context into expert chat", () => {
  assert.match(source, /function buildCommunityChatContext/);
  assert.match(source, /className="[^"]*forum-page-header[^"]*community-hero-header[^"]*"/);
  assert.match(source, /className="community-hero-kpis"/);
  assert.match(source, /buildCommunityChatContext\(\{ source: "help-form", form, uploaded \}\)/);
  assert.match(source, /buildCommunityChatContext\(\{ source: "experience-detail", post: detailPost \}\)/);
  assert.match(source, /chatContext\?\.context === "community"/);
  assert.match(source, /contextItems = chatContext\?\.context === "community"/);
  assert.match(styles, /\.community-hero-header\s*\{/);
  assert.match(styles, /\.community-hero-kpis\s*\{/);
});

test("community feed uses backend favorites and keeps likes local-only", () => {
  const communityStart = source.indexOf("function CommunityScreen");
  const categoryStart = source.indexOf("function CommunityCategoryScreen", communityStart);
  assert.ok(communityStart > -1 && categoryStart > communityStart, "CommunityScreen source should be found");
  const communitySource = source.slice(communityStart, categoryStart);

  assert.match(communitySource, /async function handleCollect\(postId\)/);
  assert.doesNotMatch(communitySource, /async function handleLike\(postId\)/);
  assert.doesNotMatch(communitySource, /setPosts\(\(prev\) =>[\s\S]*liked/);
  assert.doesNotMatch(communitySource, /鉂わ笍 宸茶禐|鉂わ笍 鐐硅禐/);
  assert.match(communitySource, /favoriteCommunityPost\(postId\)/);
  assert.match(communitySource, /unfavoriteCommunityPost\(postId\)/);
  assert.match(communitySource, /postScope === "favorites"/);
});

test("community detail uses backend favorite and comment flows without local like state", () => {
  const detailStart = source.indexOf("function CommunityDetailScreen");
  const supplyStart = source.indexOf("function SupplyScreen", detailStart);
  assert.ok(detailStart > -1 && supplyStart > detailStart, "CommunityDetailScreen source should be found");
  const detailSource = source.slice(detailStart, supplyStart);

  assert.doesNotMatch(detailSource, /const \[liked, setLiked\] = useState\(false\)/);
  assert.match(detailSource, /const \[collected, setCollected\] = useState\(false\)/);
  assert.match(detailSource, /function handleCollect\(\)/);
  assert.match(detailSource, /favoriteCommunityPost\(targetPostId\)/);
  assert.match(detailSource, /unfavoriteCommunityPost\(targetPostId\)/);
  assert.match(detailSource, /commentCommunityPost\(targetPostId,/);
  assert.doesNotMatch(detailSource, /function handleLike\(\)/);
  assert.doesNotMatch(detailSource, /鐐硅禐/);
});

test("supply publish page only exposes real submission actions", () => {
  const publishStart = source.indexOf("function SupplyPublishScreen");
  const end = source.indexOf("// ScreenHead imported", publishStart);
  assert.ok(publishStart > -1 && end > publishStart, "SupplyPublishScreen source should be found");
  const publishSource = source.slice(publishStart, end);

  assert.doesNotMatch(publishSource, /<button[^>]*>鏌ョ湅瀹℃牳椤?\/button>/);
  assert.doesNotMatch(publishSource, /<button[^>]*>淇濆瓨鑽夌<\/button>/);
  assert.doesNotMatch(publishSource, /<button[^>]*>绠＄悊鍛樺鏍?\/button>/);
  assert.match(publishSource, /onClick=\{handleSubmit\}/);
});

test("supply page uses polished compact header", () => {
  assert.match(source, /className="supply-page-header supply-hero-header"/);
  assert.match(source, /className="supply-hero-kpis"/);
  assert.doesNotMatch(
    source,
    /杩欓噷灞曠ず瀹℃牳閫氳繃鍚庣殑渚涢渶鍒楄〃锛屽彲鎼滅储銆佺瓫閫夊拰鏌ョ湅鑱旂郴鏂瑰紡锛涢渶瑕佹柊澧炲唴瀹规椂鍙偣鍑诲彸涓婅鍙戝竷渚涢渶銆?/
  );
  assert.match(styles, /\.supply-hero-header\s*\{/);
  assert.match(styles, /\.supply-hero-kpis\s*\{/);
});

test("disease detection page removes standalone title and emphasizes history", () => {
  const detectionStart = source.indexOf("function DetectionScreen");
  const chatStart = source.indexOf("function ChatScreen");
  assert.ok(detectionStart > -1 && chatStart > detectionStart, "DetectionScreen source should be found");
  const detectionSource = source.slice(detectionStart, chatStart);
  assert.doesNotMatch(detectionSource, /<ScreenHead title=\{screen\.title\}/);
  assert.match(detectionSource, /<Panel title="识别历史" className="history-panel">/);
  assert.match(styles, /\.history-panel h3\s*\{/);
  assert.match(styles, /font-size:\s*1\.15rem/);
  assert.match(styles, /margin-top:\s*24px/);
});

test("task list page calls backend task APIs for list and actions", () => {
  ["listTasks", "acceptTask", "submitTask", "addTaskEvidence"].forEach(assertContains);
  assert.match(source, /async function loadTasks/);
  assert.match(source, /listTasks\(\{ page: 1, pageSize: 20/);
  assert.match(source, /const nextTasks = pageItems\(response\)\.map\(normalizeTaskItem\)/);
  assert.match(source, /async function handleAcceptTask/);
  assert.match(source, /acceptTask\(taskId\)/);
  assert.match(source, /async function handleSubmitTask/);
  assert.match(source, /submitTask\(taskId,/);
  assert.match(source, /async function handleAddTaskEvidence/);
  assert.match(source, /addTaskEvidence\(taskId,/);
  assert.match(source, /<TaskTable[\s\S]*taskItems=\{tasks\}/);
  assert.doesNotMatch(source, /<TaskTable onNavigate=\{onNavigate\} \/>/);
  assert.doesNotMatch(taskTableSource, /from "\.\.\/prototypeData\.js"/);
  assert.doesNotMatch(taskTableSource, /\btaskRows\b/);
});

test("task view opens backend task detail by id instead of only guessing from title", () => {
  ["getTask"].forEach(assertContains);
  assert.match(source, /const \[selectedTaskId, setSelectedTaskId\]/);
  assert.match(source, /if \(options\.taskId\) setSelectedTaskId\(options\.taskId\)/);
  assert.match(source, /selectedTaskId=\{selectedTaskId\}/);
  assert.match(source, /function taskTargetForTask\(item, title\)/);
  assert.match(source, /targetId: taskTargetForTask\(item, title\)/);
  assert.match(source, /function useTaskDetail\(taskId\)/);
  assert.match(source, /getTask\(taskId\)/);
  assert.match(source, /<TaskDetailSummary[\s\S]*taskDetail=\{taskDetail\}/);
  assert.match(taskTableSource, /onNavigate\?\.\(task\.targetId, \{ taskId: task\.id \}\)/);
});

test("task operation logs render backend timeline instead of static local rows", () => {
  const operationStart = source.indexOf("function OperationScreen");
  const diagnosisStart = source.indexOf("function splitReportText", operationStart);
  assert.ok(operationStart > -1 && diagnosisStart > operationStart, "OperationScreen source should be found");
  const operationSource = source.slice(operationStart, diagnosisStart);

  assert.match(source, /function normalizeTaskTimelineLog/);
  assert.match(operationSource, /const \[logs, setLogs\] = useState\(\[\]\)/);
  assert.match(operationSource, /detail\.timeline\.map\(normalizeTaskTimelineLog\)/);
  assert.match(operationSource, /function applyTaskDetailResponse/);
  assert.match(operationSource, /const response = await addTaskEvidence/);
  assert.match(operationSource, /applyTaskDetailResponse\(apiItem\(response\)\)/);
  assert.match(operationSource, /function handleUploadOperationRecord/);
  assert.match(operationSource, /onClick=\{handleUploadOperationRecord\}/);
  assert.match(operationSource, /<EmptyState title="暂无操作日志"/);
  assert.doesNotMatch(operationSource, /useState\(\[\s*\{\s*time: "05-19 10:30"/);
  assert.doesNotMatch(operationSource, /"巡检上报"|数据异常触发|记录已上传至管理员/);
});

test("task action buttons are disabled when backend status cannot accept the transition", () => {
  assert.match(taskTableSource, /function normalizeTaskStatus/);
  assert.match(taskTableSource, /function canAcceptTask/);
  assert.match(taskTableSource, /function canSubmitTask/);
  assert.match(taskTableSource, /canAcceptTask\(task\.status\)/);
  assert.match(taskTableSource, /canSubmitTask\(task\.status\)/);
  assert.match(taskTableSource, /disabled=\{!canAccept\}/);
  assert.match(taskTableSource, /disabled=\{!canSubmit\}/);
  assert.match(taskTableSource, /title=\{canAccept \? "认领任务" : "只有 pending 状态可以认领"\}/);
  assert.match(taskTableSource, /title=\{canSubmit \? "提交任务结果" : "当前状态不能提交"\}/);
});

test("device pages call real backend device, alert, and command APIs", () => {
  ["listDevices", "getDevice", "issueDeviceCommand", "listDeviceAlerts", "acknowledgeAlert"].forEach(assertContains);
  assert.match(source, /function normalizeDeviceItem\(item, index = 0\)/);
  assert.match(source, /function normalizeDeviceAlert\(item, index = 0\)/);
  assert.match(source, /async function loadDevices/);
  assert.match(source, /listDevices\(\{ page: 1, pageSize: 50/);
  assert.match(source, /const nextDevices = pageItems\(response\)\.map\(normalizeDeviceItem\)/);
  assert.match(source, /async function loadDeviceAlerts/);
  assert.match(source, /listDeviceAlerts\(\{ page: 1, pageSize: 50/);
  assert.match(source, /const nextAlerts = pageItems\(response\)\.map\(normalizeDeviceAlert\)/);
  assert.match(source, /async function handleAcknowledgeAlert\(alertId\)/);
  assert.match(source, /acknowledgeAlert\(alertId\)/);
  assert.match(source, /async function handleDeviceCommand/);
  assert.match(source, /issueDeviceCommand\(deviceId,/);
  assert.match(source, /async function handleOperationCommand/);
  assert.match(source, /issueDeviceCommand\(deviceId,/);
  assert.doesNotMatch(source, /toast\("鐏屾簤鎸囦护宸蹭笅鍙戯紝璁惧鎵ц涓?/);
  assert.doesNotMatch(source, /toast\("杩滅▼閲嶅惎鎸囦护宸蹭笅鍙?/);
});

test("admin device pages use real backend device APIs instead of mock-only warnings", () => {
  ["listAdminAssets", "listAdminDevices", "getAdminDevice"].forEach(assertContains);
  assert.match(source, /function AdminDeviceManagement\(\{ apiScope = "farmer" \}\)/);
  assert.match(source, /<AdminDeviceManagement apiScope="admin" \/>/);
  assert.match(source, /const isAdminDeviceApi = apiScope === "admin"/);
  assert.match(source, /listAdminDevices\(\{ page: 1, pageSize: 50/);
  assert.match(source, /isAdminDeviceApi \? await getAdminDevice\(deviceId\) : await getDevice\(deviceId\)/);
  assert.doesNotMatch(source, /绠＄悊鍛樼鏆傛棤璁惧鎸囦护鐪熷疄鎺ュ彛/);
  assert.doesNotMatch(source, /绠＄悊鍛樼鏆傛棤璁惧璇︽儏鐪熷疄鎺ュ彛/);
  assert.doesNotMatch(source, /绠＄悊鍛樼鏆傛棤璁惧鍛婅鐪熷疄鎺ュ彛/);
});

test("admin device page matches the web3 master-detail device management experience", () => {
  ["AddDeviceModal", "createDevice", "bindDevice", "listDeviceLogs", "exportDeviceLogs"].forEach(assertContains);
  assert.match(source, /const \[deviceTab, setDeviceTab\] = useState\("detail"\)/);
  assert.match(source, /const \[commandStep, setCommandStep\] = useState\(0\)/);
  assert.match(source, /const \[filterText, setFilterText\] = useState\(""\)/);
  assert.match(source, /const \[deviceLogs, setDeviceLogs\] = useState\(\[\]\)/);
  assert.match(source, /const response = await listDeviceLogs\(\{ page: 1, pageSize: 200/);
  assert.doesNotMatch(source, /function buildMockDeviceLogs/);
  assert.doesNotMatch(source, /buildMockDeviceLogs\(\)/);
  assert.match(source, /const \[operationHistory, setOperationHistory\] = useState\(\[\]\)/);
  assert.match(source, /async function handleAddDevice\(device\)/);
  assert.match(source, /async function loadDeviceLogs/);
  assert.match(source, /async function handleExportLogs/);
  assert.match(source, /function renderRightPanel\(\)/);
  assert.match(source, /className="device-master-detail"/);
  assert.match(source, /className="device-list-panel"/);
  assert.match(source, /className="device-detail-panel"/);
  assert.match(source, /className="device-overview-hero"/);
  assert.match(source, /className="command-flow"/);
  assert.match(source, /className="binding-console-v"/);
  assert.match(source, /className="binding-hero"/);
  assert.match(source, /className="binding-workbench"/);
  assert.match(source, /className="binding-sync-card"/);
  assert.match(source, /className="binding-history-card"/);
  assert.doesNotMatch(source, /const \[deviceTab, setDeviceTab\] = useState\("ledger"\)/);
  assert.doesNotMatch(source, /function renderDeviceTabContent\(\)/);
});

test("sysadmin alert pages render backend alert data without mock fallbacks", () => {
  assert.match(apiSource, /export function listSysadminAlerts/);
  assert.match(apiSource, /api\.get\("\/sysadmin\/alerts"/);
  assert.match(apiSource, /export function resolveSysadminAlert/);
  assert.match(sysadminOverviewSource, /listSysadminAlerts\(\{ page: 1, pageSize: 100/);
  assert.match(sysadminOverviewSource, /resolveSysadminAlert\(alertId\)/);
  assert.doesNotMatch(sysadminOverviewSource, /status: "resolved", resolveTime: now/);
  assert.doesNotMatch(sysadminOverviewSource, /宸插厛鍦ㄩ〉闈㈠唴鏍囪/);
  assert.doesNotMatch(sysadminOverviewSource, /from "\.\.\/\.\.\/data\/mockData\.js"/);
  assert.doesNotMatch(sysadminOverviewSource, /fallbackAlertLogs|sysadminAlertLogs/);
  assert.match(sysadminAlertLogSource, /listSysadminAlerts\(\{ page: 1, pageSize: 100/);
  assert.doesNotMatch(sysadminAlertLogSource, /from "\.\.\/\.\.\/data\/mockData\.js"/);
  assert.doesNotMatch(sysadminAlertLogSource, /sysadminAlertLogs/);
});

test("smart farm inspection and anomaly task actions are recorded through task APIs", () => {
  assert.match(source, /async function handleInspectionEvidence/);
  assert.match(source, /async function handleGrowthAnomalyEvidence/);
  assert.match(source, /async function handleGrowthAnomalySubmit/);
  assert.match(source, /addTaskEvidence\(targetTaskId,/);
  assert.match(source, /submitTask\(targetTaskId,/);
  assert.match(source, /"记录温湿度": \(\) => \{ handleInspectionEvidence\("记录温湿度"\); \}/);
  assert.match(source, /"拍摄现场照片": \(\) => \{ handleInspectionEvidence\("拍摄现场照片"\); \}/);
  assert.match(source, /"复核设备状态": \(\) => \{ handleInspectionEvidence\("复核设备状态"\); \}/);
  assert.match(source, /"提交巡检结果": \(\) => \{ setStatus\("done"\); handleInspectionEvidence\("提交巡检结果"\); \}/);
  assert.match(source, /"复核作物长势": \(\) => \{ handleGrowthAnomalyEvidence\("复核作物长势"\); \}/);
  assert.match(source, /"补充历史图片": \(\) => \{ handleGrowthAnomalyEvidence\("补充历史图片"\); \}/);
  assert.match(source, /"记录异常原因": \(\) => \{ handleGrowthAnomalyEvidence\("记录异常原因"\); \}/);
  assert.match(source, /"提交异常结论": \(\) => \{ setStatus\("done"\); handleGrowthAnomalySubmit\(\); \}/);
  assert.match(source, /"复核病害图片": \(\) => \{ handleDiseaseDetectionEvidence\("复核病害图片"\); \}/);
  assert.match(source, /"上传处置照片": \(\) => \{ handleDiseaseDetectionEvidence\("上传处置照片"\); \}/);
  assert.match(source, /"记录防治措施": \(\) => \{ handleDiseaseDetectionEvidence\("记录防治措施"\); \}/);
  assert.match(source, /"提交检测结果": \(\) => \{ setStatus\("done"\); handleDiseaseDetectionSubmit\(\); \}/);
  assert.doesNotMatch(source, /handleOperationCommand\("check_power"/);
  assert.doesNotMatch(source, /handleOperationCommand\("check_network"/);
  assert.doesNotMatch(source, /handleOperationCommand\("self_check_sensor"/);
  assert.doesNotMatch(source, /handleOperationCommand\("restart", "閲嶅惎璁惧"/);
});

test("task routes are limited to the four smart-farm task types", () => {
  assert.match(source, /"irrigation-task"/);
  assert.match(source, /"inspection-task"/);
  assert.match(source, /"growth-anomaly-task"/);
  assert.match(source, /"disease-detection-task"/);
  assert.match(source, /if \(/);
  assert.match(source, /growth_anomaly/);
  assert.match(source, /disease_detection/);
  assert.doesNotMatch(source, /"device-check"/);
  assert.doesNotMatch(source, /"fertilization-task"/);
  assert.doesNotMatch(source, /handleFertilizationEvidence/);
  assert.doesNotMatch(source, /handleFertilizationSubmit/);
});

test("first batch pages no longer rely only on fake success toasts", () => {
  assert.doesNotMatch(source, /toast\("缁忛獙宸插彂甯?/);
  assert.doesNotMatch(source, /toast\("姹傚姪宸插彂甯冨埌浜ゆ祦鍖?/);
  assert.doesNotMatch(source, /toast\("宸叉彁浜ゅ鏍?/);
});

test("community and supply payloads use backend asset ids", () => {
  assert.match(source, /"大棚 A-01": "asset-greenhouse-a01"/);
  assert.match(source, /"地块 P-07": "asset-plot-p07"/);
  assert.doesNotMatch(source, /assetId: "greenhouse-a01"/);
});

test("community publish forms use backend assets for association choices", () => {
  const publishStart = source.indexOf("function CommunityPublishScreen");
  const helpStart = source.indexOf("function CommunityHelpScreen", publishStart);
  const detailStart = source.indexOf("function CommunityDetailScreen", helpStart);
  assert.ok(publishStart > -1 && helpStart > publishStart, "CommunityPublishScreen source should be found");
  assert.ok(detailStart > helpStart, "CommunityHelpScreen source should be found");
  const publishSource = source.slice(publishStart, helpStart);
  const helpSource = source.slice(helpStart, detailStart);

  assert.match(source, /function normalizeCommunityAssetOption/);
  [publishSource, helpSource].forEach((formSource) => {
    assert.match(formSource, /const \[communityAssets, setCommunityAssets\] = useState\(\[\]\)/);
    assert.match(formSource, /listAssets\(\{ page: 1, pageSize: 200 \}\)/);
    assert.match(formSource, /pageItems\(response\)\.map\(normalizeCommunityAssetOption\)/);
    assert.match(formSource, /communityAssets\.map\(\(asset\) =>/);
    assert.match(formSource, /assetId: selectedAsset\.id/);
    assert.doesNotMatch(formSource, /ASSET_ID_BY_AREA\[form\.area\]/);
  });
});

test("community page exposes a mine filter for posts waiting audit", () => {
  assert.match(source, /我的发布/);
  assert.match(source, /mine: true/);
});

test("community actions keep backend favorites and no local like state", () => {
  const communityStart = source.indexOf("function CommunityScreen");
  const categoryStart = source.indexOf("function CommunityCategoryScreen", communityStart);
  assert.ok(communityStart > -1 && categoryStart > communityStart, "CommunityScreen source should be found");
  const communitySource = source.slice(communityStart, categoryStart);

  assert.match(communitySource, /async function handleCollect\(postId\)/);
  assert.match(communitySource, /favoriteCommunityPost\(postId\)/);
  assert.match(communitySource, /unfavoriteCommunityPost\(postId\)/);
  assert.doesNotMatch(communitySource, /function handleLike\(postId\)/);
  assert.doesNotMatch(communitySource, /post\.liked/);
  assert.doesNotMatch(communitySource, /post\.likes/);
});

test("community favorite button switches to a collected-posts view", () => {
  assert.match(source, /postScope === "favorites"/);
  assert.match(source, /setPostScope\("favorites"\)/);
  assert.match(source, /posts\.filter\(\(post\) => collectedIds\.has\(post\.id\)\)/);
  assert.doesNotMatch(source, /onClick=\{\(\) => toast\(`宸叉敹钘?`/);
});

test("farmer community page keeps backend data while using the new experience layout", () => {
  const communityStart = source.indexOf("function CommunityScreen");
  const categoryStart = source.indexOf("function CommunityCategoryScreen", communityStart);
  assert.ok(communityStart > -1 && categoryStart > communityStart, "CommunityScreen source should be found");
  const communitySource = source.slice(communityStart, categoryStart);

  [
    "community-experience-shell",
    "community-experience-main",
    "community-experience-sidebar",
    "community-experience-grid",
    "community-category-entry",
  ].forEach((className) => assert.match(communitySource, new RegExp(className)));
  assert.match(communitySource, /listCommunityPosts\(\{ page: 1, pageSize: 20, \.\.\.params \}\)/);
  assert.match(communitySource, /pageItems\(response\)\.map\(normalizeCommunityPost\)/);
  assert.match(communitySource, /loadPosts\(\{ mine: true \}\)/);
  assert.match(communitySource, /onNavigate\?\.\("community-detail", \{ postId: post\.id \}\)/);
  assert.doesNotMatch(communitySource, /const communityPosts = \[/);
});

test("farmer community page lets posts scroll while the right sidebar stays sticky", () => {
  assert.doesNotMatch(styles, /\.workspace:has\(\.community-experience-shell\)\s*\{[^}]*overflow:\s*hidden/);
  assert.doesNotMatch(styles, /\.community-experience-shell\s*\{[^}]*overflow:\s*hidden/);
  assert.doesNotMatch(styles, /\.community-experience-main\s*\{[^}]*overflow-y:\s*auto/);
  assert.match(styles, /\.community-experience-sidebar\s*\{[^}]*position:\s*sticky[\s\S]*top:\s*20px/);
});

test("community all-posts view keeps real audit visibility rules", () => {
  assert.doesNotMatch(source, /shouldMergeMinePosts/);
  assert.doesNotMatch(source, /mergePostsById\(publicItems, mineItems\)/);
});

test("community runtime pages render backend posts and details instead of demo arrays", () => {
  const communityStart = source.indexOf("function CommunityScreen");
  const categoryStart = source.indexOf("function CommunityCategoryScreen", communityStart);
  const detailStart = source.indexOf("function CommunityDetailScreen");
  const supplyStart = source.indexOf("function SupplyScreen", detailStart);
  assert.ok(communityStart > -1 && categoryStart > communityStart, "CommunityScreen source should be found");
  assert.ok(detailStart > -1 && supplyStart > detailStart, "CommunityDetailScreen source should be found");
  const communitySource = source.slice(communityStart, categoryStart);
  const detailSource = source.slice(detailStart, supplyStart);

  assert.match(apiSource, /export function getCommunityPost/);
  assert.match(apiSource, /api\.get\(`\/farmer\/community\/posts\/\$\{postId\}`\)/);
  assert.match(source, /getCommunityPost\(postId\)/);
  assert.match(communitySource, /const \[posts, setPosts\] = useState\(\[\]\)/);
  assert.match(communitySource, /setCommunityStats\(buildCommunityStats\(apiItem\(response\)\?\.stats\)\)/);
  assert.doesNotMatch(source, /const communityPosts = \[/);
  assert.doesNotMatch(source, /const HOT_TOPICS = \[/);
  assert.doesNotMatch(source, /const CATEGORY_POSTS = \[/);
  assert.doesNotMatch(communitySource, /useState\(communityPosts\)/);
  assert.doesNotMatch(detailSource, /postId \|\| communityPosts\[0\]\?\.id/);
  assert.doesNotMatch(detailSource, /鍙戝竷浜猴細鏉庡洓|澶勭悊鍓嶅悗鍥剧墖|鑽夎帗绾㈢啛鏈熷彾鏂戠梾澶勭悊缁忛獙/);
});

test("admin experience audit page uses real backend community audit APIs", () => {
  const auditStart = source.indexOf("function AdminExperienceAudit");
  const supplyStart = source.indexOf("function AdminSupplyAudit", auditStart);
  assert.ok(auditStart > -1 && supplyStart > auditStart, "AdminExperienceAudit source should be found");
  const auditSource = source.slice(auditStart, supplyStart);

  ["listAdminCommunityPosts", "auditCommunityPost"].forEach(assertContains);
  assert.match(source, /async function loadAdminCommunityPosts/);
  assert.match(source, /listAdminCommunityPosts\(\)/);
  assert.match(source, /const nextPosts = pageItems\(response\)[\s\S]*\.map\(normalizeAdminCommunityPost\)/);
  assert.match(source, /async function handleAuditCommunityPost\(action\)/);
  assert.match(source, /auditCommunityPost\(post\.id,/);
  assert.match(source, /action,\s*remark: auditRemark\.trim\(\)/);
  assert.match(source, /function buildAdminCommunityAuditStats/);
  assert.match(auditSource, /const auditStats = buildAdminCommunityAuditStats\(posts\)/);
  assert.match(auditSource, /<StatStrip stats=\{auditStats\} \/>/);
  assert.doesNotMatch(auditSource, /<StatStrip stats=\{\[\["寰呭鏍稿笘瀛?, "2"/);
  assert.doesNotMatch(auditSource, /"鏂拌瘎璁?, "3"|"涓炬姤", "1"|"浠婃棩閫氳繃", "8"/);
  assert.doesNotMatch(source, /<button type="button" onClick=\{\(\) => \{\}\}>閫氳繃缁忛獙<\/button>/);
  assert.doesNotMatch(source, /<button className="danger-button" type="button" onClick=\{\(\) => \{\}\}>椹冲洖鍐呭<\/button>/);
});

test("admin experience audit does not clip the pending post list", () => {
  const auditStart = source.indexOf("function AdminExperienceAudit");
  const supplyStart = source.indexOf("function AdminSupplyAudit", auditStart);
  assert.ok(auditStart > -1 && supplyStart > auditStart, "AdminExperienceAudit source should be found");
  const auditSource = source.slice(auditStart, supplyStart);
  assert.match(auditSource, /admin-experience-audit-page/);
  assert.match(auditSource, /admin-experience-audit-canvas/);
  assert.match(styles, /\.community-layout\.admin-review-layout\s*\{[\s\S]*grid-template-columns:\s*minmax\(0,\s*1fr\)\s*320px/);
  assert.doesNotMatch(styles, /\.admin-experience-audit-page\s*\{[^}]*overflow:\s*hidden/);
  assert.doesNotMatch(styles, /\.admin-experience-audit-canvas\s*\{[^}]*height:\s*calc\(100vh - 152px\)/);
  assert.doesNotMatch(styles, /\.admin-experience-audit-canvas\s*\{[^}]*overflow:\s*hidden/);
  assert.doesNotMatch(styles, /\.community-layout\.admin-review-layout\s*>\s*\.community-feed\s*\{[^}]*overflow-y:\s*auto/);
  assert.match(styles, /\.community-layout\.admin-review-layout\s*>\s*\.audit-dynamics-panel\s*\{[\s\S]*position:\s*static/);
  assert.match(styles, /\.community-layout\.admin-review-layout\s*>\s*\.audit-dynamics-panel\s*\{[\s\S]*max-height:\s*100%/);
  assert.match(styles, /@media \(max-width:\s*1180px\)[\s\S]*\.admin-experience-audit-page\s*\{[\s\S]*height:\s*auto/);
  assert.match(styles, /@media \(max-width:\s*1180px\)[\s\S]*\.community-layout\.admin-review-layout\s*>\s*\.audit-dynamics-panel\s*\{[\s\S]*position:\s*static/);
});

test("supply hall filter buttons call the backend with real query scopes", () => {
  const supplyStart = source.indexOf("function SupplyScreen");
  const publishStart = source.indexOf("function SupplyPublishScreen", supplyStart);
  assert.ok(supplyStart > -1 && publishStart > supplyStart, "SupplyScreen source should be found");
  const supplySource = source.slice(supplyStart, publishStart);

  assert.match(apiSource, /export function getSupplyDemand/);
  assert.match(apiSource, /api\.get\(`\/farmer\/supply-demands\/\$\{itemId\}`\)/);
  assert.match(source, /const \[supplyScope, setSupplyScope\]/);
  assert.match(supplySource, /const \[rows, setRows\] = useState\(\[\]\)/);
  assert.match(source, /const supplyFilters = \[/);
  assert.match(source, /label: "我的发布"/);
  assert.match(source, /loadSupplyDemands\(filter\.params\)/);
  assert.match(source, /setSupplyScope\(filter\.key\)/);
  assert.match(source, /mine: true/);
  assert.match(source, /auditStatus: "pending"/);
  assert.match(source, /auditStatus: "approved"/);
  assert.match(source, /supplyScope === filter\.key \? "active" : ""/);
  assert.match(supplySource, /const \[supplyStatusCards, setSupplyStatusCards\]/);
  assert.match(supplySource, /buildSupplyHallStatusCards\(apiItem\(response\)\?\.stats\)/);
  assert.match(supplySource, /supplyStatusCards\.map/);
  assert.doesNotMatch(source, /const supplyRows = \[/);
  assert.doesNotMatch(supplySource, /useState\(supplyRows\)/);
  assert.doesNotMatch(supplySource, /\["鍙戝竷涓?, "3", "姝ｅ湪瀵瑰灞曠ず"\]/);
});

test("supply hall area search uses backend assets and passes asset ids", () => {
  const supplyStart = source.indexOf("function SupplyScreen");
  const publishStart = source.indexOf("function SupplyPublishScreen", supplyStart);
  assert.ok(supplyStart > -1 && publishStart > supplyStart, "SupplyScreen source should be found");
  const supplySource = source.slice(supplyStart, publishStart);

  assert.match(supplySource, /const \[supplySearch, setSupplySearch\]/);
  assert.match(supplySource, /const \[supplyAssets, setSupplyAssets\] = useState\(\[\]\)/);
  assert.match(supplySource, /listAssets\(\{ page: 1, pageSize: 200 \}\)/);
  assert.match(supplySource, /pageItems\(assetResponse\)\.map\(normalizeSupplyHallAssetOption\)/);
  assert.match(supplySource, /assetId: supplySearch\.assetId/);
  assert.match(supplySource, /supplyAssets\.map\(\(asset\) =>/);
  assert.doesNotMatch(supplySource, /\["閺堫剙鍟橀崷?, "婢堆勵棢 A-01", "閸︽澘娼?P-07"\]/);
});

test("supply publish page summarizes the farmer's backend supply items", () => {
  const publishStart = source.indexOf("function SupplyPublishScreen");
  const end = source.indexOf("// ScreenHead imported", publishStart);
  assert.ok(publishStart > -1 && end > publishStart, "SupplyPublishScreen source should be found");
  const publishSource = source.slice(publishStart, end);

  assert.match(publishSource, /const \[supplySummary, setSupplySummary\]/);
  assert.match(publishSource, /listSupplyDemands\(\{ page: 1, pageSize: 20, mine: true \}\)/);
  assert.match(publishSource, /buildSupplyPublishSummary\(pageItems\(response\), apiItem\(response\)\?\.stats\)/);
  assert.match(publishSource, /supplySummary\.statusCards\.map/);
  assert.match(publishSource, /supplySummary\.latest/);
  assert.doesNotMatch(publishSource, /鑽夎帗閲囨敹鏈熶复鏃剁敤宸ラ渶姹?/
  );
  assert.doesNotMatch(publishSource, /\["鑽夌", "2", "鏈彁浜?"\]/);
});

test("supply publish page uses backend assets for association choices", () => {
  const publishStart = source.indexOf("function SupplyPublishScreen");
  const end = source.indexOf("// ScreenHead imported", publishStart);
  assert.ok(publishStart > -1 && end > publishStart, "SupplyPublishScreen source should be found");
  const publishSource = source.slice(publishStart, end);

  assert.match(source, /function normalizeSupplyPublishAssetOption/);
  assert.match(publishSource, /const \[supplyAssets, setSupplyAssets\] = useState\(\[\]\)/);
  assert.match(publishSource, /listAssets\(\{ page: 1, pageSize: 200 \}\)/);
  assert.match(publishSource, /pageItems\(assetResponse\)\.map\(normalizeSupplyPublishAssetOption\)/);
  assert.match(publishSource, /supplyAssets\.map\(\(asset\) =>/);
  assert.match(publishSource, /assetId: selectedAsset\.id/);
  assert.doesNotMatch(publishSource, /region: "澶ф A-01"/);
  assert.doesNotMatch(publishSource, /assetId: "asset-greenhouse-a01"/);
  assert.doesNotMatch(publishSource, /ASSET_ID_BY_AREA\[form\.region\]/);
});

test("admin production navigation opens tasks from assets instead of a standalone dispatch entry", () => {
  const mainNavStart = source.indexOf("const adminNavSections = [");
  const mainNavEnd = source.indexOf("function getStatusColor", mainNavStart);
  assert.ok(mainNavStart > -1 && mainNavEnd > mainNavStart, "main admin nav block should exist");
  const mainAdminNav = source.slice(mainNavStart, mainNavEnd);
  assert.doesNotMatch(mainAdminNav, /targetId:\s*"admin-task-dispatch"/);
  assert.doesNotMatch(mainAdminNav, /matches:\s*\["admin-task-dispatch"\]/);
  assert.doesNotMatch(source, /"admin-task-dispatch":\s*"\/admin\/tasks"/);
  assert.doesNotMatch(source, /if \(activeId === "admin-task-dispatch"\)/);

  const dataNavStart = navigationSource.indexOf("const adminNavSections = [");
  const dataNavEnd = navigationSource.indexOf("function getActiveNavSectionId", dataNavStart);
  assert.ok(dataNavStart > -1 && dataNavEnd > dataNavStart, "data admin nav block should exist");
  const dataAdminNav = navigationSource.slice(dataNavStart, dataNavEnd);
  assert.doesNotMatch(dataAdminNav, /targetId:\s*"admin-task-dispatch"/);
  assert.doesNotMatch(dataAdminNav, /matches:\s*\["admin-task-dispatch"\]/);
});

test("admin asset task pages query backend tasks by asset id", () => {
  assert.match(source, /const assetId = resolveAssetBackendId\(asset\)/);
  assert.match(source, /<RelatedTasksScreen[\s\S]*assetId=\{assetId\}/);
  assert.doesNotMatch(source, /<RelatedTasksScreen[\s\S]*readonly[\s\S]*assetId=\{assetId\}/);
  assert.match(source, /<AdminConsole[\s\S]*selectedTaskId=\{selectedTaskId\}/);
  assert.match(source, /if \(options\.taskId\) setSelectedTaskId\(options\.taskId\)/);
  assert.match(source, /<ScreenView[\s\S]*selectedTaskId=\{selectedTaskId\}/);
  assert.match(source, /function RelatedTasksScreen\(\{[\s\S]*assetId[\s\S]*\}\)/);
  assert.match(source, /apiScope === "admin" && assetId/);
  assert.match(source, /listTasks\(\{ assetId, page: 1, pageSize: 50 \}\)/);
  assert.match(source, /\}, \[apiScope, assetId, assetName, isPlot\]\)/);
});

test("admin greenhouse and plot lists use backend owned assets before querying tasks or devices", () => {
  assert.match(source, /if \(scope === "admin"\) \{/);
  assert.match(source, /listAdminAssets\(\{\s*type: isGreenhouse \? "greenhouse" : "plot",\s*page: 1,\s*pageSize: 200,/);
  assert.match(source, /assetPageItems\(response\)\.map\(\(asset\) => mapAdminAssetForScreen\(asset, isGreenhouse\)\)/);
  assert.match(source, /setTotalTaskCount\(totals\.tasks\)/);
  assert.match(source, /setOnlineDeviceCount\(totals\.online\)/);
  assert.match(source, /const assetListStats = \[/);
  assert.match(source, /\{assetListStats\.map\(\(\[label, value, note\], i\) =>/);
  assert.doesNotMatch(source, /scope === "admin" && screen\.stats \? screen\.stats/);
  assert.doesNotMatch(source, /if \(scope === "admin"\) \{\s*const assets = screen\.assets \|\| \[\];/);
});

test("admin asset list shows farmer owner and removes region column", async () => {
  const adapterSource = await readFile("src/data/backendAdapters.js", "utf8");
  const assetTableStart = source.indexOf("function AdminAssetTable");
  const detailStart = source.indexOf("function DetailScreen", assetTableStart);
  assert.ok(assetTableStart > -1 && detailStart > assetTableStart, "AdminAssetTable source should be found");
  const tableSource = source.slice(assetTableStart, detailStart);
  assert.match(tableSource, /const columns = \["名称", "类型", "作物\/阶段", "负责人", "设备", "状态", "告警", "今日任务", "操作"\]/);
  assert.doesNotMatch(tableSource, /"区域"/);
  assert.doesNotMatch(tableSource, /parseAssetInfo\(asset\.name\)/);
  assert.doesNotMatch(tableSource, /<td>\{info\.region\}<\/td>/);
  assert.match(adapterSource, /owner: asset\.ownerName \|\| "未分配"/);
  assert.doesNotMatch(adapterSource, /owner: asset\.ownerName \|\| "农场管理员"/);
});

test("greenhouse asset type labels include greenhouse variants", async () => {
  const adapterSource = await readFile("src/data/backendAdapters.js", "utf8");
  assert.match(adapterSource, /function greenhouseTypeLabel\(asset = \{\}\)/);
  assert.match(adapterSource, /日光温室/);
  assert.match(adapterSource, /连栋棚/);
  assert.match(adapterSource, /育苗棚/);
  assert.match(adapterSource, /typeLabel: type === "greenhouse" \? greenhouseTypeLabel\(asset\) : "地块"/);
});

test("farmer greenhouse and plot lists use backend asset list endpoint", () => {
  const assetStart = source.indexOf("function AssetListScreen");
  const detailStart = source.indexOf("function DetailScreen", assetStart);
  assert.ok(assetStart > -1 && detailStart > assetStart, "AssetListScreen source should be found");
  const assetSource = source.slice(assetStart, detailStart);
  assert.match(source, /listAssets/);
  assert.match(assetSource, /listAssets\(\{\s*type: isGreenhouse \? "greenhouse" : "plot",\s*page: 1,\s*pageSize: 200,/);
  assert.match(assetSource, /mapFarmerAssetForScreen\(asset, isGreenhouse \? "greenhouse" : "plot"\)/);
  assert.doesNotMatch(assetSource, /getCurrentUser\(\)/);
  assert.doesNotMatch(assetSource, /listDevices\(\{ page: 1, pageSize: 200 \}\)/);
});

test("admin asset detail loads live device telemetry and uploads growth images", () => {
  ["listAdminGrowthRecords", "createAdminGrowthRecord", "getAdminAssetDiseaseStatistics"].forEach(assertContains);
  assert.match(source, /const growthFileInputRef = useRef\(null\)/);
  assert.match(source, /const \[environmentControls, setEnvironmentControls\]/);
  assert.match(source, /const assetId = resolveAssetBackendId\(asset\)/);
  assert.match(source, /const \[assetDevices, setAssetDevices\]/);
  assert.match(source, /const \[selectedGrowthStage, setSelectedGrowthStage\]/);
  assert.match(source, /const \[growthRecords, setGrowthRecords\]/);
  assert.match(source, /const \[diseaseStatistics, setDiseaseStatistics\]/);
  assert.match(source, /listAdminDevices\(\{ assetId, page: 1, pageSize: 50 \}\)/);
  assert.match(source, /const nextDevices = pageItems\(response\)/);
  assert.match(source, /setAssetDevices\(nextDevices\)/);
  assert.match(source, /buildEnvironmentControlsFromDevices\(nextDevices\)/);
  assert.doesNotMatch(source, /fallbackEnvironmentControls/);
  assert.match(source, /issueDeviceCommand\(irrigationDevice\.id,/);
  assert.match(source, /getAdminAssetDiseaseStatistics\(assetId\)/);
  assert.match(source, /<PieChart[\s\S]*data=\{diseasePieData\}/);
  assert.match(source, /listAdminGrowthRecords\(assetId/);
  assert.match(source, /async function handleGrowthImageSelected/);
  assert.match(source, /uploadFile\(file, "growth-record"\)/);
  assert.match(source, /createAdminGrowthRecord\(assetId,/);
  assert.match(source, /setSelectedGrowthStage\(stage\.key\)/);
  assert.match(source, /stage: uploadGrowthStage/);
  assert.match(source, /apiItem\(response\)/);
  assert.match(source, /type="file"/);
  assert.match(source, /accept="image\/\*"/);
  assert.match(source, /growthFileInputRef\.current\?\.click\(\)/);
  assert.doesNotMatch(source, /const growthRecords = isPlot \?/);
  assert.doesNotMatch(source, /\(isPlot \? \[0\] : \[0, 1, 2, 3\]\)\.map/);
  assert.doesNotMatch(source, /const diseaseRows = \[/);
  assert.match(styles, /\.growth-record-panel\s*\{/);
  assert.match(styles, /\.growth-detail-stack\s*\{/);
  assert.match(styles, /\.asset-detail-hero\s*\{/);
  assert.match(styles, /\.growth-record-toolbar\s*\{/);
  assert.match(styles, /\.disease-pie-card\s*\{/);
});

test("farmer asset detail mirrors the admin detail panels with farmer-scoped data", () => {
  const detailStart = source.indexOf("function DetailScreen");
  const relatedStart = source.indexOf("function RelatedTasksScreen", detailStart);
  assert.ok(detailStart > -1 && relatedStart > detailStart, "farmer DetailScreen source should be found");
  const detailSource = source.slice(detailStart, relatedStart);

  assert.match(detailSource, /listTasks\(\{ assetId: backendAssetId, page: 1, pageSize: 5 \}\)/);
  assert.doesNotMatch(detailSource, /listTasks\(\{ page: 1, pageSize: 50 \}\)/);
  assert.match(detailSource, /const \[diseaseStatistics, setDiseaseStatistics\]/);
  assert.match(detailSource, /const normalizedDiseaseStatistics = normalizeDiseaseStatistics\(diseaseStatistics\)/);
  assert.match(detailSource, /getAssetDiseaseStatistics\(backendAssetId\)/);
  assert.match(detailSource, /<PieChart[\s\S]*data=\{diseasePieData\}/);
  assert.match(detailSource, /className="disease-pie-card"/);
  assert.match(detailSource, /className="disease-latest-summary"/);
  assert.match(detailSource, /<GrowthRecordPanel/);
  assert.match(detailSource, /<AssetTrendPanel assetId=\{backendAssetId\} apiScope="farmer" large \/>/);
  assert.doesNotMatch(detailSource, /绾规灟鐥厊鏅氱柅鐥厊浜曞唸闇夌礌|闇滆劜閿伴攲/);
});

test("farmer asset detail refuses prototype-only assets and renders backend detail data", () => {
  const detailStart = source.indexOf("function DetailScreen");
  const relatedStart = source.indexOf("function RelatedTasksScreen", detailStart);
  assert.ok(detailStart > -1 && relatedStart > detailStart, "DetailScreen source should be found");
  const detailSource = source.slice(detailStart, relatedStart);
  assert.match(detailSource, /getAssetDetail\(backendAssetId\)/);
  assert.match(detailSource, /<EmptyState title="缺少资产 ID"/);
  assert.doesNotMatch(detailSource, /const displayCrop = backendCrop \|\| assetCrop/);
  assert.doesNotMatch(detailSource, /草莓 \/ 结果期|小麦 \/ 分蘗期/);
});

test("admin sc-datav big screen uses GeoJSON 3D map visual with smart farm asset data", () => {
  assert.match(apiSource, /export function getAdminFarmOverview/);
  assert.match(apiSource, /api\.get\("\/admin\/dashboard\/farm-overview"\)/);
  assert.match(scDatavApiSource, /loadAdminFarmOverview/);
  assert.match(scDatavDemoSource, /loadAdminFarmOverview\(\)/);
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
  assert.match(scDatavPanelSource, /悬浮区域图表/);
  assert.match(scDatavPanelSource, /生长状态分布/);
  assert.match(scDatavPanelSource, /四类任务结构/);
  assert.match(scDatavPanelSource, /activeAsset/);
  assert.match(scDatavHeaderSource, /智慧农业综合大屏/);
  assert.doesNotMatch(
    scDatavDemoSource + scDatavMapSource + scDatavMapBaseSource + scDatavMapCitySource + scDatavMapTooltipSource + scDatavPanelSource + scDatavApiSource + scDatavHeaderSource,
    /cityData|鍥涘窛鐪佹櫤鎱у煄甯倈SICHUAN/
  );
});

test("asset growth records render automatic model and calendar detection details", () => {
  assert.match(source, /const GROWTH_STAGE_OPTIONS_BY_CROP/);
  assert.match(source, /const GROWTH_STAGE_ALIASES_BY_CROP/);
  assert.match(source, /function growthStageOptionsForCrop/);
  assert.match(source, /function growthStageKeyForCrop/);
  assert.match(source, /function growthStageKeyForRecord/);
  assert.match(source, /function growthStageLabel/);
  assert.match(source, /function mergeGrowthStageOptions/);
  assert.match(source, /const visibleGrowthRecords = selectedGrowthStage === "all"[\s\S]*growthStageKeyForRecord\(record, cropName\) === selectedGrowthStage/);
  assert.match(source, /const hasGrowthRecords = growthRecords\.length > 0/);
  assert.match(source, /const hasVisibleGrowthRecords = visibleGrowthRecords\.length > 0/);
  assert.match(source, /stage\.key/);
  assert.match(source, /growthStageLabel\(record\.stage, cropName\)/);
  assert.doesNotMatch(source, /const growthStageLabels = \["鑲茶嫍鏈?, "瀹氭鏈?, "寮€鑺辨湡", "缁撴灉鏈?, "閲囨敹鏈?\]/);
  assert.doesNotMatch(source, /useState\(isPlot \? "瀹氭鏈? : "缁撴灉鏈?\)/);
  assert.match(source, /detection: item\.detection \|\| null/);
  assert.match(source, /function formatDetectionConfidence/);
  assert.match(source, /function detectionDecisionLabel/);
  assert.match(source, /record\.detection\.modelStage/);
  assert.match(source, /record\.detection\.calendarStage/);
  assert.match(source, /record\.detection\.decisionStage/);
  assert.match(source, /record\.detection\.agentAnalysis/);
  assert.match(source, /fileUrl:\s*absoluteApiUrl\(/);
  assert.match(source, /item\.detection\?\.imageUrl/);
  assert.match(source, /const growthPhotoRecords = visibleGrowthRecords\.filter\(\(record\) => record\.fileUrl\)/);
  assert.match(source, /const \[activeGrowthDetectionRecord, setActiveGrowthDetectionRecord\] = useState\(null\)/);
  assert.match(source, /className="growth-detection-summary"/);
  assert.match(source, /setActiveGrowthDetectionRecord\(record\)/);
  assert.match(source, /className="growth-detection-dialog-backdrop"/);
  assert.match(source, /role="dialog"/);
  assert.match(source, /className="growth-detection-dialog-card"/);
  assert.match(source, /const activeGrowthDetectionImageUrl = activeGrowthDetectionRecord\?\.fileUrl \|\| activeGrowthDetection\?\.imageUrl \|\| ""/);
  assert.match(source, /className="growth-detection-dialog-image"/);
  assert.match(source, /src=\{activeGrowthDetectionImageUrl\}/);
  assert.match(styles, /\.growth-detection-badge\s*\{/);
  assert.match(styles, /\.growth-detection-detail\s*\{/);
  assert.match(styles, /\.growth-detection-summary\s*\{/);
  assert.match(styles, /\.growth-detection-dialog-backdrop\s*\{/);
  assert.match(styles, /position:\s*fixed/);
  assert.match(styles, /\.growth-detection-dialog-card\s*\{/);
  assert.match(styles, /\.growth-detection-dialog-image\s*\{/);
  assert.match(styles, /\.growth-detection-dialog-image img\s*\{/);
  assert.match(styles, /\.growth-record-scroll\s*\{/);
  assert.match(styles, /max-height:\s*clamp\(360px,\s*48vh,\s*620px\)/);
});

test("asset environment trend panel presents richer historical charts", () => {
  assert.match(source, /const TREND_METRIC_CONFIG/);
  assert.match(source, /function buildTrendMetricCards/);
  assert.match(source, /function buildTrendStabilityItems/);
  assert.match(source, /function buildTrendDistributionItems/);
  assert.match(source, /metricKeys: "temperature,humidity,soilMoisture"/);
  assert.match(source, /className="environment-trend-summary-grid"/);
  assert.match(source, /className="environment-trend-chart-layout"/);
  assert.match(source, /className="[^"]*trend-stability-card/);
  assert.match(source, /className="[^"]*trend-distribution-card/);
  assert.match(source, /className="trend-insight-list"/);
  assert.match(lineChartSource, /humidity:\s*\{/);
  assert.match(lineChartSource, /strokeDasharray/);
  assert.match(styles, /\.environment-trend-summary-grid\s*\{/);
  assert.match(styles, /\.trend-metric-card\s*\{/);
  assert.match(styles, /\.environment-trend-chart-layout\s*\{/);
  assert.match(styles, /\.trend-side-card\s*\{/);
  assert.match(styles, /\.trend-mini-bar-fill\s*\{/);
  assert.match(styles, /\.trend-distribution-ring\s*\{/);
});

test("all smart farm fallback assets resolve backend ids for growth record loading", () => {
  assert.match(source, /"大棚 A-02": "asset-greenhouse-a02"/);
  assert.match(source, /"大棚 B-01": "asset-greenhouse-a03"/);
  assert.match(source, /"大棚 B-03": "asset-greenhouse-a04"/);
  assert.match(source, /"草莓棚 C-03": "asset-greenhouse-c03"/);
  assert.match(source, /"地块 A-01": "asset-plot-p01"/);
  assert.match(source, /"地块 A-02": "asset-plot-p02"/);
  assert.match(source, /"地块 B-01": "asset-plot-p03"/);
  assert.match(source, /"地块 B-03": "asset-plot-p04"/);
  assert.match(source, /"地块 P-08": "asset-plot-p08"/);
  assert.match(source, /"南区小麦地块": "asset-plot-p14"/);
});

test("desktop app shell scrolls only the workspace while sidebar stays in place", () => {
  assert.match(styles, /@media \(min-width:\s*1181px\)\s*\{[\s\S]*html,\s*body,\s*#root\s*\{[\s\S]*height:\s*100%/);
  assert.match(styles, /@media \(min-width:\s*1181px\)\s*\{[\s\S]*html,\s*body\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(styles, /@media \(min-width:\s*1181px\)\s*\{[\s\S]*\.app-shell\s*\{[\s\S]*overflow:\s*hidden/);
  assert.match(styles, /@media \(min-width:\s*1181px\)\s*\{[\s\S]*\.workspace\s*\{[\s\S]*height:\s*100vh[\s\S]*overflow-y:\s*auto/);
  assert.match(styles, /\.app-nav\s*\{[^}]*position:\s*sticky/);
  assert.doesNotMatch(styles, /\.app-nav\s*\{[^}]*position:\s*fixed/);
});
