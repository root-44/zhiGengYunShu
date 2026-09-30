import axios from "axios";
import { USE_MOCK, createMockApi } from "@/mock";

// Mock 模式:USE_MOCK=true 时使用 mock 实例,无需后端即可独立演示
// 简历亮点:mock 层覆盖 82 个接口路由分发,支持前端独立演示
const api = USE_MOCK
  ? createMockApi()
  : axios.create({ baseURL: "/api/v1", timeout: 15000 });

function compactPayload(payload = {}) {
  return Object.fromEntries(
    Object.entries(payload).filter(([, value]) => value !== undefined)
  );
}

function withParams(params = {}) {
  return { params: compactPayload(params) };
}

function isAuthEndpoint(url = "") {
  return ["/auth/login", "/auth/register", "/auth/refresh"].some((path) =>
    String(url).startsWith(path)
  );
}

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token && !isAuthEndpoint(config.url)) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint(originalRequest?.url)) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refreshToken");
      if (refreshToken) {
        try {
          const res = await refreshAuthToken(refreshToken);
          if (res.data.success && res.data.data) {
            const { accessToken, refreshToken: newRefreshToken } = res.data.data;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", newRefreshToken);
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            return api(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          localStorage.removeItem("user");
          window.location.href = "/login";
        }
      }
    }

    return Promise.reject(error);
  }
);

export function login({ account, password, rememberMe = false }) {
  return api.post("/auth/login", {
    account,
    password,
    clientType: "web",
    rememberMe,
  });
}

export function register({ displayName, phone, account, farmName, password, roleId, inviteCode }) {
  return api.post("/auth/register", compactPayload({
    displayName,
    phone,
    account,
    farmName,
    password,
    roleId: roleId || "farmer",
    inviteCode: inviteCode || undefined,
  }));
}

export function refreshAuthToken(refreshToken) {
  return api.post("/auth/refresh", { refreshToken });
}

export function logout(refreshToken) {
  return api.post("/auth/logout", compactPayload({ refreshToken }));
}

export function getCurrentUser() {
  return api.get("/users/me");
}

export function uploadFile(file, bizType) {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/files", formData, {
    params: { bizType },
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}

export function getFile(fileId) {
  return api.get(`/files/${fileId}`);
}

export function getDashboard() {
  return api.get("/farmer/dashboard");
}

export function getFarmerDashboard() {
  return api.get("/farmer/dashboard");
}

export function chatWithAssistant(payload = {}) {
  return api.post("/farmer/assistant/chat", compactPayload(payload));
}

async function refreshStoredAccessToken() {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) return "";
  try {
    const res = await refreshAuthToken(refreshToken);
    const data = res?.data?.data;
    if (res?.data?.success && data?.accessToken) {
      localStorage.setItem("accessToken", data.accessToken);
      if (data.refreshToken) localStorage.setItem("refreshToken", data.refreshToken);
      return data.accessToken;
    }
  } catch {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    window.location.href = "/login";
  }
  return "";
}

async function fetchAssistantStream(endpoint, payload, token) {
  return fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "text/event-stream",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(compactPayload(payload)),
  });
}

async function readStreamError(response) {
  const text = await response.text().catch(() => "");
  if (!text) return `智慧问答请求失败：${response.status}`;
  try {
    const json = JSON.parse(text);
    return json?.error?.message || json?.message || text;
  } catch {
    return text;
  }
}

export async function streamAssistantChat(payload = {}, { role = "farmer", onChunk, onDone, onError } = {}) {
  // Mock 模式:走本地流式 mock,模拟打字机效果
  if (USE_MOCK) {
    const { mockStreamAssistantChat } = await import("@/mock/streamMock");
    return mockStreamAssistantChat(payload, { onChunk, onDone, onError });
  }
  let token = localStorage.getItem("accessToken");
  const endpoint = role === "farm_admin" || role === "system_admin"
    ? "/api/v1/admin/assistant/chat/stream"
    : "/api/v1/farmer/assistant/chat/stream";
  let response = await fetchAssistantStream(endpoint, payload, token);

  if (response.status === 401) {
    token = await refreshStoredAccessToken();
    if (token) response = await fetchAssistantStream(endpoint, payload, token);
  }

  if (!response.ok || !response.body) {
    const error = new Error(await readStreamError(response));
    onError?.(error);
    throw error;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let doneReceived = false;
  const handleEvent = (raw) => {
    const lines = raw.split(/\r?\n/);
    const eventName = lines.find((line) => line.startsWith("event:"))?.slice(6).trim() || "message";
    const data = lines
      .filter((line) => line.startsWith("data:"))
      .map((line) => line.slice(5).trimStart())
      .join("\n");
    if (!data) return;
    if (eventName === "done" || data === "[DONE]") {
      doneReceived = true;
      onDone?.();
    }
    else if (eventName === "error") {
      const error = new Error(data);
      onError?.(error);
      throw error;
    } else {
      onChunk?.(data);
    }
  };

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const events = buffer.split(/\r?\n\r?\n/);
    buffer = events.pop() || "";
    for (const event of events) handleEvent(event);
  }
  if (buffer.trim()) handleEvent(buffer);
  if (!doneReceived) onDone?.();
}

