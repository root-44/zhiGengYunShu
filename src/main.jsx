import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import * as THREE from "three";
import { screens } from "./prototypeData.js";
import "./styles.css";
import { ToastContainer, toast } from "./core/Toast.jsx";
import { ConfirmContainer, confirm } from "./core/ConfirmDialog.jsx";
import Loading from "./core/Loading.jsx";
import EmptyState from "./core/EmptyState.jsx";
import ErrorFallback from "./core/ErrorFallback.jsx";

/* ── 经验交流分类配图 ── */
import imgDisease from "./assets/community/病虫害.png";
import imgIrrigation from "./assets/community/灌溉.png";
import imgFertilization from "./assets/community/施肥.png";
import imgGreenhouse from "./assets/community/大棚.png";
import imgDevice from "./assets/community/设备.png";
import imgOther from "./assets/community/其他.png";

const COMMUNITY_CATEGORY_IMAGE = {
  disease: imgDisease,
  irrigation: imgIrrigation,
  fertilization: imgFertilization,
  greenhouse: imgGreenhouse,
  device: imgDevice,
  other: imgOther,
};
import iconPaths from "./data/icons.js";
import {
  apiItem,
  mapAdminAssetForScreen,
  mapFarmerAssetForScreen,
  pageItems,
} from "./data/backendAdapters.js";
import Icon from "./core/Icon.jsx";
import ScreenHead from "./core/ScreenHead.jsx";
import StatStrip from "./core/StatStrip.jsx";
import Panel from "./core/Panel.jsx";
import MiniPanel from "./core/MiniPanel.jsx";
import DeviceStatusTag from "./core/DeviceStatusTag.jsx";
import DeviceOpsTable from "./core/DeviceOpsTable.jsx";
import SimpleTable from "./core/SimpleTable.jsx";
import FormGrid from "./core/FormGrid.jsx";
import Checklist from "./core/Checklist.jsx";
import Timeline from "./core/Timeline.jsx";
import Gauge from "./core/Gauge.jsx";
import LineChart from "./core/LineChart.jsx";
import PieChart from "./components/PieChart.jsx";
import TaskTable from "./core/TaskTable.jsx";
import HistoryTable from "./core/HistoryTable.jsx";
import AuthShell from "./features/auth/AuthShell.jsx";
import FarmThreeMap from "./features/three-map/FarmThreeMap.jsx";
import FarmerSidebar from "./layouts/FarmerSidebar.jsx";
import ProfileModal from "./layouts/ProfileModal.jsx";
import FloatingAssistant from "./core/FloatingAssistant.jsx";
import AddDeviceModal from "./core/AddDeviceModal.jsx";
import ScDatavDemo1 from "./features/sc-datav/index.tsx";
import { resolveRoleFromAccount, getGreenhouseAssetsForRole, getPlotAssetsForRole, taskTargetForName, operationFields } from "./utils/helpers.js";
import { getActiveNavSectionId, matchesNavTarget, sysadminNavSections } from "./data/navigation.js";
import SysadminOverview from "./features/sysadmin/SysadminOverview.jsx";
import {
  acceptTask,
  addTaskEvidence,
  auditCommunityPost,
  auditSupplyDemand,
  bindDevice,
  commentCommunityPost,
  createExpertChatSession,
  createAdminDiagnosis,
  createAdminDiagnosisReport,
  createAdminGrowthRecord,
  createDevice,
  createDiagnosis,
  createDiagnosisReport,
  createGrowthRecord,
  createCommunityPost,
  createSupplyDemand,
  deleteAdminDevice,
  favoriteCommunityPost,
  getAssetDetail,
  getAssetMetrics,
  getAssetThresholds,
  getAdminFarmOverview,
  getCommunityPost,
  getCurrentUser,
  getAdminAssetDiseaseStatistics,
  getAdminAssetMetrics,
  getAdminAssetThresholds,
  getAssetDiseaseStatistics,
  getTask,
  getDevice,
  getAdminDevice,
  issueDeviceCommand,
  listAdminAssetTasks,
  listAdminAssets,
  listAdminCommunityPosts,
  listAdminDiagnoses,
  listAdminDevices,
  listAdminGrowthRecords,
  listAdminSupplyDemands,
  listAssets,
  listDeviceAlerts,
  listDeviceLogs,
  listCommunityPosts,
  listDiagnoses,
  listDevices,
  listExpertChatMessages,
  listExpertChatSessions,
  listGrowthRecords,
  getSupplyDemand,
  listSupplyDemands,
  listTasks,
  acknowledgeAlert,
  sendExpertChatMessage,
  submitTask,
  streamAssistantChat,
  unfavoriteCommunityPost,
  updateAdminAssetThreshold,
  updateAssetThreshold,
  uploadFile,
} from "./services/api.js";

const farmerNavSections = [
  {
    id: "dashboard-nav",
    label: "综合大屏",
    description: "个人监测",
    short: "屏",
    icon: "grid",
    targetId: "dashboard",
    matches: ["dashboard"]
  },
  {
    id: "farm-production",
    label: "农事生产",
    description: "大棚管理与地块管理",
    short: "农",
    icon: "greenhouse",
    defaultTargetId: "greenhouse-list",
    matches: [
      "greenhouse-list",
      "greenhouse-detail",
      "greenhouse-tasks",
      "plot-list",
      "plot-detail",
      "plot-tasks"
    ],
    children: [
      {
        label: "大棚管理",
        short: "棚",
        targetId: "greenhouse-list",
        matches: ["greenhouse-list", "greenhouse-detail", "greenhouse-tasks"]
      },
      {
        label: "地块管理",
        short: "地",
        targetId: "plot-list",
        matches: ["plot-list", "plot-detail", "plot-tasks"]
      }
    ]
  },
  {
    id: "smart-services",
    label: "智能服务",
    description: "识别与问答",
    short: "智",
    icon: "scan",
    defaultTargetId: "disease-detection",
    matches: [
      "disease-detection",
      "disease-report",
      "expert-context-chat"
    ],
    children: [
      {
        label: "病害识别",
        short: "病",
        targetId: "disease-detection",
        matches: ["disease-detection", "disease-report"]
      },
      {
        label: "专家问答",
        short: "问",
        targetId: "expert-context-chat",
        matches: ["expert-context-chat"]
      }
    ]
  },
  {
    id: "community-services",
    label: "交流社区",
    description: "供需与经验",
    short: "社",
    icon: "community",
    defaultTargetId: "community",
    matches: [
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
      "supply-publish"
    ],
    children: [
      {
        label: "经验交流",
        short: "经",
        targetId: "community",
        matches: [
          "community",
          "community-category-disease",
          "community-category-irrigation",
          "community-category-fertilization",
          "community-category-greenhouse",
          "community-category-device",
          "community-publish",
          "community-help",
          "community-detail"
        ]
      },
      {
        label: "供需发布",
        short: "供",
        targetId: "supply-demand",
        matches: ["supply-demand", "supply-publish"]
      }
    ]
  }
];

const adminNavSections = [
  {
    id: "admin-overview-nav",
    label: "综合大屏",
    description: "全场监测",
    short: "屏",
    icon: "grid",
    targetId: "admin-overview",
    matches: ["admin-overview"]
  },
  {
    id: "admin-production",
    label: "农事生产",
    description: "大棚管理与地块管理",
    short: "农",
    icon: "greenhouse",
    defaultTargetId: "admin-greenhouses",
    matches: ["admin-greenhouses", "admin-plots", "admin-asset-detail"],
    children: [
      { label: "大棚管理", short: "棚", targetId: "admin-greenhouses", matches: ["admin-greenhouses"] },
      { label: "地块管理", short: "地", targetId: "admin-plots", matches: ["admin-plots"] }
    ]
  },
  {
    id: "admin-device",
    label: "设备管理",
    description: "设备状态与上报",
    short: "设",
    icon: "device",
    targetId: "admin-devices",
    matches: ["admin-devices"]
  },
  {
    id: "admin-intelligent-service",
    label: "智能服务",
    description: "识别与问答",
    short: "智",
    icon: "scan",
    defaultTargetId: "disease-detection",
    matches: [
      "disease-detection",
      "disease-report",
      "expert-context-chat"
    ],
    children: [
      {
        label: "病害识别",
        short: "病",
        targetId: "disease-detection",
        matches: ["disease-detection", "disease-report"]
      },
      {
        label: "专家问答",
        short: "问",
        targetId: "expert-context-chat",
        matches: ["expert-context-chat"]
      }
    ]
  },
  {
    id: "admin-community",
    label: "交流社区",
    description: "经验与供需审核",
    short: "社",
    icon: "community",
    defaultTargetId: "admin-experience-audit",
    matches: ["admin-experience-audit", "admin-supply-audit"],
    children: [
      {
        label: "经验审核",
        short: "经",
        targetId: "admin-experience-audit",
        matches: ["admin-experience-audit"]
      },
      {
        label: "供需审核",
        short: "供",
        targetId: "admin-supply-audit",
        matches: ["admin-supply-audit"]
      }
    ]
  }
];

function getStatusColor(status) {
  const s = String(status).toLowerCase();
  if (s.includes("正常")) return { bg: "#e6f7e6", text: "#35c36b" };
  if (s.includes("需关注") || s.includes("湿度偏低")) return { bg: "#fff7e6", text: "#fa8c16" };
  if (s.includes("离线") || s.includes("异常")) return { bg: "#fff1f0", text: "#f5222d" };
  if (s.includes("灌溉中")) return { bg: "#e6f7ff", text: "#1890ff" };
  return { bg: "#f0f0f0", text: "#666" };
}

function parseAssetInfo(name) {
  const parts = name.split(/[\s-]+/);
  let region = "未知";
  let crop = "--";
  let code = name;
  
  if (name.includes("北区")) region = "北区";
  else if (name.includes("南区")) region = "南区";
  else if (name.includes("东区")) region = "东区";
  else if (name.includes("西区")) region = "西区";
  
  if (name.includes("草莓")) crop = "草莓";
  else if (name.includes("小麦")) crop = "小麦";
  
  return { region, crop, code };
}

function assetPageItems(response) {
  return pageItems(response);
}

const adminGreenhouseScreen = {
  id: "admin-greenhouses",
  title: "大棚管理",
  nav: "大棚",
  layout: "asset-list",
  assetType: "大棚",
  subtitle: "全场大棚统一管理，可查看不同农户负责的大棚数据。"
};

const adminPlotScreen = {
  id: "admin-plots",
  title: "地块管理",
  nav: "地块",
  layout: "asset-list",
  assetType: "地块",
  subtitle: "全场地块统一管理，可查看不同农户负责的地块数据。"
};

function App() {
  const [authView, setAuthView] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [activeId, setActiveId] = useState("dashboard");
  const [openSectionIds, setOpenSectionIds] = useState(["farm-production"]);
  const [adminActiveId, setAdminActiveId] = useState("admin-overview");
  const [adminOpenSectionIds, setAdminOpenSectionIds] = useState(["admin-production"]);
  const [sysadminActiveId, setSysadminActiveId] = useState("sysadmin-overview");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(true);
  const [chatContext, setChatContext] = useState(null);
  const [selectedCommunityPostId, setSelectedCommunityPostId] = useState(null);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [selectedAssetId, setSelectedAssetId] = useState(null);
  const [selectedAssetName, setSelectedAssetName] = useState(null);
  const [selectedAssetCrop, setSelectedAssetCrop] = useState(null);
  const [authBootstrapped, setAuthBootstrapped] = useState(() => {
    const hasTokens = Boolean(localStorage.getItem("accessToken") || localStorage.getItem("refreshToken"));
    return !hasTokens;
  });
  const [navStack, setNavStack] = useState([]);
  const activeScreen = useMemo(
    () => screens.find((screen) => screen.id === activeId) ?? screens[1],
    [activeId]
  );

  // URL → screenId mapping
  const farmerUrls = { dashboard: "/farmer/dashboard", "greenhouse-list": "/farmer/greenhouses", "plot-list": "/farmer/plots", tasks: "/farmer/tasks", "disease-detection": "/farmer/diagnosis", "expert-context-chat": "/farmer/expert-chat", community: "/farmer/community", "supply-demand": "/farmer/supply" };
  const adminUrls = { "admin-overview": "/admin/overview", "admin-greenhouses": "/admin/greenhouses", "admin-plots": "/admin/plots", "admin-devices": "/admin/devices", "disease-detection": "/admin/diagnosis", "expert-context-chat": "/admin/expert-chat", "admin-experience-audit": "/admin/community/experience-audit", "admin-supply-audit": "/admin/community/supply-audit" };
  const sysadminUrls = { "sysadmin-overview": "/sysadmin/overview" };

  // Save requested URL for post-login redirect
  const [redirectAfterLogin, setRedirectAfterLogin] = useState(() => {
    const path = window.location.pathname;
    if (path === "/" || path === "/login") return null;
    try { sessionStorage.setItem("loginRedirect", path); } catch (e) { /* ignore */ }
    return path;
  });

  // Read URL on first load
  useEffect(() => {
    const path = window.location.pathname;
    for (const [id, url] of Object.entries(farmerUrls)) { if (path.startsWith(url)) { setActiveId(id); return; } }
    for (const [id, url] of Object.entries(adminUrls)) { if (path.startsWith(url)) { setAdminActiveId(id); return; } }
    for (const [id, url] of Object.entries(sysadminUrls)) { if (path.startsWith(url)) { setSysadminActiveId(id); return; } }
  }, []);

  // Handle browser back/forward + set title
  function syncFromUrl() {
    const path = window.location.pathname;
    for (const [id, url] of Object.entries(farmerUrls)) { if (path.startsWith(url)) { setActiveId(id); const s = screens.find((sc) => sc.id === id); if (s) document.title = s.title + " - 智慧农业"; return; } }
    for (const [id, url] of Object.entries(adminUrls)) { if (path.startsWith(url)) { setAdminActiveId(id); const s = screens.find((sc) => sc.id === id); if (s) document.title = s.title + " - 智慧农业·管理"; return; } }
    for (const [id, url] of Object.entries(sysadminUrls)) { if (path.startsWith(url)) { setSysadminActiveId(id); document.title = "系统管理 - 智慧农业"; return; } }
  }
  useEffect(() => { syncFromUrl(); }, []);
  useEffect(() => { window.addEventListener("popstate", syncFromUrl); return () => window.removeEventListener("popstate", syncFromUrl); }, []);
  // Esc to close profile modal
  useEffect(() => { const onKey = (e) => { if (e.key === "Escape") { setIsProfileOpen(false); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);

  useEffect(() => {
    let ignored = false;

    async function bootstrapAuth() {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const hasStoredAuth = Boolean(accessToken || refreshToken);
      const cachedUser = readStoredCurrentUser();
      if (cachedUser && hasStoredAuth) {
        if (!ignored) setCurrentUser(cachedUser);
      }

      if (!hasStoredAuth) {
        if (!ignored) setAuthBootstrapped(true);
        return;
      }

      try {
        const response = await getCurrentUser();
        if (ignored) return;
        const user = apiItem(response) || {};
        const nextUser = buildCurrentUser(user);
        if (nextUser) {
          setCurrentUser(nextUser);
        } else if (!cachedUser) {
          throw new Error("用户信息缺失");
        }
        if (user && typeof user === "object") {
          localStorage.setItem("user", JSON.stringify(user));
        }
      } catch {
        if (!cachedUser) {
          clearStoredAuth();
          if (!ignored) setCurrentUser(null);
        }
      } finally {
        if (!ignored) setAuthBootstrapped(true);
      }
    }

    bootstrapAuth();
    return () => {
      ignored = true;
    };
  }, []);

  function handleNavigate(targetId, options = {}) {
    setNavStack((prev) => [...prev, activeId]);
    setActiveId(targetId);
    setChatContext(targetId === "expert-context-chat" && options.context ? options : null);
    if (targetId === "community-detail") setSelectedCommunityPostId(options.postId ?? null);
    if (options.taskId) setSelectedTaskId(options.taskId);
    else if (!["irrigation-task", "inspection-task", "growth-anomaly-task", "disease-detection-task"].includes(targetId)) setSelectedTaskId(null);
    if (options.assetId) setSelectedAssetId(options.assetId);
    else if (!["greenhouse-tasks", "plot-tasks", "greenhouse-detail", "plot-detail", "irrigation-task", "inspection-task", "growth-anomaly-task", "disease-detection-task"].includes(targetId)) setSelectedAssetId(null);
    if (options.assetName) setSelectedAssetName(options.assetName);
    else if (!["greenhouse-tasks", "plot-tasks", "greenhouse-detail", "plot-detail", "irrigation-task", "inspection-task", "growth-anomaly-task", "disease-detection-task"].includes(targetId)) setSelectedAssetName(null);
    if (options.assetCrop) setSelectedAssetCrop(options.assetCrop);
    else if (!["greenhouse-detail", "plot-detail", "irrigation-task", "inspection-task", "growth-anomaly-task", "disease-detection-task"].includes(targetId)) setSelectedAssetCrop(null);
    const url = farmerUrls[targetId];
    if (url) { window.history.pushState(null, "", url); const s = screens.find((sc) => sc.id === targetId); if (s) document.title = s.title + " - 智慧农业"; }
  }

  function handleGoBack() {
    if (navStack.length === 0) return;
    const targetId = navStack[navStack.length - 1];
    setActiveId(targetId);
    setNavStack((prev) => prev.slice(0, -1));
    const s = screens.find((sc) => sc.id === targetId);
    if (s) document.title = s.title + " - 智慧农业";
  }

  function handleSectionToggle(item) {
    if ((item.children ?? []).length === 0) {
      handleNavigate(item.targetId);
      return;
    }

    setOpenSectionIds((current) => (
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id]
    ));
    handleNavigate(item.defaultTargetId);
  }

  function handleSidebarSectionToggle(item) {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      window.setTimeout(() => handleSectionToggle(item), 150);
      return;
    }

    handleSectionToggle(item);
  }

  function handleAdminNavigate(targetId, options = {}) {
    setAdminActiveId(targetId);
    setChatContext(targetId === "expert-context-chat" && options.context ? options : null);
    if (options.taskId) setSelectedTaskId(options.taskId);
    else if (!["irrigation-task", "inspection-task", "growth-anomaly-task", "disease-detection-task"].includes(targetId)) setSelectedTaskId(null);
    const url = adminUrls[targetId];
    if (url) { window.history.pushState(null, "", url); const s = screens.find((sc) => sc.id === targetId); if (s) document.title = s.title + " - 智慧农业·管理"; }
  }

  function handleAdminSectionToggle(item) {
    if ((item.children ?? []).length === 0) {
      handleAdminNavigate(item.targetId);
      return;
    }

    setAdminOpenSectionIds((current) => (
      current.includes(item.id)
        ? current.filter((id) => id !== item.id)
        : [...current, item.id]
    ));
    handleAdminNavigate(item.defaultTargetId);
  }

  function handleAdminSidebarSectionToggle(item) {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      window.setTimeout(() => handleAdminSectionToggle(item), 150);
      return;
    }

    handleAdminSectionToggle(item);
  }

  function handleSysadminNavigate(targetId) {
    setSysadminActiveId(targetId);
    const url = sysadminUrls[targetId];
    if (url) { window.history.pushState(null, "", url); document.title = "系统管理 - 智慧农业"; }
  }

  function handleSysadminSectionToggle(item) {
    if ((item.children ?? []).length === 0) {
      handleSysadminNavigate(item.targetId);
      return;
    }
    handleSysadminNavigate(item.defaultTargetId);
  }

  function handleSysadminSidebarSectionToggle(item) {
    if (isSidebarCollapsed) {
      setIsSidebarCollapsed(false);
      window.setTimeout(() => handleSysadminSectionToggle(item), 150);
      return;
    }
    handleSysadminSectionToggle(item);
  }

  if (!authBootstrapped) {
    return (
      <div className="auth-bootstrap-shell">
        <Loading type="card" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <AuthShell
        view={authView}
        onSwitchView={setAuthView}
        onLogin={(authData) => {
          const { accessToken, refreshToken, user } = authData;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          const nextUser = buildCurrentUser(user);
          if (nextUser) {
            setCurrentUser(nextUser);
          }
          localStorage.setItem("user", JSON.stringify(user));
          toast("登录成功", { type: "success" });
          const redir = sessionStorage.getItem("loginRedirect");
          if (redir) { sessionStorage.removeItem("loginRedirect"); window.history.replaceState(null, "", redir); }
        }}
        onRegister={(authData) => {
          const { accessToken, refreshToken, user } = authData;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
          const nextUser = buildCurrentUser(user);
          if (nextUser) {
            setCurrentUser(nextUser);
          }
          localStorage.setItem("user", JSON.stringify(user));
          toast("注册成功", { type: "success" });
          const redir = sessionStorage.getItem("loginRedirect");
          if (redir) { sessionStorage.removeItem("loginRedirect"); window.history.replaceState(null, "", redir); }
        }}
      />
    );
  }

  if (currentUser.role === "sysadmin") {
    return (
      <div className={`app-shell ${isSidebarCollapsed ? "nav-collapsed" : "nav-expanded"}`}>
        <FarmerSidebar
          activeId={sysadminActiveId}
          navSections={sysadminNavSections}
          brandTitle="Sys Admin"
          brandSubtitle="System Monitor"
          navLabel="系统管理员功能导航"
          profileTitle="系统管理员"
          profileSubtitle="智慧农业系统监控"
          isCollapsed={isSidebarCollapsed}
          onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onNavigate={handleSysadminNavigate}
          onToggleSection={handleSysadminSidebarSectionToggle}
          onSwitchLogin={async () => { const ok = await confirm("确定要退出登录或切换账号吗？", { title: "切换登录" }); if (ok) { const refreshToken = localStorage.getItem("refreshToken"); if (refreshToken) { import("./services/api.js").then(m => m.logout(refreshToken).catch(() => {})); } clearStoredAuth(); setCurrentUser(null); toast("已退出登录"); } }}
        />
        <main className="workspace">
          <section className="prototype-frame admin-frame">
            <SysadminConsole activeId={sysadminActiveId} />
          </section>
        </main>
        {isProfileOpen && (
          <ProfileModal profileRole="admin" onClose={() => setIsProfileOpen(false)} />
        )}
        <FloatingAssistant currentUser={currentUser} />
      </div>
    );
  }

  if (currentUser.role === "admin") {
    return (
      <div className={`app-shell ${isSidebarCollapsed ? "nav-collapsed" : "nav-expanded"}`}>
        <FarmerSidebar
          activeId={adminActiveId}
          navSections={adminNavSections}
          brandTitle="Farm Admin"
          brandSubtitle="Smart Farm Ops"
          navLabel="农场管理员功能导航"
          profileTitle="农场管理员"
          profileSubtitle="智慧农场运营中心"
          isCollapsed={isSidebarCollapsed}
          openSectionIds={adminOpenSectionIds}
          onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onNavigate={handleAdminNavigate}
          onToggleSection={handleAdminSidebarSectionToggle}
          onSwitchLogin={async () => { const ok = await confirm("确定要退出登录或切换账号吗？", { title: "切换登录" }); if (ok) { const refreshToken = localStorage.getItem("refreshToken"); if (refreshToken) { import("./services/api.js").then(m => m.logout(refreshToken).catch(() => {})); } clearStoredAuth(); setCurrentUser(null); toast("已退出登录"); } }}
        />
        <main className="workspace">
          <section className="prototype-frame admin-frame">
            <AdminConsole activeId={adminActiveId} chatContext={chatContext} selectedTaskId={selectedTaskId} onNavigate={handleAdminNavigate} />
          </section>
        </main>
        {isProfileOpen && (
          <ProfileModal profileRole="admin" onClose={() => setIsProfileOpen(false)} />
        )}
        <FloatingAssistant currentUser={currentUser} />
      </div>
    );
  }

  return (
    <div className={`app-shell ${isSidebarCollapsed ? "nav-collapsed" : "nav-expanded"}`}>
      <FarmerSidebar
        activeId={activeId}
        isCollapsed={isSidebarCollapsed}
        openSectionIds={openSectionIds}
        onToggleCollapsed={() => setIsSidebarCollapsed((current) => !current)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onNavigate={handleNavigate}
        onToggleSection={handleSidebarSectionToggle}
        onSwitchLogin={async () => { const ok = await confirm("确定要退出登录或切换账号吗？", { title: "切换登录" }); if (ok) { const refreshToken = localStorage.getItem("refreshToken"); if (refreshToken) { import("./services/api.js").then(m => m.logout(refreshToken).catch(() => {})); } clearStoredAuth(); setCurrentUser(null); toast("已退出登录"); } }}
      />
      <main className="workspace">
        <section className={`prototype-frame ${activeScreen?.layout === "dashboard" ? "admin-frame" : ""}`}>
          <ScreenView screen={activeScreen} chatContext={chatContext} selectedCommunityPostId={selectedCommunityPostId} selectedTaskId={selectedTaskId} selectedAssetId={selectedAssetId} selectedAssetName={selectedAssetName} selectedAssetCrop={selectedAssetCrop} onNavigate={handleNavigate} goBack={navStack.length > 0 ? handleGoBack : undefined} role="farmer" />
        </section>
      </main>
      {isProfileOpen && (
        <ProfileModal profileRole="farmer" onClose={() => setIsProfileOpen(false)} />
      )}
      <FloatingAssistant currentUser={currentUser} />
    </div>
  );
}

// resolveRoleFromAccount, getGreenhouseAssetsForRole, getPlotAssetsForRole → utils/helpers.js

// AuthShell, LoginScreen, RegisterScreen → features/auth/

function AdminConsole({ activeId, chatContext, selectedTaskId, onNavigate }) {
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [relatedAsset, setRelatedAsset] = useState(null);
  const sharedServiceScreen = screens.find((screen) => screen.id === activeId);

  useEffect(() => {
    setSelectedAsset(null);
    setRelatedAsset(null);
  }, [activeId]);

  if (selectedAsset) {
    return (
      <AdminAssetDetail
        asset={selectedAsset}
        onBack={() => setSelectedAsset(null)}
        onNavigate={onNavigate}
        onRelatedTasks={(asset) => {
          setSelectedAsset(null);
          setRelatedAsset(asset);
        }}
      />
    );
  }

  if (relatedAsset) {
    return (
      <AdminRelatedTasks
        asset={relatedAsset}
        onBack={() => setRelatedAsset(null)}
        onAssetDetail={(asset) => {
          setRelatedAsset(null);
          setSelectedAsset(asset);
        }}
        onNavigate={onNavigate}
      />
    );
  }

  if (sharedServiceScreen) {
    return <ScreenView screen={sharedServiceScreen} chatContext={chatContext} selectedTaskId={selectedTaskId} onNavigate={onNavigate} role="admin" />;
  }

  if (activeId === "admin-greenhouses") {
    return <AdminGreenhouseManagement onAssetDetail={setSelectedAsset} onRelatedTasks={setRelatedAsset} onNavigate={onNavigate} />;
  }

  if (activeId === "admin-plots") {
    return <AdminPlotManagement onAssetDetail={setSelectedAsset} onRelatedTasks={setRelatedAsset} onNavigate={onNavigate} />;
  }

  if (activeId === "admin-devices") {
    return <AdminDeviceManagement apiScope="admin" />;
  }

  if (activeId === "admin-experience-audit") {
    return <AdminExperienceAudit />;
  }

  if (activeId === "admin-supply-audit") {
    return <AdminSupplyAudit />;
  }

  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <ScDatavDemo1 />
    </div>
  );
}

function SysadminConsole({ activeId }) {
  return <SysadminOverview />;
}

function AdminGreenhouseManagement({ onAssetDetail, onRelatedTasks, onNavigate }) {
  return (
    <main className="admin-console">
      <AssetListScreen
        screen={adminGreenhouseScreen}
        scope="admin"
        showOwner
        onAssetDetail={onAssetDetail}
        onRelatedTasks={onRelatedTasks}
        onNavigate={onNavigate}
      />
    </main>
  );
}

function AdminPlotManagement({ onAssetDetail, onRelatedTasks, onNavigate }) {
  return (
    <main className="admin-console">
      <AssetListScreen
        screen={adminPlotScreen}
        scope="admin"
        showOwner
        onAssetDetail={onAssetDetail}
        onRelatedTasks={onRelatedTasks}
        onNavigate={onNavigate}
      />
    </main>
  );
}

function normalizeDeviceStatus(status) {
  const normalized = String(status || "").toLowerCase();
  if (["online", "active", "running"].includes(normalized)) return "在线";
  if (["offline", "inactive", "disconnected"].includes(normalized)) return "离线";
  if (["maintenance", "repairing"].includes(normalized)) return "维护中";
  return status || "未知";
}

function normalizeDeviceType(type) {
  const normalized = String(type || "").toLowerCase();
  if (normalized.includes("environment")) return "环境传感器";
  if (normalized.includes("irrigation")) return "灌溉控制器";
  if (normalized.includes("camera")) return "摄像头";
  if (normalized.includes("soil")) return "土壤墒情站";
  return type || "未知设备";
}

function normalizeRiskText(value) {
  const normalized = String(value || "low").toLowerCase();
  if (normalized === "low") return "低";
  if (normalized === "medium") return "中";
  if (["high", "critical"].includes(normalized)) return "高";
  return value || "--";
}

function normalizeDeviceItem(item, index = 0) {
  const status = normalizeDeviceStatus(item.status);
  const alertText = item.alert || (item.alertLevel && item.alertLevel !== "none" ? item.alertLevel : "正常");
  const last = item.lastSeenAt ? new Date(item.lastSeenAt).toLocaleString("zh-CN", { hour12: false }) : item.last || "暂无上报";
  return {
    id: item.id || `device-${index + 1}`,
    name: item.name || item.id || `设备 ${index + 1}`,
    type: normalizeDeviceType(item.type),
    rawType: item.type || "",
    assetId: item.assetId || item.asset?.id || "",
    area: item.assetName || item.asset?.name || item.area || item.assetId || "未绑定区域",
    owner: item.ownerName || item.owner || "当前农户",
    status,
    data: item.latestTelemetryText || item.data || item.firmwareVersion || "--",
    last,
    alert: alertText,
    alertLevel: item.alertLevel || "none",
    command: status === "离线" ? "远程重启" : item.type?.includes("irrigation") ? "停止灌溉" : "刷新状态",
  };
}

function normalizeDeviceAlert(item, index = 0) {
  return {
    id: item.id || `alert-${index + 1}`,
    type: item.type || "device",
    title: item.title || item.alert || item.type || "设备告警",
    content: item.content || "--",
    level: item.level || "medium",
    status: item.status || "open",
    deviceId: item.deviceId || "",
    deviceName: item.deviceName || item.deviceId || item.id || "--",
    assetId: item.assetId || "",
    assetName: item.assetName || item.area || item.assetId || "未绑定区域",
    createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString("zh-CN", { hour12: false }) : "--",
  };
}

function commandTypeForDeviceAction(action, device) {
  const text = `${action || ""} ${device?.type || ""} ${device?.rawType || ""}`.toLowerCase();
  if (text.includes("停止") || text.includes("stop")) return "stop_irrigation";
  if (text.includes("灌溉") || text.includes("irrigation")) return "start_irrigation";
  if (text.includes("重启") || text.includes("restart")) return "restart";
  if (text.includes("阈值") || text.includes("threshold")) return "update_threshold";
  return "refresh_status";
}

