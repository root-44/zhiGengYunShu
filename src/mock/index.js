/**
 * Mock 路由分发器
 * ----------------------------------------------------------------
 * 模拟 axios 实例,根据 method + url 路由到 mockData 中对应数据。
 * 设计目标:api.js 仅需替换顶部 1 行,全部 82 个接口自动走 mock。
 *
 * 简历亮点:
 *  - 使用 mock 层实现前端独立演示,支持 82 个接口的 mock 分发
 *  - 采用路由表模式匹配 RESTful 接口,模拟网络延迟与分页
 */

import { mockData, traceId } from "./mockData";

// ============ 一键开关:设为 false 即走真实后端 ============
export const USE_MOCK = true;

// ============ 响应构造工具(对齐后端统一格式) ============
function ok(data, message = "操作成功") {
  return { success: true, data, message, error: null, traceId: traceId() };
}

function okPage(items, params = {}) {
  const page = Number(params.page ?? 1);
  const pageSize = Number(params.pageSize ?? 20);
  const total = items.length;
  const start = (page - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return ok({ items: pageItems, page, pageSize, total, hasNext: start + pageSize < total });
}

function err(message = "mock 错误") {
  return { success: false, data: null, message, error: { message }, traceId: traceId() };
}

// ============ 模拟网络延迟 ============
function delay(ms = 150 + Math.random() * 250) {
  return new Promise((r) => setTimeout(r, ms));
}

// ============ 路由表:精确匹配 + 动态匹配 ============
// 返回 { success, data, message, error, traceId } 结构
function route(method, url, { params = {}, data = {} } = {}) {
  const path = String(url).split("?")[0];

  // ---------- 认证 ----------
  if (path === "/auth/login") return ok(mockData.auth.loginResponse, "登录成功");
  if (path === "/auth/register") return ok(mockData.auth.registerResponse, "注册成功");
  if (path === "/auth/refresh") return ok(mockData.auth.refreshResponse, "刷新成功");
  if (path === "/auth/logout") return ok(null, "已退出登录");
  if (path === "/users/me") return ok(mockData.auth.currentUser);

  // ---------- 文件 ----------
  if (path === "/files" && method === "post") {
    return ok({ id: "file_mock_" + Date.now(), bizType: params.bizType, fileName: "mock-file.jpg", mimeType: "image/jpeg", sizeBytes: 102400, publicUrl: "/uploads/mock/mock-file.jpg", createdAt: new Date().toISOString() });
  }
  let m = path.match(/^\/files\/([^/]+)$/);
  if (m) return ok({ id: m[1], fileName: "mock-file.jpg", publicUrl: "/uploads/mock/mock-file.jpg" });

  // ---------- Dashboard ----------
  if (path === "/farmer/dashboard") return ok(mockData.dashboard);

  // ---------- 专家会话 ----------
  if (path === "/farmer/expert-chat/sessions") {
    if (method === "get") return okPage(mockData.expertChatSessions, params);
    if (method === "post") return ok({ id: "sess_new_" + Date.now(), title: data.title || "新会话", lastMessage: "", updatedAt: new Date().toISOString() });
  }
  m = path.match(/^\/farmer\/expert-chat\/sessions\/([^/]+)\/messages$/);
  if (m) {
    if (method === "get") return okPage(mockData.expertChatMessages[m[1]] || [], params);
    if (method === "post") return ok({ id: "m_new_" + Date.now(), role: "assistant", content: "收到您的问题,建议您参考相关资料,如有需要可上门指导。", createdAt: new Date().toISOString() });
  }

  // ---------- AI 对话(非流式) ----------
  if (path === "/farmer/assistant/chat" && method === "post") {
    return ok({ content: "您好,我是智慧农业助手。根据您的问题,建议您先检查土壤湿度,如果低于 30% 需要及时灌溉。", role: "assistant" });
  }

  // ---------- 任务 ----------
  if (path === "/farmer/tasks" && method === "get") return okPage(mockData.tasks, params);
  m = path.match(/^\/farmer\/tasks\/([^/]+)$/);
  if (m) {
    const task = mockData.tasks.find((t) => t.id === m[1]) || mockData.tasks[0];
    return ok({ ...task, timeline: [
      { event: "created", at: task.createdAt, operator: "系统" },
      { event: task.status, at: task.createdAt, operator: task.assignedTo },
    ] });
  }
  m = path.match(/^\/farmer\/tasks\/([^/]+)\/accept$/);
  if (m) return ok({ id: m[1], status: "accepted" });
  m = path.match(/^\/farmer\/tasks\/([^/]+)\/submit$/);
  if (m) return ok({ id: m[1], status: "submitted" });
  m = path.match(/^\/farmer\/tasks\/([^/]+)\/evidence$/);
  if (m) return ok({ id: "evidence_new", taskId: m[1] });

  // ---------- 供需 ----------
  if (path === "/farmer/supply-demands" && method === "get") return okPage(mockData.supplyDemands, params);
  if (path === "/farmer/supply-demands" && method === "post") return ok({ ...data, id: "sd_new_" + Date.now(), status: "pending", createdAt: new Date().toISOString() });
  if (path === "/admin/supply-demands" && method === "get") return okPage(mockData.supplyDemands, params);
  m = path.match(/^\/farmer\/supply-demands\/([^/]+)$/);
  if (m) {
    const item = mockData.supplyDemands.find((s) => s.id === m[1]);
    if (method === "get") return ok(item || mockData.supplyDemands[0]);
    if (method === "patch") return ok({ ...item, ...data });
    if (method === "delete") return ok(null, "已归档");
  }
  m = path.match(/^\/admin\/supply-demands\/([^/]+)\/audit$/);
  if (m) return ok({ id: m[1], status: data.status || "approved" });

  // ---------- 诊断 ----------
  if (path === "/farmer/diagnoses" && method === "get") return okPage(mockData.diagnoses, params);
  if (path === "/farmer/diagnoses" && method === "post") return ok({ ...mockData.diagnoses[0], id: "diag_new_" + Date.now(), status: "pending", createdAt: new Date().toISOString() });
  if (path === "/admin/diagnoses" && method === "get") return okPage(mockData.diagnoses, params);
  if (path === "/admin/diagnoses" && method === "post") return ok({ ...mockData.diagnoses[0], id: "diag_new_" + Date.now() });
  m = path.match(/^\/farmer\/diagnoses\/([^/]+)$/);
  if (m) {
    const diag = mockData.diagnoses.find((d) => d.id === m[1]) || mockData.diagnoses[0];
    return ok(diag);
  }
  m = path.match(/^\/farmer\/diagnoses\/([^/]+)\/report$/);
  if (m) {
    const diag = mockData.diagnoses.find((d) => d.id === m[1]) || mockData.diagnoses[0];
    return ok(diag.report || { cause: "暂无", suggestion: "暂无", prevention: "暂无" });
  }
  m = path.match(/^\/admin\/diagnoses\/([^/]+)\/report$/);
  if (m) return ok(mockData.diagnoses[0].report);

  // ---------- 生长记录 ----------
  m = path.match(/^\/farmer\/assets\/([^/]+)\/growth-records$/);
  if (m) {
    const records = mockData.growthRecords[m[1]] || mockData.growthRecords.greenhouse_a01 || [];
    if (method === "get") return okPage(records, params);
    if (method === "post") return ok({ ...data, id: "gr_new", assetId: m[1], recordedAt: new Date().toISOString() });
  }
  m = path.match(/^\/admin\/assets\/([^/]+)\/growth-records$/);
  if (m) {
    const records = mockData.growthRecords[m[1]] || mockData.growthRecords.greenhouse_a01 || [];
    if (method === "get") return okPage(records, params);
    if (method === "post") return ok({ ...data, id: "gr_new", assetId: m[1], recordedAt: new Date().toISOString() });
  }

  // ---------- 资产(farmer) ----------
  if (path === "/farmer/assets" && method === "get") return okPage(mockData.assets, params);
  m = path.match(/^\/farmer\/assets\/([^/]+)$/);
  if (m) {
    const asset = mockData.assets.find((a) => a.id === m[1]) || mockData.assets[0];
    return ok(asset);
  }
  m = path.match(/^\/farmer\/assets\/([^/]+)\/metrics$/);
  if (m) return ok({ history: mockData.generateMetricHistory(m[1]), latest: mockData.assets[0].metrics });
  m = path.match(/^\/farmer\/assets\/([^/]+)\/thresholds$/);
  if (m) return ok(mockData.assetThresholds);
  m = path.match(/^\/farmer\/assets\/([^/]+)\/thresholds\/([^/]+)$/);
  if (m && method === "put") return ok({ ...mockData.assetThresholds, [m[2]]: data });
  m = path.match(/^\/farmer\/assets\/([^/]+)\/disease-statistics$/);
  if (m) return ok(mockData.diseaseStatistics(m[1]));

  // ---------- 资产(admin) ----------
  if (path === "/admin/assets" && method === "get") return okPage(mockData.assets, params);
  if (path === "/admin/dashboard/farm-overview") return ok(mockData.adminFarmOverview);
  m = path.match(/^\/admin\/assets\/([^/]+)\/tasks$/);
  if (m) return okPage(mockData.tasks, params);
  m = path.match(/^\/admin\/assets\/([^/]+)\/metrics$/);
  if (m) return ok({ history: mockData.generateMetricHistory(m[1]), latest: mockData.assets[0].metrics });
  m = path.match(/^\/admin\/assets\/([^/]+)\/disease-statistics$/);
  if (m) return ok(mockData.diseaseStatistics(m[1]));
  m = path.match(/^\/admin\/assets\/([^/]+)\/thresholds$/);
  if (m) return ok(mockData.assetThresholds);
  m = path.match(/^\/admin\/assets\/([^/]+)\/thresholds\/([^/]+)$/);
  if (m && method === "put") return ok({ ...mockData.assetThresholds, [m[2]]: data });

  // ---------- 设备(admin) ----------
  if (path === "/admin/devices" && method === "get") return okPage(mockData.devices, params);
  if (path === "/admin/devices" && method === "post") return ok({ ...data, id: "dev_new_" + Date.now(), online: false });
  m = path.match(/^\/admin\/devices\/([^/]+)$/);
  if (m) {
    const dev = mockData.devices.find((d) => d.id === m[1]) || mockData.devices[0];
    if (method === "get") return ok(dev);
    if (method === "delete") return ok(null, "设备已删除");
  }
  m = path.match(/^\/admin\/devices\/([^/]+)\/binding$/);
  if (m) {
    if (method === "put") return ok({ id: m[1], assetId: data.assetId, bound: true });
    if (method === "delete") return ok({ id: m[1], bound: false });
  }

  // ---------- 设备(farmer) ----------
  if (path === "/farmer/devices" && method === "get") return okPage(mockData.devices, params);
  m = path.match(/^\/farmer\/devices\/([^/]+)$/);
  if (m) return ok(mockData.devices.find((d) => d.id === m[1]) || mockData.devices[0]);
  m = path.match(/^\/farmer\/devices\/([^/]+)\/commands$/);
  if (m) return ok({ commandId: "cmd_" + Date.now(), deviceId: m[1], command: data.command, status: "executing", createdAt: new Date().toISOString() });
  m = path.match(/^\/farmer\/devices\/([^/]+)\/bindings$/);
  if (m) return ok({ id: m[1], bound: true });

  // ---------- 设备告警 ----------
  if (path === "/farmer/device-alerts" && method === "get") return okPage(mockData.deviceAlerts, params);
  m = path.match(/^\/farmer\/device-alerts\/([^/]+)\/acknowledge$/);
  if (m) return ok({ id: m[1], status: "acknowledged" });

  // ---------- 设备日志 ----------
  if (path === "/farmer/devices/logs" && method === "get") return okPage(mockData.deviceLogs, params);
  if (path === "/farmer/devices/logs/export" && method === "get") return ok({ url: "/uploads/mock/device-logs.csv" });

  // ---------- 社区 ----------
  if (path === "/farmer/community/posts" && method === "get") return okPage(mockData.communityPosts, params);
  if (path === "/farmer/community/posts" && method === "post") return ok({ ...data, id: "post_new_" + Date.now(), commentCount: 0, favoriteCount: 0, createdAt: new Date().toISOString() });
  if (path === "/admin/community/posts" && method === "get") return okPage(mockData.communityPosts, params);
  m = path.match(/^\/farmer\/community\/posts\/([^/]+)$/);
  if (m) {
    const post = mockData.communityPosts.find((p) => p.id === m[1]) || mockData.communityPosts[0];
    if (method === "get") return ok(post);
    if (method === "patch") return ok({ ...post, ...data });
  }
  m = path.match(/^\/admin\/community\/posts\/([^/]+)\/audit$/);
  if (m) return ok({ id: m[1], status: data.status || "approved" });
  m = path.match(/^\/farmer\/community\/posts\/([^/]+)\/favorite$/);
  if (m) return ok({ id: m[1], favorited: method === "post" });
  m = path.match(/^\/farmer\/community\/posts\/([^/]+)\/comments$/);
  if (m) return ok({ id: "comment_new", postId: m[1], content: data.content, createdAt: new Date().toISOString() });

  // ---------- 通知 ----------
  if (path === "/farmer/notifications" && method === "get") return okPage(mockData.notifications, params);
  m = path.match(/^\/farmer\/notifications\/([^/]+)\/read$/);
  if (m && method === "patch") return ok({ id: m[1], read: true });
  if (path === "/farmer/notifications/read-all" && method === "patch") return ok(null, "全部已读");

  // ---------- 字典 ----------
  if (path === "/dictionaries") return ok(mockData.dictionaries);

  // ---------- 系统管理员告警 ----------
  if (path === "/sysadmin/alerts" && method === "get") {
    const result = okPage(mockData.sysadminAlerts, params);
    result.data.stats = { pendingAlerts: 12, criticalAlerts: 3, resolvedAlerts: 45 };
    return result;
  }
  m = path.match(/^\/sysadmin\/alerts\/([^/]+)\/resolve$/);
  if (m) return ok({ id: m[1], status: "resolved", operator: "当前用户", resolveTime: new Date().toISOString() });

  // ---------- 兜底:未匹配的接口 ----------
  console.warn(`[mock] 未匹配接口: ${method.toUpperCase()} ${path}`);
  return ok(null, "mock 兜底");
}

// ============ 模拟 axios 实例工厂 ============
export function createMockApi() {
  // 模拟 axios 的方法签名,返回 Promise<{ data: ... }>
  const mockCall = (method, url, config = {}) => {
    const params = config?.params || {};
    const data = config?.data || {};
    return delay().then(() => ({ data: route(method, url, { params, data }) }));
  };

  const mockApi = {
    get: (url, config) => mockCall("get", url, config),
    post: (url, data, config) => mockCall("post", url, { ...config, data }),
    put: (url, data, config) => mockCall("put", url, { ...config, data }),
    patch: (url, data, config) => mockCall("patch", url, { ...config, data }),
    delete: (url, config) => mockCall("delete", url, config),
    // 拦截器在 mock 模式下为空操作(api.js 会注册拦截器)
    interceptors: {
      request: { use: () => 0, eject: () => {} },
      response: { use: () => 0, eject: () => {} },
    },
  };
  return mockApi;
}

export default { USE_MOCK, createMockApi };