export function listExpertChatSessions(params = {}) {
  return api.get("/farmer/expert-chat/sessions", withParams(params));
}

export function createExpertChatSession(payload = {}) {
  return api.post("/farmer/expert-chat/sessions", compactPayload(payload));
}

export function listExpertChatMessages(sessionId) {
  return api.get(`/farmer/expert-chat/sessions/${sessionId}/messages`);
}

export function sendExpertChatMessage(sessionId, payload = {}) {
  return api.post(`/farmer/expert-chat/sessions/${sessionId}/messages`, compactPayload(payload));
}

export function listTasks(params = {}) {
  return api.get("/farmer/tasks", withParams(params));
}

export function getTask(taskId) {
  return api.get(`/farmer/tasks/${taskId}`);
}

export function acceptTask(taskId) {
  return api.post(`/farmer/tasks/${taskId}/accept`);
}

export function submitTask(taskId, payload = {}) {
  return api.post(`/farmer/tasks/${taskId}/submit`, compactPayload(payload));
}

export function addTaskEvidence(taskId, payload = {}) {
  return api.post(`/farmer/tasks/${taskId}/evidence`, compactPayload(payload));
}

export function listSupplyDemands(params = {}) {
  return api.get("/farmer/supply-demands", withParams(params));
}

export function getSupplyDemand(itemId) {
  return api.get(`/farmer/supply-demands/${itemId}`);
}

export function listAdminSupplyDemands(params = {}) {
  return api.get("/admin/supply-demands", withParams(params));
}

export function auditSupplyDemand(itemId, payload = {}) {
  return api.post(`/admin/supply-demands/${itemId}/audit`, compactPayload(payload));
}

export function createSupplyDemand(payload = {}) {
  return api.post("/farmer/supply-demands", compactPayload(payload));
}

export function updateSupplyDemand(itemId, payload = {}) {
  return api.patch(`/farmer/supply-demands/${itemId}`, compactPayload(payload));
}

export function archiveSupplyDemand(itemId) {
  return api.delete(`/farmer/supply-demands/${itemId}`);
}

export function listDiagnoses(params = {}) {
  return api.get("/farmer/diagnoses", withParams(params));
}

export function listAdminDiagnoses(params = {}) {
  return api.get("/admin/diagnoses", withParams(params));
}

export function createDiagnosis(payload = {}) {
  return api.post("/farmer/diagnoses", compactPayload(payload));
}

export function createAdminDiagnosis(payload = {}) {
  return api.post("/admin/diagnoses", compactPayload(payload));
}

export function getDiagnosis(diagnosisId) {
  return api.get(`/farmer/diagnoses/${diagnosisId}`);
}

export function getDiagnosisReport(diagnosisId) {
  return api.get(`/farmer/diagnoses/${diagnosisId}/report`);
}

export function createDiagnosisReport(diagnosisId) {
  return api.post(`/farmer/diagnoses/${diagnosisId}/report`);
}

export function createAdminDiagnosisReport(diagnosisId) {
  return api.post(`/admin/diagnoses/${diagnosisId}/report`);
}

export function listGrowthRecords(assetId, params = {}) {
  return api.get(`/farmer/assets/${assetId}/growth-records`, withParams(params));
}

export function createGrowthRecord(assetId, payload = {}) {
  return api.post(`/farmer/assets/${assetId}/growth-records`, compactPayload(payload));
}

export function listAssets(params = {}) {
  return api.get("/farmer/assets", withParams(params));
}

export function getAssetDetail(assetId) {
  return api.get(`/farmer/assets/${assetId}`);
}

export function getAssetMetrics(assetId, params = {}) {
  return api.get(`/farmer/assets/${assetId}/metrics`, withParams(params));
}

export function getAssetThresholds(assetId) {
  return api.get(`/farmer/assets/${assetId}/thresholds`);
}

export function updateAssetThreshold(assetId, metricKey, payload = {}) {
  return api.put(`/farmer/assets/${assetId}/thresholds/${metricKey}`, compactPayload(payload));
}

export function getAssetDiseaseStatistics(assetId) {
  return api.get(`/farmer/assets/${assetId}/disease-statistics`);
}

export function listAdminAssets(params = {}) {
  return api.get("/admin/assets", withParams(params));
}