function AdminDeviceManagement({ apiScope = "farmer" }) {
  const [deviceTab, setDeviceTab] = useState("detail");
  const [selectedDeviceId, setSelectedDeviceId] = useState("device-agri-001");
  const [deviceControlPanel, setDeviceControlPanel] = useState("commands");
  const [commandStep, setCommandStep] = useState(0);
  const [filterText, setFilterText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [filterArea, setFilterArea] = useState("");
  const [boundDevices, setBoundDevices] = useState(new Set(["AGRI_001", "AGRI_008"]));
  const [dispatchedDevices, setDispatchedDevices] = useState(new Set(["AGRI_016"]));
  const [devices, setDevices] = useState([]);
  const [deviceAlerts, setDeviceAlerts] = useState([]);
  const [devicesLoading, setDevicesLoading] = useState(true);
  const [devicesError, setDevicesError] = useState("");
  const [isAddDeviceOpen, setIsAddDeviceOpen] = useState(false);
  const [deviceMutating, setDeviceMutating] = useState(false);
  const [deviceLogs, setDeviceLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(apiScope === "farmer");
  const [operationHistory, setOperationHistory] = useState([]);
  const [bindingForm, setBindingForm] = useState({ newArea: "", owner: "", notify: "立即通知", reason: "" });
  const [bindingStep, setBindingStep] = useState(0);
  const [bindingHistory, setBindingHistory] = useState([]);
  const [showBindingHistory, setShowBindingHistory] = useState(false);
  const [assetList, setAssetList] = useState([]);
  const isAdminDeviceApi = apiScope === "admin";
  const canUseFarmerDeviceApi = apiScope === "farmer";
  const deviceItems = devices;
  const selectedDevice = deviceItems.find((item) => item.id === selectedDeviceId) ?? deviceItems[0] ?? null;
  const selected = selectedDevice ?? normalizeDeviceItem({}, 0);
  const hasDevices = deviceItems.length > 0;
  const onlineCount = deviceItems.filter((item) => item.status === "在线").length;
  const alertDevices = deviceAlerts;
  const tabLabel = {
    detail: "设备详情",
    control: "远程控制",
    binding: "绑定管理",
    logs: "通信日志"
  }[deviceTab] ?? "设备详情";
  const rightTabs = [
    ["detail", "设备详情"],
    ["control", "远程控制"],
    ["binding", "绑定管理"],
    ["logs", "通信日志"]
  ];

  const filteredDevices = deviceItems.filter((item) => {
    if (filterText && !item.id.toLowerCase().includes(filterText.toLowerCase()) && !item.name.toLowerCase().includes(filterText.toLowerCase())) return false;
    if (filterType && item.type !== filterType) return false;
    if (filterStatus && item.status !== filterStatus) return false;
    if (filterArea && item.area !== filterArea) return false;
    return true;
  });

  const deviceAlertsForSelected = alertDevices.filter((a) => a.deviceId === selected.id);
  const deviceLogsForSelected = deviceLogs.filter((log) => log.deviceId === selected.id);

  async function loadAssetList() {
    try {
      if (isAdminDeviceApi) {
        const response = await listAdminAssets({ page: 1, pageSize: 200 });
        const assets = assetPageItems(response).filter(
          (a) => a?.id && ["greenhouse", "plot"].includes(a.type)
        );
        setAssetList(assets.map((a) => ({ id: a.id, name: a.name || a.id })));
        return;
      }
      if (canUseFarmerDeviceApi) {
        const response = await getCurrentUser();
        const profile = apiItem(response);
        const assets = (profile?.ownedAssets || []).filter(
          (a) => a?.id && ["greenhouse", "plot"].includes(a.type)
        );
        setAssetList(assets.map((a) => ({ id: a.id, name: a.name || a.id })));
      }
    } catch {
      // 资产列表加载失败不影响主流程
    }
  }

  async function loadDevices(params = {}, preferredDeviceId = selectedDeviceId) {
    setDevicesLoading(true);
    setDevicesError("");
    try {
      const response = isAdminDeviceApi
        ? await listAdminDevices({ page: 1, pageSize: 50, ...params })
        : await listDevices({ page: 1, pageSize: 50, ...params });
      const nextDevices = pageItems(response).map(normalizeDeviceItem);
      setDevices(nextDevices);
      const nextSelectedId = nextDevices.some((item) => item.id === preferredDeviceId)
        ? preferredDeviceId
        : nextDevices[0]?.id;
      setSelectedDeviceId(nextSelectedId || "");
    } catch (error) {
      const message = apiErrorMessage(error, "设备列表加载失败");
      setDevicesError(message);
      toast(message, { type: "warn" });
      setDevices([]);
    } finally {
      setDevicesLoading(false);
    }
  }

  async function loadDeviceAlerts(params = {}) {
    if (!canUseFarmerDeviceApi) {
      setDeviceAlerts([]);
      return;
    }

    try {
      const response = await listDeviceAlerts({ page: 1, pageSize: 50, ...params });
      const nextAlerts = pageItems(response).map(normalizeDeviceAlert);
      setDeviceAlerts(nextAlerts);
    } catch (error) {
      toast(apiErrorMessage(error, "设备告警加载失败"), { type: "warn" });
      setDeviceAlerts([]);
    }
  }

  useEffect(() => {
    loadDevices();
    loadDeviceAlerts();
    loadDeviceLogs();
    loadAssetList();
  }, []);

  useEffect(() => {
    setBindingForm({ newArea: selected.assetId || "", owner: selected.owner, notify: "立即通知", reason: "" });
    setBindingStep(0);
    setShowBindingHistory(false);
  }, [selectedDeviceId]);

  const bindingDirty = bindingForm.newArea !== (selected.assetId || "") || bindingForm.owner !== selected.owner || bindingForm.reason.trim() !== "";

  function handleBindingFormChange(field, value) {
    setBindingForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSaveBinding() {
    const targetAsset = assetList.find((asset) => asset.id === bindingForm.newArea);
    const targetAreaName = targetAsset?.name || bindingForm.newArea || "未绑定区域";
    recordOperation(selected.id, "binding", `绑定变更: ${targetAreaName} / ${bindingForm.owner}`);

    try {
      await bindDevice(selected.id, {
        assetId: bindingForm.newArea,
      });
      toast("绑定信息已保存至后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "后端保存失败，变更已记录在本地"), { type: "warn" });
    }

    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const record = {
      id: `bind-${Date.now()}`,
      deviceId: selected.id,
      time,
      oldArea: selected.area,
      newArea: targetAreaName,
      oldOwner: selected.owner,
      newOwner: bindingForm.owner,
      notify: bindingForm.notify,
      reason: bindingForm.reason,
    };
    setBindingHistory((prev) => [record, ...prev]);

    setDevices((current) => current.map((item) => (
      item.id === selected.id
        ? { ...item, area: targetAreaName, assetId: bindingForm.newArea, owner: bindingForm.owner }
        : item
    )));

    setBindingForm((prev) => ({ ...prev, reason: "" }));
    advanceBindingStep();
    loadDevices();
  }

  function advanceBindingStep() {
    setBindingStep((prev) => Math.min(prev + 1, 4));
  }

  const bindingHistoryForSelected = bindingHistory.filter((h) => h.deviceId === selected.id);

  async function handleAcknowledgeAlert(alertId) {
    if (!canUseFarmerDeviceApi) {
      setDeviceAlerts((current) => current.map((item) => (
        item.id === alertId ? { ...item, status: "acknowledged" } : item
      )));
      toast("设备告警已在页面内标记确认", { type: "warn" });
      return;
    }

    try {
      await acknowledgeAlert(alertId);
      toast("告警已确认", { type: "success" });
      loadDeviceAlerts();
    } catch (error) {
      toast(apiErrorMessage(error, "告警确认失败"), { type: "warn" });
    }
  }

  async function handleDeviceCommand(deviceId, commandType, parameters = {}) {
    const commandLabels = {
      refresh_status: "刷新设备状态",
      restart: "远程重启设备",
      update_threshold: "更新阈值设置",
      start_irrigation: "启动灌溉",
      stop_irrigation: "停止灌溉",
    };
    const label = commandLabels[commandType] || commandType;
    recordOperation(deviceId, "command", label);

    if (!canUseFarmerDeviceApi) {
      toast("设备指令已记录到本地操作历史", { type: "warn" });
      return;
    }

    try {
      await issueDeviceCommand(deviceId, {
        commandType,
        parameters,
        idempotencyKey: `web-${deviceId}-${commandType}-${Date.now()}`,
      });
      toast("设备指令已提交后端", { type: "success" });
      loadDevices();
    } catch (error) {
      toast(apiErrorMessage(error, "设备指令下发失败"), { type: "warn" });
    }
  }

  async function handleOpenDeviceDetail(deviceId) {
    if (!canUseFarmerDeviceApi && !isAdminDeviceApi) {
      selectDevice(deviceId, "detail");
      toast("设备详情已切换到本地台账展示", { type: "warn" });
      return;
    }

    try {
      const response = isAdminDeviceApi ? await getAdminDevice(deviceId) : await getDevice(deviceId);
      const detail = apiItem(response);
      if (detail) {
        setDevices((current) => current.map((item) => (
          item.id === deviceId
            ? { ...item, ...normalizeDeviceItem({ ...detail, assetId: detail.asset?.id, assetName: detail.asset?.name }, 0) }
            : item
        )));
      }
    } catch (error) {
      toast(apiErrorMessage(error, "设备详情加载失败"), { type: "warn" });
    } finally {
      selectDevice(deviceId, "detail");
    }
  }

  function selectDevice(id, nextTab = deviceTab) {
    setSelectedDeviceId(id);
    setDeviceTab(nextTab);
    setDeviceControlPanel("commands");
    setCommandStep(0);
  }

  function advanceCommandStep() {
    setCommandStep((prev) => Math.min(prev + 1, 4));
  }

  function recordOperation(deviceId, type, content, result = "成功") {
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    const entry = { id: `op-${Date.now()}`, deviceId, time, type, content, result };
    setOperationHistory((prev) => [entry, ...prev].slice(0, 50));
  }

  const operationsForSelected = operationHistory.filter((op) => op.deviceId === selected.id);

  function toggleBound(id) {
    setBoundDevices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleDispatched(id) {
    setDispatchedDevices(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAddDevice(device) {
    setDeviceMutating(true);
    try {
      const response = await createDevice(device);
      const created = apiItem(response);
      const createdId = created?.deviceId || created?.id || device.deviceId;
      await loadDevices({}, createdId);
      setIsAddDeviceOpen(false);
      toast("设备添加成功", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "设备添加失败"), { type: "warn" });
    } finally {
      setDeviceMutating(false);
    }
  }

  async function handleDeleteDevice(deviceId) {
    if (!isAdminDeviceApi) {
      toast("当前账号无设备删除权限", { type: "warn" });
      return;
    }
    const deviceName = selected.id === deviceId ? selected.name : deviceId;
    const ok = await confirm(`确定要删除设备 ${deviceName} 吗？删除后设备将从当前农场设备台账移除。`, {
      title: "删除设备",
      confirmText: "确认删除",
      danger: true,
    });
    if (!ok) return;

    setDeviceMutating(true);
    try {
      await deleteAdminDevice(deviceId);
      await loadDevices({}, deviceItems.find((item) => item.id !== deviceId)?.id || "");
      toast("设备已删除，列表已同步刷新", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "设备删除失败"), { type: "warn" });
    } finally {
      setDeviceMutating(false);
    }
  }

  async function loadDeviceLogs(params = {}) {
    if (!canUseFarmerDeviceApi) {
      setDeviceLogs([]);
      setLogsLoading(false);
      return;
    }

    setLogsLoading(true);
    try {
      const response = await listDeviceLogs({ page: 1, pageSize: 200, ...params });
      const items = pageItems(response);
      setDeviceLogs(items.map((item) => ({
        time: item.createdAt ? new Date(item.createdAt).toLocaleTimeString("zh-CN", { hour12: false }) : (item.time || "--"),
        deviceId: item.deviceId || item.deviceName || "--",
        type: item.logType || item.type || "--",
        content: item.content || item.message || "--",
        result: item.result || item.status || "--",
      })));
    } catch (error) {
      toast(apiErrorMessage(error, "设备日志加载失败"), { type: "warn" });
      setDeviceLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }

  function renderRightPanel() {
    if (!hasDevices) {
      return <EmptyState title="暂无设备" description="新增设备后，设备列表和详情会自动刷新。" />;
    }

    if (deviceTab === "control") {
      const thresholdMode = deviceControlPanel === "threshold";
      return (
        <div className="control-console">
          <section>
            {thresholdMode ? (
              <>
                <div className="device-form-grid">
                  {[
                    ["土壤湿度下限", "35%"],
                    ["空气温度上限", "32℃"],
                    ["空气湿度上限", "70%"],
                    ["光照下限", "9000 lux"],
                    ["自动灌溉", "启用"],
                    ["通知农户", "阈值变更后通知"]
                  ].map(([label, value]) => (
                    <label key={label}>
                      <span>{label}</span>
                      {label === "自动灌溉" ? (
                        <select aria-label={label} defaultValue={value}>
                          <option>启用</option>
                          <option>停用</option>
                        </select>
                      ) : label === "通知农户" ? (
                        <select aria-label={label} defaultValue={value}>
                          <option>阈值变更后通知</option>
                          <option>不通知</option>
                        </select>
                      ) : (
                        <input aria-label={label} defaultValue={value} />
                      )}
                    </label>
                  ))}
                </div>
                <div className="ops-action-row" style={{ marginTop: 12 }}>
                  <button type="button" onClick={() => { handleDeviceCommand(selected.id, "update_threshold", { source: "web" }); advanceCommandStep(); setDeviceControlPanel("commands"); }}>保存并下发阈值</button>
                  <button type="button" onClick={() => setDeviceControlPanel("commands")}>返回控制</button>
                </div>
              </>
            ) : (
              <>
                <div className="detail-list">
                  {[
                    ["设备类型", selected.type],
                    ["绑定区域", selected.area],
                    ["设备状态", selected.status],
                    ["最近上报", selected.last]
                  ].map(([label, value]) => (
                    <div key={label}><span>{label}</span><strong>{value}</strong></div>
                  ))}
                </div>
                <div className="ops-action-row" style={{ marginTop: 20 }}>
                  <button type="button" onClick={() => { handleDeviceCommand(selected.id, commandTypeForDeviceAction(selected.command, selected), { durationMinutes: 0.05 }); advanceCommandStep(); }}>{selected.command}</button>
                  <button type="button" onClick={() => { recordOperation(selected.id, "refresh", "刷新设备状态"); handleOpenDeviceDetail(selected.id); selectDevice(selected.id, "control"); advanceCommandStep(); }}>刷新状态</button>
                  <button type="button" onClick={() => setDeviceControlPanel("threshold")}>设置阈值</button>
                  <button className="danger-button" type="button" onClick={async () => { const ok = await confirm("确定要远程重启此设备吗？重启期间设备将短暂离线。", { title: "远程重启", confirmText: "确认重启", danger: true }); if (ok) { handleDeviceCommand(selected.id, "restart"); advanceCommandStep(); } }}>远程重启</button>
                </div>
              </>
            )}
          </section>
          <div className="command-flow">
            {[
              ["命令创建", "POST /api/device/commands"],
              ["MQTT下发", `agri/${selected.id}/command`],
              ["硬件接收", "command-reply: RECEIVED"],
              ["执行完成", "command-reply: DONE"]
            ].map(([title, desc], index) => (
              <div className={`command-step${index < commandStep ? " done" : ""}`} key={title}>
                <span className="step-dot" />
                <div className="step-text"><strong>{title}</strong><p>{desc}</p></div>
                {index < 3 && <span className="step-connector" />}
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (deviceTab === "detail") {
      const health = selected.status === "离线" ? "45" : "92";
      const isOnline = selected.status === "在线";
      return (
        <section className="device-detail-page">
          <div className="device-overview-hero">
            <div className="hero-ring">
              <div style={{ textAlign: "center" }}>
                <strong>{isOnline ? "在线" : "离线"}</strong>
                <span>{selected.data}</span>
              </div>
            </div>
            <div className="hero-info">
              <DeviceStatusTag value={selected.status} />
              <h3 style={{ marginTop: 4 }}>{selected.id}</h3>
              <p>{selected.type} · {selected.area}</p>
              <strong>{selected.data}</strong>
              <small style={{ color: "var(--muted)", display: "block", marginTop: 4 }}>负责人：{selected.owner} · 最近上报：{selected.last}</small>
            </div>
          </div>
          {isAdminDeviceApi && hasDevices && selected.id ? (
            <div className="ops-action-row device-detail-actions">
              <button type="button" onClick={() => loadDevices({}, selected.id)} disabled={deviceMutating || devicesLoading}>
                刷新列表
              </button>
              <button className="danger-button" type="button" onClick={() => handleDeleteDevice(selected.id)} disabled={deviceMutating || devicesLoading}>
                {deviceMutating ? "处理中" : "删除设备"}
              </button>
            </div>
          ) : null}
          <div className="device-overview-metrics">
            {[
              ["健康分", health, isOnline ? "运行稳定" : "建议现场检查"],
              ["信号强度", isOnline ? "-62 RSSI" : "无", "最近心跳"],
              ["电池/供电", selected.type.includes("摄像头") ? "外接电源" : "86%", "设备状态"],
              ["告警状态", selected.alert, "告警规则"]
            ].map(([label, value, note]) => (
              <article key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
                <small>{note}</small>
              </article>
            ))}
          </div>
          <div className="device-detail-columns">
            <section>
              <h3>运维建议</h3>
              <DeviceOpsTable
                columns={["项目", "状态", "建议"]}
                rows={[
                  ["设备连接", selected.status, selected.status === "离线" ? "派发现场排查" : "保持"],
                  ["数据质量", selected.alert, selected.alert === "正常" ? "保持" : "复核传感器"],
                  ["农户反馈", "待同步", "通知负责人确认现场情况"]
                ]}
              />
            </section>
          </div>
          <section className="device-logs-panel">
            <h3>最近通信与操作</h3>
            {operationsForSelected.length === 0 ? (
              <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                暂无操作记录，可在远程控制面板中操作设备
              </div>
            ) : (
              <DeviceOpsTable
                columns={["时间", "类型", "内容", "结果"]}
                rows={operationsForSelected.slice(0, 20).map((op) => [
                  op.time,
                  op.type,
                  op.content,
                  op.result,
                ])}
              />
            )}
          </section>
        </section>
      );
    }

    if (deviceTab === "binding") {
      const bindingTargets = assetList.length > 0
        ? assetList
        : [...new Set(deviceItems.map((d) => d.area).filter(Boolean))].map((area) => ({ id: area, name: area }));
      const targetAsset = bindingTargets.find((target) => target.id === bindingForm.newArea);
      const previewArea = targetAsset?.name || bindingForm.newArea || selected.area;
      const areaChanged = previewArea !== selected.area;
      const ownerChanged = bindingForm.owner !== selected.owner;
      const previewOwner = bindingForm.owner || selected.owner;
      const notifyLabel = bindingForm.notify === "立即通知" ? "已发送通知" : "未发送通知";
      return (
        <div className="binding-console-v">
          <section className="binding-hero">
            <div>
              <span>当前设备</span>
              <strong>{selected.id}</strong>
              <small>{selected.type} · {selected.status}</small>
            </div>
            <div>
              <span>绑定区域</span>
              <strong>{selected.area}</strong>
              <small>负责人：{selected.owner}</small>
            </div>
            <div>
              <span>变更状态</span>
              <strong>{bindingDirty ? "待保存" : "未变更"}</strong>
              <small>{notifyLabel}</small>
            </div>
          </section>

          <section className="binding-workbench">
            <div className="binding-form-card">
              <div className="binding-sync-card" style={{ marginBottom: 14 }}>
                <h3>农户端通知预览</h3>
                <div className="farmer-notice-preview">
                  <strong>设备绑定变更通知</strong>
                  <p>
                    设备 {selected.id}
                    {areaChanged ? ` 已从 ${selected.area} 迁移至 ${previewArea}` : ` 位于 ${previewArea}`}
                    {ownerChanged ? `，负责人由 ${selected.owner} 变更为 ${bindingForm.owner}` : `，负责人为 ${previewOwner}`}
                    {bindingForm.reason ? `（原因：${bindingForm.reason}）` : ""}。
                  </p>
                  <span>接收人：{previewOwner} · {notifyLabel}</span>
                </div>
              </div>

              <div className="binding-section-head">
                <div>
                  <h3>绑定信息</h3>
                  <p>调整设备所属大棚/地块，并同步更新负责人和农户通知。</p>
                </div>
              </div>
              <div className="device-form-grid">
                <label>
                  <span>设备编号</span>
                  <div className="binding-readonly">{selected.id}</div>
                </label>
                <label>
                  <span>当前绑定区域</span>
                  <div className="binding-readonly">{selected.area}</div>
                </label>
                <label>
                  <span>负责人</span>
                  <input
                    aria-label="负责人"
                    value={bindingForm.owner}
                    onChange={(e) => handleBindingFormChange("owner", e.target.value)}
                    placeholder={selected.owner}
                  />
                </label>
                <label>
                  <span>新绑定区域</span>
                  <select
                    aria-label="新绑定区域"
                    value={bindingForm.newArea}
                    onChange={(e) => handleBindingFormChange("newArea", e.target.value)}
                  >
                    {!bindingForm.newArea && <option value="">请选择绑定区域</option>}
                    {bindingTargets.map((target) => (
                      <option key={target.id} value={target.id}>{target.name}</option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="binding-inline-row">
                <label>
                  <span>通知农户</span>
                  <select
                    aria-label="通知农户"
                    value={bindingForm.notify}
                    onChange={(e) => handleBindingFormChange("notify", e.target.value)}
                  >
                    <option>立即通知</option>
                    <option>暂不通知</option>
                  </select>
                </label>
                <label className="binding-reason-field">
                  <span>操作原因</span>
                  <input
                    aria-label="操作原因"
                    value={bindingForm.reason}
                    onChange={(e) => handleBindingFormChange("reason", e.target.value)}
                    placeholder="如：设备维护或区域调整"
                  />
                </label>
              </div>
              <div className="binding-action-row">
                <button type="button" className="binding-btn-primary" onClick={handleSaveBinding}>确认绑定</button>
                <button type="button" className="binding-btn-secondary" onClick={handleSaveBinding}>保存变更记录</button>
              </div>
            </div>
          </section>

          <section className="binding-history-card">
            <div className="binding-section-head">
              <div>
                <h3>变更记录</h3>
                <p>记录当前设备最近的绑定调整，便于追溯责任人和通知状态。</p>
              </div>
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowBindingHistory((v) => !v)}
              >
                {showBindingHistory ? "收起记录" : "查看记录"}
              </button>
            </div>
            {showBindingHistory ? (
              bindingHistoryForSelected.length === 0 ? (
                <div className="binding-empty-history">暂无变更记录</div>
              ) : (
                <DeviceOpsTable
                  columns={["时间", "原区域", "新区域", "原负责人", "新负责人", "通知", "原因"]}
                  rows={bindingHistoryForSelected.slice(0, 20).map((h) => [
                    h.time,
                    h.oldArea,
                    h.newArea,
                    h.oldOwner,
                    h.newOwner,
                    h.notify,
                    h.reason || "--",
                  ])}
                />
              )
            ) : (
              <div className="binding-history-summary">
                <strong>{bindingHistoryForSelected.length}</strong>
                <span>条历史记录</span>
              </div>
            )}
          </section>
        </div>
      );
    }

    if (deviceTab === "logs") {
      if (logsLoading) return <Loading type="table" rows={4} cols={5} />;
      const mergedLogs = [
        ...deviceLogsForSelected.map((log) => ({ ...log, source: "系统" })),
        ...operationsForSelected.map((op) => ({ ...op, source: "操作" })),
      ].sort((a, b) => b.time.localeCompare(a.time));
      if (mergedLogs.length === 0) {
        return <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>该设备暂无通信日志</div>;
      }
      return (
        <DeviceOpsTable
          columns={["时间", "来源", "类型", "内容", "结果"]}
          rows={mergedLogs.map((log) => [
            log.time,
            <span key={`src-${log.id || log.time}`} style={{ fontSize: "0.75rem", color: log.source === "操作" ? "var(--accent)" : "var(--muted)", fontWeight: 900 }}>{log.source}</span>,
            log.type,
            log.content,
            log.result,
          ])}
        />
      );
    }

    return <div style={{ padding: 24, textAlign: "center", color: "var(--muted)" }}>请从左侧列表选择设备</div>;
  }

  return (
    <main className="admin-console">
      <div className="screen-canvas device-ops-page">
        <section className="device-page-head">
          <div>
            <h2>设备运维</h2>
          </div>
          <div>
            <button type="button" onClick={() => setIsAddDeviceOpen(true)}>新增设备</button>
          </div>
        </section>
        {devicesError && <div className="error-message">{devicesError}</div>}
        <section className="device-metric-grid">
          {[
            ["设备总数", String(deviceItems.length), "传感器 / 控制器 / 摄像头"],
            ["在线设备", `${onlineCount}/${deviceItems.length}`, "实时心跳"],
            ["告警设备", String(alertDevices.length), "离线 / 低湿 / 通信异常"],
            ["待处理反馈", "4", "来自农户端上传"]
          ].map(([label, value, note]) => (
            <article key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          ))}
        </section>
        <div className="device-master-detail">
          <section className="device-detail-panel">
            <div className="device-detail-tabs">
              {rightTabs.map(([id, label]) => (
                <button
                  className={deviceTab === id ? "active" : ""}
                  key={id}
                  type="button"
                  onClick={() => setDeviceTab(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <h3>{hasDevices ? `${tabLabel} · ${selected.id}` : "设备详情"}</h3>
            {devicesLoading ? <Loading type="table" rows={4} cols={5} /> : renderRightPanel()}
          </section>
          <aside className="device-list-panel">
            <div className="device-list-head">
              <input
                type="text"
                placeholder="搜索设备编号或名称…"
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <div className="device-list-filters">
                <select aria-label="设备类型" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                  <option value="">全部类型</option>
                  {[...new Set(deviceItems.map((d) => d.type))].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <select aria-label="状态" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                  <option value="">全部状态</option>
                  <option value="在线">在线</option>
                  <option value="离线">离线</option>
                </select>
                <select aria-label="绑定区域" value={filterArea} onChange={(e) => setFilterArea(e.target.value)}>
                  <option value="">全部区域</option>
                  {[...new Set(deviceItems.map((d) => d.area))].map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="device-list-body">
              {devicesLoading ? (
                <Loading type="table" rows={4} cols={3} />
              ) : filteredDevices.length === 0 ? (
                <div style={{ padding: 20, textAlign: "center", color: "var(--muted)", fontSize: "0.85rem" }}>
                  没有匹配的设备
                </div>
              ) : (
                filteredDevices.map((item) => (
                  <div
                    key={item.id}
                    className={`device-list-item${selectedDeviceId === item.id ? " active" : ""}`}
                    onClick={() => selectDevice(item.id, deviceTab)}
                  >
                    <div className="item-head">
                      <DeviceStatusTag value={item.status} />
                      <strong>{item.id}</strong>
                    </div>
                    <div className="item-meta">
                      <span>{item.type}</span>
                      <span>·</span>
                      <span>{item.area}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </aside>
        </div>
      </div>
      {isAddDeviceOpen && (
        <AddDeviceModal
          onClose={() => setIsAddDeviceOpen(false)}
          onAdd={handleAddDevice}
          existingAreas={assetList}
          farmId=""
          submitting={deviceMutating}
        />
      )}
    </main>
  );
}

// DeviceStatusTag → core/DeviceStatusTag.jsx
// DeviceOpsTable → core/DeviceOpsTable.jsx

function AdminTaskDispatchManagement() {
  return (
    <main className="admin-console">
      <div className="screen-canvas admin-task-layout">
        <ScreenHead title="任务派发" />
        <StatStrip stats={[
          ["任务来源", "后端接口", "按资产详情聚合"],
          ["任务类型", "4 类", "灌溉 / 巡检 / 生长异常 / 病害检测"],
          ["处理入口", "资产详情", "查看关联任务"],
          ["数据状态", "实时加载", "不使用静态样例"],
        ]} />
        <Panel title="任务派发" className="admin-task-list-panel">
          <EmptyState
            title="任务派发入口已接入资产详情"
            description="请选择大棚或地块后查看关联任务，任务列表会从后端接口实时加载。"
          />
        </Panel>
      </div>
    </main>
  );
}

function normalizeAdminCommunityPost(item, index = 0) {
  const statusMap = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已驳回",
    supplement_required: "待补充",
    need_supplement: "待补充",
  };
  const categoryMap = {
    disease: "病害交流",
    irrigation: "灌溉经验",
    fertilization: "施肥经验",
    greenhouse: "大棚管理",
    device: "设备使用",
    other: "其他",
  };
  const auditStatus = item.auditStatus || item.status || "pending";
  const category = item.category || item.type || "other";
  const favoriteCount = Number(item.favoriteCount ?? item.likeCount ?? item.likes ?? 0);
  const commentCount = Number(item.commentCount ?? item.comments ?? 0);

  return {
    id: item.id || `admin-post-${index + 1}`,
    title: item.title || "未命名帖子",
    category,
    type: categoryMap[category] || category,
    author: item.authorDisplayName || item.authorName || item.authorId || item.publisherName || "未知农户",
    meta: `评论 ${commentCount} · 收藏 ${favoriteCount}`,
    status: statusMap[auditStatus] || auditStatus,
    auditStatus,
    commentCount,
    favoriteCount,
    excerpt: item.summary || item.content || "暂无摘要",
    thumb: category === "disease" ? "病害图" : category === "device" ? "设备图" : "经验图",
  };
}

function isPendingAdminCommunityPost(post = {}) {
  return !post.auditStatus || ["pending", "待审核"].includes(post.auditStatus);
}

function buildAdminCommunityAuditStats(posts = []) {
  const pendingCount = posts.filter(isPendingAdminCommunityPost).length;
  const approvedCount = posts.filter((post) => ["approved", "已通过"].includes(post.auditStatus)).length;
  const commentCount = posts.reduce((sum, post) => sum + Number(post.commentCount || 0), 0);
  const favoriteCount = posts.reduce((sum, post) => sum + Number(post.favoriteCount || 0), 0);
  return [
    ["待审核帖子", String(pendingCount), "来自后端审核状态"],
    ["评论总数", String(commentCount), "来自后端评论计数"],
    ["收藏互动", String(favoriteCount), "来自后端收藏计数"],
    ["已通过", String(approvedCount), "已同步到农户端"],
  ];
}

function formatAdminDateTime(value, fallback = "未设置") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function normalizeAdminSupplyReview(item, index = 0) {
  const statusAliases = {
    审核中: "pending",
    待审: "pending",
    待审核: "pending",
    已通过: "approved",
    已驳回: "rejected",
    待补充: "supplement_required",
  };
  const auditStatus = statusAliases[item.auditStatus] || statusAliases[item.status] || item.auditStatus || item.status || "pending";
  const statusMap = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已驳回",
    supplement_required: "待补充",
    need_supplement: "待补充",
    needs_more_info: "待补充",
    审核中: "待审核",
    待审: "待审核",
  };
  const typeMap = {
    supply: "供给",
    demand: "需求",
    help: "求助",
    service: "服务",
  };

  return {
    id: item.id || `admin-supply-${index + 1}`,
    title: item.title || "未命名供需信息",
    farmer: item.publisherDisplayName || item.publisherName || item.publisherId || item.farmer || "未知农户",
    area: item.region || item.assetName || item.assetId || item.area || "未填写区域",
    type: typeMap[item.type] || item.type || "供需",
    rawType: item.type || "",
    status: statusMap[auditStatus] || auditStatus,
    auditStatus,
    summary: item.description || item.summary || "暂无说明",
    contact: item.contact || "未填写",
    amount: item.quantityText || item.quantity || item.amount || "未填写",
    time: item.time || formatAdminDateTime(item.publishedAt || item.createdAt),
    auditComment: item.auditComment || "",
  };
}

const AUDIT_CONTENT_TABS = [
  { label: "全部帖子", filter: "all" },
  { label: "病虫害经验", filter: "disease" },
  { label: "灌溉经验", filter: "irrigation" },
  { label: "施肥经验", filter: "fertilization" },
  { label: "大棚管理", filter: "greenhouse" },
  { label: "设备使用", filter: "device" },
];

function AdminExperienceAudit() {
  const [contentTab, setContentTab] = useState("all");
  const [selectedPosts, setSelectedPosts] = useState(new Set());
  const [auditRemark, setAuditRemark] = useState("内容符合发布规则，同意同步到农户端。");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [auditing, setAuditing] = useState(false);

  async function loadAdminCommunityPosts() {
    setLoading(true);
    setListError("");
    try {
      const response = await listAdminCommunityPosts();
      const nextPosts = pageItems(response)
        .map(normalizeAdminCommunityPost);
      const nextPendingPosts = nextPosts.filter(isPendingAdminCommunityPost);
      setPosts(nextPosts);
      setSelectedPosts((current) => {
        const kept = new Set([...current].filter((id) => nextPendingPosts.some((post) => post.id === id)));
        if (kept.size === 0 && nextPendingPosts[0]) kept.add(nextPendingPosts[0].id);
        return kept;
      });
    } catch (error) {
      const message = apiErrorMessage(error, "待审帖子加载失败");
      setListError(message);
      toast(message, { type: "warn" });
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAdminCommunityPosts();
  }, []);

  useEffect(() => {
    if (pendingPosts.length > 0) {
      setSelectedPosts((current) => {
        const filtered = new Set([...current].filter((id) => pendingPosts.some((post) => post.id === id)));
        if (filtered.size === 0) return new Set([pendingPosts[0].id]);
        return filtered;
      });
    }
  }, [contentTab]);

  function togglePostSelect(id) {
    setSelectedPosts(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function handleAuditCommunityPost(action) {
    const selectedIds = [...selectedPosts];
    if (selectedIds.length === 0) {
      toast("请先选择要审核的帖子", { type: "warn" });
      return;
    }

    const statusByAction = {
      approve: "approved",
      reject: "rejected",
      supplement: "supplement_required",
    };

    setAuditing(true);
    try {
      const selectedItems = posts.filter((post) => selectedIds.includes(post.id));
      await Promise.all(selectedItems.map((post) => auditCommunityPost(post.id, {
        action,
        remark: auditRemark.trim(),
        auditStatus: statusByAction[action],
      })));
      toast("帖子审核结果已提交后端", { type: "success" });
      await loadAdminCommunityPosts();
    } catch (error) {
      toast(apiErrorMessage(error, "帖子审核失败"), { type: "warn" });
    } finally {
      setAuditing(false);
    }
  }

  const selectedCount = selectedPosts.size;
  const pendingPosts = posts.filter((post) => {
    if (!isPendingAdminCommunityPost(post)) return false;
    if (contentTab === "all") return true;
    return post.category === contentTab;
  });
  const auditStats = buildAdminCommunityAuditStats(posts);

  return (
    <main className="admin-console admin-community-page admin-experience-audit-page">
      <header className="admin-title">
        <div>
          <p className="eyebrow">农场管理员 / 经验审核</p>
          <h1>经验审核</h1>
          <p>发帖、评论、举报；管理员按权限审核内容。</p>
        </div>
        <div className="admin-title-actions">
          <button className="ghost-button" type="button" onClick={() => {}}>导出审核记录</button>
        </div>
      </header>

      <div className="screen-canvas admin-community-canvas admin-experience-audit-canvas">
        <StatStrip stats={auditStats} />

        <section className="community-topbar">
          <div className="community-tab-group">
            <select
              className="tab-select"
              value={contentTab}
              onChange={(e) => setContentTab(e.target.value)}
              aria-label="内容分类"
            >
              {AUDIT_CONTENT_TABS.map((tab) => <option key={tab.filter} value={tab.filter}>{tab.label}</option>)}
            </select>
          </div>
          <div className="community-search">
            <input aria-label="搜索帖子" placeholder="搜索帖子" />
            <button type="button" onClick={() => loadAdminCommunityPosts()}>搜索</button>
          </div>
        </section>

        <section className="community-layout admin-review-layout">
          <Panel title="待审内容" className="community-feed">
            {loading ? <Loading type="card" /> : listError ? (
              <EmptyState title="待审帖子加载失败" description={listError} />
            ) : pendingPosts.length === 0 ? (
              <EmptyState title="暂无待审帖子" description="当前后端没有返回待审核社区内容。" />
            ) : pendingPosts.map((post) => (
              <article
                className={`post wide-post ${selectedPosts.has(post.id) ? "active" : ""}`}
                key={post.id}
                onClick={() => togglePostSelect(post.id)}
                style={{ cursor: "pointer" }}
              >
                <div>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="request-meta">
                    <span>{post.type}</span>
                    <span>农户：{post.author}</span>
                    <span>{post.meta}</span>
                    <span className="audit-status-tag">{post.status}</span>
                  </div>
                </div>
                <div className="post-thumb">
                  <img src={COMMUNITY_CATEGORY_IMAGE[post.category] || imgOther} alt={post.title} />
                </div>
              </article>
            ))}
          </Panel>

          <Panel title="审核/动态" className="audit-dynamics-panel">
            <div className="action-row audit-action-row">
              <button type="button" onClick={() => handleAuditCommunityPost("approve")} disabled={auditing || selectedCount === 0}>通过经验</button>
              <button className="danger-button" type="button" onClick={() => handleAuditCommunityPost("reject")} disabled={auditing || selectedCount === 0}>驳回内容</button>
              <button className="ghost-button" type="button" onClick={() => handleAuditCommunityPost("supplement")} disabled={auditing || selectedCount === 0}>要求补充</button>
            </div>
          </Panel>
        </section>
      </div>
    </main>
  );
}

function AdminSupplyAudit() {
  const [reviews, setReviews] = useState([]);
  const [activeReview, setActiveReview] = useState(null);
  const [auditRemark, setAuditRemark] = useState("建议补充采收时间段，例如上午 8:00-11:00。");
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [auditing, setAuditing] = useState(false);

  async function loadSupplyReviews() {
    setLoading(true);
    setListError("");
    try {
      const response = await listAdminSupplyDemands({ page: 1, pageSize: 100 });
      const nextReviews = pageItems(response).map(normalizeAdminSupplyReview);
      setReviews(nextReviews);
      setActiveReview((current) => {
        const currentReview = current ? nextReviews.find((item) => item.id === current.id) : null;
        if (currentReview) return currentReview;
        return nextReviews.find((item) => ["pending", "supplement_required", "needs_more_info"].includes(item.auditStatus)) || nextReviews[0] || null;
      });
    } catch (error) {
      const message = apiErrorMessage(error, "供需审核列表加载失败");
      setListError(message);
      toast(message, { type: "warn" });
      setReviews([]);
      setActiveReview(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSupplyReviews();
  }, []);

  async function handleAuditSupply(action) {
    if (!activeReview) {
      toast("请先选择要审核的供需信息", { type: "warn" });
      return;
    }

    const statusByAction = {
      approve: "approved",
      reject: "rejected",
      supplement: "supplement_required",
    };

    setAuditing(true);
    try {
      const response = await auditSupplyDemand(activeReview.id, {
        action,
        auditStatus: statusByAction[action],
        auditComment: auditRemark.trim(),
        remark: auditRemark.trim(),
      });
      const updated = normalizeAdminSupplyReview(apiItem(response) || activeReview);
      setReviews((current) => current.map((item) => item.id === updated.id ? updated : item));
      setActiveReview(updated);
      toast("供需审核结果已提交后端", { type: "success" });
      await loadSupplyReviews();
    } catch (error) {
      toast(apiErrorMessage(error, "供需审核失败"), { type: "warn" });
    } finally {
      setAuditing(false);
    }
  }

  const stats = useMemo(() => {
    const count = (statuses) => reviews.filter((item) => statuses.includes(item.auditStatus)).length;
    return [
      ["待审核", String(count(["pending"])), "等待管理员处理"],
      ["已通过", String(count(["approved"])), "已同步到前台"],
      ["已驳回", String(count(["rejected"])), "需修改再提"],
      ["待补充", String(count(["supplement_required", "needs_more_info", "need_supplement"])), "信息不完整"],
    ];
  }, [reviews]);

  const pendingReviews = reviews.filter((item) => !["approved", "rejected"].includes(item.auditStatus));

  return (
    <main className="admin-console admin-community-page admin-supply-audit-page">
      <header className="admin-title">
        <div>
          <p className="eyebrow">农场管理员 / 供需审核</p>
          <h1>供需审核</h1>
          <p>查看农户发布详情、补充审核意见、通过或驳回，并把结果同步回农户端。</p>
        </div>
        <div className="admin-title-actions">
          <button className="ghost-button" type="button" onClick={loadSupplyReviews} disabled={loading}>刷新列表</button>
          <button type="button" onClick={() => handleAuditSupply("approve")} disabled={auditing || !activeReview}>通过当前</button>
        </div>
      </header>

      <div className="screen-canvas admin-community-canvas">
        <StatStrip stats={stats} />

        <section className="admin-audit-layout">
          <Panel title="待审列表" className="request-list-panel">
            <div className="request-list">
              {loading ? <Loading type="card" /> : listError && reviews.length === 0 ? (
                <EmptyState title="供需列表加载失败" description={listError} />
              ) : pendingReviews.length === 0 ? (
                <EmptyState title="暂无待审核供需" description="当前农场没有待审核或待补充的供需信息。" />
              ) : pendingReviews.map((item) => (
                <article
                  className={`request-card ${item.id === activeReview?.id ? "active" : ""}`}
                  key={item.id}
                  onClick={() => setActiveReview(item)}
                  style={{ cursor: "pointer" }}
                >
                  <strong>{item.title}</strong>
                  <div className="request-meta">
                    <span>农户：{item.farmer}</span>
                    <span>区域：{item.area}</span>
                    <span>类型：{item.type}</span>
                    <span className="audit-status-tag">{item.status}</span>
                  </div>
                  <p>{item.summary}</p>
                </article>
              ))}
            </div>
          </Panel>

          <Panel title="审核详情" className="audit-detail-panel">
            {!activeReview ? (
              <EmptyState title="请选择供需信息" description="左侧选择一条待审核内容后可提交审核结果。" />
            ) : (
              <>
                <div className="audit-detail-head">
                  <strong className="audit-detail-title">{activeReview.title}</strong>
                  <span className={`audit-detail-type-tag ${activeReview.rawType}`}>{activeReview.type}</span>
                </div>

                <div className="audit-detail-grid">
                  {[
                    ["发布人", activeReview.farmer],
                    ["联系电话", activeReview.contact],
                    ["区域", activeReview.area],
                    ["数量 / 规格", activeReview.amount],
                    ["发布时间", activeReview.time],
                    ["当前状态", activeReview.status],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <span>{label}</span>
                      <strong>{label === "当前状态" ? <span className="audit-status-tag">{value}</span> : value}</strong>
                    </div>
                  ))}
                </div>

                <div className="audit-detail-desc">
                  <strong>供需说明</strong>
                  <p>{activeReview.summary}</p>
                </div>

                <label className="audit-remark-field">
                  <span>审核备注</span>
                  <textarea
                    aria-label="审核备注"
                    value={auditRemark}
                    onChange={(e) => setAuditRemark(e.target.value)}
                  />
                </label>

                <div className="action-row audit-action-row">
                  <button type="button" onClick={() => handleAuditSupply("approve")} disabled={auditing}>通过审核</button>
                  <button className="ghost-button" type="button" onClick={() => handleAuditSupply("supplement")} disabled={auditing}>要求补充</button>
                  <button className="danger-button" type="button" onClick={() => handleAuditSupply("reject")} disabled={auditing}>驳回</button>
                </div>
              </>
            )}
          </Panel>
        </section>
      </div>
    </main>
  );
}

function AdminRelatedTasks({ asset, onBack, onAssetDetail, onNavigate }) {
  const isPlot = asset.type === "plot";
  const assetId = resolveAssetBackendId(asset);
  const relatedScreen = {
    id: isPlot ? "plot-tasks" : "greenhouse-tasks",
    title: `${asset.name} 相关任务`,
    layout: "related-tasks",
    tabs: ["种植作物", "绑定设备", "当前告警"],
    taskScope: isPlot ? "当前地块摘要" : "当前大棚摘要"
  };

  function handleNavigate(targetId, options) {
    if (targetId === "greenhouse-detail" || targetId === "plot-detail") {
      onAssetDetail(asset);
    } else if (targetId === "greenhouse-list" || targetId === "plot-list") {
      onBack();
    } else {
      onNavigate?.(targetId, options);
    }
  }

  return (
    <main className="admin-console">
      <RelatedTasksScreen screen={relatedScreen} onNavigate={handleNavigate} onBack={onBack} assetName={asset.name} assetId={assetId} apiScope="admin" />
    </main>
  );
}

function adminOverviewNumber(value, fallback = 0) {
  const next = Number(value ?? fallback);
  return Number.isFinite(next) ? next : fallback;
}

function adminOverviewInt(value, fallback = 0) {
  return Math.round(adminOverviewNumber(value, fallback));
}

function adminOverviewMetric(value, unit = "") {
  if (value == null || value === "") return "--";
  const number = Number(value);
  if (!Number.isFinite(number)) return `${value}${unit}`;
  const text = Number.isInteger(number) ? String(number) : number.toFixed(1).replace(/\.0$/, "");
  return `${text}${unit}`;
}

function adminOverviewChartItems(items = []) {
  return Array.isArray(items) ? items : [];
}

function normalizeAdminFarmOverview(raw = {}) {
  const summary = raw?.summary || {};
  const permanentCharts = raw?.permanentCharts || {};
  return {
    ...raw,
    summary: {
      assetCount: adminOverviewInt(summary.assetCount),
      greenhouseCount: adminOverviewInt(summary.greenhouseCount),
      plotCount: adminOverviewInt(summary.plotCount),
      openAlertCount: adminOverviewInt(summary.openAlertCount),
      activeTaskCount: adminOverviewInt(summary.activeTaskCount),
      averageTemperature: summary.averageTemperature ?? null,
      averageHumidity: summary.averageHumidity ?? null,
      averageSoilMoisture: summary.averageSoilMoisture ?? null,
    },
    assets: Array.isArray(raw?.assets) ? raw.assets : [],
    permanentCharts: {
      growthStages: adminOverviewChartItems(permanentCharts.growthStages),
      cropTypes: adminOverviewChartItems(permanentCharts.cropTypes),
      taskTypes: adminOverviewChartItems(permanentCharts.taskTypes),
      taskStatuses: adminOverviewChartItems(permanentCharts.taskStatuses),
      environment: adminOverviewChartItems(permanentCharts.environment),
      riskOverview: adminOverviewChartItems(permanentCharts.riskOverview),
      weather: permanentCharts.weather || null,
    },
  };
}

function countAdminOverviewDevices(devices = {}, predicate) {
  return (Array.isArray(devices) ? devices : []).filter(predicate).length;
}

function adminOverviewChartValue(items = [], type) {
  const match = adminOverviewChartItems(items).find((item) => item?.type === type || item?.label === type);
  return adminOverviewInt(match?.value);
}

function isAdminOverviewDeviceOnline(device) {
  return normalizeDeviceStatus(device?.status) === "在线";
}

function isAdminOverviewDeviceOffline(device) {
  return normalizeDeviceStatus(device?.status) === "离线";
}

function isAdminOverviewDeviceAlerting(device) {
  const level = String(device?.alertLevel || "").toLowerCase();
  return Boolean(level && !["none", "normal", "ok"].includes(level)) || normalizeDeviceStatus(device?.status) === "维护中";
}

function buildAdminOverviewTopStats(farmOverview, adminOverviewDevices = []) {
  const summary = farmOverview?.summary || {};
  const deviceTotal = Array.isArray(adminOverviewDevices) ? adminOverviewDevices.length : 0;
  const onlineDeviceCount = countAdminOverviewDevices(adminOverviewDevices, isAdminOverviewDeviceOnline);
  const irrigationTasks = adminOverviewChartValue(farmOverview?.permanentCharts?.taskTypes, "irrigation");
  return [
    ["设备总数", deviceTotal > 0 ? `${deviceTotal}台` : "--"],
    ["在线设备", deviceTotal > 0 ? `${onlineDeviceCount}台` : "--"],
    ["大棚数量", `${adminOverviewInt(summary.greenhouseCount)}块`],
    ["地块数量", `${adminOverviewInt(summary.plotCount)}块`],
    ["今日告警", `${adminOverviewInt(summary.openAlertCount)}条`],
    ["待处理任务", `${adminOverviewInt(summary.activeTaskCount)}项`],
    ["灌溉任务", `${irrigationTasks}项`],
  ];
}

function buildAdminOverviewDeviceStatus(farmOverview, adminOverviewDevices = []) {
  const devices = Array.isArray(adminOverviewDevices) ? adminOverviewDevices : [];
  if (devices.length > 0) {
    const online = countAdminOverviewDevices(devices, isAdminOverviewDeviceOnline);
    const offline = countAdminOverviewDevices(devices, isAdminOverviewDeviceOffline);
    const alerting = countAdminOverviewDevices(devices, isAdminOverviewDeviceAlerting);
    return [
      ["在线设备", `${online} / ${devices.length}`, "后端设备列表"],
      ["离线设备", `${offline}`, offline > 0 ? "待恢复" : "全部在线"],
      ["告警设备", `${alerting}`, alerting > 0 ? "待巡检" : "无告警"],
    ];
  }

  const summary = farmOverview?.summary || {};
  return [
    ["资产总数", `${adminOverviewInt(summary.assetCount)} 个`, "后端农场总览"],
    ["待处理告警", `${adminOverviewInt(summary.openAlertCount)} 条`, "按资产聚合"],
    ["活跃任务", `${adminOverviewInt(summary.activeTaskCount)} 项`, "四类任务"],
  ];
}

function buildAdminOverviewEnvironment(farmOverview) {
  const environment = adminOverviewChartItems(farmOverview?.permanentCharts?.environment);
  if (environment.length > 0) {
    return environment.map((item) => [
      item?.label || "环境指标",
      adminOverviewMetric(item?.value, item?.unit || ""),
    ]);
  }

  const summary = farmOverview?.summary || {};
  return [
    ["空气温度", adminOverviewMetric(summary.averageTemperature, "℃")],
    ["空气湿度", adminOverviewMetric(summary.averageHumidity, "%")],
    ["土壤水分", adminOverviewMetric(summary.averageSoilMoisture, "%")],
  ];
}

function buildAdminOverviewWeather(farmOverview) {
  const weather = farmOverview?.permanentCharts?.weather || {};
  const forecastRows = [weather?.hourlyForecast, weather?.dailyForecast]
    .flat()
    .filter(Boolean)
    .slice(0, 3)
    .map((item) => [
      item?.label || "预报",
      `${adminOverviewMetric(item?.temperatureCelsius, "℃")} / ${adminOverviewMetric(item?.humidityPercent, "%")}`,
      item?.condition || "--",
    ]);

  return {
    summary: weather?.summary || "--",
    location: weather?.location || "--",
    metrics: [
      ["温度", adminOverviewMetric(weather?.temperatureCelsius, "℃")],
      ["降雨概率", weather?.rainProbability == null ? "--" : `${adminOverviewInt(weather.rainProbability)}%`],
      ["湿度", weather?.humidityPercent == null ? "--" : `${adminOverviewInt(weather.humidityPercent)}%`],
      ["风力", weather?.wind || "--"],
    ],
    forecastRows: forecastRows.length > 0 ? forecastRows : [
      ["预报", "--", "--"],
    ],
    tip: weather?.tip || "--",
    updatedAt: weather?.updatedAt || "",
  };
}

function buildAdminOverviewAlerts(farmOverview) {
  const rows = [];
  const assets = Array.isArray(farmOverview?.assets) ? farmOverview.assets : [];
  assets.forEach((asset) => {
    const name = asset?.name || asset?.id || "未命名资产";
    const openAlertCount = adminOverviewInt(asset?.openAlertCount);
    if (openAlertCount > 0) rows.push([name, `${openAlertCount} 条待处理告警`]);

    const growthDetection = asset?.latestGrowthDetection;
    if (growthDetection?.decisionStatus === "mismatch") rows.push([name, "生长阶段异常"]);

    const disease = asset?.latestDisease;
    if (disease && !["healthy", "resolved", "normal"].includes(String(disease.status || "").toLowerCase())) {
      rows.push([name, disease.result || "病害风险待处理"]);
    }
  });

  if (rows.length === 0 && adminOverviewInt(farmOverview?.summary?.openAlertCount) > 0) {
    rows.push(["全场告警", `${adminOverviewInt(farmOverview.summary.openAlertCount)} 条待处理`]);
  }

  return rows.slice(0, 3);
}

function buildAdminOverviewDevicePie(farmOverview, adminOverviewDevices = []) {
  const palette = ["#45c26b", "#3aa0ff", "#ffd166", "#e24d57", "#8b6bd6", "#6b8e7a"];
  const devices = Array.isArray(adminOverviewDevices) ? adminOverviewDevices : [];
  const counts = devices.reduce((acc, device) => {
    const label = normalizeDeviceType(device?.type);
    acc.set(label, (acc.get(label) || 0) + 1);
    return acc;
  }, new Map());

  return [...counts.entries()]
    .filter(([, value]) => value > 0)
    .map(([label, value], index) => ({ label, value, color: palette[index % palette.length] }));
}

function buildAdminOverviewChartRows(items = [], unit = "") {
  return adminOverviewChartItems(items)
    .slice(0, 4)
    .map((item) => [item?.label || item?.type || "未分类", `${adminOverviewInt(item?.value)}${unit}`]);
}

function mapAdminOverviewAssetsForMap(farmOverview) {
  const assets = Array.isArray(farmOverview?.assets) ? farmOverview.assets : [];
  return assets.map((asset, index) => {
    const position = asset?.transform?.position || asset?.position || {};
    return {
      id: asset?.id || `admin-asset-${index + 1}`,
      backendId: asset?.id || "",
      name: asset?.name || asset?.id || "未命名资产",
      type: asset?.type || "greenhouse",
      x: Number(position.x ?? (-2.4 + (index % 3) * 1.9)),
      z: Number(position.z ?? (index < 3 ? -1.1 : 1.05)),
      crop: [asset?.crop, asset?.growthStage].filter(Boolean).join(" / ") || "--",
      owner: asset?.ownerName || "农场管理员",
      openAlertCount: adminOverviewInt(asset?.openAlertCount),
      activeTaskCount: adminOverviewInt(asset?.activeTaskCount),
    };
  });
}

function buildCurrentUser(user = {}) {
  if (!user || typeof user !== "object") return null;
  const roleMap = { farmer: "farmer", farm_admin: "admin", system_admin: "sysadmin" };
  const role = roleMap[user.roleId] || "farmer";
  return {
    role,
    account: user.displayName || user.account || user.id || "",
    userId: user.id || "",
    farmId: user.farmId || "",
  };
}

function readStoredCurrentUser() {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    return buildCurrentUser(JSON.parse(raw));
  } catch {
    return null;
  }
}

function clearStoredAuth() {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
}

function AdminOverview({ setSelectedAsset }) {
  const [farmOverview, setFarmOverview] = useState(null);
  const [adminOverviewDevices, setAdminOverviewDevices] = useState([]);
  const [overviewLoading, setOverviewLoading] = useState(true);
  const [overviewError, setOverviewError] = useState("");

  useEffect(() => {
    let ignored = false;

    async function loadAdminOverview() {
      setOverviewLoading(true);
      setOverviewError("");
      try {
        const [overviewResponse, devicesResponse] = await Promise.all([
          getAdminFarmOverview(),
          listAdminDevices({ page: 1, pageSize: 200 }),
        ]);
        if (ignored) return;
        setFarmOverview(normalizeAdminFarmOverview(apiItem(overviewResponse) || {}));
        setAdminOverviewDevices(pageItems(devicesResponse));
      } catch (error) {
        if (ignored) return;
        const message = apiErrorMessage(error, "管理员总览加载失败");
        setOverviewError(message);
        setFarmOverview(normalizeAdminFarmOverview());
        setAdminOverviewDevices([]);
        toast(message, { type: "warn" });
      } finally {
        if (!ignored) setOverviewLoading(false);
      }
    }

    loadAdminOverview();
    return () => {
      ignored = true;
    };
  }, []);

  const topStats = buildAdminOverviewTopStats(farmOverview, adminOverviewDevices);
  const deviceStatus = buildAdminOverviewDeviceStatus(farmOverview, adminOverviewDevices);
  const weatherData = buildAdminOverviewWeather(farmOverview);
  const alertItems = buildAdminOverviewAlerts(farmOverview);
  const devicePieData = buildAdminOverviewDevicePie(farmOverview, adminOverviewDevices);
  const growthStageItems = farmOverview ? farmOverview.permanentCharts.growthStages : [];
  const riskOverviewItems = farmOverview ? farmOverview.permanentCharts.riskOverview : [];
  const cropStages = buildAdminOverviewChartRows(growthStageItems, " 块");
  const pestRisks = buildAdminOverviewChartRows(riskOverviewItems, " 项");
  const adminMapAssets = mapAdminOverviewAssetsForMap(farmOverview);

  return (
    <main className="admin-console admin-overview">

        <header className="admin-title">
          <h1>智慧农场检测大屏</h1>
        </header>
        {(overviewLoading || overviewError) && (
          <div className="admin-overview-sync">
            {overviewLoading ? "正在加载后端农场总览..." : overviewError}
          </div>
        )}

        <section className="admin-stat-strip">
          {topStats.map(([label, value]) => (
            <article key={label}>
              <strong>{label}</strong>
              <span>{value}</span>
            </article>
          ))}
        </section>

        <section className="admin-screen-grid admin-grid-equal-rows">
          <aside className="admin-left-rail">
            <Panel title="设备运行状态" className="fill-panel">
              <div className="device-status-list">
                {deviceStatus.map(([label, value, note]) => (
                  <div key={label}>
                    <span>{label}</span>
                    <strong>{value}</strong>
                    <small>{note}</small>
                  </div>
                ))}
              </div>

            </Panel>

            <Panel title="天气预报" className="fill-panel weather-panel">
              <div className="weather-summary-panel">
                <strong>{weatherData.summary}</strong>
                <span>{weatherData.location}</span>
              </div>
              <div className="env-grid weather-metric-grid">
                {weatherData.metrics.map(([label, value]) => (
                  <div className="env-item" key={label}><span>{label}</span><strong>{value}</strong></div>
                ))}
              </div>
              <div className="weather-forecast-list overview-weather-forecast">
                {weatherData.forecastRows.map(([label, value, condition]) => (
                  <article key={`${label}-${value}-${condition}`}>
                    <strong>{label}</strong>
                    <span>{condition}</span>
                    <small>{value}</small>
                  </article>
                ))}
              </div>
              <p className="weather-tip">{weatherData.tip}</p>
              {weatherData.updatedAt && <small className="weather-updated-at">更新时间：{weatherData.updatedAt}</small>}
            </Panel>

            <Panel title="实时告警" className="fill-panel alert-panel">
              <div className="alert-list">
                {alertItems.length === 0 ? (
                  <article><strong>暂无待处理告警</strong><span>来自后端农场总览</span></article>
                ) : (
                  alertItems.map(([assetName, content]) => (
                    <article key={`${assetName}-${content}`}><strong>{content}</strong><span>{assetName}</span></article>
                  ))
                )}
              </div>

            </Panel>
          </aside>

          <div className="admin-map-panel fill-panel center-panel">
            <div className="admin-map-inner">
                <FarmThreeMap role="admin" assets={adminMapAssets} onSelectAsset={setSelectedAsset} />
                <div className="map-header-overlay">
                  <h3>农田模型</h3>
                </div>
                <span className="map-hint">点击区域查看农田信息</span>
            </div>
          </div>

          <aside className="admin-right-rail">
            <Panel title="作物生长状态" className="fill-panel">
              <div className="growth-list">
                {cropStages.length === 0 ? (
                  <div><span>暂无生长阶段数据</span><strong>--</strong></div>
                ) : (
                  cropStages.map(([stage, count]) => (
                    <div key={stage}><span>{stage}</span><strong>{count}</strong></div>
                  ))
                )}
              </div>
            </Panel>

            <Panel title="病虫害风险统计" className="fill-panel">
              <div className="risk-list">
                {pestRisks.length === 0 ? (
                  <div><span>暂无风险数据</span><strong>--</strong></div>
                ) : (
                  pestRisks.map(([label, value]) => (
                    <div key={label}><span>{label}</span><strong>{value}</strong></div>
                  ))
                )}
              </div>
            </Panel>

            <Panel title="设备类型占比" className="fill-panel">
              <div className="pie-container">
                {devicePieData.length === 0 ? <EmptyState title="暂无设备类型数据" /> : <PieChart data={devicePieData} size={160} innerRadius={44} />}
              </div>
            </Panel>
          </aside>

      </section>
    </main>
  );
}

function DetailBasicInfoPanel({ title, items, onDeviceClick }) {
  const colors = [ "var(--accent)", "var(--accent-2)", "var(--warn)", "#7c5ce7", "var(--danger)", "var(--ok)", "#6b8e7a" ];
  return (
    <Panel title={title} className="asset-basic-panel">
      <div className="detail-info-card-list">
        {items.map(([label, value, action], i) => {
          const isDeviceEntry = action === "devices";
          const style = { "--detail-accent": colors[i % colors.length] };
          const content = (
            <>
              <span>{label}</span>
              <strong>{value}</strong>
              {isDeviceEntry && <small>点击查看全部设备详情</small>}
            </>
          );
          return isDeviceEntry ? (
            <button key={label} type="button" onClick={onDeviceClick} style={style}>
              {content}
            </button>
          ) : (
            <div key={label} style={style}>
              {content}
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

function BoundDeviceDetailOverlay({ displayName, devices = [], onClose }) {
  return (
    <div className="bound-device-detail-overlay" role="dialog" aria-modal="true" aria-label={`${displayName}绑定设备详情`}>
      <div className="bound-device-detail-popover">
        <div className="bound-device-detail-head">
          <div>
            <strong>绑定设备详情</strong>
            <span>{displayName}</span>
          </div>
          <button type="button" onClick={onClose}>关闭</button>
        </div>
        {devices.length === 0 ? (
          <p className="bound-device-empty">暂无绑定设备</p>
        ) : (
          <div className="bound-device-detail-list">
            {devices.map((device, index) => (
              <article key={device.id || index} className="bound-device-detail-card">
                <div>
                  <strong>{device.name || device.id || `设备 ${index + 1}`}</strong>
                  <span>{normalizeDeviceType(device.type)} · {normalizeDeviceStatus(device.status)}</span>
                </div>
                <dl>
                  <div><dt>设备编号</dt><dd>{device.id || "--"}</dd></div>
                  <div><dt>告警</dt><dd>{device.alertTitle || device.alert || "无"}</dd></div>
                  <div><dt>灌溉状态</dt><dd>{device.irrigationStatus || "--"}</dd></div>
                  <div><dt>最后上报</dt><dd>{device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString("zh-CN", { hour12: false }) : (device.last || "暂无上报")}</dd></div>
                </dl>
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailMetricGrid({ metrics = [] }) {
  return (
    <div className="detail-metric-grid">
      {metrics.map((m) => (
        <article key={m.label} className="mini-panel detail-metric-card">
          <span>{m.label}</span>
          <div>
            <strong className={m.warn ? "warn" : m.ok ? "ok" : ""}>{m.value}</strong>
            {m.unit && <small>{m.unit}</small>}
          </div>
        </article>
      ))}
    </div>
  );
}

function DetailPendingTasksPanel({ tasksLoading, pendingTasks = [], onTaskClick, onViewAll }) {
  return (
    <div className="pending-tasks-panel">
      <h4>待办任务</h4>
      {tasksLoading ? (
        <Loading type="card" />
      ) : pendingTasks.length === 0 ? (
        <p className="pending-empty-text">暂无待办任务</p>
      ) : (
        <div className="admin-task-mini-list">
          {pendingTasks.slice(0, 5).map((task) => (
            <button className="detail-task-row" type="button" key={task.id} onClick={() => onTaskClick?.(task)}>
              <div>
                <strong>{task.title || task.assetName || "待办任务"}</strong>
                <span>{task.type} · {task.deadlineText}</span>
              </div>
              <em className={task.status === "已完成" ? "done" : ""}>{task.status}</em>
            </button>
          ))}
        </div>
      )}
      <button className="detail-task-all-button" type="button" onClick={onViewAll}>
        查看全部任务 →
      </button>
    </div>
  );
}

const GROWTH_STAGE_OPTIONS_BY_CROP = {
  strawberry: [
    { key: "Green", label: "草莓绿果期" },
    { key: "White", label: "草莓白果期" },
    { key: "Turning", label: "草莓转色期" },
    { key: "Early-Turning", label: "草莓初转色" },
    { key: "Late-Turning", label: "草莓后转色" },
    { key: "Red", label: "草莓红熟期" },
  ],
  wheat: [
    { key: "stage_1", label: "小麦出苗期" },
    { key: "stage_2", label: "小麦分蘖期" },
    { key: "stage_3", label: "小麦拔节期" },
    { key: "stage_4", label: "小麦孕穗期" },
    { key: "stage_5", label: "小麦抽穗期" },
    { key: "stage_6", label: "小麦灌浆期" },
    { key: "stage_7", label: "小麦成熟期" },
  ],
};

const GROWTH_STAGE_ALIASES_BY_CROP = {
  strawberry: {
    "绿果期": "Green",
    "草莓绿果期": "Green",
    "白果期": "White",
    "草莓白果期": "White",
    "转色期": "Turning",
    "草莓转色期": "Turning",
    "初转色": "Early-Turning",
    "草莓初转色": "Early-Turning",
    "后转色": "Late-Turning",
    "草莓后转色": "Late-Turning",
    "红熟期": "Red",
    "草莓红熟期": "Red",
    "结果期": "Red",
    "采收期": "Red",
  },
  wheat: {
    "出苗期": "stage_1",
    "小麦出苗期": "stage_1",
    "分蘖期": "stage_2",
    "小麦分蘖期": "stage_2",
    "拔节期": "stage_3",
    "小麦拔节期": "stage_3",
    "孕穗期": "stage_4",
    "小麦孕穗期": "stage_4",
    "抽穗期": "stage_5",
    "小麦抽穗期": "stage_5",
    "灌浆期": "stage_6",
    "小麦灌浆期": "stage_6",
    "成熟期": "stage_7",
    "小麦成熟期": "stage_7",
  },
};

function cropKeyFromName(crop) {
  const value = String(crop || "").toLowerCase();
  if (value.includes("strawberry") || value.includes("草莓")) return "strawberry";
  if (value.includes("wheat") || value.includes("小麦")) return "wheat";
  return "";
}

function growthStageOptionsForCrop(crop) {
  const key = cropKeyFromName(crop);
  return GROWTH_STAGE_OPTIONS_BY_CROP[key] || [];
}

function growthStageKeyForCrop(stage, crop) {
  const value = String(stage || "").trim();
  if (!value) return "";
  const options = growthStageOptionsForCrop(crop);
  if (options.some((item) => item.key === value)) return value;
  const matchedLabel = options.find((item) => item.label === value);
  if (matchedLabel) return matchedLabel.key;
  const aliases = GROWTH_STAGE_ALIASES_BY_CROP[cropKeyFromName(crop)] || {};
  return aliases[value] || "";
}

function growthStageKeyForRecord(record, crop) {
  return growthStageKeyForCrop(record?.stage, crop)
    || growthStageKeyForCrop(record?.detection?.modelStage, crop)
    || growthStageKeyForCrop(record?.detection?.decisionStage, crop)
    || growthStageKeyForCrop(record?.detection?.calendarStage, crop)
    || record?.stage
    || record?.detection?.modelStage
    || record?.detection?.decisionStage
    || "";
}

function growthStageLabel(stage, crop) {
  const value = String(stage || "").trim();
  if (!value) return "未分期";
  const normalizedKey = growthStageKeyForCrop(value, crop) || value;
  const option = growthStageOptionsForCrop(crop).find((item) => item.key === normalizedKey);
  return option?.label || value;
}

function mergeGrowthStageOptions(crop, records = []) {
  const options = [{ key: "all", label: "全部" }, ...growthStageOptionsForCrop(crop)];
  const knownKeys = new Set(options.map((item) => item.key));
  records.forEach((record) => {
    const stageKey = growthStageKeyForRecord(record, crop);
    if (!stageKey || knownKeys.has(stageKey)) return;
    knownKeys.add(stageKey);
    options.push({ key: stageKey, label: growthStageLabel(record.stage, crop) });
  });
  return options;
}

function firstConcreteGrowthStage(options = [], preferred = "", crop = "") {
  const normalizedPreferred = growthStageKeyForCrop(preferred, crop) || preferred;
  if (normalizedPreferred && options.some((item) => item.key === normalizedPreferred && item.key !== "all")) return normalizedPreferred;
  return options.find((item) => item.key !== "all")?.key || "";
}

function GrowthRecordPanel({
  isPlot,
  hasBackendAsset,
  growthFileInputRef,
  cropName,
  growthStageOptions,
  selectedGrowthStage,
  setSelectedGrowthStage,
  growthRecords,
  growthRecordsLoading,
  growthRecordsError,
  uploadingGrowthImage,
  onFileSelected,
}) {
  const [activeGrowthDetectionRecord, setActiveGrowthDetectionRecord] = useState(null);
  const visibleGrowthRecords = selectedGrowthStage === "all"
    ? growthRecords
    : growthRecords.filter((record) => growthStageKeyForRecord(record, cropName) === selectedGrowthStage);
  const growthPhotoRecords = visibleGrowthRecords.filter((record) => record.fileUrl);
  const hasGrowthRecords = growthRecords.length > 0;
  const hasVisibleGrowthRecords = visibleGrowthRecords.length > 0;
  const growthRecordCountByStage = growthRecords.reduce((counts, record) => {
    const stageKey = growthStageKeyForRecord(record, cropName);
    counts[stageKey] = (counts[stageKey] || 0) + 1;
    return counts;
  }, {});
  const activeGrowthDetection = activeGrowthDetectionRecord?.detection || null;
  const activeGrowthDetectionImageUrl = activeGrowthDetectionRecord?.fileUrl || activeGrowthDetection?.imageUrl || "";

  useEffect(() => {
    if (!activeGrowthDetectionRecord) return undefined;
    function closeOnEscape(event) {
      if (event.key === "Escape") setActiveGrowthDetectionRecord(null);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [activeGrowthDetectionRecord]);

  return (
    <Panel title="生长记录" className="growth-record-panel asset-detail-hero">
      <div className="growth-record-toolbar">
        <button type="button" onClick={() => growthFileInputRef.current?.click()} disabled={uploadingGrowthImage || !hasBackendAsset}>
          {uploadingGrowthImage ? "上传中..." : "上传图片"}
        </button>
      </div>
      <div className="growth-stage-tabs" role="tablist" aria-label="生长阶段">
        {growthStageOptions.map((stage) => (
          <button
            className={selectedGrowthStage === stage.key ? "active" : ""}
            type="button"
            key={stage.key}
            onClick={() => setSelectedGrowthStage(stage.key)}
          >
            <span>{stage.label}</span>
            <small>{stage.key === "all" ? growthRecords.length : (growthRecordCountByStage[stage.key] || 0)} 条</small>
          </button>
        ))}
      </div>
      {growthRecordsLoading ? (
        <Loading type="card" />
      ) : growthRecordsError ? (
        <EmptyState title="生长记录加载失败" description={growthRecordsError} />
      ) : (
        <div className="growth-record-scroll">
          <div className="growth-photo-grid">
            {growthPhotoRecords.map((record) => (
              <article className="growth-photo-card uploaded" key={record.id}>
                {record.fileUrl ? <img src={record.fileUrl} alt={record.fileName || record.note || "生长记录图片"} /> : <span aria-hidden="true">图片</span>}
                <small>{record.fileName || formatGrowthRecordTime(record.capturedAt)}</small>
                {record.detection ? (
                  <div className="growth-detection-badge">
                    <strong>{detectionDecisionLabel(record.detection.decisionStatus)}</strong>
                    <span>视觉 {growthStageLabel(record.detection.modelStage, cropName)} / 日历 {growthStageLabel(record.detection.calendarStage, cropName)}</span>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
          {!hasGrowthRecords ? (
            <EmptyState title="暂无生长记录" description="后台自动检测或人工上传后会在这里展示图片和检测详情" />
          ) : !hasVisibleGrowthRecords ? (
            <EmptyState title="当前阶段暂无记录" description="当前阶段还没有上传过拍摄记录" />
          ) : (
            <table className="growth-record-table">
              <thead>
                <tr>
                  <th>拍摄时间</th>
                  <th>记录人</th>
                  <th>生长阶段</th>
                  <th>自动检测</th>
                  <th>观察说明</th>
                </tr>
              </thead>
              <tbody>
                {visibleGrowthRecords.map((record) => (
                  <tr key={record.id}>
                    <td>{formatGrowthRecordTime(record.capturedAt)}</td>
                    <td>{record.recorderName || record.recorderId || "未记录"}</td>
                    <td>{growthStageLabel(record.stage, cropName)}</td>
                    <td>
                      {record.detection ? (
                        <div className="growth-detection-summary">
                          <strong>{detectionDecisionLabel(record.detection.decisionStatus)}</strong>
                          <span>视觉 {growthStageLabel(record.detection.modelStage, cropName)} / 日历 {growthStageLabel(record.detection.calendarStage, cropName)}</span>
                          <button
                            type="button"
                            data-decision-stage={record.detection.decisionStage || ""}
                            data-agent-analysis={record.detection.agentAnalysis || ""}
                            onClick={() => setActiveGrowthDetectionRecord(record)}
                          >
                            查看详情
                          </button>
                        </div>
                      ) : "人工上传"}
                    </td>
                    <td>{record.note || "已上传拍摄图片"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
      <input
        className="growth-file-input"
        ref={growthFileInputRef}
        type="file"
        accept="image/*"
        onChange={onFileSelected}
      />
      {activeGrowthDetectionRecord && activeGrowthDetection ? (
        <div className="growth-detection-dialog-backdrop" onClick={() => setActiveGrowthDetectionRecord(null)}>
          <section
            className="growth-detection-dialog-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="growth-detection-dialog-title"
            onClick={(event) => event.stopPropagation()}
          >
            <header>
              <div>
                <span>自动检测详情</span>
                <h3 id="growth-detection-dialog-title">{detectionDecisionLabel(activeGrowthDetection.decisionStatus)}</h3>
              </div>
              <button type="button" aria-label="关闭自动检测详情" onClick={() => setActiveGrowthDetectionRecord(null)}>×</button>
            </header>
            <div className="growth-detection-dialog-grid">
              <div><span>视觉模型</span><strong>{growthStageLabel(activeGrowthDetection.modelStage, cropName)}</strong><small>{formatDetectionConfidence(activeGrowthDetection.modelConfidence)}</small></div>
              <div><span>经验日历</span><strong>{growthStageLabel(activeGrowthDetection.calendarStage, cropName)}</strong><small>按作物周期推断</small></div>
              <div><span>决策阶段</span><strong>{growthStageLabel(activeGrowthDetection.decisionStage, cropName)}</strong><small>{activeGrowthDetection.detectedAt ? formatGrowthRecordTime(activeGrowthDetection.detectedAt) : "未记录"}</small></div>
            </div>
            {activeGrowthDetectionImageUrl ? (
              <figure className="growth-detection-dialog-image">
                <img
                  src={activeGrowthDetectionImageUrl}
                  alt={activeGrowthDetectionRecord.fileName || activeGrowthDetectionRecord.note || "自动检测生长记录图片"}
                />
                <figcaption>
                  <span>检测图片</span>
                  <strong>{activeGrowthDetectionRecord.fileName || formatGrowthRecordTime(activeGrowthDetectionRecord.capturedAt)}</strong>
                </figcaption>
              </figure>
            ) : null}
            <div className="growth-detection-dialog-note">
              <span>Agent 分析</span>
              <p>{activeGrowthDetection.agentAnalysis || activeGrowthDetectionRecord.note || "模型与日历结果一致，暂无额外分析。"}</p>
            </div>
          </section>
        </div>
      ) : null}
    </Panel>
  );
}

const TREND_METRIC_CONFIG = {
  temperature: {
    label: "温度",
    unit: "℃",
    color: "#f59e0b",
    idealMin: 18,
    idealMax: 30,
    max: 40,
  },
  humidity: {
    label: "空气湿度",
    unit: "%",
    color: "#2da9dc",
    idealMin: 55,
    idealMax: 80,
    max: 100,
  },
  soilMoisture: {
    label: "土壤湿度",
    unit: "%",
    color: "#35c36b",
    idealMin: 40,
    idealMax: 70,
    max: 100,
  },
};

function trendMetricValues(data, metricKey) {
  const target = Array.isArray(data?.series)
    ? data.series.find((item) => item?.metricKey === metricKey)
    : null;
  return (target?.points || [])
    .map((point) => Number(point?.value ?? point?.metricValue ?? point))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function formatTrendRange(values = [], unit = "") {
  if (!values.length) return "--";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const format = (value) => value.toFixed(value % 1 === 0 ? 0 : 1);
  return `${format(min)}~${format(max)}${unit}`;
}

function formatTrendValue(value, unit = "") {
  if (!Number.isFinite(value)) return "--";
  return `${value.toFixed(value % 1 === 0 ? 0 : 1)}${unit}`;
}

function averageTrendValue(values = []) {
  if (!values.length) return null;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clampPercent(value) {
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function buildTrendMetricCards(data) {
  return Object.entries(TREND_METRIC_CONFIG).map(([key, config]) => {
    const values = trendMetricValues(data, key);
    const latest = values.at(-1);
    const previous = values.length > 1 ? values.at(-2) : latest;
    const delta = Number.isFinite(latest) && Number.isFinite(previous) ? latest - previous : null;
    const average = averageTrendValue(values);
    const inRange = Number.isFinite(latest) && latest >= config.idealMin && latest <= config.idealMax;
    return {
      key,
      ...config,
      latestText: formatTrendValue(latest, config.unit),
      averageText: formatTrendValue(average, config.unit),
      deltaText: delta === null ? "--" : `${delta >= 0 ? "+" : ""}${delta.toFixed(Math.abs(delta) % 1 === 0 ? 0 : 1)}${config.unit}`,
      deltaClass: delta === null ? "" : delta >= 0 ? "up" : "down",
      statusText: inRange ? "适宜区间" : "需关注",
      fillPercent: clampPercent((latest / config.max) * 100),
    };
  });
}

function buildTrendStabilityItems(data) {
  return Object.entries(TREND_METRIC_CONFIG).map(([key, config]) => {
    const values = trendMetricValues(data, key);
    const min = values.length ? Math.min(...values) : null;
    const max = values.length ? Math.max(...values) : null;
    const range = Number.isFinite(min) && Number.isFinite(max) ? max - min : null;
    const score = range === null ? 0 : clampPercent(100 - (range / config.max) * 120);
    return {
      key,
      label: config.label,
      color: config.color,
      rangeText: range === null ? "--" : formatTrendRange(values, config.unit),
      score,
      scoreText: score >= 78 ? "稳定" : score >= 55 ? "轻微波动" : "波动偏大",
    };
  });
}

function buildTrendDistributionItems(data) {
  const cards = buildTrendMetricCards(data);
  const total = cards.reduce((sum, card) => sum + Math.max(card.fillPercent, 0), 0) || 1;
  return cards.map((card) => ({
    ...card,
    share: clampPercent((card.fillPercent / total) * 100),
  }));
}

function buildTrendNote(data) {
  const temperature = trendMetricValues(data, "temperature");
  const humidity = trendMetricValues(data, "humidity");
  const soilMoisture = trendMetricValues(data, "soilMoisture");
  return `近 7 天范围：温度 ${formatTrendRange(temperature, "℃")}，空气湿度 ${formatTrendRange(humidity, "%")}，土壤湿度 ${formatTrendRange(soilMoisture, "%")}`;
}

function AssetTrendPanel({ assetId, apiScope = "farmer", large = false }) {
  const [trendData, setTrendData] = useState(null);
  const [trendLoading, setTrendLoading] = useState(Boolean(assetId));
  const [trendError, setTrendError] = useState("");
  const chartHeight = large ? 340 : 220;
  const chartWidth = large ? 1120 : 700;
  const trendNote = useMemo(() => buildTrendNote(trendData), [trendData]);
  const metricCards = useMemo(() => buildTrendMetricCards(trendData), [trendData]);
  const stabilityItems = useMemo(() => buildTrendStabilityItems(trendData), [trendData]);
  const distributionItems = useMemo(() => buildTrendDistributionItems(trendData), [trendData]);

  useEffect(() => {
    if (!assetId) {
      setTrendData(null);
      setTrendLoading(false);
      setTrendError("");
      return undefined;
    }

    let ignored = false;
    async function loadTrendData() {
      setTrendLoading(true);
      setTrendError("");
      try {
        const request = apiScope === "admin" ? getAdminAssetMetrics : getAssetMetrics;
        const response = await request(assetId, {
          metricKeys: "temperature,humidity,soilMoisture",
          hours: 168,
        });
        if (!ignored) setTrendData(apiItem(response));
      } catch (error) {
        if (!ignored) {
          setTrendData(null);
          setTrendError(apiErrorMessage(error, "趋势数据加载失败"));
        }
      } finally {
        if (!ignored) setTrendLoading(false);
      }
    }

    loadTrendData();
    return () => { ignored = true; };
  }, [assetId, apiScope]);

  return (
    <Panel title="环境变化趋势" className={`environment-trend-panel${large ? " environment-trend-panel-large" : ""}`}>
      <div className="environment-trend-summary-grid">
        {metricCards.map((card) => (
          <article className="trend-metric-card" key={card.key} style={{ "--trend-color": card.color, "--trend-fill": `${card.fillPercent}%` }}>
            <span>{card.label}</span>
            <strong>{card.latestText}</strong>
            <small className={card.deltaClass}>{card.deltaText} · 均值 {card.averageText}</small>
            <em>{card.statusText}</em>
          </article>
        ))}
      </div>
      <div className="environment-trend-chart-layout">
        <div className="environment-trend-chart-frame">
          <div className="trend-legend" aria-hidden="true">
            <span><i className="trend-legend-temp" />温度</span>
            <span><i className="trend-legend-humidity" />空气湿度</span>
            <span><i className="trend-legend-soil" />土壤湿度</span>
          </div>
          {trendLoading ? (
            <div className="trend-inline-state" style={{ minHeight: chartHeight }}>趋势加载中...</div>
          ) : (
            <LineChart series={trendData?.series || []} width={chartWidth} height={chartHeight} />
          )}
        </div>
        <aside className="trend-side-stack">
          <section className="trend-side-card trend-stability-card">
            <h4>稳定性</h4>
            {stabilityItems.map((item) => (
              <div className="trend-mini-bar" key={item.key}>
                <span><b>{item.label}</b><small>{item.scoreText}</small></span>
                <div><i className="trend-mini-bar-fill" style={{ width: `${item.score}%`, background: item.color }} /></div>
                <em>{item.rangeText}</em>
              </div>
            ))}
          </section>
          <section className="trend-side-card trend-distribution-card">
            <h4>环境均衡</h4>
            <div className="trend-distribution-ring" aria-hidden="true">
              {distributionItems.map((item, index) => (
                <i
                  key={item.key}
                  style={{
                    "--ring-color": item.color,
                    "--ring-inset": `${7 + index * 8}px`,
                    "--ring-rotation": `${Math.max(22, item.share) * 2.4}deg`,
                  }}
                />
              ))}
              <strong>综合</strong>
            </div>
            <div className="trend-insight-list">
              {distributionItems.map((item) => (
                <span key={item.key}><i style={{ background: item.color }} />{item.label} {item.latestText}</span>
              ))}
            </div>
          </section>
        </aside>
      </div>
      <p className="trend-note">{trendError || trendNote}</p>
    </Panel>
  );
}

function AdminAssetDetail({ asset, onBack, onNavigate, onRelatedTasks }) {
  const isPlot = asset.type === "plot";
  const assetId = resolveAssetBackendId(asset);
  const growthFileInputRef = useRef(null);
  const hasBackendAsset = Boolean(assetId);
  const [assetDevices, setAssetDevices] = useState([]);
  const [pendingTasks, setPendingTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [envLoading, setEnvLoading] = useState(true);
  const [envError, setEnvError] = useState("");
  const [showDeviceDetailCard, setShowDeviceDetailCard] = useState(false);
  const [selectedGrowthStage, setSelectedGrowthStage] = useState("all");
  const [growthRecords, setGrowthRecords] = useState([]);
  const [growthRecordsLoading, setGrowthRecordsLoading] = useState(true);
  const [growthRecordsError, setGrowthRecordsError] = useState("");
  const [uploadingGrowthImage, setUploadingGrowthImage] = useState(false);
  const [diseaseStatistics, setDiseaseStatistics] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(true);
  const [diseaseError, setDiseaseError] = useState("");
  const [thresholdDetail, setThresholdDetail] = useState(null);
  const [thresholdLoading, setThresholdLoading] = useState(Boolean(assetId));
  const [thresholdInput, setThresholdInput] = useState("45");
  const [thresholdSaving, setThresholdSaving] = useState(false);
  const [environmentControls, setEnvironmentControls] = useState(emptyEnvironmentControls());
  const normalizedDiseaseStatistics = normalizeDiseaseStatistics(diseaseStatistics);
  const diseasePieData = buildDiseasePieData(normalizedDiseaseStatistics);
  const latestDisease = normalizedDiseaseStatistics.latest;
  const normalizedDevices = assetDevices.map((item, index) => normalizeDeviceItem(item, index));
  const deviceTypeCounts = normalizedDevices.reduce((acc, device) => {
    acc[device.type] = (acc[device.type] || 0) + 1;
    return acc;
  }, {});
  const deviceSummary = asset.deviceSummary || {};
  const deviceTotal = normalizedDevices.length || Number(deviceSummary.total || 0);
  const onlineDeviceCount = normalizedDevices.filter((device) => device.status === "在线").length || Number(deviceSummary.online || 0);
  const offlineDeviceCount = Math.max(deviceTotal - onlineDeviceCount, 0);
  const deviceSummaryText = normalizedDevices.length > 0
    ? Object.entries(deviceTypeCounts).map(([label, count]) => `${label} ${count} 台`).join(" / ")
    : (asset.deviceText || "暂无设备");
  const deviceStatusText = deviceTotal > 0 ? `${onlineDeviceCount} 台在线 / ${offlineDeviceCount} 台离线` : "暂无设备";
  const alertText = Number(asset.openAlertCount || 0) > 0 ? `${asset.openAlertCount} 条告警` : (asset.warningText || "无");
  const cropName = asset.cropName || String(asset.crop || "").split(" / ")[0] || "--";
  const growthStage = asset.growthStage || String(asset.crop || "").split(" / ")[1] || "--";
  const growthStageOptions = useMemo(() => mergeGrowthStageOptions(cropName, growthRecords), [cropName, growthRecords]);
  const uploadGrowthStage = firstConcreteGrowthStage(growthStageOptions, selectedGrowthStage === "all" ? asset.growthStage : selectedGrowthStage, cropName);
  const uploadGrowthStageLabel = growthStageLabel(uploadGrowthStage, cropName);
  const detailMetrics = [
    { label: "作物", value: cropName },
    { label: "生长期", value: growthStageLabel(growthStage, cropName) },
    { label: "健康度", value: "--" },
    { label: "病害风险", value: Number(asset.openAlertCount || 0) > 0 ? "中" : "低", warn: Number(asset.openAlertCount || 0) > 0 },
  ];
  const basicInfo = [
    [isPlot ? "地块名称" : "大棚名称", asset.name],
    ["种植作物", asset.crop || "--"],
    ["管理农户", asset.owner || "农场管理员"],
    ["绑定设备", envLoading ? "加载中..." : deviceSummaryText, "devices"],
    ["设备状态", envLoading ? "加载中..." : deviceStatusText],
    ["当前告警", alertText],
    ["所属农场", "南区智慧农场"]
  ];
  const thresholdText = thresholdLoading
    ? "阈值加载中..."
    : `低于 ${(thresholdDetail?.minValue ?? thresholdInput) || 45}% 触发告警`;

  useEffect(() => {
    let ignored = false;
    async function loadAssetTasks() {
      if (!hasBackendAsset) {
        setPendingTasks([]);
        setTasksLoading(false);
        return;
      }
      setTasksLoading(true);
      try {
        const response = await listAdminAssetTasks(assetId, { page: 1, pageSize: 5 });
        if (!ignored) setPendingTasks(pageItems(response).map(normalizeTaskItem));
      } catch (error) {
        if (!ignored) toast(apiErrorMessage(error, "待办任务加载失败"), { type: "warn" });
      } finally {
        if (!ignored) setTasksLoading(false);
      }
    }
    loadAssetTasks();
    return () => { ignored = true; };
  }, [assetId, hasBackendAsset]);

  useEffect(() => {
    let ignored = false;
    async function loadAssetEnvironment() {
      if (!hasBackendAsset) {
        setAssetDevices([]);
        setEnvironmentControls(emptyEnvironmentControls());
        setEnvError("");
        setEnvLoading(false);
        return;
      }
      setEnvLoading(true);
      setEnvError("");
      try {
        const response = await listAdminDevices({ assetId, page: 1, pageSize: 50 });
        if (!ignored) {
          const nextDevices = pageItems(response);
          setAssetDevices(nextDevices);
          setEnvironmentControls(buildEnvironmentControlsFromDevices(nextDevices));
        }
      } catch (error) {
        if (!ignored) {
          const message = apiErrorMessage(error, "实时环境数据加载失败");
          setEnvError(message);
          setEnvironmentControls(emptyEnvironmentControls());
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) setEnvLoading(false);
      }
    }
    loadAssetEnvironment();
    return () => { ignored = true; };
  }, [assetId, hasBackendAsset]);

  useEffect(() => {
    let ignored = false;
    async function loadAdminThresholds() {
      if (!hasBackendAsset) {
        setThresholdDetail(null);
        setThresholdLoading(false);
        setThresholdInput("45");
        return;
      }
      setThresholdLoading(true);
      try {
        const response = await getAdminAssetThresholds(assetId);
        const items = pageItems(response);
        const soilThreshold = items.find((item) => item.metricKey === "soilMoisture") || items[0] || null;
        if (!ignored) {
          setThresholdDetail(soilThreshold);
          setThresholdInput(String(soilThreshold?.minValue ?? 45));
        }
      } catch (error) {
        if (!ignored) toast(apiErrorMessage(error, "土壤湿度阈值加载失败"), { type: "warn" });
      } finally {
        if (!ignored) setThresholdLoading(false);
      }
    }
    loadAdminThresholds();
    return () => { ignored = true; };
  }, [assetId, hasBackendAsset]);

  useEffect(() => {
    let ignored = false;
    async function loadDiseaseStatistics() {
      if (!hasBackendAsset) {
        setDiseaseStatistics(null);
        setDiseaseError("");
        setDiseaseLoading(false);
        return;
      }
      setDiseaseLoading(true);
      setDiseaseError("");
      try {
        const response = await getAdminAssetDiseaseStatistics(assetId);
        if (!ignored) setDiseaseStatistics(apiItem(response));
      } catch (error) {
        if (!ignored) {
          const message = apiErrorMessage(error, "病虫害统计加载失败");
          setDiseaseStatistics(null);
          setDiseaseError(message);
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) setDiseaseLoading(false);
      }
    }
    loadDiseaseStatistics();
    return () => { ignored = true; };
  }, [assetId, hasBackendAsset]);

  async function loadGrowthRecords() {
    if (!hasBackendAsset) {
      setGrowthRecords([]);
      setGrowthRecordsError("");
      setGrowthRecordsLoading(false);
      return;
    }
    setGrowthRecordsLoading(true);
    setGrowthRecordsError("");
    try {
      const response = await listAdminGrowthRecords(assetId, { page: 1, pageSize: 200 });
      setGrowthRecords(normalizeGrowthRecordItems(apiItem(response)?.items || pageItems(response)));
    } catch (error) {
      const message = apiErrorMessage(error, "生长记录加载失败");
      setGrowthRecords([]);
      setGrowthRecordsError(message);
      toast(message, { type: "warn" });
    } finally {
      setGrowthRecordsLoading(false);
    }
  }

  useEffect(() => {
    let ignored = false;
    async function run() {
      if (!hasBackendAsset) {
        setGrowthRecords([]);
        setGrowthRecordsError("");
        setGrowthRecordsLoading(false);
        return;
      }
      setGrowthRecordsLoading(true);
      setGrowthRecordsError("");
      try {
        const response = await listAdminGrowthRecords(assetId, { page: 1, pageSize: 200 });
        if (!ignored) setGrowthRecords(normalizeGrowthRecordItems(apiItem(response)?.items || pageItems(response)));
      } catch (error) {
        if (!ignored) {
          const message = apiErrorMessage(error, "生长记录加载失败");
          setGrowthRecords([]);
          setGrowthRecordsError(message);
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) setGrowthRecordsLoading(false);
      }
    }
    run();
    return () => { ignored = true; };
  }, [assetId, hasBackendAsset]);

  useEffect(() => {
    if (!growthStageOptions.length) return;
    if (growthStageOptions.some((item) => item.key === selectedGrowthStage)) return;
    setSelectedGrowthStage("all");
  }, [growthStageOptions, selectedGrowthStage]);

  async function handleGrowthImageSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!hasBackendAsset) {
      toast("当前资产没有后端编号，不能创建生长记录", { type: "warn" });
      event.target.value = "";
      return;
    }
    if (!uploadGrowthStage) {
      toast("当前作物没有可用的生长阶段，不能创建生长记录", { type: "warn" });
      event.target.value = "";
      return;
    }
    setUploadingGrowthImage(true);
    try {
      const response = await uploadFile(file, "growth-record");
      const uploadedFile = apiItem(response) || {};
      await createAdminGrowthRecord(assetId, {
        stage: uploadGrowthStage,
        fileId: uploadedFile.id || uploadedFile.fileId,
        note: `${uploadGrowthStageLabel}图片记录：${uploadedFile.fileName || uploadedFile.name || file.name}`,
        capturedAt: new Date().toISOString().slice(0, 19),
      });
      await loadGrowthRecords();
      toast("图片已上传，并生成真实生长记录", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "图片上传失败"), { type: "warn" });
    } finally {
      setUploadingGrowthImage(false);
      event.target.value = "";
    }
  }

  async function handleAdminThresholdSave() {
    if (!hasBackendAsset) {
      toast("当前资产没有后端编号，无法保存阈值", { type: "warn" });
      return;
    }
    const minValue = Number(thresholdInput);
    if (!Number.isFinite(minValue) || minValue <= 0 || minValue > 100) {
      toast("请输入 1-100 之间的土壤湿度阈值", { type: "warn" });
      return;
    }

    setThresholdSaving(true);
    try {
      const response = await updateAdminAssetThreshold(assetId, "soilMoisture", { minValue, enabled: true });
      const saved = apiItem(response);
      setThresholdDetail(saved);
      setThresholdInput(String(saved?.minValue ?? minValue));
      toast("土壤湿度阈值已保存", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "土壤湿度阈值保存失败"), { type: "warn" });
    } finally {
      setThresholdSaving(false);
    }
  }

  async function handleAdminIrrigationCommand(commandType) {
    const irrigationDevice = assetDevices
      .map((item, index) => normalizeDeviceItem(item, index))
      .find((device) => /irrigation|灌溉|controller|控制/.test(`${device.rawType} ${device.type} ${device.name}`.toLowerCase()));
    if (!irrigationDevice) {
      toast(hasBackendAsset ? "当前资产没有可下发灌溉指令的设备" : "当前为本地占位资产，暂无后端设备可操作", { type: "warn" });
      return;
    }

    try {
      await issueDeviceCommand(irrigationDevice.id, {
        commandType,
        parameters: commandType === "start_irrigation" ? { durationMinutes: 0.05 } : {},
        idempotencyKey: `web-admin-${assetId}-${commandType}-${Date.now()}`,
      });
      toast(commandType === "start_irrigation" ? "灌溉指令已提交后端" : "停止灌溉指令已提交后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "灌溉指令下发失败"), { type: "warn" });
    }
  }

  return (
    <div className="screen-canvas detail-layout">
        <ScreenHead
          title={asset.name}
          secondary="↩"
          secondaryClass="back-arrow-btn"
          onSecondary={onBack}
        />
        <section className="asset-detail-grid" aria-label={`${asset.name}查看详情`}>
          <div className="asset-detail-left-rail">
            <DetailBasicInfoPanel
              title={`${isPlot ? "地块" : "大棚"}基本信息`}
              items={basicInfo}
              onDeviceClick={() => setShowDeviceDetailCard((current) => !current)}
            />
            {showDeviceDetailCard && (
              <BoundDeviceDetailOverlay
                displayName={asset.name}
                devices={normalizedDevices}
                onClose={() => setShowDeviceDetailCard(false)}
              />
            )}
            <DetailMetricGrid metrics={detailMetrics} />
          </div>
          <div className="realtime-monitor-panel">
            <h3>{asset.name} 实时监控</h3>
            <div className="monitor-placeholder">
              <strong>{asset.name}</strong>
              <span>实时监控画面 / 传感器空间视图</span>
            </div>
          </div>
          <Panel title="实时环境与操作" className="environment-control-panel">
            {envLoading ? <p className="environment-inline-status">正在同步后端环境数据...</p> : null}
            {envError ? <p className="environment-inline-status warn">{envError}</p> : null}
            <div className="environment-control-grid">
              {environmentControls.map(([label, value]) => (
                <button type="button" key={label}>
                  <span>{label}</span>
                  <strong>{value}</strong>
                </button>
              ))}
            </div>
            <div className="soil-threshold-editor">
              <div>
                <strong>土壤湿度阈值</strong>
                <span>{thresholdText}</span>
              </div>
              <label>
                <span>最低土壤湿度（%）</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  step="1"
                  value={thresholdInput}
                  onChange={(event) => setThresholdInput(event.target.value)}
                  disabled={thresholdSaving}
                />
              </label>
              <button type="button" onClick={handleAdminThresholdSave} disabled={thresholdLoading || thresholdSaving}>
                {thresholdSaving ? "保存中" : "保存阈值"}
              </button>
            </div>
            <div className="irrigation-actions">
              <button type="button" onClick={() => handleAdminIrrigationCommand("start_irrigation")}>启动灌溉</button>
              <button type="button" onClick={async () => { const ok = await confirm("确定要停止灌溉吗？作物可能因缺水受影响。", { title: "停止灌溉", danger: true }); if (ok) handleAdminIrrigationCommand("stop_irrigation"); }}>停止灌溉</button>
            </div>
            <DetailPendingTasksPanel
              tasksLoading={tasksLoading}
              pendingTasks={pendingTasks}
              onTaskClick={(task) => onNavigate?.(task.targetId, { taskId: task.id })}
              onViewAll={() => onRelatedTasks ? onRelatedTasks(asset) : onNavigate?.(isPlot ? "plot-tasks" : "greenhouse-tasks", { assetId, assetName: asset.name })}
            />
          </Panel>
          <Panel title="病虫害统计" className="disease-summary-panel">
          {diseaseLoading ? (
            <Loading type="card" />
          ) : diseaseError ? (
            <EmptyState title="统计加载失败" description={diseaseError} />
          ) : normalizedDiseaseStatistics.total === 0 ? (
            <EmptyState title="暂无病虫害数据" description="当前区域还没有后端诊断记录" />
          ) : (
            <div className="disease-pie-card">
              <div className="disease-pie-visual">
                <PieChart data={diseasePieData} size={150} />
                <div className="disease-pie-total">
                  <strong>{normalizedDiseaseStatistics.total}</strong>
                  <span>次诊断</span>
                </div>
              </div>
              <div className="disease-pie-legend">
                {diseasePieData.map((item) => (
                  <div className="disease-pie-legend-item" key={item.label}>
                    <i style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
              {latestDisease ? (
                <div className="disease-latest-summary">
                  <span>最新诊断</span>
                  <strong>{latestDisease.result}</strong>
                  <small>
                    {diseaseRiskLabel(latestDisease.riskLevel)} · 置信度 {formatDiseaseConfidence(latestDisease.confidence)}
                  </small>
                  <em>{formatDiseaseTime(latestDisease.createdAt)}</em>
                </div>
              ) : null}
            </div>
          )}
          </Panel>
          <div className="growth-detail-stack">
            <GrowthRecordPanel
              isPlot={isPlot}
              hasBackendAsset={hasBackendAsset}
              growthFileInputRef={growthFileInputRef}
              cropName={cropName}
              growthStageOptions={growthStageOptions}
              selectedGrowthStage={selectedGrowthStage}
              setSelectedGrowthStage={setSelectedGrowthStage}
              growthRecords={growthRecords}
              growthRecordsLoading={growthRecordsLoading}
              growthRecordsError={growthRecordsError}
              uploadingGrowthImage={uploadingGrowthImage}
              onFileSelected={handleGrowthImageSelected}
            />
            <AssetTrendPanel assetId={assetId} apiScope="admin" large />
          </div>
        </section>
      </div>
  );
}

// function FarmThreeMap → imported

// function FarmerSidebar → imported

// function ProfileModal → imported

// getActiveNavSectionId, matchesNavTarget → data/navigation.js
function ScreenView({ screen, chatContext, selectedCommunityPostId, selectedTaskId, selectedAssetId, selectedAssetName, selectedAssetCrop, onNavigate, goBack, role = "farmer" }) {
  if (screen.layout === "notes") return <NotesScreen screen={screen} />;
  if (screen.layout === "dashboard") return <DashboardScreen screen={screen} onNavigate={onNavigate} />;
  if (screen.layout === "asset-list") return <AssetListScreen screen={screen} onNavigate={onNavigate} />;
  if (screen.layout === "detail") return <DetailScreen screen={screen} onNavigate={onNavigate} goBack={goBack} assetId={selectedAssetId} assetName={selectedAssetName} assetCrop={selectedAssetCrop} />;
  if (screen.layout === "related-tasks") return <RelatedTasksScreen screen={screen} onNavigate={onNavigate} goBack={goBack} assetId={selectedAssetId} assetName={selectedAssetName} />;
  if (screen.layout === "operation") return <OperationScreen screen={screen} taskId={selectedTaskId} onNavigate={onNavigate} goBack={goBack} />;
  if (screen.layout === "detection") return <DetectionScreen screen={screen} taskId={selectedTaskId} onNavigate={onNavigate} role={role} />;
  if (screen.layout === "chat-context") return <ChatScreen chatContext={chatContext} role={role} />;
  if (screen.layout === "community") return <CommunityScreen screen={screen} onNavigate={onNavigate} />;
  if (screen.layout === "community-category") return <CommunityCategoryScreen screen={screen} onNavigate={onNavigate} />;
  if (screen.layout === "community-publish") return <CommunityPublishScreen screen={screen} onNavigate={onNavigate} />;
  if (screen.layout === "community-help") return <CommunityHelpScreen screen={screen} onNavigate={onNavigate} />;
  if (screen.layout === "community-detail") return <CommunityDetailScreen screen={screen} postId={selectedCommunityPostId} onNavigate={onNavigate} />;
  if (screen.layout === "supply-publish") return <SupplyPublishScreen screen={screen} onNavigate={onNavigate} />;
  return <SupplyScreen screen={screen} onNavigate={onNavigate} />;
}
function NotesScreen({ screen }) {
  return (
    <div className="screen-canvas notes-canvas">
      <section className="notes-panel">
        <p className="eyebrow">说明</p>
        <h2>{screen.title}</h2>
        <div className="note-grid">
          {screen.bullets.map((bullet) => (
            <span key={bullet}>{bullet}</span>
          ))}
        </div>
      </section>
    </div>
  );
}

function DashboardScreen() {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <ScDatavDemo1 scope="farmer" />
    </div>
  );
}

function AssetListScreen({ screen, onNavigate, scope = "farmer", showOwner = false, onAssetDetail, onRelatedTasks }) {
  const isGreenhouse = screen.assetType === "大棚";
  const detailTarget = isGreenhouse ? "greenhouse-detail" : "plot-detail";
  const taskTarget = isGreenhouse ? "greenhouse-tasks" : "plot-tasks";
  const canSwitchViews = scope === "admin";
    const [assetList, setAssetList] = useState([]);
  const [totalTaskCount, setTotalTaskCount] = useState(0);
  const [onlineDeviceCount, setOnlineDeviceCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  useEffect(() => {
    let ignored = false;
    async function loadAssets() {
      setLoading(true);
      setListError("");
      try {
        if (scope === "admin") {
          const response = await listAdminAssets({
            type: isGreenhouse ? "greenhouse" : "plot",
            page: 1,
            pageSize: 200,
          });
          if (ignored) return;
          const mapped = assetPageItems(response).map((asset) => mapAdminAssetForScreen(asset, isGreenhouse));
          const totals = mapped.reduce((acc, asset) => {
            const summary = asset.deviceSummary || {};
            acc.tasks += Number(asset.activeTaskCount || 0);
            acc.online += Number(summary.online || 0);
            return acc;
          }, { tasks: 0, online: 0 });
          setAssetList(mapped);
          setTotalTaskCount(totals.tasks);
          setOnlineDeviceCount(totals.online);
          return;
        }

        const response = await listAssets({
          type: isGreenhouse ? "greenhouse" : "plot",
          page: 1,
          pageSize: 200,
        });
        if (ignored) return;
        const mapped = assetPageItems(response).map((asset) =>
          mapFarmerAssetForScreen(asset, isGreenhouse ? "greenhouse" : "plot")
        );
        const totals = mapped.reduce((acc, asset) => {
          const summary = asset.deviceSummary || {};
          acc.tasks += Number(asset.activeTaskCount || 0);
          acc.online += Number(summary.online || 0);
          return acc;
        }, { tasks: 0, online: 0 });
        setAssetList(mapped);
        setTotalTaskCount(totals.tasks);
        setOnlineDeviceCount(totals.online);
      } catch (error) {
        const message = apiErrorMessage(error, "资产列表加载失败");
        if (!ignored) setListError(message);
        toast(message, { type: "warn" });
      } finally {
        if (!ignored) setLoading(false);
      }
    }
    loadAssets();
    return () => { ignored = true; };
  }, [screen.assetType, scope]);

  const handleMonitor = (asset) => onAssetDetail ? onAssetDetail(asset) : onNavigate?.(detailTarget, { assetId: resolveAssetBackendId(asset), assetName: asset.name, assetCrop: asset.crop });
  const handleTask = (asset) => onRelatedTasks ? onRelatedTasks(asset) : onNavigate?.(taskTarget, { assetId: resolveAssetBackendId(asset), assetName: asset.name });

  const filteredAssets = assetList.filter(asset => {
    if (searchText) {
      const lowerText = searchText.toLowerCase();
      if (!asset.name.toLowerCase().includes(lowerText) && 
          !asset.owner?.toLowerCase().includes(lowerText) &&
          !asset.crop?.toLowerCase().includes(lowerText)) {
        return false;
      }
    }
    if (filterType && asset.typeLabel !== filterType) return false;
    if (filterStatus && asset.status !== filterStatus) return false;
    return true;
  });
  const totalDeviceCount = assetList.reduce((total, asset) => total + Number(asset.deviceSummary?.total || asset.deviceCount || 0), 0);
  const alertAssetCount = assetList.filter((asset) => asset.warningText && asset.warningText !== "无").length;
  const assetListStats = [
    [`${screen.assetType}总数`, String(assetList.length), scope === "admin" ? "后端资产列表" : "已分配给你的资产"],
    ["在线设备", totalDeviceCount > 0 ? `${onlineDeviceCount}/${totalDeviceCount}` : String(onlineDeviceCount), "传感器与控制器"],
    ["待处理告警", String(alertAssetCount), "需关注资产"],
    ["今日任务", String(totalTaskCount), "待处理与进行中"],
  ];

  if (loading) {
    return (
      <div className="screen-canvas asset-layout">
        <ScreenHead title={screen.title} />
        <Loading type="stat" count={4} />
        <Panel title="加载中">
          <Loading type="table" rows={4} cols={4} />
        </Panel>
      </div>
    );
  }

  if (listError) {
    return (
      <div className="screen-canvas asset-layout">
        <ScreenHead title={screen.title} />
        <EmptyState icon="greenhouse" title={`${screen.assetType}列表加载失败`} description={listError} />
      </div>
    );
  }

  if (assetList.length === 0) {
    return (
      <div className="screen-canvas asset-layout">
        <ScreenHead title={screen.title} />
        <EmptyState icon="greenhouse" title={`暂无${screen.assetType}`} description="当前账号没有被分配任何大棚或地块" />
      </div>
    );
  }

  return (
    <div className="screen-canvas asset-layout">
      <ScreenHead title={screen.title} />
      
      <section className="stat-strip">
        {assetListStats.map(([label, value, note], i) => {
          const targets = scope === "admin" ? [null, "admin-devices", null, null] : [null, null, null, null];
          const target = targets[i];
          return (
            <article
              key={label}
              onClick={() => target && onNavigate?.(target)}
              style={{ cursor: target ? "pointer" : "default", transition: "transform 120ms ease" }}
              onMouseEnter={(e) => { if (target) e.currentTarget.style.transform = "scale(1.03)"; }}
              onMouseLeave={(e) => { if (target) e.currentTarget.style.transform = "scale(1)"; }}
            >
              <span>{label}</span>
              <strong>{value}</strong>
              <small>{note}</small>
            </article>
          );
        })}
      </section>

      {canSwitchViews && (
        <section style={{ 
          padding: "16px", 
          background: "white", 
          borderRadius: "12px", 
          border: "1px solid var(--line)", 
          marginBottom: "16px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "12px"
        }}>
          <input
            type="text"
            placeholder={`搜索${screen.assetType}名称/负责人...`}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              fontSize: "0.9rem"
            }}
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              fontSize: "0.9rem"
            }}
          >
            <option value="">全部类型</option>
            {Array.from(new Set(assetList.map(a => a.typeLabel))).map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            style={{
              padding: "10px 12px",
              border: "1px solid var(--line)",
              borderRadius: "8px",
              fontSize: "0.9rem"
            }}
          >
            <option value="">全部状态</option>
            {Array.from(new Set(assetList.map(a => a.status))).map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </section>
      )}

      {canSwitchViews ? (
        <Panel className="asset-list-panel admin-asset-list-panel">
          <AdminAssetTable 
            screen={screen} 
            assets={filteredAssets} 
            onMonitor={handleMonitor} 
            onTask={handleTask} 
          />
        </Panel>
      ) : (
        <Panel className="asset-list-panel admin-asset-list-panel">
          <div className="asset-grid">
          {assetList.map((asset) => (
            <article key={asset.id} className="asset-card">
              <div>
                <strong>{asset.name}</strong>
                <span>{asset.crop}</span>
                {showOwner && <small className="asset-owner">管理农户：{asset.owner}</small>}
              </div>
              <div className="asset-actions">
                <button type="button" onClick={() => handleMonitor(asset)}>查看详情</button>
                <button type="button" onClick={() => handleTask(asset)}>相关任务</button>
              </div>
              <b>{asset.status}</b>
            </article>
          ))}
        </div>
        </Panel>
      )}
    </div>
  );
}
function AdminAssetTable({ screen, assets, onMonitor, onTask }) {
  const columns = ["名称", "类型", "作物/阶段", "负责人", "设备", "状态", "告警", "今日任务", "操作"];

  return (
    <div className="admin-asset-table-wrap">
      <table className="admin-asset-table data-table">
        <caption>{screen.assetType}列表</caption>
        <thead>
          <tr>
            {columns.map((column) => <th key={column}>{column}</th>)}
          </tr>
        </thead>
        <tbody>
          {assets.map((asset) => {
            const statusColor = getStatusColor(asset.status);
            const isWarning = asset.warningText && asset.warningText !== "无";
            return (
            <tr key={asset.id} style={{
              borderLeft: isWarning ? "4px solid #ffc107" : "4px solid transparent"
            }}>
              <td><strong>{asset.name}</strong></td>
              <td>{asset.typeLabel}</td>
              <td>{asset.crop}</td>
              <td>{asset.owner}</td>
              <td style={{ color: asset.deviceText && asset.deviceText !== "--" ? "inherit" : "#aaa" }}>
                {asset.deviceText || "--"}
              </td>
              <td>
                <span style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  background: statusColor.bg,
                  color: statusColor.text
                }}>
                  {asset.status}
                </span>
              </td>
              <td style={{ color: isWarning ? "#fa8c16" : "#aaa" }}>
                {asset.warningText}
              </td>
              <td>{asset.todayTaskText}</td>
              <td>
                <div className="asset-table-actions" style={{ gap: "8px" }}>
                  <button 
                    type="button" 
                    onClick={() => onMonitor(asset)}
                    style={{
                      background: "linear-gradient(135deg, #35c36b, #42cc7a)",
                      color: "white",
                      border: "none",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontWeight: "bold"
                    }}
                  >
                    监控
                  </button>
                  <button 
                    type="button" 
                    onClick={() => onTask(asset)}
                    style={{
                      background: "white",
                      color: "#35c36b",
                      border: "1px solid #35c36b",
                      padding: "6px 14px",
                      borderRadius: "6px",
                      fontWeight: "bold"
                    }}
                  >
                    任务
                  </button>
                </div>
              </td>
            </tr>
          );})}
        </tbody>
      </table>
    </div>
  );
}
function DetailScreen({ screen, onNavigate, goBack, assetId, assetName, assetCrop }) {
  const [loading, setLoading] = useState(true);
  const isPlot = screen.detailType === "plot";
  const backendAssetId = assetId || "";
  const hasBackendAsset = Boolean(backendAssetId);
  const growthFileInputRef = useRef(null);
  const [assetDetail, setAssetDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(Boolean(backendAssetId));
  const [thresholdDetail, setThresholdDetail] = useState(null);
  const [thresholdLoading, setThresholdLoading] = useState(Boolean(backendAssetId));
  const [thresholdInput, setThresholdInput] = useState("45");
  const [thresholdSaving, setThresholdSaving] = useState(false);
  const [showDeviceDetailCard, setShowDeviceDetailCard] = useState(false);
  const displayName = assetDetail?.name || assetName || screen.title;
  const backendCrop = [assetDetail?.crop, assetDetail?.growthStage].filter(Boolean).join(" / ");
  const displayCrop = backendCrop || "--";
  const [pendingTasks, setPendingTasks] = useState([]);
  const [tasksLoading, setTasksLoading] = useState(true);
  const [selectedGrowthStage, setSelectedGrowthStage] = useState("all");
  const [growthRecords, setGrowthRecords] = useState([]);
  const [growthRecordsLoading, setGrowthRecordsLoading] = useState(Boolean(backendAssetId));
  const [growthRecordsError, setGrowthRecordsError] = useState("");
  const [uploadingGrowthImage, setUploadingGrowthImage] = useState(false);
  const [diseaseStatistics, setDiseaseStatistics] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(Boolean(backendAssetId));
  const [diseaseError, setDiseaseError] = useState("");
  const [envLoading, setEnvLoading] = useState(Boolean(backendAssetId));
  const [envError, setEnvError] = useState("");
  const detailCropName = assetDetail?.crop || "--";
  const detailCurrentGrowthStage = assetDetail?.growthStage || "";
  const growthStageOptions = useMemo(() => mergeGrowthStageOptions(detailCropName, growthRecords), [detailCropName, growthRecords]);
  const uploadGrowthStage = firstConcreteGrowthStage(growthStageOptions, selectedGrowthStage === "all" ? detailCurrentGrowthStage : selectedGrowthStage, detailCropName);
  const uploadGrowthStageLabel = growthStageLabel(uploadGrowthStage, detailCropName);
  const normalizedDiseaseStatistics = normalizeDiseaseStatistics(diseaseStatistics);
  const diseasePieData = buildDiseasePieData(normalizedDiseaseStatistics);
  const latestDisease = normalizedDiseaseStatistics.latest;

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 350);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!backendAssetId) {
      setAssetDetail(null);
      setDetailLoading(false);
      return undefined;
    }

    let ignored = false;
    async function loadAssetDetail() {
      setDetailLoading(true);
      setEnvLoading(true);
      setEnvError("");
      try {
        const response = await getAssetDetail(backendAssetId);
        if (!ignored) setAssetDetail(apiItem(response));
      } catch (error) {
        if (!ignored) {
          const message = apiErrorMessage(error, "资产详情加载失败");
          setAssetDetail(null);
          setEnvError(message);
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) {
          setDetailLoading(false);
          setEnvLoading(false);
        }
      }
    }
    loadAssetDetail();
    return () => { ignored = true; };
  }, [backendAssetId]);

  useEffect(() => {
    if (!backendAssetId) {
      setThresholdDetail(null);
      setThresholdLoading(false);
      setThresholdInput("45");
      return undefined;
    }

    let ignored = false;
    async function loadThresholds() {
      setThresholdLoading(true);
      try {
        const response = await getAssetThresholds(backendAssetId);
        const items = pageItems(response);
        const soilThreshold = items.find((item) => item.metricKey === "soilMoisture") || items[0] || null;
        if (!ignored) {
          setThresholdDetail(soilThreshold);
          setThresholdInput(String(soilThreshold?.minValue ?? 45));
        }
      } catch (error) {
        if (!ignored) toast(apiErrorMessage(error, "土壤湿度阈值加载失败"), { type: "warn" });
      } finally {
        if (!ignored) setThresholdLoading(false);
      }
    }
    loadThresholds();
    return () => { ignored = true; };
  }, [backendAssetId]);

  useEffect(() => {
    let ignored = false;
    async function loadDetailTasks() {
      if (!hasBackendAsset) {
        setPendingTasks([]);
        setTasksLoading(false);
        return;
      }
      setTasksLoading(true);
      try {
        const response = await listTasks({ assetId: backendAssetId, page: 1, pageSize: 5 });
        if (!ignored) setPendingTasks(pageItems(response).map(normalizeTaskItem).filter((t) => t.targetId !== "generic-task"));
      } catch (error) {
        if (!ignored) toast(apiErrorMessage(error, "待办任务加载失败"), { type: "warn" });
      } finally {
        if (!ignored) setTasksLoading(false);
      }
    }
    loadDetailTasks();
    return () => { ignored = true; };
  }, [backendAssetId, hasBackendAsset]);

  useEffect(() => {
    let ignored = false;
    async function loadDiseaseStatistics() {
      if (!hasBackendAsset) {
        setDiseaseStatistics(null);
        setDiseaseError("");
        setDiseaseLoading(false);
        return;
      }
      setDiseaseLoading(true);
      setDiseaseError("");
      try {
        const response = await getAssetDiseaseStatistics(backendAssetId);
        if (!ignored) setDiseaseStatistics(apiItem(response));
      } catch (error) {
        if (!ignored) {
          const message = apiErrorMessage(error, "病虫害统计加载失败");
          setDiseaseStatistics(null);
          setDiseaseError(message);
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) setDiseaseLoading(false);
      }
    }
    loadDiseaseStatistics();
    return () => { ignored = true; };
  }, [backendAssetId, hasBackendAsset]);

  async function loadGrowthRecords() {
    if (!hasBackendAsset) {
      setGrowthRecords([]);
      setGrowthRecordsError("");
      setGrowthRecordsLoading(false);
      return;
    }
    setGrowthRecordsLoading(true);
    setGrowthRecordsError("");
    try {
      const response = await listGrowthRecords(backendAssetId, { page: 1, pageSize: 200 });
      setGrowthRecords(normalizeGrowthRecordItems(apiItem(response)?.items || pageItems(response)));
    } catch (error) {
      const message = apiErrorMessage(error, "生长记录加载失败");
      setGrowthRecords([]);
      setGrowthRecordsError(message);
      toast(message, { type: "warn" });
    } finally {
      setGrowthRecordsLoading(false);
    }
  }

  useEffect(() => {
    let ignored = false;
    async function run() {
      if (!hasBackendAsset) {
        setGrowthRecords([]);
        setGrowthRecordsError("");
        setGrowthRecordsLoading(false);
        return;
      }
      setGrowthRecordsLoading(true);
      setGrowthRecordsError("");
      try {
        const response = await listGrowthRecords(backendAssetId, { page: 1, pageSize: 200 });
        if (!ignored) setGrowthRecords(normalizeGrowthRecordItems(apiItem(response)?.items || pageItems(response)));
      } catch (error) {
        if (!ignored) {
          const message = apiErrorMessage(error, "生长记录加载失败");
          setGrowthRecords([]);
          setGrowthRecordsError(message);
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) setGrowthRecordsLoading(false);
      }
    }
    run();
    return () => { ignored = true; };
  }, [backendAssetId, hasBackendAsset]);

  useEffect(() => {
    if (!growthStageOptions.length) return;
    if (growthStageOptions.some((item) => item.key === selectedGrowthStage)) return;
    setSelectedGrowthStage("all");
  }, [growthStageOptions, selectedGrowthStage]);

  async function handleDetailIrrigationCommand(commandType) {
    const irrigationDevice = (assetDetail?.devices || []).find((device) => /irrigation|灌溉/.test(`${device.type || ""} ${device.name || ""}`.toLowerCase()));
    if (!irrigationDevice?.id) {
      toast("当前资产没有可下发灌溉指令的后端设备", { type: "warn" });
      return;
    }
    try {
      await issueDeviceCommand(irrigationDevice.id, {
        commandType,
        parameters: commandType === "start_irrigation" ? { durationMinutes: 0.05 } : {},
        idempotencyKey: `web-${screen.id}-${commandType}-${Date.now()}`,
      });
      toast(commandType === "start_irrigation" ? "灌溉指令已提交后端" : "停止灌溉指令已提交后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "灌溉指令下发失败"), { type: "warn" });
    }
  }

  async function handleThresholdSave() {
    if (!backendAssetId) {
      toast("当前资产没有后端资产 ID，无法保存阈值", { type: "warn" });
      return;
    }
    const minValue = Number(thresholdInput);
    if (!Number.isFinite(minValue) || minValue <= 0 || minValue > 100) {
      toast("请输入 1-100 之间的土壤湿度阈值", { type: "warn" });
      return;
    }

    setThresholdSaving(true);
    try {
      const response = await updateAssetThreshold(backendAssetId, "soilMoisture", { minValue, enabled: true });
      const saved = apiItem(response);
      setThresholdDetail(saved);
      setThresholdInput(String(saved?.minValue ?? minValue));
      toast("土壤湿度阈值已保存", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "土壤湿度阈值保存失败"), { type: "warn" });
    } finally {
      setThresholdSaving(false);
    }
  }

  async function handleGrowthImageSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!hasBackendAsset) {
      toast("当前资产没有后端资产 ID，不能创建生长记录", { type: "warn" });
      event.target.value = "";
      return;
    }
    if (!uploadGrowthStage) {
      toast("当前作物没有可用的生长阶段，不能创建生长记录", { type: "warn" });
      event.target.value = "";
      return;
    }
    setUploadingGrowthImage(true);
    try {
      const response = await uploadFile(file, "growth-record");
      const uploadedFile = apiItem(response) || {};
      await createGrowthRecord(backendAssetId, {
        stage: uploadGrowthStage,
        fileId: uploadedFile.id || uploadedFile.fileId,
        note: `${uploadGrowthStageLabel}图片记录：${uploadedFile.fileName || uploadedFile.name || file.name}`,
        capturedAt: new Date().toISOString().slice(0, 19),
      });
      await loadGrowthRecords();
      toast("图片已上传，并生成真实生长记录", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "图片上传失败"), { type: "warn" });
    } finally {
      setUploadingGrowthImage(false);
      event.target.value = "";
    }
  }

  const basicPanelTitle = isPlot ? "地块基本信息" : "大棚基本信息";
  const monitorPanelTitle = `${displayName} 实时监控`;
  const detailDevices = assetDetail?.devices || [];
  const deviceTypeCounts = detailDevices.reduce((acc, device) => {
    const label = normalizeDeviceType(device.type);
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const deviceSummaryText = detailDevices.length === 0
    ? "暂无设备"
    : Object.entries(deviceTypeCounts).map(([label, count]) => `${label} ${count} 台`).join(" / ");
  const onlineDeviceCount = detailDevices.filter((device) => normalizeDeviceStatus(device.status) === "在线").length;
  const offlineDeviceCount = detailDevices.filter((device) => normalizeDeviceStatus(device.status) === "离线").length;
  const deviceStatusText = detailDevices.length === 0 ? "暂无设备" : `${onlineDeviceCount} 台在线 / ${offlineDeviceCount} 台离线`;
  const openAlertCount = Number(assetDetail?.alertSummary?.openCount || 0);
  const firstDeviceAlert = detailDevices.find((device) => device.alertTitle)?.alertTitle;
  const alertText = openAlertCount > 0 ? (firstDeviceAlert || `${openAlertCount} 条未处理告警`) : "无";
  const basicInfo = [
    [isPlot ? "地块名称" : "大棚名称", displayName],
    ["种植作物", displayCrop],
    ["管理农户", "农户管理员"],
    ["绑定设备", detailLoading ? "加载中..." : deviceSummaryText, "devices"],
    ["设备状态", detailLoading ? "加载中..." : deviceStatusText],
    ["当前告警", detailLoading ? "加载中..." : alertText],
    ["所属农场", "南区智慧农场"]
  ];
  const cropState = assetDetail?.cropState || {};
  const detailMetrics = [
    { label: "作物", value: detailCropName },
    { label: "生长期", value: growthStageLabel(detailCurrentGrowthStage, detailCropName) },
    { label: "健康度", value: formatTelemetryValue(cropState.healthIndex, "%") || "--" },
    { label: "病害风险", value: normalizeRiskText(cropState.diseaseRisk), warn: ["中", "高"].includes(normalizeRiskText(cropState.diseaseRisk)) },
  ];
  const latestMetrics = assetDetail?.latestMetrics || {};
  const environmentControls = [
    ["光照强度", formatTelemetryValue(latestMetrics.light, "klx") || "--"],
    ["温度", formatTelemetryValue(latestMetrics.temperature, "℃") || "--"],
    ["空气湿度", formatTelemetryValue(latestMetrics.humidity, "%") || "--"],
    ["土壤湿度", formatTelemetryValue(latestMetrics.soilMoisture, "%") || "--"],
  ];
  const thresholdText = thresholdLoading
    ? "阈值加载中..."
    : `低于 ${(thresholdDetail?.minValue ?? thresholdInput) || 45}% 触发告警`;

  if (!hasBackendAsset) {
    return (
      <div className="screen-canvas detail-layout">
        <ScreenHead
          title={screen.title}
          secondary={goBack ? "↩" : undefined}
          secondaryClass="back-arrow-btn"
          onSecondary={goBack}
        />
        <EmptyState title="缺少资产 ID" description="请从后端资产列表进入资产详情。" />
      </div>
    );
  }

  return (
    <div className="screen-canvas detail-layout">
      <ScreenHead
        title={displayName}
        secondary={goBack ? "↩" : undefined}
        secondaryClass="back-arrow-btn"
        onSecondary={goBack}
      />
      <section className="asset-detail-grid" aria-label={`${screen.title}查看详情`}>
        <div className="asset-detail-left-rail">
          <DetailBasicInfoPanel
            title={basicPanelTitle}
            items={basicInfo}
            onDeviceClick={() => setShowDeviceDetailCard((current) => !current)}
          />
          {showDeviceDetailCard && (
            <BoundDeviceDetailOverlay
              displayName={displayName}
              devices={detailDevices}
              onClose={() => setShowDeviceDetailCard(false)}
            />
          )}
          <DetailMetricGrid metrics={detailMetrics} />
        </div>
        <div className="realtime-monitor-panel">
          <h3>{monitorPanelTitle}</h3>
          <div className="monitor-placeholder">
            <strong>{displayName}</strong>
            <span>实时监控画面 / 传感器空间视图</span>
          </div>
        </div>
        <Panel title="实时环境与操作" className="environment-control-panel">
          {envLoading ? <p className="environment-inline-status">正在同步后端环境数据...</p> : null}
          {envError ? <p className="environment-inline-status warn">{envError}</p> : null}
          <div className="environment-control-grid">
            {environmentControls.map(([label, value]) => (
              <button type="button" key={label}>
                <span>{label}</span>
                <strong>{value}</strong>
              </button>
            ))}
          </div>
          <div className="soil-threshold-editor">
            <div>
              <strong>土壤湿度阈值</strong>
              <span>{thresholdText}</span>
            </div>
            <label>
              <span>最低土壤湿度（%）</span>
              <input
                type="number"
                min="1"
                max="100"
                step="1"
                value={thresholdInput}
                onChange={(event) => setThresholdInput(event.target.value)}
                disabled={thresholdSaving}
              />
            </label>
            <button type="button" onClick={handleThresholdSave} disabled={thresholdLoading || thresholdSaving}>
              {thresholdSaving ? "保存中" : "保存阈值"}
            </button>
          </div>
          <div className="irrigation-actions">
            <button type="button" onClick={() => handleDetailIrrigationCommand("start_irrigation")}>启动灌溉</button>
            <button type="button" onClick={async () => { const ok = await confirm("确定要停止灌溉吗？作物可能因缺水受影响。", { title: "停止灌溉", danger: true }); if (ok) handleDetailIrrigationCommand("stop_irrigation"); }}>停止灌溉</button>
          </div>
          <DetailPendingTasksPanel
            tasksLoading={tasksLoading}
            pendingTasks={pendingTasks}
            onTaskClick={(task) => onNavigate?.(task.targetId, { taskId: task.id })}
            onViewAll={() => onNavigate?.(isPlot ? "plot-tasks" : "greenhouse-tasks", { assetId: backendAssetId, assetName: displayName })}
          />
        </Panel>
        <Panel title="病虫害统计" className="disease-summary-panel">
          {diseaseLoading ? (
            <Loading type="card" />
          ) : diseaseError ? (
            <EmptyState title="统计加载失败" description={diseaseError} />
          ) : normalizedDiseaseStatistics.total === 0 ? (
            <EmptyState title="暂无病虫害数据" description="当前区域还没有后端诊断记录" />
          ) : (
            <div className="disease-pie-card">
              <div className="disease-pie-visual">
                <PieChart data={diseasePieData} size={150} />
                <div className="disease-pie-total">
                  <strong>{normalizedDiseaseStatistics.total}</strong>
                  <span>次诊断</span>
                </div>
              </div>
              <div className="disease-pie-legend">
                {diseasePieData.map((item) => (
                  <div className="disease-pie-legend-item" key={item.label}>
                    <i style={{ backgroundColor: item.color }} />
                    <span>{item.label}</span>
                    <b>{item.value}</b>
                  </div>
                ))}
              </div>
              {latestDisease ? (
                <div className="disease-latest-summary">
                  <span>最新诊断</span>
                  <strong>{latestDisease.result}</strong>
                  <small>
                    {diseaseRiskLabel(latestDisease.riskLevel)} · 置信度 {formatDiseaseConfidence(latestDisease.confidence)}
                  </small>
                  <em>{formatDiseaseTime(latestDisease.createdAt)}</em>
                </div>
              ) : null}
            </div>
          )}
        </Panel>
        <div className="growth-detail-stack">
          <GrowthRecordPanel
            isPlot={isPlot}
            hasBackendAsset={hasBackendAsset}
            growthFileInputRef={growthFileInputRef}
            cropName={detailCropName}
            growthStageOptions={growthStageOptions}
            selectedGrowthStage={selectedGrowthStage}
            setSelectedGrowthStage={setSelectedGrowthStage}
            growthRecords={growthRecords}
            growthRecordsLoading={growthRecordsLoading}
            growthRecordsError={growthRecordsError}
            uploadingGrowthImage={uploadingGrowthImage}
            onFileSelected={handleGrowthImageSelected}
          />
          <AssetTrendPanel assetId={backendAssetId} apiScope="farmer" large />
        </div>
      </section>
    </div>
  );
}
function RelatedTasksScreen({ screen, onNavigate, readonly = false, onBack, goBack, assetName, assetId, apiScope = "farmer" }) {
  const isPlot = screen.id?.startsWith("plot");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignored = false;
    async function loadRelatedTasks() {
      setLoading(true);
      try {
        const response = apiScope === "admin" && assetId
          ? await listAdminAssetTasks(assetId, { page: 1, pageSize: 50 })
          : assetId
            ? await listTasks({ assetId, page: 1, pageSize: 50 })
            : await listTasks({ page: 1, pageSize: 50 });
        if (!ignored) {
          const allTasks = pageItems(response).map(normalizeTaskItem)
            .filter((t) => t.targetId !== "generic-task");
          if (assetId) {
            setTasks(allTasks);
          } else if (assetName) {
            setTasks(allTasks.filter((t) => t.assetName === assetName));
          } else if (isPlot) {
            setTasks(allTasks.filter((t) => t.assetName && t.assetName.includes("地块")));
          } else {
            setTasks(allTasks.filter((t) => t.assetName && t.assetName.includes("大棚")));
          }
        }
      } catch (error) {
        if (!ignored) toast(apiErrorMessage(error, "任务列表加载失败"), { type: "warn" });
      } finally {
        if (!ignored) setLoading(false);
      }
    }
    loadRelatedTasks();
    return () => { ignored = true; };
  }, [apiScope, assetId, assetName, isPlot]);

  return (
    <div className="screen-canvas related-layout">
      <section className="related-board">
        <ScreenHead
          title={assetName ? `${assetName} 相关任务` : screen.title.replace(" 相关任务", "")}
          secondary={onBack || goBack ? "↩" : undefined}
          secondaryClass="back-arrow-btn"
          onSecondary={onBack || goBack}
        />
        <Panel title="任务列表" className="table-card">
          {loading ? (
            <Loading type="table" rows={4} cols={4} />
          ) : (
            <TaskTable compact onNavigate={onNavigate} readonly={readonly} taskItems={tasks} />
          )}
        </Panel>
        <Panel title="相关记录" style={{ marginTop: 4 }}>
          <div style={{ display: "grid", gap: 0 }}>
            {tasks.length === 0 && !loading ? (
              <EmptyState title="暂无相关记录" description="当前区域还没有任务操作记录" />
            ) : (
              tasks.slice(0, 20).map((task) => {
                const typeIcon = taskTypeIcon(task.type);
                const statusColor = taskStatusColor(task.status);
                const isProcessed = task.status !== "待处理" && task.status !== "pending";
                return (
                  <div key={task.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid var(--line)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, display: "grid", placeItems: "center", background: "linear-gradient(135deg, #f0faf3, #e8f5e9)", fontSize: "0.9rem", flexShrink: 0 }}>
                      {typeIcon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <strong style={{ fontSize: "0.86rem", color: "var(--text)", display: "block" }}>{task.title}</strong>
                      <small style={{ fontSize: "0.72rem", color: "var(--muted)" }}>
                        {task.type} · {task.deadlineText}
                        {isProcessed ? ` · 已处理` : ""}
                      </small>
                    </div>
                    <span style={{
                      padding: "3px 10px", borderRadius: 999, fontSize: "0.72rem", fontWeight: 800,
                      background: statusColor.bg, color: statusColor.fg, whiteSpace: "nowrap",
                    }}>
                      {isProcessed ? (task.status === "submitted" || task.status === "待复核" ? "已提交" : task.status) : "待处理"}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </Panel>
      </section>
    </div>
  );
}
function taskTypeIcon(type) {
  const t = (type || "").toLowerCase();
  if (/灌溉|irrigation/.test(t)) return "💧";
  if (/病虫|病害|检测|disease|pest|diagnos/.test(t)) return "🔬";
  if (/生长|growth|anomaly/.test(t)) return "🌱";
  if (/巡检|inspection|check/.test(t)) return "🔎";
  return "📋";
}

function taskStatusColor(status) {
  const s = (status || "").toLowerCase();
  if (s === "completed" || s === "已完成" || s === "approved") return { bg: "rgba(40,180,99,0.12)", fg: "var(--ok)" };
  if (s === "in_progress" || s === "进行中" || s === "processing") return { bg: "rgba(45,169,220,0.12)", fg: "var(--accent)" };
  if (s === "submitted" || s === "待复核") return { bg: "rgba(142,68,173,0.12)", fg: "#8e44ad" };
  if (s === "rejected" || s === "已驳回") return { bg: "rgba(231,76,60,0.12)", fg: "#e74c3c" };
  return { bg: "rgba(149,165,166,0.12)", fg: "#7f8c8d" };
}

function taskTargetForTask(item, title) {
  const type = String(item?.type || item?.taskType || "").trim().toLowerCase();
  const text = `${type} ${title || ""}`.toLowerCase();
  if (/irrigation|watering|water|灌溉|补水/.test(text)) return "irrigation-task";
  if (/growth_anomaly|growth|anomaly|生长异常|长势|生长/.test(text)) return "growth-anomaly-task";
  if (/disease_detection|diagnosis|disease|pest|病虫|病害|检测|复查/.test(text)) return "disease-detection-task";
  if (/inspection|check|巡检|环境/.test(text)) return "inspection-task";
  return taskTargetForName(title);
}

function taskStatusForOperation(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (["accepted", "active", "in_progress", "processing", "running"].includes(normalized)) return "running";
  if (["submitted", "completed", "done", "finished"].includes(normalized)) return "done";
  if (["cancelled", "canceled", "rejected", "failed", "stopped"].includes(normalized)) return "stopped";
  return "pending";
}

function useTaskDetail(taskId) {
  const [taskDetail, setTaskDetail] = useState(null);
  const [taskDetailLoading, setTaskDetailLoading] = useState(false);
  const [taskDetailError, setTaskDetailError] = useState("");

  useEffect(() => {
    if (!taskId) {
      setTaskDetail(null);
      setTaskDetailError("");
      setTaskDetailLoading(false);
      return;
    }

    let ignored = false;
    async function loadTaskDetail() {
      setTaskDetailLoading(true);
      setTaskDetailError("");
      try {
        const response = await getTask(taskId);
        if (!ignored) setTaskDetail(apiItem(response));
      } catch (error) {
        const message = apiErrorMessage(error, "任务详情加载失败");
        if (!ignored) setTaskDetailError(message);
        toast(message, { type: "warn" });
      } finally {
        if (!ignored) setTaskDetailLoading(false);
      }
    }

    loadTaskDetail();
    return () => { ignored = true; };
  }, [taskId]);

  return { taskDetail, taskDetailLoading, taskDetailError };
}

function formatTaskTimelineTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function taskTimelineActionLabel(event = {}) {
  const type = event.eventType || event.type || event.action || "";
  if (type === "accepted") return "认领任务";
  if (type === "submitted") return "提交任务";
  if (type === "evidence") return "补充凭证";
  return event.action || event.title || type || "任务进展";
}

function normalizeTaskTimelineLog(event = {}, index = 0) {
  return {
    time: formatTaskTimelineTime(event.createdAt || event.time || event.occurredAt),
    action: taskTimelineActionLabel(event),
    result: event.content || event.result || event.description || event.remark || `记录 ${index + 1}`,
  };
}

function TaskDetailSummary({ taskDetail, loading, error }) {
  if (!loading && !error && !taskDetail) return null;
  const assetName = taskDetail?.asset?.name || taskDetail?.assetName || taskDetail?.assetId || "--";
  const deadline = taskDetail?.deadline ? new Date(taskDetail.deadline).toLocaleString("zh-CN", { hour12: false }) : "--";
  const detailEntries = taskDetail?.detail && typeof taskDetail.detail === "object"
    ? Object.entries(taskDetail.detail).filter(([, value]) => value !== undefined && value !== null && value !== "")
    : [];

  return (
    <Panel title="任务详情" className="task-detail-panel">
      {loading ? (
        <Loading type="card" />
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="form-grid">
          <span>任务名称</span><span>{taskDetail?.title || "--"}</span>
          <span>任务类型</span><span>{taskDetail?.type || "--"}</span>
          <span>关联区域</span><span>{assetName}</span>
          <span>优先级</span><span>{taskDetail?.priority || "--"}</span>
          <span>当前状态</span><span>{taskDetail?.status || "--"}</span>
          <span>截止时间</span><span>{deadline}</span>
          {taskDetail?.description && <><span>任务说明</span><span>{taskDetail.description}</span></>}
          {detailEntries.slice(0, 6).map(([key, value]) => (
            <React.Fragment key={key}>
              <span>{key}</span>
              <span>{typeof value === "object" ? JSON.stringify(value) : String(value)}</span>
            </React.Fragment>
          ))}
        </div>
      )}
    </Panel>
  );
}

function normalizeTaskItem(item, index = 0) {
  const title = item.title || item.name || `任务 ${index + 1}`;
  const type = item.type || "任务";
  const deadlineText = item.deadline ? new Date(item.deadline).toLocaleString("zh-CN", { hour12: false }) : "未设置";

  return {
    id: item.id || `task-${index + 1}`,
    title,
    type,
    assetId: item.assetId || item.asset?.id || "",
    assetName: item.assetName || item.asset?.name || item.assetId || "未关联区域",
    priority: item.priority || "普通",
    status: item.status || "待处理",
    deadlineText,
    targetId: taskTargetForTask(item, title),
  };
}

function TaskTableScreen({ screen, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([]);
  const [listError, setListError] = useState("");

  async function loadTasks(params = {}) {
    setLoading(true);
    setListError("");
    try {
      const response = await listTasks({ page: 1, pageSize: 20, ...params });
      const nextTasks = pageItems(response).map(normalizeTaskItem);
      setTasks(nextTasks);
    } catch (error) {
      setListError(apiErrorMessage(error, "待办任务加载失败"));
      toast(apiErrorMessage(error, "待办任务加载失败"), { type: "warn" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadTasks(); }, []);

  async function handleAcceptTask(taskId) {
    try {
      await acceptTask(taskId);
      toast("任务已认领", { type: "success" });
      loadTasks();
    } catch (error) {
      toast(apiErrorMessage(error, "任务认领失败"), { type: "warn" });
    }
  }

  async function handleSubmitTask(taskId) {
    try {
      await submitTask(taskId, { resultSummary: "前端提交处理结果" });
      toast("任务结果已提交", { type: "success" });
      loadTasks();
    } catch (error) {
      toast(apiErrorMessage(error, "任务提交失败"), { type: "warn" });
    }
  }

  async function handleAddTaskEvidence(taskId) {
    try {
      await addTaskEvidence(taskId, { type: "text", content: "前端补充处理凭证" });
      toast("任务凭证已提交", { type: "success" });
      loadTasks();
    } catch (error) {
      toast(apiErrorMessage(error, "凭证提交失败"), { type: "warn" });
    }
  }

  if (loading) {
    return (
      <div className="screen-canvas tasks-layout">
        <ScreenHead title={screen.title} action="刷新" secondary="返回综合大屏" />
        <Loading type="stat" count={4} />
        <Panel title="全部任务" className="table-card">
          <Loading type="table" rows={4} cols={5} />
        </Panel>
      </div>
    );
  }

  return (
    <div className="screen-canvas tasks-layout">
      <ScreenHead title={screen.title} action="刷新" onAction={() => loadTasks()} secondary="返回综合大屏" onSecondary={() => onNavigate?.("dashboard")} />
      <StatStrip stats={screen.stats} />

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12, marginBottom: 16 }}>
        {[
          { id: "irrigation-task", title: "灌溉任务", sub: "地块 P-07 · 土壤水分偏低", icon: "💧" },
          { id: "inspection-task", title: "环境巡检", sub: "草莓棚 C-03 · 每日巡检", icon: "🔎" },
          { id: "growth-anomaly-task", title: "生长异常", sub: "草莓棚 C-03 · 阶段不一致", icon: "🌱" },
          { id: "disease-detection-task", title: "病害检测", sub: "大棚 A-01 · 叶斑风险", icon: "🔬" },
        ].map((card) => (
          <button
            key={card.id}
            onClick={() => onNavigate?.(card.id)}
            style={{
              border: "1px solid var(--line)", borderRadius: "var(--radius)", background: "var(--panel-strong)",
              padding: 20, cursor: "pointer", textAlign: "left", boxShadow: "var(--shadow-soft)",
              transition: "transform 120ms ease, box-shadow 120ms ease",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--shadow)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "var(--shadow-soft)"; }}
          >
            <div style={{ fontSize: "1.6rem", marginBottom: 8 }}>{card.icon}</div>
            <strong style={{ display: "block", fontSize: "0.94rem", marginBottom: 4 }}>{card.title}</strong>
            <span style={{ fontSize: "0.78rem", color: "var(--muted)" }}>{card.sub}</span>
          </button>
        ))}
      </div>

      <Panel title="全部任务" className="table-card">
        {listError && <div className="error-message">{listError}</div>}
        <TaskTable
          taskItems={tasks}
          onNavigate={onNavigate}
          onAcceptTask={handleAcceptTask}
          onSubmitTask={handleSubmitTask}
          onAddEvidence={handleAddTaskEvidence}
        />
      </Panel>
      {tasks.length === 0 && (
        <EmptyState icon="task" title="暂无任务" description="当前没有待办任务" />
      )}
    </div>
  );
}

function OperationScreen({ screen, taskId, onNavigate, goBack }) {
  const { taskDetail, taskDetailLoading, taskDetailError } = useTaskDetail(taskId);
  const [status, setStatus] = useState("pending");
  const [formValues, setFormValues] = useState(() => {
    if (screen.operation === "irrigation") return { region: "大棚 A-01", device: "灌溉阀 #03", mode: "手动控制", target: "45%", pauseMin: "0.05" };
    if (screen.operation === "inspection") return { region: "草莓棚 C-03", temperature: "24.6℃", humidity: "71%", deviceStatus: "在线", photoCount: "3" };
    if (screen.operation === "growth_anomaly") return { region: "草莓棚 C-03", modelStage: "白果期", calendarStage: "转色期", reason: "现场果色比例待复核", imageCount: "4" };
    return { region: "大棚 A-01", diseaseResult: "叶斑风险", riskLevel: "中", treatment: "控湿通风并复拍", photoCount: "2" };
  });
  const [logs, setLogs] = useState([]);

  function applyTaskDetailResponse(detail) {
    if (!detail) {
      setLogs([]);
      return;
    }
    setStatus(taskStatusForOperation(detail.status));
    const assetName = detail.asset?.name || detail.assetName || detail.assetId;
    if (assetName) setFormValues((prev) => ({ ...prev, region: assetName }));
    setLogs(Array.isArray(detail.timeline) ? detail.timeline.map(normalizeTaskTimelineLog) : []);
  }

  useEffect(() => {
    applyTaskDetailResponse(taskDetail);
  }, [taskDetail]);

  async function handleOperationCommand(commandType, action, parameters = {}) {
    const deviceId = taskDetail?.detail?.deviceId
      || taskDetail?.deviceId
      || (screen.operation === "irrigation" ? "device-agri-008" : "device-agri-001");
    const targetTaskId = taskId || taskDetail?.id;
    try {
      await issueDeviceCommand(deviceId, {
        commandType,
        taskId: targetTaskId,
        parameters,
        idempotencyKey: `web-${taskId || "task"}-${commandType}-${Date.now()}`,
      });
      if (targetTaskId) {
        const response = await addTaskEvidence(targetTaskId, {
          type: "text",
          content: `设备指令：${action}；指令类型：${commandType}`,
        });
        applyTaskDetailResponse(apiItem(response));
      }
      toast(`${action} 已提交后端`, { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, `${action} 失败`), { type: "warn" });
    }
  }

  async function handleInspectionEvidence(action) {
    const targetTaskId = taskId || taskDetail?.id;
    if (!targetTaskId) {
      toast("请从待办任务点击查看后再提交巡检记录", { type: "warn" });
      return;
    }

    try {
      const response = await addTaskEvidence(targetTaskId, {
        type: "text",
        content: `环境巡检：${action}；区域：${formValues.region || "--"}；温度：${formValues.temperature || "--"}；湿度：${formValues.humidity || "--"}；设备：${formValues.deviceStatus || "--"}`,
      });
      applyTaskDetailResponse(apiItem(response));
      toast(`${action} 已记录到后端任务`, { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, `${action} 记录失败`), { type: "warn" });
    }
  }

  async function handleGrowthAnomalyEvidence(action) {
    const targetTaskId = taskId || taskDetail?.id;
    if (!targetTaskId) {
      toast("请从待办任务点击查看后再记录生长异常复核", { type: "warn" });
      return;
    }

    const detailText = [
      `区域：${formValues.region || "--"}`,
      `模型阶段：${formValues.modelStage || "--"}`,
      `经验阶段：${formValues.calendarStage || "--"}`,
      `异常原因：${formValues.reason || "--"}`,
      `历史图片：${formValues.imageCount || "--"} 张`,
    ].join("；");

    try {
      const response = await addTaskEvidence(targetTaskId, {
        type: "text",
        content: `生长异常复核：${action}；${detailText}`,
      });
      applyTaskDetailResponse(apiItem(response));
      toast(`${action} 已记录到后端任务`, { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, `${action} 记录失败`), { type: "warn" });
    }
  }

  async function handleDiseaseDetectionEvidence(action) {
    const targetTaskId = taskId || taskDetail?.id;
    if (!targetTaskId) {
      toast("请从待办任务点击查看后再记录病害检测处置", { type: "warn" });
      return;
    }

    try {
      const response = await addTaskEvidence(targetTaskId, {
        type: "text",
        content: `病害检测：${action}；区域：${formValues.region || "--"}；结果：${formValues.diseaseResult || "--"}；风险：${formValues.riskLevel || "--"}；措施：${formValues.treatment || "--"}`,
      });
      applyTaskDetailResponse(apiItem(response));
      toast(`${action} 已记录到后端任务`, { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, `${action} 记录失败`), { type: "warn" });
    }
  }

  async function handleGrowthAnomalySubmit() {
    const targetTaskId = taskId || taskDetail?.id;
    if (!targetTaskId) {
      toast("请从待办任务点击查看后再提交生长异常结论", { type: "warn" });
      return;
    }

    const resultSummary = `生长异常复核：${formValues.region || "--"}，模型阶段 ${formValues.modelStage || "--"}，经验阶段 ${formValues.calendarStage || "--"}，结论：${formValues.reason || "--"}`;
    try {
      const response = await submitTask(targetTaskId, { resultSummary });
      applyTaskDetailResponse(apiItem(response));
      toast("生长异常结论已提交后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "生长异常提交失败"), { type: "warn" });
    }
  }

  async function handleDiseaseDetectionSubmit() {
    const targetTaskId = taskId || taskDetail?.id;
    if (!targetTaskId) {
      toast("请从待办任务点击查看后再提交病害检测结果", { type: "warn" });
      return;
    }

    const resultSummary = `病害检测处置：${formValues.region || "--"}，${formValues.diseaseResult || "--"}，风险 ${formValues.riskLevel || "--"}，措施：${formValues.treatment || "--"}`;
    try {
      const response = await submitTask(targetTaskId, { resultSummary });
      applyTaskDetailResponse(apiItem(response));
      toast("病害检测结果已提交后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "病害检测结果提交失败"), { type: "warn" });
    }
  }

  async function handleUploadOperationRecord() {
    const targetTaskId = taskId || taskDetail?.id;
    if (!targetTaskId) {
      toast("请从待办任务点击查看后再上传操作记录", { type: "warn" });
      return;
    }
    try {
      const response = await addTaskEvidence(targetTaskId, {
        type: "text",
        content: `操作记录上传：区域 ${formValues.region || "--"}；当前状态 ${statusBadge?.label || status}`,
      });
      applyTaskDetailResponse(apiItem(response));
      toast("操作记录已写入后端任务", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "操作记录上传失败"), { type: "warn" });
    }
  }

  const actionMap = {
    "下发灌溉指令": () => { setStatus("running"); handleOperationCommand("start_irrigation", "下发灌溉指令", { durationMinutes: Number(formValues.pauseMin || 0.05) }); },
    "紧急停止": () => { setStatus("stopped"); handleOperationCommand("stop_irrigation", "紧急停止"); },
    "暂停": () => { const m = formValues.pauseMin || "30"; setStatus("paused"); handleOperationCommand("pause_irrigation", `暂停 ${m} 分钟`, { durationMinutes: Number(m) }); },
    "记录温湿度": () => { handleInspectionEvidence("记录温湿度"); },
    "拍摄现场照片": () => { handleInspectionEvidence("拍摄现场照片"); },
    "复核设备状态": () => { handleInspectionEvidence("复核设备状态"); },
    "提交巡检结果": () => { setStatus("done"); handleInspectionEvidence("提交巡检结果"); },
    "复核作物长势": () => { handleGrowthAnomalyEvidence("复核作物长势"); },
    "补充历史图片": () => { handleGrowthAnomalyEvidence("补充历史图片"); },
    "记录异常原因": () => { handleGrowthAnomalyEvidence("记录异常原因"); },
    "提交异常结论": () => { setStatus("done"); handleGrowthAnomalySubmit(); },
    "复核病害图片": () => { handleDiseaseDetectionEvidence("复核病害图片"); },
    "上传处置照片": () => { handleDiseaseDetectionEvidence("上传处置照片"); },
    "记录防治措施": () => { handleDiseaseDetectionEvidence("记录防治措施"); },
    "提交检测结果": () => { setStatus("done"); handleDiseaseDetectionSubmit(); },
  };

  const statusBadge = {
    pending: { label: "待处理", color: "var(--warn)", bg: "rgba(201,138,16,0.1)" },
    running: { label: "执行中", color: "var(--accent-2)", bg: "rgba(45,169,220,0.1)" },
    stopped: { label: "已停止", color: "var(--danger)", bg: "rgba(226,77,87,0.1)" },
    paused: { label: "已暂停", color: "var(--warn)", bg: "rgba(201,138,16,0.1)" },
    done: { label: "已完成", color: "var(--ok)", bg: "rgba(40,180,99,0.1)" },
  }[status];

  const actionLabels = screen.operation === "irrigation"
    ? ["下发灌溉指令", "紧急停止", "暂停"]
    : screen.actions;

  return (
    <div className={`screen-canvas operation-layout operation-${screen.operation}`}>
      <ScreenHead title={screen.title} secondary={goBack ? "↩" : undefined} secondaryClass="back-arrow-btn" onSecondary={goBack} />
      <TaskDetailSummary taskDetail={taskDetail} loading={taskDetailLoading} error={taskDetailError} />
      <StatStrip stats={screen.summary.map(([label, value]) => [label, value, ""])} />
      <Panel title={screen.panels[0]} className="operation-main">
        <div className="op-form-grid">
          {screen.operation === "irrigation" && (
            <>
              <label><span>灌溉区域</span><input value={formValues.region} onChange={(e) => setFormValues((p) => ({ ...p, region: e.target.value }))} /></label>
              <label><span>绑定设备</span><input value={formValues.device} onChange={(e) => setFormValues((p) => ({ ...p, device: e.target.value }))} /></label>
              <label>
                <span>控制模式</span>
                <select value={formValues.mode} onChange={(e) => setFormValues((p) => ({ ...p, mode: e.target.value }))}>
                  {["手动控制", "定时执行", "阈值联动"].map((m) => <option key={m}>{m}</option>)}
                </select>
              </label>
              <label><span>目标水分</span><input value={formValues.target} onChange={(e) => setFormValues((p) => ({ ...p, target: e.target.value }))} /></label>
              <label>
                <span>暂停时长</span>
                <select value={formValues.pauseMin} onChange={(e) => setFormValues((p) => ({ ...p, pauseMin: e.target.value }))}>
                  {["15", "30", "45", "60", "90", "120"].map((m) => <option key={m} value={m}>{m} 分钟</option>)}
                </select>
              </label>
            </>
          )}
          {screen.operation === "inspection" && (
            <>
              <label><span>巡检区域</span><input value={formValues.region} onChange={(e) => setFormValues((p) => ({ ...p, region: e.target.value }))} /></label>
              <label><span>温度记录</span><input value={formValues.temperature} onChange={(e) => setFormValues((p) => ({ ...p, temperature: e.target.value }))} /></label>
              <label><span>湿度记录</span><input value={formValues.humidity} onChange={(e) => setFormValues((p) => ({ ...p, humidity: e.target.value }))} /></label>
              <label><span>设备状态</span><input value={formValues.deviceStatus} onChange={(e) => setFormValues((p) => ({ ...p, deviceStatus: e.target.value }))} /></label>
              <label><span>现场照片</span><input value={formValues.photoCount} onChange={(e) => setFormValues((p) => ({ ...p, photoCount: e.target.value }))} /></label>
            </>
          )}
          {screen.operation === "growth_anomaly" && (
            <>
              <label><span>关联区域</span><input value={formValues.region} onChange={(e) => setFormValues((p) => ({ ...p, region: e.target.value }))} /></label>
              <label><span>模型阶段</span><input value={formValues.modelStage} onChange={(e) => setFormValues((p) => ({ ...p, modelStage: e.target.value }))} /></label>
              <label><span>经验阶段</span><input value={formValues.calendarStage} onChange={(e) => setFormValues((p) => ({ ...p, calendarStage: e.target.value }))} /></label>
              <label><span>异常原因</span><input value={formValues.reason} onChange={(e) => setFormValues((p) => ({ ...p, reason: e.target.value }))} /></label>
              <label><span>历史图片</span><input value={formValues.imageCount} onChange={(e) => setFormValues((p) => ({ ...p, imageCount: e.target.value }))} /></label>
            </>
          )}
          {screen.operation === "disease_detection" && (
            <>
              <label><span>关联区域</span><input value={formValues.region} onChange={(e) => setFormValues((p) => ({ ...p, region: e.target.value }))} /></label>
              <label><span>病害结果</span><input value={formValues.diseaseResult} onChange={(e) => setFormValues((p) => ({ ...p, diseaseResult: e.target.value }))} /></label>
              <label><span>风险等级</span><input value={formValues.riskLevel} onChange={(e) => setFormValues((p) => ({ ...p, riskLevel: e.target.value }))} /></label>
              <label><span>防治措施</span><input value={formValues.treatment} onChange={(e) => setFormValues((p) => ({ ...p, treatment: e.target.value }))} /></label>
              <label><span>现场照片</span><input value={formValues.photoCount} onChange={(e) => setFormValues((p) => ({ ...p, photoCount: e.target.value }))} /></label>
            </>
          )}
        </div>
        <div className="operation-actions">
          {actionLabels.map((action) => (
            <button key={action} type="button" onClick={actionMap[action] || (() => toast(`${action} 暂无后端操作`, { type: "warn" }))}>
              {action}
            </button>
          ))}
        </div>
      </Panel>
      <Panel title={screen.panels[1]} className="operation-side">
        {screen.operation === "irrigation" ? (
          <div style={{ display: "grid", placeItems: "center", gap: 8 }}>
            <Gauge />
          </div>
        ) : (
          <Checklist items={screen.actions} />
        )}
      </Panel>
      <Panel title={screen.panels[2]} className="timeline-panel">
        <div style={{ fontSize: "0.78rem", color: "var(--text-2)" }}>
          <Timeline />
          {status !== "pending" && (
            <div style={{ marginTop: 8, padding: "6px 10px", borderRadius: "var(--radius)", background: statusBadge.bg, fontSize: "0.72rem", color: statusBadge.color, fontWeight: 700 }}>
              ● 当前状态：{statusBadge.label}
            </div>
          )}
        </div>
      </Panel>
      <Panel title={screen.panels[3]} className="log-panel">
        <table className="data-table">
          <thead><tr>{["时间", "操作", "结果"].map((c) => <th key={c}>{c}</th>)}</tr></thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="3"><EmptyState title="暂无操作日志" description="后端当前没有返回任务时间线。" /></td></tr>
            ) : logs.map((log, i) => (
              <tr key={i}><td>{log.time}</td><td>{log.action}</td><td>{log.result}</td></tr>
            ))}
          </tbody>
        </table>
      </Panel>
      <footer className="upload-note" style={{ cursor: "pointer" }} onClick={handleUploadOperationRecord}>上传到农户管理员记录</footer>
    </div>
  );
}

function splitReportText(value) {
  if (Array.isArray(value)) return value.filter(Boolean);
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed
            .map((item) => item?.content || item?.body || item?.title || "")
            .map((item) => String(item).trim())
            .filter(Boolean);
        }
        if (parsed && typeof parsed === "object") {
          return Object.values(parsed)
            .flatMap((item) => Array.isArray(item) ? item : [item])
            .map((item) => typeof item === "object" ? (item?.content || item?.body || item?.title || "") : item)
            .map((item) => String(item).trim())
            .filter(Boolean);
        }
      } catch {
        // Fall back to plain text splitting below.
      }
    }
  }
  return String(value || "")
    .split(/\n|；|;/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function buildDiagnosisReportDetail({ report, detectionResult, uploadedFile }) {
  const generatedAt = new Date();
  const confidenceText = detectionResult?.confidence || report?.context?.confidence || "--";
  const confidenceValue = Number.parseInt(confidenceText, 10);
  const riskLevel = Number.isFinite(confidenceValue) && confidenceValue >= 85
    ? "高风险"
    : Number.isFinite(confidenceValue) && confidenceValue >= 65
      ? "中风险"
      : "待复核";
  const summary = report?.summary || `${detectionResult?.crop || "作物"}疑似出现${detectionResult?.disease || "病害"}，建议结合图片、资产环境指标和近期任务记录进行复核。`;
  const treatmentSteps = splitReportText(report?.treatmentSteps);
  const preventionTips = splitReportText(report?.preventionTips);

  return {
    id: report?.id || detectionResult?.id || `report-${generatedAt.getTime()}`,
    title: "病虫害智能诊断报告",
    generatedAt: generatedAt.toLocaleString("zh-CN", { hour12: false }),
    crop: detectionResult?.crop || "未识别",
    disease: detectionResult?.disease || "待识别",
    confidence: confidenceText,
    riskLevel,
    imageName: uploadedFile?.name || "未上传图片",
    imageUrl: detectionResult?.imageUrl || report?.imageUrl || uploadedFile?.publicUrl || "",
    annotatedImageUrl: detectionResult?.annotatedImageUrl || report?.annotatedImageUrl || "",
    assetName: "大棚 A-01",
    growthStage: "结果期",
    summary,
    treatmentSteps: treatmentSteps.length ? treatmentSteps : [
      "隔离疑似病株，减少交叉传播风险。",
      "加强通风降湿，暂停叶面喷水和高湿作业。",
      "必要时联系农技人员确认用药方案。",
    ],
    preventionTips: preventionTips.length ? preventionTips : [
      "24 小时后复拍同角度图片，观察病斑扩散速度。",
      "检查最近灌溉、通风和巡检记录，排查诱发因素。",
      "连续三天记录温湿度变化，异常时及时补充处理凭证。",
    ],
    rawReport: report,
  };
}

function diagnosisReportFileName(reportDetail) {
  if (!reportDetail) return "";
  return `${reportDetail.title}-${reportDetail.id}.txt`;
}

function buildDiagnosisReportText(reportDetail) {
  if (!reportDetail) return "";
  return [
    reportDetail.title,
    `报告编号：${reportDetail.id}`,
    `生成时间：${reportDetail.generatedAt}`,
    `关联资产：${reportDetail.assetName}`,
    `作物阶段：${reportDetail.crop} / ${reportDetail.growthStage}`,
    `识别图片：${reportDetail.imageName}`,
    `疑似病害：${reportDetail.disease}`,
    `置信度：${reportDetail.confidence}`,
    `风险等级：${reportDetail.riskLevel}`,
    "",
    "一、核心结论",
    reportDetail.summary,
    "",
    "二、处置方案",
    ...reportDetail.treatmentSteps.map((item, index) => `${index + 1}. ${item}`),
    "",
    "三、复查计划",
    ...reportDetail.preventionTips.map((item, index) => `${index + 1}. ${item}`),
  ].join("\n");
}

function downloadDiagnosisReport(reportDetail) {
  if (!reportDetail) return;
  const blob = new Blob([buildDiagnosisReportText(reportDetail)], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = diagnosisReportFileName(reportDetail);
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function absoluteApiUrl(url) {
  if (!url) return "";
  if (/^https?:\/\//i.test(url) || url.startsWith("blob:") || url.startsWith("data:")) return url;
  return url.startsWith("/") ? url : `/${url}`;
}

function buildDiagnosisChatContext({ detectionResult, uploadedFile, reportDetail }) {
  const crop = detectionResult?.crop || reportDetail?.crop || "待识别作物";
  const disease = detectionResult?.disease || reportDetail?.disease || "待识别病虫害";
  return {
    context: "diagnosis",
    conversationId: diagnosisConversationId({ crop, result: disease }),
    crop,
    disease,
    confidence: detectionResult?.confidence || reportDetail?.confidence || "--",
    imageName: uploadedFile?.name || reportDetail?.imageName || "未上传图片",
    imageUrl: detectionResult?.imageUrl || reportDetail?.imageUrl || uploadedFile?.publicUrl || "",
    annotatedImageUrl: detectionResult?.annotatedImageUrl || reportDetail?.annotatedImageUrl || "",
    reportSummary: reportDetail?.summary || detectionResult?.advice?.[0] || "暂无报告摘要",
    reportFileName: reportDetail ? diagnosisReportFileName(reportDetail) : "",
    reportText: reportDetail ? buildDiagnosisReportText(reportDetail) : "",
  };
}

function diagnosisConversationId(entry) {
  const crop = entry?.crop || "未知作物";
  const disease = entry?.result || entry?.disease || "未知问题";
  return `diagnosis-${crop}-${disease}`.replace(/\s+/g, "-");
}

function formatDiagnosisHistoryTime(value) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function cropFromDiagnosisItem(item = {}) {
  const title = String(item.title || "").replace(/诊断|防治报告/g, "").trim();
  return item.crop || title || "--";
}

function normalizeDiagnosisHistoryRow(item = {}) {
  const status = String(item.status || "").toLowerCase();
  const isComplete = ["completed", "finished", "done", "success"].includes(status);
  return {
    id: item.id || "",
    time: formatDiagnosisHistoryTime(item.createdAt),
    crop: cropFromDiagnosisItem(item),
    image: item.assetName || item.imageName || item.assetId || "后端记录",
    result: item.result || item.status || "等待识别结果",
    advice: isComplete ? "可继续追问" : (item.status || "处理中"),
    action: "继续提问",
  };
}

function buildCommunityChatContext({ source, form, uploaded, post }) {
  const isHelpForm = source === "help-form";
  const title = isHelpForm
    ? (form?.title?.trim() || "社区求助问题")
    : (post?.title || "经验详情追问");
  const fields = isHelpForm
    ? [
        ["来源", "交流社区 / 我要提问"],
        ["问题类型", form?.type || "未填写"],
        ["关联区域", form?.area || "未填写"],
        ["作物", form?.crop || "未填写"],
        ["标题", form?.title || "未填写"],
        ["问题描述", form?.content || "未填写"],
        ["图片", uploaded ? "已上传" : "未上传"],
      ]
    : [
        ["来源", "交流社区 / 经验详情"],
        ["经验类型", post?.type || "病虫害处理"],
        ["关联区域", post?.area || "大棚 A-01"],
        ["作物", post?.crop || "草莓"],
        ["标题", post?.title || "经验详情"],
        ["内容摘要", post?.content || "暂无摘要"],
      ];

  return {
    context: "community",
    conversationId: `community-${source}-${title}`.replace(/\s+/g, "-"),
    title,
    source,
    sourceLabel: isHelpForm ? "来自社区求助" : "来自经验详情",
    fields,
    prompt: fields.map(([label, value]) => `${label}：${value}`).join("\n"),
  };
}

function DetectionScreen({ screen, taskId, onNavigate, role = "farmer" }) {
  const { taskDetail, taskDetailLoading, taskDetailError } = useTaskDetail(taskId);
  const [step, setStep] = useState(0);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [detectionResult, setDetectionResult] = useState(null);
  const [reportDetail, setReportDetail] = useState(null);
  const [showReport, setShowReport] = useState(false);
  const fileInputRef = useRef(null);
  const [history, setHistory] = useState([]);
  const [historyError, setHistoryError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ignored = false;
    async function loadDiagnosisHistory() {
      setLoading(true);
      setHistoryError("");
      try {
        const response = role === "admin"
          ? await listAdminDiagnoses({ page: 1, pageSize: 20 })
          : await listDiagnoses({ page: 1, pageSize: 20 });
        if (!ignored) setHistory(pageItems(response).map(normalizeDiagnosisHistoryRow));
      } catch (error) {
        const message = apiErrorMessage(error, "识别历史加载失败");
        if (!ignored) {
          setHistoryError(message);
          setHistory([]);
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) setLoading(false);
      }
    }

    loadDiagnosisHistory();
    return () => { ignored = true; };
  }, [role]);

  useEffect(() => () => {
    if (uploadedFile?.previewUrl) URL.revokeObjectURL(uploadedFile.previewUrl);
  }, [uploadedFile?.previewUrl]);

  function handleUpload() {
    fileInputRef.current?.click();
  }

  async function handleFileSelected(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setDetectionResult(null);
    setReportDetail(null);
    setShowReport(false);
    try {
      const previewUrl = URL.createObjectURL(file);
      const response = await uploadFile(file, "diagnosis");
      const uploaded = apiItem(response);
      if (!uploaded?.id) throw new Error("后端没有返回图片 fileId");
      setUploadedFile({
        id: uploaded.id,
        name: uploaded.fileName || file.name,
        publicUrl: uploaded.publicUrl || uploaded.url || "",
        previewUrl,
      });
      setStep(1);
      toast("图片已上传到后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "图片上传失败"), { type: "warn" });
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  }

  async function handleDetect() {
    if (!uploadedFile?.id) { toast("请先选择并上传图片", { type: "warn" }); return; }
    setDetecting(true);
    try {
      const createDiagnosisApi = role === "admin" ? createAdminDiagnosis : createDiagnosis;
      const response = await createDiagnosisApi({
        assetId: "asset-greenhouse-a01",
        crop: "草莓",
        growthStage: "Red",
        fileIds: [uploadedFile.id],
        imageFileIds: [uploadedFile.id],
      });
      const item = apiItem(response);
      const confidence = item?.confidence === undefined || item?.confidence === null
        ? "--"
        : Number(item.confidence) <= 1
          ? `${Math.round(Number(item.confidence) * 100)}%`
          : `${Math.round(Number(item.confidence))}%`;
      setDetectionResult({
        id: item?.id,
        crop: item?.crop || "草莓",
        disease: item?.result || "等待后端识别结果",
        confidence,
        imageUrl: item?.imageUrl || uploadedFile?.publicUrl || uploadedFile?.previewUrl || "",
        annotatedImageUrl: item?.annotatedImageUrl || "",
        advice: [item?.suggestion, item?.followUp, item?.recommendedActions].filter(Boolean).length
          ? [item?.suggestion, item?.followUp, item?.recommendedActions].filter(Boolean)
          : ["请生成防治报告查看详细建议。"],
      });
      setReportDetail(null);
      setStep(2);
      toast("识别任务已提交后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "识别提交失败"), { type: "warn" });
    } finally {
      setDetecting(false);
    }
  }

  async function handleReport() {
    if (!detectionResult?.id) { toast("请先完成后端识别", { type: "warn" }); return; }
    setDetecting(true);
    try {
      const createReportApi = role === "admin" ? createAdminDiagnosisReport : createDiagnosisReport;
      const response = await createReportApi(detectionResult.id);
      const report = apiItem(response);
      const suggestionAdvice = Array.isArray(report?.suggestions)
        ? report.suggestions.map((item) => item?.body || item?.content || item?.title).filter(Boolean)
        : [];
      const advice = [report?.summary, ...suggestionAdvice, report?.treatmentSteps, report?.preventionTips].filter(Boolean);
      const nextResult = {
        ...detectionResult,
        imageUrl: report?.imageUrl || detectionResult.imageUrl,
        annotatedImageUrl: report?.annotatedImageUrl || detectionResult.annotatedImageUrl,
        advice: advice.length ? advice : detectionResult.advice,
      };
      const nextReportDetail = buildDiagnosisReportDetail({ report, detectionResult: nextResult, uploadedFile });
      setDetectionResult(nextResult);
      setReportDetail(nextReportDetail);
      setShowReport(true);
      setStep(3);
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
      setHistory((prev) => [{ time, crop: nextResult.crop, image: uploadedFile?.name || "新图片", result: nextResult.disease, advice: "查看报告", action: "继续提问" }, ...prev]);
      toast("防治报告已生成", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "防治报告生成失败"), { type: "warn" });
    } finally {
      setDetecting(false);
    }
  }

  function handleHistoryAction(index, action) {
    const entry = history[index];
    if (action === "继续提问") {
      onNavigate?.("expert-context-chat", {
        context: "diagnosis",
        conversationId: diagnosisConversationId(entry),
        crop: entry.crop,
        disease: entry.result,
        imageName: entry.image,
        reportSummary: entry.advice,
      });
    } else if (action === "重新提问" || action === "补充拍照") {
      setStep(0); setUploadedFile(null); setDetectionResult(null); setReportDetail(null); setShowReport(false);
      toast("已重置，请上传新图片", { type: "success" });
    } else if (action === "查看专家建议" || action === "查看报告") {
      setShowReport(true);
      toast("已加载防治建议", { type: "success" });
    }
  }

  const stepLabels = ["上传图片", "点击识别", "生成报告"];

  if (loading) {
    return (
      <div className="screen-canvas detection-layout">
        <Panel title="识别流程" className="flow-panel"><Loading type="card" /></Panel>
        <div style={{ minHeight: 120, borderRadius: "var(--radius)", background: "linear-gradient(90deg, #e8f5e9 25%, #c8e6c9 50%, #e8f5e9 75%)", backgroundSize: "200% 100%", animation: "skeleton-shimmer 1.5s infinite" }} />
        <Panel title="加载中" className="result-panel"><Loading type="card" /></Panel>
        <Panel title="识别历史" className="history-panel"><Loading type="table" rows={3} cols={4} /></Panel>
      </div>
    );
  }

  return (
    <div className="screen-canvas detection-layout">
      <TaskDetailSummary taskDetail={taskDetail} loading={taskDetailLoading} error={taskDetailError} />
      <Panel title="识别流程" className="flow-panel">
        <div className="detection-actions">
          {stepLabels.map((label, i) => (
            <button
              key={label}
              type="button"
              className={`detection-btn ${i < step ? "done" : ""} ${i === step ? "active" : ""}`}
              onClick={() => { if (i === 0) handleUpload(); else if (i === 1) handleDetect(); else handleReport(); }}
              disabled={detecting || uploading}
            >
              {label}
              {i < step && <small> ✓</small>}
              {i === step && detecting && <small className="spinning"> ⟳</small>}
            </button>
          ))}
          <button
            type="button"
            className="detection-btn secondary"
            onClick={() => onNavigate?.("expert-context-chat", buildDiagnosisChatContext({ detectionResult, uploadedFile, reportDetail }))}
          >
            专家问答
          </button>
        </div>
      </Panel>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleFileSelected}
      />
      <section
        className={`upload-drop ${uploadedFile ? "has-file" : ""}`}
        onClick={handleUpload}
        style={{ cursor: "pointer" }}
      >
        {uploading ? (
          <div className="upload-preview">
            <strong>上传中...</strong>
            <span>正在发送到后端</span>
          </div>
        ) : uploadedFile ? (
          <div className="disease-image-board">
            <div className="disease-image-card">
              <span>上传图片</span>
              <img src={absoluteApiUrl(uploadedFile.publicUrl || uploadedFile.previewUrl)} alt="上传的病害识别图片" />
              <small>{uploadedFile.name}</small>
            </div>
            <div className={`disease-image-card ${detectionResult?.annotatedImageUrl ? "" : "empty"}`}>
              <span>识别结果图</span>
              {detectionResult?.annotatedImageUrl ? (
                <img src={absoluteApiUrl(detectionResult.annotatedImageUrl)} alt="病害识别结果图" />
              ) : (
                <strong>完成识别后显示</strong>
              )}
              <small>{detectionResult?.disease || "等待模型输出"}</small>
            </div>
            <button type="button" className="image-reupload-button">重新上传</button>
          </div>
        ) : (
          <span>点击上传或拖拽图片</span>
        )}
      </section>
      <Panel title={showReport ? "防治建议" : "识别结果"} className="result-panel">
        {detecting ? (
          <Loading type="card" />
        ) : showReport && reportDetail ? (
          <div className="advice-list" style={{ maxHeight: "360px", overflowY: "auto" }}>
            {(reportDetail.annotatedImageUrl || reportDetail.imageUrl) && (
              <img className="report-result-image" src={absoluteApiUrl(reportDetail.annotatedImageUrl || reportDetail.imageUrl)} alt="病害识别报告图片" />
            )}
            <div className="report-summary-card">
              <strong>{reportDetail.disease}</strong>
              <span>{reportDetail.crop} / {reportDetail.riskLevel} / 置信度 {reportDetail.confidence}</span>
              <p>{reportDetail.summary}</p>
            </div>
            {reportDetail.treatmentSteps.slice(0, 3).map((a, i) => <span key={a}>建议{i + 1}：{a}</span>)}
            <button className="report-export-button" type="button" onClick={() => downloadDiagnosisReport(reportDetail)}>导出报告</button>
          </div>
        ) : detectionResult ? (
          <div className="form-grid">
            <span>识别作物</span><span>{detectionResult.crop}</span>
            <span>疑似病害</span><span>{detectionResult.disease}</span>
            <span>置信度</span><span>{detectionResult.confidence}</span>
          </div>
        ) : (
          <div className="form-grid">
            <span>识别作物</span><span>--</span>
            <span>疑似病害</span><span>--</span>
            <span>置信度</span><span>--</span>
          </div>
        )}
      </Panel>
      <Panel title="识别历史" className="history-panel">
        {historyError ? (
          <EmptyState title="识别历史加载失败" description={historyError} />
        ) : history.length === 0 ? (
          <EmptyState title="暂无识别历史" description="后端当前没有返回诊断记录。" />
        ) : (
          <HistoryTable rows={history} onAction={handleHistoryAction} />
        )}
      </Panel>
    </div>
  );
}

function chatMessageId(prefix = "message") {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function normalizeChatMessage(message, prefix = "message") {
  return {
    id: message.id || chatMessageId(prefix),
    ...message,
  };
}

function cloneChatConversation(conversation) {
  return {
    ...conversation,
    messages: (conversation.messages || []).map((message, index) =>
      normalizeChatMessage(message, `${conversation.id || "chat"}-${index}`)
    ),
  };
}

function formatChatSessionSubtitle(value, fallback = "后端会话") {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString("zh-CN", { month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
}

function normalizeChatSession(session = {}) {
  return {
    id: session.id || chatMessageId("chat-session"),
    title: session.title || session.contextLabel || "新的专家问答",
    subtitle: session.lastMessageSummary || formatChatSessionSubtitle(session.updatedAt),
    contextType: session.contextType || "",
    contextId: session.contextId || "",
    contextLabel: session.contextLabel || "",
    messages: [],
    messagesLoaded: false,
    isBackendSession: true,
  };
}

function normalizeExpertChatMessage(message = {}) {
  const role = message.role === "assistant" ? "model" : message.role === "user" ? "farmer" : (message.role || "model");
  return normalizeChatMessage({
    id: message.id,
    role,
    text: message.content || message.text || "",
  }, "expert-chat-message");
}

function isChatPendingText(text) {
  return !text || text === "正在分析中...";
}

function buildContextConversation(chatContext) {
  if (chatContext?.context === "community") {
    return {
      id: chatContext?.conversationId || "current-community",
      title: chatContext?.title || "社区问题追问",
      subtitle: chatContext?.sourceLabel || "来自交流社区",
      contextType: "community",
      contextId: chatContext?.conversationId || "",
      contextLabel: chatContext?.title || chatContext?.sourceLabel || "社区问题追问",
      isBackendSession: false,
      isContextDraft: true,
      messages: [
        {
          role: "model",
          text: "社区上下文已放入输入框，你可以补充想问的问题，发送时会一并交给专家模型分析。",
        },
      ],
    };
  }
  if (chatContext?.context !== "diagnosis") return null;
  return {
    id: chatContext?.conversationId || "current-diagnosis",
    title: `${chatContext.crop || "作物"} ${chatContext.disease || "病虫害问题"}`,
    subtitle: "来自病害识别",
    contextType: "diagnosis",
    contextId: chatContext?.conversationId || "",
    contextLabel: chatContext?.disease || chatContext?.crop || "病害识别",
    isBackendSession: false,
    isContextDraft: true,
    messages: [
      {
        role: "model",
        text: "识别结果和报告文件已放入输入框，你可以补充想问的问题，发送时会一并交给专家模型分析。",
      },
    ],
  };
}

function mergeContextConversation(conversations, chatContext) {
  const contextConversation = buildContextConversation(chatContext);
  if (!contextConversation) return conversations;
  const normalizedContextConversation = cloneChatConversation(contextConversation);
  const existingIndex = conversations.findIndex((item) => item.id === contextConversation.id);
  if (existingIndex < 0) return [normalizedContextConversation, ...conversations];
  return conversations.map((item, index) =>
    index === existingIndex
      ? { ...item, subtitle: "来自识别历史，可继续追问" }
      : item
  );
}

function estimateTextBytes(text = "") {
  return `${Math.max(1, Math.ceil(new Blob([text]).size / 1024))}KB`;
}

function ChatScreen({ chatContext, role = "farmer" }) {
  const hasContext = Boolean(chatContext);
  const [loading, setLoading] = useState(true);
  const [chatError, setChatError] = useState("");
  const [conversations, setConversations] = useState(() => mergeContextConversation([], chatContext));
  const [activeConvId, setActiveConvId] = useState(chatContext?.conversationId || "");
  const [inputText, setInputText] = useState("");
  const [processing, setProcessing] = useState(false);
  const [sentContextIds, setSentContextIds] = useState(new Set());
  const inputRef = React.useRef(null);
  const threadRef = React.useRef(null);

  useEffect(() => {
    let ignored = false;
    async function loadExpertChatSessions() {
      if (role === "admin") {
        setLoading(false);
        return;
      }
      setLoading(true);
      setChatError("");
      try {
        const response = await listExpertChatSessions({ page: 1, pageSize: 20 });
        const backendConversations = pageItems(response).map(normalizeChatSession);
        if (!ignored) {
          setConversations((prev) => {
            const drafts = prev.filter((item) => item.isContextDraft);
            return mergeContextConversation([...drafts, ...backendConversations], chatContext);
          });
          setActiveConvId((current) => current || chatContext?.conversationId || backendConversations[0]?.id || "");
        }
      } catch (error) {
        const message = apiErrorMessage(error, "专家问答历史加载失败");
        if (!ignored) {
          setChatError(message);
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) setLoading(false);
      }
    }

    loadExpertChatSessions();
    return () => { ignored = true; };
  }, [role]);

  useEffect(() => {
    const contextConversation = buildContextConversation(chatContext);
    if (!contextConversation) return;
    setConversations((prev) => mergeContextConversation(prev, chatContext));
    setActiveConvId(contextConversation.id);
  }, [chatContext?.conversationId, chatContext?.crop, chatContext?.disease]);

  async function loadExpertChatMessages(sessionId) {
    try {
      const response = await listExpertChatMessages(sessionId);
      const messages = pageItems(response).map(normalizeExpertChatMessage);
      setConversations((prev) =>
        prev.map((conversation) =>
          conversation.id === sessionId
            ? { ...conversation, messages, messagesLoaded: true }
            : conversation
        )
      );
    } catch (error) {
      toast(apiErrorMessage(error, "专家问答消息加载失败"), { type: "warn" });
    }
  }

  const activeConv = conversations.find((c) => c.id === activeConvId) || conversations[0];

  useEffect(() => {
    if (role === "admin" || !activeConv?.isBackendSession || activeConv.messagesLoaded) return;
    loadExpertChatMessages(activeConv.id);
  }, [activeConvId, conversations, role]);

  const contextItems = chatContext?.context === "community"
    ? chatContext?.fields || []
    : hasContext
      ? [
        ["识别作物", chatContext?.crop || "草莓"],
        ["疑似问题", chatContext?.disease || "叶斑病疑似"],
        ["识别图片", chatContext?.imageName || "上传图片"],
        ["识别置信度", chatContext?.confidence || "--"],
        ["所在区域", "地块 P-07"],
        ["报告文件", chatContext?.reportFileName || "未生成报告"],
        ["报告摘要", chatContext?.reportSummary || "等待专家结合上下文分析"],
      ]
      : [];

  const activeContextId = chatContext?.conversationId || "current-diagnosis";
  const isActiveContextConversation = activeConv?.id === activeContextId || activeConv?.contextId === activeContextId;
  const shouldSendContext = hasContext && contextItems.length > 0 && isActiveContextConversation && !sentContextIds.has(activeContextId);

  const promptChips = chatContext?.context === "community"
    ? ["给出处理建议", "生成追问清单", "整理成发帖内容"]
    : hasContext
    ? ["根据诊断结果给处理方案", "判断是否需要停灌", "生成今日巡检要点"]
    : ["小麦叶片发黄怎么办？", "草莓花期如何控温？", "设备离线先查哪里？"];

  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [activeConvId, activeConv?.messages?.length, processing]);

  function buildLocalChatConversation(title = "新的专家问答") {
    const now = new Date();
    return {
      id: `chat-${now.getTime()}`,
      title,
      subtitle: "刚刚创建",
      isBackendSession: false,
      messages: [
        normalizeChatMessage({
          role: "model",
          text: "你好，我是农业专家助手。你可以描述作物、区域、症状、持续时间，也可以从病害识别历史继续追问。",
        }, "new-chat-welcome"),
      ],
    };
  }

  function handleNewConversation() {
    const nextConversation = buildLocalChatConversation();
    setConversations((prev) => [nextConversation, ...prev]);
    setActiveConvId(nextConversation.id);
    setInputText("");
  }

  async function ensureExpertChatSession(messageText) {
    const currentConversation = conversations.find((item) => item.id === activeConvId);
    if (role === "admin") {
      if (currentConversation) return currentConversation;
      const nextConversation = buildLocalChatConversation(messageText.slice(0, 18) || "新的专家问答");
      setConversations((prev) => [nextConversation, ...prev]);
      setActiveConvId(nextConversation.id);
      return nextConversation;
    }
    if (currentConversation?.isBackendSession) return currentConversation;

    const response = await createExpertChatSession({
      title: currentConversation?.title || messageText.slice(0, 18) || "新的专家问答",
      contextType: chatContext?.context || currentConversation?.contextType || undefined,
      contextId: chatContext?.conversationId || currentConversation?.contextId || undefined,
      contextLabel: chatContext?.title || chatContext?.disease || currentConversation?.contextLabel || undefined,
    });
    const nextConversation = {
      ...normalizeChatSession(apiItem(response)),
      messages: currentConversation?.messages || [],
      messagesLoaded: true,
    };
    setConversations((prev) => [
      nextConversation,
      ...prev.filter((item) => item.id !== currentConversation?.id && item.id !== nextConversation.id),
    ]);
    setActiveConvId(nextConversation.id);
    return nextConversation;
  }

  async function sendMessage(text) {
    if (!text.trim() || processing) return;
    const reportContext = chatContext?.reportText ? `\n\n【诊断报告】\n${chatContext.reportText}` : "";
    const trimmed = text.trim();
    const contextPayload = contextItems.length
      ? { context: chatContext?.context, items: contextItems, reportText: chatContext?.reportText || "" }
      : null;
    const contextAttachment = shouldSendContext
      ? {
        fileType: "上下文",
        fileName: chatContext?.reportFileName || "诊断上下文",
        fileSize: estimateTextBytes(chatContext?.reportText || JSON.stringify(contextItems)),
      }
      : null;
    setInputText("");
    setProcessing(true);
    const userMessageId = chatMessageId("user");
    const assistantMessageId = chatMessageId("assistant");
    let targetConvId = activeConvId;

    try {
      const ensuredConversation = await ensureExpertChatSession(trimmed);
      targetConvId = ensuredConversation.id;
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetConvId) return c;
          return {
            ...c,
            messages: [
              ...c.messages,
              { id: userMessageId, role: "farmer", text: trimmed, attachment: contextAttachment },
              { id: assistantMessageId, role: "model", text: "正在分析中...", streamingId: assistantMessageId },
            ],
            subtitle: "正在回复",
          };
        })
      );

      if (role === "admin") {
        await streamAssistantChat(
          {
            chatId: targetConvId,
            message: trimmed + reportContext,
            context: contextPayload || undefined,
          },
          {
            role: "farm_admin",
            onChunk: (chunk) => {
              setConversations((prev) =>
                prev.map((c) => {
                  if (c.id !== targetConvId) return c;
                  return {
                    ...c,
                    messages: c.messages.map((msg) =>
                      msg.streamingId === assistantMessageId
                        ? { ...msg, text: isChatPendingText(msg.text) ? chunk : `${msg.text || ""}${chunk}` }
                        : msg
                    ),
                    subtitle: "正在回复",
                  };
                })
              );
            },
          }
        );
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConvId) return c;
            return {
              ...c,
              messages: c.messages.map((msg) =>
                msg.streamingId === assistantMessageId
                  ? { ...msg, text: isChatPendingText(msg.text) ? "后端暂未返回内容。" : msg.text, streamingId: undefined }
                  : msg
              ),
              subtitle: "刚刚更新",
            };
          })
        );
      } else {
        const response = await sendExpertChatMessage(targetConvId, {
          message: trimmed + reportContext,
          attachmentNames: contextAttachment ? [contextAttachment.fileName] : undefined,
        });
        const savedMessages = (apiItem(response)?.messages || []).map(normalizeExpertChatMessage);
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== targetConvId) return c;
            const currentMessages = c.messages.filter((msg) => msg.id !== userMessageId && msg.id !== assistantMessageId);
            return {
              ...c,
              messages: savedMessages.length
                ? [...currentMessages, ...savedMessages]
                : c.messages.map((msg) =>
                  msg.streamingId === assistantMessageId
                    ? { ...msg, text: isChatPendingText(msg.text) ? "后端暂未返回内容。" : msg.text, streamingId: undefined }
                    : msg
                ),
              messagesLoaded: true,
              subtitle: "刚刚更新",
            };
          })
        );
      }
      toast("专家已回复", { type: "success" });
      setSentContextIds((next) => {
        const updated = new Set(next);
        updated.add(activeContextId);
        return updated;
      });
    } catch (error) {
      const message = apiErrorMessage(error, "智慧问答生成失败");
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== targetConvId) return c;
          return {
            ...c,
            messages: c.messages.map((msg) =>
              msg.streamingId === assistantMessageId
                ? { ...msg, text: message, streamingId: undefined, isError: true }
                : msg
            ),
            subtitle: "回复失败",
          };
        })
      );
      toast(message, { type: "warn" });
    } finally {
      setProcessing(false);
    }
  }

  function handleVoiceInput() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast("当前浏览器不支持语音识别，请手动输入问题", { type: "warn" });
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = "zh-CN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results || [])
        .map((result) => result?.[0]?.transcript || "")
        .join("")
        .trim();
      if (!transcript) {
        toast("未识别到语音内容，请再试一次", { type: "warn" });
        return;
      }
      setInputText(transcript);
      inputRef.current?.focus();
      toast("语音识别完成", { type: "success" });
    };
    recognition.onerror = (event) => {
      const message = event?.error === "not-allowed"
        ? "请允许浏览器麦克风权限后再试"
        : "语音识别失败，请手动输入问题";
      toast(message, { type: "warn" });
    };
    recognition.start();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputText);
    }
  }

  if (loading) {
    return (
      <div className="screen-canvas chat-page">
        <div className="chat-shell">
          <aside className="chat-sidebar">
            <Loading type="card" />
            <Loading type="card" />
          </aside>
          <main className="chat-room">
            <Loading type="card" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="screen-canvas chat-page">
      <div className="chat-shell">
        <aside className="chat-sidebar">
          <div className="chat-brand">
            <span>农</span>
            <strong>农业专家问答</strong>
          </div>
          <button type="button" className="chat-new-button" onClick={handleNewConversation}>
            <span>+</span>
            新对话
          </button>
          <div className="chat-history-label">历史对话</div>
          <div className="chat-history-list">
            {chatError && <div className="error-message">{chatError}</div>}
            {!chatError && conversations.length === 0 ? (
              <EmptyState title="暂无历史对话" description="发送新问题后会在这里展示后端会话。" />
            ) : conversations.map((conv) => (
              <button
                className={conv.id === activeConvId ? "chat-history-item active" : "chat-history-item"}
                key={conv.id}
                type="button"
                onClick={() => setActiveConvId(conv.id)}
              >
                <strong>{conv.title}</strong>
                <span>{conv.subtitle}</span>
              </button>
            ))}
          </div>
        </aside>
        <main className="chat-room">
          <header className="chat-topbar">
            <div>
              <strong>{activeConv?.title || "新的专家问答"}</strong>
              <span>{activeConv?.subtitle || "可继续输入问题"}</span>
            </div>
          </header>
          <div className="chat-thread" ref={threadRef} aria-label="专家问答对话">
            {activeConv?.messages?.length ? activeConv.messages.map((msg, i) => (
              <div className={`message-row ${msg.role}${msg.isError ? " error" : ""}`} key={msg.id || i}>
                {msg.attachment && (
                  <div className="message-attachment-card">
                    <span>{msg.attachment.fileType}</span>
                    <div>
                      <strong>{msg.attachment.fileName}</strong>
                      <small>{msg.attachment.fileSize || "上下文"}</small>
                    </div>
                  </div>
                )}
                <span>{msg.role === "farmer" ? "农户" : "农业专家助手"}</span>
                <p>{msg.text}</p>
              </div>
            )) : (
              <EmptyState title="暂无对话消息" description="选择历史会话或发送新问题后显示内容。" />
            )}
          </div>
          <div className="prompt-chips" aria-label="常用追问">
            {promptChips.map((item) => (
              <button key={item} type="button" onClick={() => sendMessage(item)} disabled={processing}>
                {item}
              </button>
            ))}
          </div>
          <div className="chat-composer">
            {shouldSendContext && (
              <div className="chat-composer-context" aria-label="待发送上下文">
                
                <div className="composer-context-meta">
                  {contextItems
                    .filter(([label]) => label !== "报告正文")
                    .slice(0, 6)
                    .map(([label, value]) => (
                      <span key={label}>
                        <b>{label}</b>
                        {value}
                      </span>
                    ))}
                </div>
              </div>
            )}
            <input
              ref={inputRef}
              type="text"
              placeholder="发消息..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={processing}
            />
            <button type="button" onClick={handleVoiceInput} disabled={processing}>语音</button>
            <button type="button" onClick={() => sendMessage(inputText)} disabled={processing}>发送</button>
          </div>
        </main>
      </div>
    </div>
  );
}

const COMMUNITY_CATEGORY_MAP = {
  病虫害处理: "disease",
  病虫害: "disease",
  灌溉经验: "irrigation",
  灌溉: "irrigation",
  施肥经验: "fertilization",
  施肥: "fertilization",
  大棚管理: "greenhouse",
  设备使用: "device",
  设备使用经验: "device",
  设备: "device",
  其他: "other",
};

const ASSET_ID_BY_AREA = {
  "大棚 A-01": "asset-greenhouse-a01",
  "大棚 A-02": "asset-greenhouse-a02",
  "大棚 B-01": "asset-greenhouse-a03",
  "大棚 B-03": "asset-greenhouse-a04",
  "草莓棚 C-03": "asset-greenhouse-c03",
  "地块 A-01": "asset-plot-p01",
  "地块 A-02": "asset-plot-p02",
  "地块 B-01": "asset-plot-p03",
  "地块 B-03": "asset-plot-p04",
  "地块 P-07": "asset-plot-p07",
  "地块 P-08": "asset-plot-p08",
  "南区小麦地块": "asset-plot-p14",
};

function resolveAssetBackendId(asset = {}) {
  if (!asset) return "";
  if (asset.isLocalPlaceholder) return "";
  if (asset.backendId) return asset.backendId;
  if (ASSET_ID_BY_AREA[asset.name]) return ASSET_ID_BY_AREA[asset.name];
  if (asset.id && String(asset.id).startsWith("asset-")) return asset.id;
  return "";
}

function readTelemetryValue(source, keys = []) {
  if (!source || typeof source !== "object") return "";
  for (const key of keys) {
    const value = source[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return "";
}

function formatTelemetryValue(value, unit = "") {
  if (value === undefined || value === null || value === "") return "";
  const text = String(value);
  return unit && !text.includes(unit) ? `${text}${unit}` : text;
}

function parseTelemetryText(text = "") {
  const source = String(text || "");
  const pick = (patterns) => {
    for (const pattern of patterns) {
      const match = source.match(pattern);
      if (match?.[1]) return match[1];
    }
    return "";
  };
  return {
    light: pick([/(?:光照|light|illumination)[^\d]*(\d+(?:\.\d+)?\s*(?:klx|lux)?)/i]),
    temperature: pick([/(?:温度|temperature|temp)[^\d-]*(-?\d+(?:\.\d+)?\s*(?:℃|°C|C)?)/i, /(-?\d+(?:\.\d+)?)\s*(?:℃|°C)/i]),
    humidity: pick([/(?:空气湿度|湿度|humidity|airHumidity)[^\d]*(\d+(?:\.\d+)?\s*%?)/i]),
    ph: pick([/(?:ph|PH)[^\d]*(\d+(?:\.\d+)?)/]),
    soilMoisture: pick([/(?:土壤湿度|土壤水分|soilMoisture|soilHumidity|moisture)[^\d]*(\d+(?:\.\d+)?\s*%?)/i]),
  };
}

function normalizeTelemetrySource(item = {}) {
  const telemetry = item.latestTelemetry || item.telemetry || item.data || {};
  if (telemetry && typeof telemetry === "object" && !Array.isArray(telemetry)) return telemetry;
  return parseTelemetryText(item.latestTelemetryText || item.data || "");
}

function emptyEnvironmentControls() {
  return [
    ["光照强度", "--"],
    ["温度", "--"],
    ["空气湿度", "--"],
    ["土壤湿度", "--"]
  ];
}

function buildEnvironmentControlsFromDevices(devices = []) {
  const merged = {};
  devices.forEach((item) => {
    const telemetry = normalizeTelemetrySource(item);
    const textTelemetry = parseTelemetryText(item.latestTelemetryText || item.data || "");
    Object.assign(merged, textTelemetry, telemetry);
  });

  const nextControls = [
    ["光照强度", formatTelemetryValue(readTelemetryValue(merged, ["light", "illumination", "lightIntensity", "lux"]), "klx")],
    ["温度", formatTelemetryValue(readTelemetryValue(merged, ["temperature", "temp", "airTemperature"]), "℃")],
    ["空气湿度", formatTelemetryValue(readTelemetryValue(merged, ["humidity", "airHumidity", "airMoisture"]), "%")],
    ["土壤湿度", formatTelemetryValue(readTelemetryValue(merged, ["soilMoisture", "moisture", "soilHumidity"]), "%")],
  ];

  return nextControls.map(([label, value]) => [label, value || "--"]);
}

function apiErrorMessage(error, fallback) {
  return error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || fallback;
}

function normalizeGrowthRecordItems(items = []) {
  return items.map((item, index) => ({
    id: item.id || `growth-record-${index + 1}`,
    farmId: item.farmId || "",
    assetId: item.assetId || "",
    stage: item.stage || "未分期",
    fileId: item.fileId || item.imageFileId || item.detection?.imageFileId || "",
    fileName: item.fileName || item.name || item.file?.fileName || item.image?.fileName || "",
    fileUrl: absoluteApiUrl(
      item.fileUrl
      || item.publicUrl
      || item.url
      || item.imageUrl
      || item.file?.publicUrl
      || item.file?.url
      || item.image?.publicUrl
      || item.image?.url
      || item.detection?.imageUrl
      || ""
    ),
    recorderId: item.recorderId || "",
    recorderName: item.recorderName || item.recorder || "",
    note: item.note || item.description || "",
    capturedAt: item.capturedAt || item.createdAt || "",
    createdAt: item.createdAt || "",
    detection: item.detection || null,
  }));
}

function formatDetectionConfidence(value) {
  if (value === null || value === undefined || value === "") return "--";
  const next = Number(value);
  if (!Number.isFinite(next)) return String(value);
  return `${Math.round(next * 100)}%`;
}

function detectionDecisionLabel(status) {
  return {
    matched: "模型与日历一致",
    mismatch: "模型与日历不一致",
  }[status] || status || "未记录";
}

function formatGrowthRecordTime(value) {
  if (!value) return "未记录";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function normalizeDiseaseStatistics(value = {}) {
  const riskDistribution = Array.isArray(value?.riskDistribution) ? value.riskDistribution : [];
  const diseaseDistribution = Array.isArray(value?.diseaseDistribution) ? value.diseaseDistribution : [];
  return {
    assetId: value?.assetId || "",
    total: Number(value?.total ?? 0),
    riskDistribution: riskDistribution.map((item, index) => ({
      key: item.key || item.label || `risk-${index + 1}`,
      label: item.label || diseaseRiskLabel(item.key),
      value: Number(item.value ?? 0),
    })).filter((item) => item.value > 0),
    diseaseDistribution: diseaseDistribution.map((item, index) => ({
      key: item.key || item.label || `disease-${index + 1}`,
      label: item.label || item.key || `病害 ${index + 1}`,
      value: Number(item.value ?? 0),
    })).filter((item) => item.value > 0),
    latest: value?.latest || null,
  };
}

function buildDiseasePieData(statistics) {
  const palette = ["#e24d57", "#2fae74", "#3b82c4", "#c98a10", "#758a81", "#8b6bd6"];
  const diseaseItems = statistics.diseaseDistribution.length > 0
    ? statistics.diseaseDistribution
    : statistics.riskDistribution.map((item) => ({ ...item, label: diseaseRiskLabel(item.key) }));

  return diseaseItems.map((item, index) => ({
    label: item.label || item.key,
    value: item.value,
    color: diseaseColor(item.key, index, palette),
  }));
}

function diseaseColor(key, index, palette) {
  const colorMap = {
    high: "#e24d57",
    medium: "#c98a10",
    low: "#28b463",
    unknown: "#758a81",
  };
  return colorMap[String(key || "").toLowerCase()] || palette[index % palette.length];
}

function diseaseRiskLabel(value) {
  const risk = String(value || "").toLowerCase();
  if (risk === "high") return "高风险";
  if (risk === "medium") return "中风险";
  if (risk === "low") return "低风险";
  return "待复核";
}

function formatDiseaseConfidence(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return "--";
  return `${Math.round(numeric * 100)}%`;
}

function formatDiseaseTime(value) {
  if (!value) return "未记录时间";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function buildCommunityStats(stats = {}) {
  return [
    ["今日新增", String(stats?.todayNew ?? 0), "经验与求助"],
    ["热门话题", String(stats?.hotTopics ?? 0), "后端统计"],
    ["我的收藏", String(stats?.myFavorites ?? 0), "可复用经验"],
    ["待回复求助", String(stats?.pendingReply ?? 0), "等待农友补充"],
  ];
}

function normalizeCommunityPost(item, index = 0) {
  const title = item.title || "未命名帖子";
  const category = item.category || "experience";
  const favoriteCount = Number(item.favoriteCount ?? item.likeCount ?? item.likes ?? 0);
  const commentCount = Number(item.commentCount ?? item.comments ?? 0);
  const author = item.author || {};
  const authorName = author.displayName || item.authorDisplayName || item.authorId || "农户";

  return {
    id: item.id || `post-${index + 1}`,
    thumb: category === "disease" ? "病虫害" : category === "irrigation" ? "灌溉" : "经验",
    category,
    title,
    desc: item.summary || item.content || "暂无摘要",
    meta: [
      `发布人：${authorName}`,
      `分类：${item.categoryLabel || category}`,
      `状态：${item.auditStatus || "待审核"}`,
      `收藏 ${favoriteCount}`,
      `评论 ${commentCount}`,
    ],
    primary: index === 0,
    favoriteCount,
    comments: commentCount,
    favorited: Boolean(item.favorited),
  };
}

function normalizeCommunityComment(item = {}, index = 0) {
  const author = item.author || {};
  return {
    id: item.id || `comment-${index + 1}`,
    author: author.displayName || item.authorDisplayName || item.authorId || "农户",
    text: item.content || item.text || "",
    createdAt: item.createdAt || "",
  };
}

function normalizeCommunityDetail(item = {}) {
  const author = item.author || {};
  const category = item.category || item.categoryLabel || item.type || "experience";
  const categoryLabel = item.categoryLabel || item.category || item.type || "经验";
  const comments = Array.isArray(item.comments) ? item.comments.map(normalizeCommunityComment) : [];
  return {
    id: item.id || "",
    title: item.title || "未命名帖子",
    type: item.type || categoryLabel,
    category,
    area: item.region || item.assetName || item.assetId || "未关联区域",
    crop: item.crop || item.categoryLabel || item.category || "未填写",
    content: item.content || item.description || item.summary || "暂无正文",
    authorName: author.displayName || item.authorDisplayName || item.authorId || "农户",
    commentCount: Number(item.commentCount ?? comments.length ?? 0),
    favoriteCount: Number(item.favoriteCount ?? 0),
    favorited: Boolean(item.favorited),
    comments,
    createdAt: item.createdAt || "",
  };
}

function communityCategoryForScreen(screen = {}) {
  const id = screen.id || "";
  if (id.includes("disease")) return "disease";
  if (id.includes("irrigation")) return "irrigation";
  if (id.includes("fertilization")) return "fertilization";
  if (id.includes("greenhouse")) return "greenhouse";
  if (id.includes("device")) return "device";
  return "";
}

function normalizeSupplyRow(item) {
  const statusMap = {
    pending: "待审核",
    approved: "展示中",
    rejected: "已驳回",
  };
  const status = item.auditStatus || item.status || "draft";
  return {
    id: item.id || "",
    cells: [
      item.title || "未命名供需",
      item.typeLabel || item.type || "供需",
      item.quantityText || "未填写",
      item.region || item.assetId || "未填写",
      statusMap[status] || status || "草稿",
    ],
  };
}

function normalizeSupplyPublishAssetOption(asset = {}) {
  const typeLabel = asset.type === "plot" ? "地块" : "大棚";
  const crop = [asset.crop, asset.growthStage].filter(Boolean).join(" / ");
  return {
    id: asset.id || asset.backendId || "",
    name: asset.name || asset.id || "未命名资产",
    region: asset.name || asset.region || asset.id || "",
    label: [asset.name || asset.id || "未命名资产", crop || typeLabel].filter(Boolean).join(" · "),
  };
}

function normalizeSupplyHallAssetOption(asset = {}) {
  return normalizeSupplyPublishAssetOption(asset);
}

function normalizeCommunityAssetOption(asset = {}) {
  return normalizeSupplyPublishAssetOption(asset);
}

function supplyAuditLabel(status) {
  return ({
    draft: "草稿",
    pending: "审核中",
    approved: "已通过",
    rejected: "已驳回",
  })[status] || status || "待审核";
}

function supplyAuditNote(status) {
  return ({
    draft: "未提交",
    pending: "等待农场管理员处理",
    approved: "可对外展示",
    rejected: "需修改后重提",
  })[status] || "等待处理";
}

function buildSupplyHallStatusCards(items = []) {
  const countByStatus = items.reduce((acc, item) => {
    const status = item.auditStatus || item.status || "draft";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  return [
    { key: "active", label: "发布中", value: countByStatus.approved ?? 0, note: "正在对外展示" },
    { key: "pending", label: "待审核", value: countByStatus.pending ?? 0, note: "等待管理员处理" },
    { key: "approved", label: "已通过", value: countByStatus.approved ?? 0, note: "可公开联系" },
    { key: "rejected", label: "已驳回", value: countByStatus.rejected ?? 0, note: "需修改后重提" },
  ];
}

function buildSupplyPublishSummary(items = [], stats = {}) {
  const countByStatus = items.reduce((acc, item) => {
    const status = item.auditStatus || item.status || "draft";
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {});
  const latest = items[0] || null;

  return {
    statusCards: [
      { key: "draft", label: "草稿", value: countByStatus.draft || 0, note: "未提交" },
      { key: "pending", label: "审核中", value: stats?.pending ?? countByStatus.pending ?? 0, note: "等待农场管理员处理" },
      { key: "approved", label: "已通过", value: stats?.approved ?? countByStatus.approved ?? 0, note: "可对外展示" },
      { key: "rejected", label: "已驳回", value: stats?.rejected ?? countByStatus.rejected ?? 0, note: "需修改后重提" },
    ],
    latest: latest ? {
      title: latest.title || "未命名供需",
      status: supplyAuditLabel(latest.auditStatus || latest.status),
      feedback: supplyAuditNote(latest.auditStatus || latest.status),
    } : null,
  };
}

function CommunityScreen({ screen, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [postScope, setPostScope] = useState("all");
  const [searchText, setSearchText] = useState("");
  const [posts, setPosts] = useState([]);
  const [collectedIds, setCollectedIds] = useState(new Set());
  const [listError, setListError] = useState("");
  const [communityStats, setCommunityStats] = useState(buildCommunityStats());

  const forumTabs = [
    { label: "全部" },
    { label: "病虫害经验" },
    { label: "灌溉经验" },
    { label: "施肥经验" },
    { label: "大棚管理" },
    { label: "设备使用" },
  ];

  function scopeParams(scope = postScope) {
    return scope === "mine" ? { mine: true } : {};
  }

  async function loadPosts(params = {}) {
    setLoading(true);
    setListError("");
    try {
      const response = await listCommunityPosts({ page: 1, pageSize: 20, ...params });
      const nextPosts = pageItems(response).map(normalizeCommunityPost);
      setPosts(nextPosts.length ? nextPosts : []);
      setCollectedIds(new Set(nextPosts.filter((post) => post.favorited).map((post) => post.id)));
      setCommunityStats(buildCommunityStats(apiItem(response)?.stats));
    } catch (error) {
      setListError(apiErrorMessage(error, "社区列表加载失败"));
      toast(apiErrorMessage(error, "社区列表加载失败"), { type: "warn" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPosts(); }, []);

  function handleSearch() {
    if (!searchText.trim()) { toast("请输入搜索关键词", { type: "warn" }); return; }
    loadPosts({ ...scopeParams(), keyword: searchText.trim() });
  }

  async function handleCollect(postId) {
    const nextCollected = !collectedIds.has(postId);
    try {
      if (nextCollected) await favoriteCommunityPost(postId);
      else await unfavoriteCommunityPost(postId);
      setCollectedIds((prev) => {
        const next = new Set(prev);
        if (nextCollected) next.add(postId);
        else next.delete(postId);
        return next;
      });
      toast(nextCollected ? "已收藏到后端" : "已取消后端收藏", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "收藏操作失败"), { type: "warn" });
    }
  }

  if (loading) {
    return (
      <div className="screen-canvas community-layout community-forum-layout">
        <section className="forum-page-header"><div><h2>加载中...</h2></div></section>
        <Loading type="stat" count={4} />
        <Loading type="table" rows={3} cols={3} />
      </div>
    );
  }

  const visiblePosts = postScope === "favorites" ? posts.filter((post) => collectedIds.has(post.id)) : posts;
  const panelTitle = postScope === "mine" ? "我的发布" : postScope === "favorites" ? "我的收藏" : "热门经验";
  const emptyDescription = postScope === "mine"
    ? "你还没有发布过帖子，或后端没有返回我的发布数据。"
    : postScope === "favorites"
      ? "你还没有收藏帖子，先点击帖子上的 ⭐️ 收藏。"
      : "后端当前没有返回帖子数据。";
  const categoryEntries = forumTabs.slice(1).map((tab) => {
    const label = tab.label.replace("经验", "");
    const category = COMMUNITY_CATEGORY_MAP[label] || COMMUNITY_CATEGORY_MAP[tab.label] || "other";
    const count = posts.filter((post) => {
      const metaText = post.meta.join(" ");
      return metaText.includes(tab.label) || metaText.includes(label) || metaText.includes(category);
    }).length;
    return { ...tab, label, category, count };
  });

  return (
    <div className="screen-canvas community-layout community-forum-layout community-experience-shell">
      <main className="community-experience-main">
        <section className="forum-page-header community-hero-header community-experience-hero">
          <div>
            <p className="eyebrow">农户社区</p>
            <h2>{panelTitle}</h2>
            <p>农人智慧，共同分享</p>
          </div>
          <div className="community-hero-kpis" aria-label="社区概览">
            <span>种植经验</span>
            <span>问题求助</span>
            <span>智能问答</span>
          </div>
        </section>

        <div className="forum-search-row community-experience-search" role="search">
          <input
            aria-label="搜索经验"
            placeholder="搜索草莓叶斑病、小麦灌溉、大棚湿度、设备离线等经验"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          />
          <button type="button" onClick={handleSearch}>搜索</button>
        </div>

        <div className="forum-tabs community-experience-categories" aria-label="经验分类">
          {forumTabs.map((tab, index) => (
            <button
              className={index === activeTab ? "active" : ""}
              key={tab.label}
              type="button"
              onClick={() => {
                setActiveTab(index);
                const category = index === 0 ? undefined : COMMUNITY_CATEGORY_MAP[tab.label.replace("经验", "")] || COMMUNITY_CATEGORY_MAP[tab.label];
                loadPosts(category ? { ...scopeParams(), category } : scopeParams());
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="community-scope-tabs" aria-label="帖子范围">
          <button className={postScope === "all" ? "active" : ""} type="button" onClick={() => { setPostScope("all"); setActiveTab(0); loadPosts(); }}>最新</button>
          <button className={postScope === "mine" ? "active" : ""} type="button" onClick={() => { setPostScope("mine"); setActiveTab(0); loadPosts({ mine: true }); }}>我的发布</button>
          <button className={postScope === "favorites" ? "active" : ""} type="button" onClick={() => { setPostScope("favorites"); setActiveTab(0); }}>已收藏 ({collectedIds.size})</button>
        </div>

        <StatStrip stats={communityStats} />

        <Panel title={panelTitle} className="experience-panel community-experience-panel">
          {listError && <div className="error-message">{listError}</div>}
          <div className="post-list community-experience-grid">
            {visiblePosts.length === 0 ? <EmptyState title="暂无社区内容" description={emptyDescription} /> : visiblePosts.map((post) => (
              <article className="post-card community-experience-card" key={post.id}>
                <div className="post-thumb community-experience-thumb">
                  <img src={COMMUNITY_CATEGORY_IMAGE[post.category] || imgOther} alt={post.title} />
                </div>
                <div className="community-experience-card-body">
                  <h4>{post.title}</h4>
                  <p>{post.desc}</p>
                  <div className="post-meta">
                    {post.meta.map((item) => <span key={item}>{item}</span>)}
                  </div>
                </div>
                <div className="post-card-actions">
                  <button className={post.primary ? "" : "ghost-button"} type="button" onClick={() => onNavigate?.("community-detail", { postId: post.id })}>查看详情</button>
                  <button className="ghost-button small" type="button" onClick={() => handleCollect(post.id)} title={collectedIds.has(post.id) ? "取消收藏" : "收藏"}>{collectedIds.has(post.id) ? "⭐️ 已收藏" : "⭐️ 收藏"}</button>
                </div>
              </article>
            ))}
          </div>
        </Panel>
      </main>

      <aside className="community-experience-sidebar" aria-label="社区操作">
        <Panel title="分类入口" className="topic-panel community-category-panel">
          <div className="topic-tags community-category-list">
            {categoryEntries.map((tab) => (
              <button className="community-category-entry" key={tab.label} type="button" onClick={() => onNavigate?.(`community-category-${tab.category}`)}>
                <span>{tab.label}</span>
                <strong>{tab.count} 条内容</strong>
                <small>查看{tab.label}相关经验</small>
              </button>
            ))}
          </div>
        </Panel>

        <Panel title="快捷操作" className="topic-panel community-action-panel">
          <div className="forum-actions community-sidebar-actions">
            <button type="button" onClick={() => onNavigate?.("community-publish")}>发布经验</button>
            <button type="button" onClick={() => onNavigate?.("community-help")}>我要提问</button>
            <button className="ghost-button" type="button" onClick={() => { setPostScope("favorites"); setActiveTab(0); }}>我的收藏</button>
            <button className="ghost-button" type="button" onClick={() => { setPostScope("mine"); setActiveTab(0); loadPosts({ mine: true }); }}>我的发布</button>
          </div>
        </Panel>
      </aside>
    </div>
  );
}

function CommunityCategoryScreen({ screen, onNavigate }) {
  const [activeFilters, setActiveFilters] = useState(new Set(["全部作物"]));
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState("");

  const baseCategory = communityCategoryForScreen(screen);

  async function loadCategoryPosts(filters = activeFilters) {
    setLoading(true);
    setListError("");
    const cropKeyword = ["草莓", "小麦"].find((item) => filters.has(item));
    try {
      const response = await listCommunityPosts({
        page: 1,
        pageSize: 20,
        ...(baseCategory ? { category: baseCategory } : {}),
        ...(filters.has("按热度排序") ? { sort: "hot" } : {}),
        ...(cropKeyword ? { keyword: cropKeyword } : {}),
      });
      setPosts(pageItems(response).map(normalizeCommunityPost));
    } catch (error) {
      const message = apiErrorMessage(error, "分类经验加载失败");
      setListError(message);
      toast(message, { type: "warn" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadCategoryPosts(); }, [screen.id]);

  function toggleFilter(item) {
    const nextFilters = (() => {
      if (item === "全部作物") return new Set(["全部作物"]);
      const next = new Set(activeFilters);
      next.delete("全部作物");
      if (next.has(item)) next.delete(item); else next.add(item);
      return next.size === 0 ? new Set(["全部作物"]) : next;
    })();
    setActiveFilters(nextFilters);
    loadCategoryPosts(nextFilters);
    toast(`筛选：${item}`, { type: "success" });
  }

  return (
    <div className="screen-canvas community-layout community-category-layout">
      <section className="forum-page-header">
        <div>
          <p className="eyebrow">经验交流 / 分类列表</p>
          <h2>{screen.title}</h2>
          <p>{screen.subtitle}</p>
        </div>
        <div className="forum-actions">
          <button className="ghost-button" type="button" onClick={() => onNavigate?.("community")}>返回经验交流</button>
        </div>
      </section>
      <Panel title={`${screen.title}筛选`} className="category-panel">
        <div className="category-filter-row">
          {["全部作物", "草莓", "小麦", "有图片", "按热度排序"].map((item) => (
            <button
              key={item}
              type="button"
              className={activeFilters.has(item) ? "active" : ""}
              onClick={() => toggleFilter(item)}
            >
              {item}
            </button>
          ))}
        </div>
      </Panel>
      <Panel title="经验列表" className="experience-panel">
        {listError && <div className="error-message">{listError}</div>}
        <div className="post-list">
          {loading ? <Loading type="card" /> : posts.length === 0 ? (
            <EmptyState title="暂无分类经验" description="后端当前没有返回该分类的帖子。" />
          ) : posts.map((post, index) => (
            <article className="post-card" key={post.id}>
              <div className="post-thumb">
                <img src={COMMUNITY_CATEGORY_IMAGE[post.category] || imgOther} alt={post.title} />
              </div>
              <div>
                <h4>{post.title}</h4>
                <p>{post.desc}</p>
                <div className="post-meta">{post.meta.map((item) => <span key={item}>{item}</span>)}</div>
              </div>
              <button className={index === 0 ? "" : "ghost-button"} type="button" onClick={() => onNavigate?.("community-detail", { postId: post.id })}>查看详情</button>
            </article>
          ))}
        </div>
      </Panel>
    </div>
  );
}

function CommunityPublishScreen({ screen, onNavigate }) {
  const [form, setForm] = useState({ type: "病虫害处理", area: "", assetId: "", crop: "草莓", stage: "结果期", title: "", content: "", public: "公开" });
  const [uploaded, setUploaded] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [communityAssets, setCommunityAssets] = useState([]);

  useEffect(() => {
    let ignored = false;
    async function loadCommunityAssets() {
      try {
        const response = await listAssets({ page: 1, pageSize: 200 });
        const assetOptions = pageItems(response).map(normalizeCommunityAssetOption).filter((asset) => asset.id);
        if (!ignored) {
          setCommunityAssets(assetOptions);
          if (assetOptions.length > 0) {
            setForm((previous) => {
              if (previous.assetId) return previous;
              const selectedAsset = assetOptions[0];
              return { ...previous, area: selectedAsset.region, assetId: selectedAsset.id };
            });
          }
        }
      } catch (error) {
        if (!ignored) toast(apiErrorMessage(error, "关联资产加载失败"), { type: "warn" });
      }
    }
    loadCommunityAssets();
    return () => { ignored = true; };
  }, []);

  async function handlePublish() {
    if (!form.title.trim()) { toast("请输入经验标题", { type: "warn" }); return; }
    if (!form.content.trim()) { toast("请输入经验内容", { type: "warn" }); return; }
    const selectedAsset = communityAssets.find((asset) => asset.id === form.assetId) || null;
    if (!selectedAsset) { toast("请选择关联资产", { type: "warn" }); return; }
    setPublishing(true);
    try {
      const response = await createCommunityPost({
        type: "experience",
        category: COMMUNITY_CATEGORY_MAP[form.type] || "disease",
        title: form.title.trim(),
        summary: `${form.crop} / ${form.stage} / ${selectedAsset.region}`,
        content: form.content.trim(),
        assetId: selectedAsset.id,
      });
      const created = apiItem(response);
      toast("经验已提交后端", { type: "success" });
      onNavigate?.("community-detail", { postId: created?.id });
    } catch (error) {
      toast(apiErrorMessage(error, "经验发布失败"), { type: "warn" });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="screen-canvas community-layout community-form-layout">
      <section className="forum-page-header">
        <div>
          <p className="eyebrow">经验交流 / 发布经验</p>
          <h2>{screen.title}</h2>
          <p>{screen.subtitle}</p>
        </div>
        <div className="forum-actions">
          <button className="ghost-button" type="button" onClick={() => onNavigate?.("community")}>返回经验交流</button>
        </div>
      </section>
      <Panel title="经验发布" className="community-form-panel">
        <div className="form-grid interactive">
          <label><span>经验类型</span>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {["病虫害处理", "灌溉经验", "施肥经验", "大棚管理", "设备使用"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label><span>关联区域</span>
            <select
              value={form.assetId}
              onChange={(e) => {
                const selectedAsset = communityAssets.find((asset) => asset.id === e.target.value);
                setForm((p) => ({
                  ...p,
                  area: selectedAsset?.region || "",
                  assetId: selectedAsset?.id || "",
                }));
              }}
            >
              <option value="">请选择后端资产</option>
              {communityAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.label}</option>)}
            </select>
          </label>
          <label><span>作物类型</span><input value={form.crop} onChange={(e) => setForm((p) => ({ ...p, crop: e.target.value }))} /></label>
          <label><span>生长阶段</span><input value={form.stage} onChange={(e) => setForm((p) => ({ ...p, stage: e.target.value }))} /></label>
          <label><span>标题</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="请输入经验标题" /></label>
          <label><span>是否公开</span>
            <select value={form.public} onChange={(e) => setForm((p) => ({ ...p, public: e.target.value }))}>
              {["公开", "仅好友可见", "草稿"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
        </div>
        <textarea
          className="text-area-preview"
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          placeholder="经验内容：描述发现问题、处理过程、使用方法和最终效果。"
          rows={5}
        />
        <div className={`upload-box ${uploaded ? "has-file" : ""}`} onClick={() => { setUploaded(true); toast("图片已上传", { type: "success" }); }} style={{ cursor: "pointer" }}>
          {uploaded ? <strong>已上传图片 ✓</strong> : <><strong>上传图片</strong><span>可上传处理前、处理中、处理后的对比图片。</span></>}
        </div>
        <div className="form-actions">
          <button type="button" onClick={handlePublish} disabled={publishing}>{publishing ? "提交中..." : "发布并查看详情"}</button>
        </div>
      </Panel>
    </div>
  );
}

function CommunityHelpScreen({ screen, onNavigate }) {
  const [form, setForm] = useState({ type: "病虫害", area: "", assetId: "", crop: "小麦", title: "", content: "" });
  const [uploaded, setUploaded] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [communityAssets, setCommunityAssets] = useState([]);

  useEffect(() => {
    let ignored = false;
    async function loadCommunityAssets() {
      try {
        const response = await listAssets({ page: 1, pageSize: 200 });
        const assetOptions = pageItems(response).map(normalizeCommunityAssetOption).filter((asset) => asset.id);
        if (!ignored) {
          setCommunityAssets(assetOptions);
          if (assetOptions.length > 0) {
            setForm((previous) => {
              if (previous.assetId) return previous;
              const selectedAsset = assetOptions[0];
              return { ...previous, area: selectedAsset.region, assetId: selectedAsset.id };
            });
          }
        }
      } catch (error) {
        if (!ignored) toast(apiErrorMessage(error, "关联资产加载失败"), { type: "warn" });
      }
    }
    loadCommunityAssets();
    return () => { ignored = true; };
  }, []);

  async function handlePublish() {
    if (!form.title.trim()) { toast("请输入求助标题", { type: "warn" }); return; }
    if (!form.content.trim()) { toast("请输入问题描述", { type: "warn" }); return; }
    const selectedAsset = communityAssets.find((asset) => asset.id === form.assetId) || null;
    if (!selectedAsset) { toast("请选择关联资产", { type: "warn" }); return; }
    setPublishing(true);
    try {
      const response = await createCommunityPost({
        type: "help",
        category: COMMUNITY_CATEGORY_MAP[form.type] || "disease",
        title: form.title.trim(),
        summary: `${form.crop} / ${selectedAsset.region}`,
        content: form.content.trim(),
        assetId: selectedAsset.id,
      });
      const created = apiItem(response);
      toast("求助已提交后端", { type: "success" });
      onNavigate?.("community-detail", { postId: created?.id });
    } catch (error) {
      toast(apiErrorMessage(error, "求助发布失败"), { type: "warn" });
    } finally {
      setPublishing(false);
    }
  }

  return (
    <div className="screen-canvas community-layout community-form-layout">
      <section className="forum-page-header">
        <div>
          <p className="eyebrow">经验交流 / 我要提问</p>
          <h2>{screen.title}</h2>
          <p>{screen.subtitle}</p>
        </div>
        <div className="forum-actions">
          <button className="ghost-button" type="button" onClick={() => onNavigate?.("community")}>返回经验交流</button>
        </div>
      </section>
      <Panel title="求助发布" className="community-form-panel">
        <div className="form-grid interactive">
          <label><span>问题类型</span>
            <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
              {["病虫害", "灌溉", "施肥", "设备", "大棚管理", "其他"].map((o) => <option key={o}>{o}</option>)}
            </select>
          </label>
          <label><span>关联区域</span>
            <select
              value={form.assetId}
              onChange={(e) => {
                const selectedAsset = communityAssets.find((asset) => asset.id === e.target.value);
                setForm((p) => ({
                  ...p,
                  area: selectedAsset?.region || "",
                  assetId: selectedAsset?.id || "",
                }));
              }}
            >
              <option value="">请选择后端资产</option>
              {communityAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.label}</option>)}
            </select>
          </label>
          <label><span>作物</span><input value={form.crop} onChange={(e) => setForm((p) => ({ ...p, crop: e.target.value }))} /></label>
          <label><span>标题</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="请输入求助标题" /></label>
        </div>
        <textarea
          className="text-area-preview"
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          placeholder="问题描述：请描述当前现象、已经做过的处理、希望获得什么建议。"
          rows={5}
        />
        <div className={`upload-box ${uploaded ? "has-file" : ""}`} onClick={() => { setUploaded(true); toast("图片已上传", { type: "success" }); }} style={{ cursor: "pointer" }}>
          {uploaded ? <strong>已上传图片 ✓</strong> : <><strong>上传问题图片</strong><span>可上传叶片、果实、设备或地块现场照片。</span></>}
        </div>
        <div className="form-actions">
          <button type="button" onClick={() => onNavigate?.("expert-context-chat", buildCommunityChatContext({ source: "help-form", form, uploaded }))}>同步问大模型</button>
          <button className="ghost-button" type="button" onClick={handlePublish} disabled={publishing}>{publishing ? "提交中..." : "发布到交流区"}</button>
        </div>
      </Panel>
    </div>
  );
}

function CommunityDetailScreen({ screen, postId, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [collected, setCollected] = useState(false);
  const [detailPost, setDetailPost] = useState(null);
  const [detailError, setDetailError] = useState("");
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState("");

  useEffect(() => {
    let ignored = false;

    async function loadCommunityPostDetail() {
      if (!postId) {
        setDetailError("请选择要查看的社区帖子");
        setDetailPost(null);
        setComments([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setDetailError("");
      try {
        const response = await getCommunityPost(postId);
        const rawPost = apiItem(response);
        const nextPost = normalizeCommunityDetail(rawPost);
        if (!ignored) {
          setDetailPost(nextPost);
          setCollected(nextPost.favorited);
          setComments(nextPost.comments);
        }
      } catch (error) {
        if (!ignored) {
          const message = apiErrorMessage(error, "社区详情加载失败");
          setDetailError(message);
          setDetailPost(null);
          setComments([]);
          toast(message, { type: "warn" });
        }
      } finally {
        if (!ignored) setLoading(false);
      }
    }

    loadCommunityPostDetail();
    return () => { ignored = true; };
  }, [postId]);

  async function handleCollect() {
    const targetPostId = detailPost?.id || postId;
    if (!targetPostId) { toast("缺少帖子 ID，无法收藏", { type: "warn" }); return; }
    try {
      if (collected) await unfavoriteCommunityPost(targetPostId);
      else await favoriteCommunityPost(targetPostId);
      setCollected((value) => !value);
      toast(collected ? "已取消后端收藏" : "已收藏到后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "收藏操作失败"), { type: "warn" });
    }
  }
  function handleAdopt() { toast("建议已采纳，感谢反馈", { type: "success" }); }

  async function addComment() {
    if (!commentText.trim()) { toast("请输入评论内容", { type: "warn" }); return; }
    const targetPostId = detailPost?.id || postId;
    if (!targetPostId) { toast("缺少帖子 ID，无法评论", { type: "warn" }); return; }
    try {
      const response = await commentCommunityPost(targetPostId, { content: commentText.trim() });
      const createdComment = normalizeCommunityComment(apiItem(response) || { content: commentText.trim(), author: { displayName: "我" } });
      setComments((prev) => [createdComment, ...prev]);
      setDetailPost((prev) => prev ? { ...prev, commentCount: prev.commentCount + 1 } : prev);
      setCommentText("");
      toast("评论已提交后端", { type: "success" });
    } catch (error) {
      toast(apiErrorMessage(error, "评论发布失败"), { type: "warn" });
    }
  }

  if (loading) return <div className="screen-canvas community-layout community-detail-layout"><section className="forum-page-header"><div><h2>加载中...</h2></div></section><Loading type="card" /></div>;

  return (
    <div className="screen-canvas community-layout community-detail-layout">
      <section className="forum-page-header">
        <div>
          <p className="eyebrow">经验交流 / 详情</p>
          <h2>{detailPost?.title || screen.title}</h2>
          <p>{detailPost?.content || screen.subtitle}</p>
        </div>
        <div className="forum-actions">
          <button className="ghost-button" type="button" onClick={() => onNavigate?.("community")}>返回经验交流</button>
          <button className="ghost-button" type="button" onClick={() => toast(`发布人：${detailPost?.authorName || "农户"}`, { type: "success" })}>查看发布人</button>
          <button type="button" onClick={() => detailPost && onNavigate?.("expert-context-chat", buildCommunityChatContext({ source: "experience-detail", post: detailPost }))}>问大模型</button>
        </div>
      </section>
      <Panel title="经验详情" className="experience-detail-card">
        {detailError && <div className="error-message">{detailError}</div>}
        {!detailPost ? (
          <EmptyState title="暂无帖子详情" description="请选择一个后端社区帖子后查看详情。" />
        ) : <div className="detail-body-grid">
          <aside className="detail-media-column">
            <div className="detail-photo">
              <img src={COMMUNITY_CATEGORY_IMAGE[detailPost.category] || imgOther} alt={detailPost.title || detailPost.category} />
            </div>
            <div className="detail-info-grid">
              {[
                ["作物", detailPost.crop],
                ["区域", detailPost.area],
                ["经验类型", detailPost.type],
                ["发布人", detailPost.authorName],
                ["收藏数", String(detailPost.favoriteCount)],
                ["评论数", String(detailPost.commentCount)]
              ].map(([label, value]) => (
                <div key={label}><span>{label}</span><strong>{value}</strong></div>
              ))}
            </div>
          </aside>

          <div className="detail-main-column">
            <section className="detail-section-card">
              <h4>正文内容</h4>
              <p>{detailPost.content}</p>
            </section>

            <section className="detail-section-card">
              <h4>互动数据</h4>
              <div className="compact-post-list">
                <article><strong>收藏</strong><span>{detailPost.favoriteCount}</span></article>
                <article><strong>评论</strong><span>{detailPost.commentCount}</span></article>
              </div>
            </section>

            <section className="detail-section-card detail-comment-card">
              <h4>评论区</h4>
              <div className="comment-horizontal-list">
                {comments.map((c, i) => (
                  <article key={i} className="comment-chip"><strong>{c.author}</strong><p>{c.text}</p></article>
                ))}
              </div>
              <div className="comment-input-row">
                <input
                  type="text"
                  placeholder="写下你的评论..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") addComment(); }}
                />
                <button type="button" onClick={addComment}>发布</button>
              </div>
            </section>
          </div>
        </div>}

              <div className="detail-action-bar">
          <button type="button" onClick={handleCollect}>{collected ? "已收藏 ✓" : "收藏"}</button>
          <button type="button" onClick={addComment}>评论</button>
          <button type="button" onClick={handleAdopt}>采纳建议</button>
        </div>
      </Panel>
    </div>
  );
}

function SupplyScreen({ screen, onNavigate }) {
  const [loading, setLoading] = useState(true);
  const [supplyScope, setSupplyScope] = useState("all");
  const [supplySearch, setSupplySearch] = useState({ keyword: "", type: "", assetId: "" });
  const [supplyAssets, setSupplyAssets] = useState([]);
  const [rows, setRows] = useState([]);
  const [listError, setListError] = useState("");
  const [supplyStatusCards, setSupplyStatusCards] = useState(buildSupplyHallStatusCards([]));
  const [detailLoading, setDetailLoading] = useState(false);
  const [supplyDetail, setSupplyDetail] = useState(null);

  const supplyFilters = [
    { key: "all", label: "全部", params: { mine: true } },
    { key: "supply", label: "供给", params: { mine: true, type: "supply" } },
    { key: "demand", label: "需求", params: { mine: true, type: "demand" } },
    { key: "help", label: "求助", params: { mine: true, type: "help" } },
    { key: "pending", label: "待审核", params: { mine: true, status: "pending" } },
    { key: "approved", label: "已通过", params: { mine: true, status: "approved" } },
    { key: "mine", label: "我的发布", params: { mine: true } },
  ];

  async function loadSupplyDemands(params = {}) {
    setLoading(true);
    setListError("");
    try {
      const { status: filterStatus, auditStatus: filterAudit, ...queryParams } = params;
      const searchParams = {
        keyword: supplySearch.keyword.trim(),
        type: supplySearch.type,
        assetId: supplySearch.assetId,
      };
      const requestParams = Object.fromEntries(
        Object.entries({ ...searchParams, ...queryParams }).filter(([, value]) => value !== "")
      );
      const response = await listSupplyDemands({ page: 1, pageSize: 20, ...requestParams });
      const allItems = pageItems(response);
      const filterValue = filterStatus || filterAudit;
      const items = allItems.filter((item) => !filterValue || (item.auditStatus || item.status) === filterValue);
      const nextRows = items.map(normalizeSupplyRow);
      setRows(nextRows.length ? nextRows : []);
      setSupplyStatusCards(buildSupplyHallStatusCards(allItems));
    } catch (error) {
      setListError(apiErrorMessage(error, "供需列表加载失败"));
      toast(apiErrorMessage(error, "供需列表加载失败"), { type: "warn" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let ignored = false;
    async function loadSupplyAssets() {
      try {
        const assetResponse = await listAssets({ page: 1, pageSize: 200 });
        const assetOptions = pageItems(assetResponse).map(normalizeSupplyHallAssetOption).filter((asset) => asset.id);
        if (!ignored) setSupplyAssets(assetOptions);
      } catch (error) {
        if (!ignored) toast(apiErrorMessage(error, "供需区域资产加载失败"), { type: "warn" });
      }
    }
    loadSupplyAssets();
    loadSupplyDemands({ mine: true });
    return () => { ignored = true; };
  }, []);

  async function handleSupplyDetail(itemId) {
    setDetailLoading(true);
    setSupplyDetail(null);
    try {
      const response = await getSupplyDemand(itemId);
      const raw = apiItem(response);
      setSupplyDetail({
        title: raw?.title || "未命名",
        type: raw?.type || "--",
        quantity: raw?.quantityText || "--",
        region: raw?.region || "--",
        contact: raw?.contact || "--",
        description: raw?.description || "暂无详细说明",
        status: raw?.auditStatus || raw?.status || "--",
      });
    } catch (error) {
      toast(apiErrorMessage(error, "详情加载失败"), { type: "warn" });
    } finally {
      setDetailLoading(false);
    }
  }

  function handleSupplyFilter(filter) {
    if (!filter) return;
    setSupplyScope(filter.key);
    loadSupplyDemands(filter.params);
  }

  const activeSupplyFilter = supplyFilters.find((filter) => filter.key === supplyScope) ?? supplyFilters[0];

  if (loading) {
    return (
      <div className="screen-canvas supply-layout supply-hall-layout">
        <section className="supply-page-header"><div><h2>加载中...</h2></div></section>
        <Loading type="stat" count={3} />
        <Loading type="table" rows={4} cols={5} />
      </div>
    );
  }

  return (
    <div className="screen-canvas supply-layout supply-hall-layout">
      <section className="supply-page-header supply-hero-header">
        <div>
          <p className="eyebrow">农户供需</p>
          <h2>供需发布</h2>
          <div className="supply-hero-kpis" aria-label="供需概览">
            <span>供给上架</span>
            <span>需求匹配</span>
            <span>审核流转</span>
          </div>
        </div>
        <div className="supply-page-actions">
          <button type="button" onClick={() => onNavigate?.("supply-publish")}>发布供需</button>
          <button className="ghost-button" type="button" onClick={() => handleSupplyFilter(supplyFilters.find((filter) => filter.key === "mine"))}>我的发布</button>
        </div>
      </section>

      <div className="supply-list-tabs" aria-label="供需状态筛选">
        {supplyFilters.map((filter) => (
          <button
            className={supplyScope === filter.key ? "active" : ""}
            key={filter.key}
            type="button"
            onClick={() => {
              setSupplyScope(filter.key);
              loadSupplyDemands(filter.params);
            }}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <section className="supply-status-row">
        {supplyStatusCards.map((item) => (
          <article className="supply-status-card" key={item.key}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </section>

      <Panel title="供需列表" className="supply-table">
        {listError && <div className="error-message">{listError}</div>}
        <table className="data-table supply-data-table">
          <thead>
            <tr>{["标题", "类型", "数量 / 规格", "区域", "状态", "操作"].map((column) => <th key={column}>{column}</th>)}</tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={6}><EmptyState title="暂无供需数据" description="后端当前没有返回供需列表。" /></td></tr>
            ) : rows.map((row) => (
              <tr key={row.id}>
                {row.cells.map((cell, index) => (
                  <td key={`${row.id}-${index}`}>
                    {index === 4 ? <span className="supply-status-tag">{cell}</span> : cell}
                  </td>
                ))}
                <td>
                  <button className="ghost-button small" type="button" onClick={() => handleSupplyDetail(row.id)}>查看详情</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Panel>

      {/* ── 详情弹窗 ── */}
      {(supplyDetail || detailLoading) && (
        <div className="supply-detail-overlay" onClick={() => { setSupplyDetail(null); }}>
          <div className="supply-detail-modal" onClick={(e) => e.stopPropagation()}>
            {detailLoading ? (
              <Loading type="card" />
            ) : supplyDetail ? (
              <>
                <h3>{supplyDetail.title}</h3>
                <div className="supply-detail-grid">
                  <div><span>类型</span><strong>{supplyDetail.type}</strong></div>
                  <div><span>数量 / 规格</span><strong>{supplyDetail.quantity}</strong></div>
                  <div><span>区域</span><strong>{supplyDetail.region}</strong></div>
                  <div><span>联系方式</span><strong>{supplyDetail.contact}</strong></div>
                  <div><span>状态</span><strong className="supply-status-tag">{supplyDetail.status}</strong></div>
                </div>
                <div className="supply-detail-desc">
                  <span>详细说明</span>
                  <p>{supplyDetail.description}</p>
                </div>
                <button className="ghost-button" type="button" onClick={() => setSupplyDetail(null)}>关闭</button>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

function SupplyPublishScreen({ screen, onNavigate }) {
  const [form, setForm] = useState({
    type: "supply",
    title: "",
    description: "",
    quantityText: "",
    region: "",
    contactName: "",
    contactPhone: "",
    assetId: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [supplyAssets, setSupplyAssets] = useState([]);
  const [supplySummary, setSupplySummary] = useState(buildSupplyPublishSummary());
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState("");

  async function loadSupplyPublishSummary() {
    setSummaryLoading(true);
    setSummaryError("");
    try {
      const response = await listSupplyDemands({ page: 1, pageSize: 20, mine: true });
      setSupplySummary(buildSupplyPublishSummary(pageItems(response), apiItem(response)?.stats));
    } catch (error) {
      setSummaryError(apiErrorMessage(error, "供需发布记录加载失败"));
    } finally {
      setSummaryLoading(false);
    }
  }

  useEffect(() => {
    let ignored = false;
    async function load() {
      setSummaryLoading(true);
      setSummaryError("");
      try {
        const [response, assetResponse] = await Promise.all([
          listSupplyDemands({ page: 1, pageSize: 20, mine: true }),
          listAssets({ page: 1, pageSize: 200 }),
        ]);
        const assetOptions = pageItems(assetResponse).map(normalizeSupplyPublishAssetOption).filter((asset) => asset.id);
        if (!ignored) {
          setSupplySummary(buildSupplyPublishSummary(pageItems(response), apiItem(response)?.stats));
          setSupplyAssets(assetOptions);
          if (assetOptions.length > 0) {
            setForm((previous) => {
              if (previous.assetId) return previous;
              const selectedAsset = assetOptions[0];
              return { ...previous, region: selectedAsset.region, assetId: selectedAsset.id };
            });
          }
        }
      } catch (error) {
        if (!ignored) setSummaryError(apiErrorMessage(error, "供需发布记录加载失败"));
      } finally {
        if (!ignored) setSummaryLoading(false);
      }
    }
    load();
    return () => { ignored = true; };
  }, []);

  async function handleSubmit() {
    if (!form.title.trim()) { toast("请输入供需标题", { type: "warn" }); return; }
    if (!form.description.trim()) { toast("请输入供需说明", { type: "warn" }); return; }
    if (!form.quantityText.trim()) { toast("请输入数量或规格", { type: "warn" }); return; }
    if (!form.contactPhone.trim()) { toast("请输入联系电话", { type: "warn" }); return; }
    const selectedAsset = supplyAssets.find((asset) => asset.id === form.assetId) || null;
    if (!selectedAsset) { toast("请选择关联资产", { type: "warn" }); return; }
    setSubmitting(true);
    try {
      await createSupplyDemand({
        type: form.type,
        title: form.title.trim(),
        description: form.description.trim(),
        quantityText: form.quantityText.trim(),
        region: (selectedAsset?.region || form.region).trim(),
        contact: [form.contactName.trim(), form.contactPhone.trim()].filter(Boolean).join(" / "),
        assetId: selectedAsset.id,
      });
      toast("供需已提交后端审核", { type: "success" });
      await loadSupplyPublishSummary();
      onNavigate?.("supply-demand");
    } catch (error) {
      toast(apiErrorMessage(error, "供需提交失败"), { type: "warn" });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="screen-canvas supply-layout supply-publish-page">
      <section className="supply-page-header">
        <div>
          <p className="eyebrow">农户 / 供需发布</p>
          <h2>{screen.title}</h2>
          <p>{screen.subtitle}</p>
        </div>
        <div className="supply-page-actions">
          <button className="ghost-button" type="button" onClick={() => onNavigate?.("supply-demand")}>返回供需大厅</button>
          <button type="button" onClick={handleSubmit} disabled={submitting}>{submitting ? "提交中..." : "提交审核"}</button>
        </div>
      </section>

      <section className="supply-status-row">
        {supplySummary.statusCards.map((item) => (
          <article className="supply-status-card" key={item.key}>
            <span>{item.label}</span>
            <strong>{summaryLoading ? "..." : item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </section>

      <section className="supply-publish-layout">
        <Panel title="发布表单" className="supply-form-panel">
          <div className="form-grid interactive">
            <label><span>发布类型</span>
              <select value={form.type} onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}>
                <option value="supply">供给</option>
                <option value="demand">需求</option>
                <option value="help">求助</option>
              </select>
            </label>
            <label><span>标题</span><input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="例如：出售草莓 / 求购小麦种苗" /></label>
            <label><span>关联区域</span>
              <select
                value={form.assetId}
                onChange={(e) => {
                  const selectedAsset = supplyAssets.find((asset) => asset.id === e.target.value);
                  setForm((p) => ({
                    ...p,
                    region: selectedAsset?.region || "",
                    assetId: selectedAsset?.id || "",
                  }));
                }}
              >
                <option value="">请选择后端资产</option>
                {supplyAssets.map((asset) => <option key={asset.id} value={asset.id}>{asset.label}</option>)}
              </select>
            </label>
            <label><span>资产 ID</span><input value={form.assetId} readOnly placeholder="从后端资产列表选择" /></label>
            <label><span>数量 / 规格</span><input value={form.quantityText} onChange={(e) => setForm((p) => ({ ...p, quantityText: e.target.value }))} placeholder="例如：200kg / 500 株" /></label>
            <label><span>联系人</span><input value={form.contactName} onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))} /></label>
            <label><span>联系电话</span><input value={form.contactPhone} onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))} /></label>
          </div>
          <textarea
            className="text-area-preview"
            value={form.description}
            onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            placeholder="发布内容：请填写供需说明、规格要求、交付时间、地点和其他补充信息。"
            rows={5}
          />
          <div className="upload-box">
            <strong>上传图片或凭证</strong>
            <span>现场照片、需求说明、报价单、采购单或货物图片</span>
          </div>
          <div className="supply-tag-row">
            {["需要管理员审核", "审核通过后公开", "支持再次修改后重提"].map((item) => <span key={item}>{item}</span>)}
          </div>
          <div className="form-actions">
            <button type="button" onClick={handleSubmit} disabled={submitting}>{submitting ? "提交中..." : "提交审核"}</button>
            <button className="ghost-button" type="button" onClick={() => onNavigate?.("supply-demand")}>返回供需大厅</button>
          </div>
        </Panel>

        <Panel title="审核流程说明" className="audit-panel">
          <div className="audit-flow">
            {[
              ["农户提交", "填写供需信息、上传图片和联系方式。"],
              ["进入审核", "系统把内容推送给农场管理员审核。"],
              ["审核通过 / 驳回", "通过后公开展示，驳回后可修改再提交。"],
              ["同步展示", "审核结果同步到供需列表和管理员端。"]
            ].map(([title, desc], index) => (
              <div className="audit-step" key={title}>
                <b>{index + 1}</b>
                <span><strong>{title}</strong>{desc}</span>
              </div>
            ))}
          </div>
          <div className="review-box">
            <h4>最近发布记录</h4>
            <div className="screen-list light-list">
              {summaryLoading ? (
                <div><span>状态</span><strong>加载中...</strong></div>
              ) : supplySummary.latest ? (
                <>
                  <div><span>标题</span><strong>{supplySummary.latest.title}</strong></div>
                  <div><span>状态</span><strong>{supplySummary.latest.status}</strong></div>
                  <div><span>管理员反馈</span><strong>{summaryError || supplySummary.latest.feedback}</strong></div>
                </>
              ) : (
                <div><span>状态</span><strong>{summaryError || "暂无发布记录"}</strong></div>
              )}
            </div>
          </div>
        </Panel>
      </section>
    </div>
  );
}

// ScreenHead imported from core/ScreenHead.jsx

// StatStrip imported from core/StatStrip.jsx

// Panel imported from core/Panel.jsx

// MiniPanel → core/MiniPanel.jsx

// taskTargetsByName, taskTargetForName → utils/helpers.js

// TaskTable → core/TaskTable.jsx
// HistoryTable → core/HistoryTable.jsx

// SimpleTable, FormGrid, Checklist, Timeline, Gauge, LineChart → core/

// operationFields → utils/helpers.js

// Icon imported from core/Icon.jsx

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 48, fontFamily: "sans-serif", maxWidth: 700, margin: "60px auto", color: "#163128" }}>
          <div style={{ width: 56, height: 56, borderRadius: 999, background: "rgba(226,77,87,0.12)", display: "grid", placeItems: "center", marginBottom: 16, fontSize: "1.5rem", color: "#e24d57" }}>!</div>
          <h2 style={{ margin: "0 0 8px", fontSize: "1.3rem" }}>页面加载异常</h2>
          <p style={{ margin: "0 0 16px", color: "#758a81", fontSize: "0.9rem" }}>请尝试刷新页面，如果问题持续请联系管理员。</p>
          <pre style={{ whiteSpace: "pre-wrap", fontSize: "0.78rem", background: "#fff3f3", padding: 14, borderRadius: 8, overflow: "auto", maxHeight: 200 }}>{this.state.error.message}{"\n"}{this.state.error.stack}</pre>
          <button onClick={() => { this.setState({ error: null }); window.location.reload(); }} style={{ marginTop: 16, minHeight: 40, padding: "0 18px", border: "1px solid rgba(53,195,107,0.24)", borderRadius: 8, color: "#35c36b", background: "#f2f8f3", fontWeight: 900, cursor: "pointer" }}>重新加载</button>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(<ErrorBoundary><App /><ToastContainer /><ConfirmContainer /></ErrorBoundary>);