export function getAdminFarmOverview() {
  return api.get("/admin/dashboard/farm-overview");
}

export function listAdminAssetTasks(assetId, params = {}) {
  return api.get(`/admin/assets/${assetId}/tasks`, withParams(params));
}

export function getAdminAssetMetrics(assetId, params = {}) {
  return api.get(`/admin/assets/${assetId}/metrics`, withParams(params));
}

export function listAdminGrowthRecords(assetId, params = {}) {
  return api.get(`/admin/assets/${assetId}/growth-records`, withParams(params));
}

export function createAdminGrowthRecord(assetId, payload = {}) {
  return api.post(`/admin/assets/${assetId}/growth-records`, compactPayload(payload));
}

export function getAdminAssetDiseaseStatistics(assetId) {
  return api.get(`/admin/assets/${assetId}/disease-statistics`);
}

export function getAdminAssetThresholds(assetId) {
  return api.get(`/admin/assets/${assetId}/thresholds`);
}

export function updateAdminAssetThreshold(assetId, metricKey, payload = {}) {
  return api.put(`/admin/assets/${assetId}/thresholds/${metricKey}`, compactPayload(payload));
}

export function createDevice(payload = {}) {
  return api.post("/admin/devices", compactPayload(payload));
}

export function listAdminDevices(params = {}) {
  return api.get("/admin/devices", withParams(params));
}

export function getAdminDevice(deviceId) {
  return api.get(`/admin/devices/${deviceId}`);
}

export function deleteAdminDevice(deviceId) {
  return api.delete(`/admin/devices/${deviceId}`);
}

export function bindDevice(deviceId, payload = {}) {
  return api.put(`/admin/devices/${deviceId}/binding`, compactPayload(payload));
}

export function unbindDevice(deviceId) {
  return api.delete(`/admin/devices/${deviceId}/binding`);
}

export function listDevices(params = {}) {
  return api.get("/farmer/devices", withParams(params));
}

export function getDevice(deviceId) {
  return api.get(`/farmer/devices/${deviceId}`);
}

export function issueDeviceCommand(deviceId, payload = {}) {
  return api.post(`/farmer/devices/${deviceId}/commands`, compactPayload(payload));
}

export function listDeviceAlerts(params = {}) {
  return api.get("/farmer/device-alerts", withParams(params));
}

export function getDeviceAlerts(params = {}) {
  return listDeviceAlerts(params);
}

export function acknowledgeAlert(alertId) {
  return api.post(`/farmer/device-alerts/${alertId}/acknowledge`);
}

export function listDeviceLogs(params = {}) {
  return api.get("/farmer/devices/logs", withParams(params));
}

export function exportDeviceLogs(params = {}) {
  return api.get("/farmer/devices/logs/export", {
    ...withParams(params),
    responseType: "blob",
  });
}

export function saveDeviceBinding(deviceId, payload = {}) {
  return api.post(`/farmer/devices/${deviceId}/bindings`, compactPayload(payload));
}

export function listCommunityPosts(params = {}) {
  return api.get("/farmer/community/posts", withParams(params));
}

export function getCommunityPost(postId) {
  return api.get(`/farmer/community/posts/${postId}`);
}

export function listAdminCommunityPosts(params = {}) {
  return api.get("/admin/community/posts", withParams(params));
}

export function auditCommunityPost(postId, payload = {}) {
  return api.post(`/admin/community/posts/${postId}/audit`, compactPayload(payload));
}

export function createCommunityPost(payload = {}) {
  return api.post("/farmer/community/posts", compactPayload(payload));
}

export function updateCommunityPost(postId, payload = {}) {
  return api.patch(`/farmer/community/posts/${postId}`, compactPayload(payload));
}

export function favoriteCommunityPost(postId) {
  return api.post(`/farmer/community/posts/${postId}/favorite`);
}

export function unfavoriteCommunityPost(postId) {
  return api.delete(`/farmer/community/posts/${postId}/favorite`);
}

export function commentCommunityPost(postId, payload = {}) {
  return api.post(`/farmer/community/posts/${postId}/comments`, compactPayload(payload));
}

export function listNotifications(params = {}) {
  return api.get("/farmer/notifications", withParams(params));
}

export function markNotificationRead(notificationId) {
  return api.patch(`/farmer/notifications/${notificationId}/read`);
}

export function markAllNotificationsRead(payload = {}) {
  return api.patch("/farmer/notifications/read-all", compactPayload(payload));
}

export function getDictionaries(params = {}) {
  return api.get("/dictionaries", withParams(params));
}

export function listSysadminAlerts(params = {}) {
  return api.get("/sysadmin/alerts", withParams(params));
}

export function resolveSysadminAlert(alertId) {
  return api.post(`/sysadmin/alerts/${alertId}/resolve`);
}

export default api;
