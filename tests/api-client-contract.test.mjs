import assert from "node:assert/strict";
import { test } from "node:test";
import fs from "node:fs";
import apiClient, * as api from "../src/services/api.js";

global.localStorage = {
  getItem() {
    return null;
  },
};

const apiSpec = JSON.parse(fs.readFileSync("API.json", "utf8"));

function assertInSpec(method, path) {
  const specPath = Object.keys(apiSpec.paths).find((candidate) => {
    const pattern = new RegExp(
      `^${candidate.replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/\\\{[^}]+\\\}/g, "[^/]+")}$`
    );
    return pattern.test(path);
  });
  const methods = apiSpec.paths[specPath];
  assert.ok(methods, `${path} must exist in API.json`);
  assert.ok(methods[method.toLowerCase()], `${method} ${path} must exist in API.json`);
}

async function captureRequest(action) {
  const previousAdapter = apiClient.defaults.adapter;
  let captured;

  apiClient.defaults.adapter = async (config) => {
    captured = config;
    return {
      data: { success: true, data: {} },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      request: {},
    };
  };

  try {
    await action();
  } finally {
    apiClient.defaults.adapter = previousAdapter;
  }

  assert.ok(captured, "request should be sent through the shared API client");
  return captured;
}

async function expectRequest(name, method, path, invoke) {
  test(`${name} sends ${method} ${path}`, async () => {
    assert.equal(typeof api[name], "function", `${name} should be exported`);
    assertInSpec(method, `/api/v1${path}`);

    const request = await captureRequest(() => invoke(api[name]));
    assert.equal(request.method, method.toLowerCase());
    assert.equal(request.url, path);
  });
}

await expectRequest("login", "POST", "/auth/login", (fn) =>
  fn({ account: "admin", password: "123456", rememberMe: true })
);

test("login does not attach stale bearer token from localStorage", async () => {
  const previousLocalStorage = global.localStorage;
  global.localStorage = {
    getItem(key) {
      return key === "accessToken" ? "stale-token" : null;
    },
    setItem() {},
    removeItem() {},
  };

  try {
    const request = await captureRequest(() =>
      api.login({ account: "admin", password: "123456", rememberMe: true })
    );
    assert.equal(request.headers?.Authorization, undefined);
  } finally {
    global.localStorage = previousLocalStorage;
  }
});

await expectRequest("register", "POST", "/auth/register", (fn) =>
  fn({ displayName: "A", phone: "1", account: "a", farmName: "Farm", password: "123456" })
);
await expectRequest("refreshAuthToken", "POST", "/auth/refresh", (fn) => fn("refresh-token"));
await expectRequest("logout", "POST", "/auth/logout", (fn) => fn("refresh-token"));
await expectRequest("getCurrentUser", "GET", "/users/me", (fn) => fn());
await expectRequest("uploadFile", "POST", "/files", (fn) =>
  fn(new Blob(["x"], { type: "text/plain" }), "diagnosis")
);
await expectRequest("getFile", "GET", "/files/file-1", (fn) => fn("file-1"));
await expectRequest("getDashboard", "GET", "/farmer/dashboard", (fn) => fn());

test("shared API client exposes a current-user probe for session bootstrap", async () => {
  const request = await captureRequest(() => api.getCurrentUser());
  assert.equal(request.method, "get");
  assert.equal(request.url, "/users/me");
});

test("streamAssistantChat retries once after refreshing an expired access token", async () => {
  const previousLocalStorage = global.localStorage;
  const previousFetch = global.fetch;
  const stored = new Map([
    ["accessToken", "expired-token"],
    ["refreshToken", "refresh-token"],
  ]);
  const fetchCalls = [];

  global.localStorage = {
    getItem(key) {
      return stored.get(key) || null;
    },
    setItem(key, value) {
      stored.set(key, value);
    },
    removeItem(key) {
      stored.delete(key);
    },
  };

  let refreshCaptured = false;
  const previousAdapter = apiClient.defaults.adapter;
  apiClient.defaults.adapter = async (config) => {
    refreshCaptured = config.url === "/auth/refresh";
    return {
      data: { success: true, data: { accessToken: "fresh-token", refreshToken: "fresh-refresh-token" } },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
      request: {},
    };
  };

  global.fetch = async (url, options) => {
    fetchCalls.push({ url, options });
    if (fetchCalls.length === 1) {
      return { ok: false, status: 401, text: async () => "expired" };
    }
    return {
      ok: true,
      status: 200,
      body: {
        getReader() {
          let sent = false;
          return {
            async read() {
              if (sent) return { done: true };
              sent = true;
              return { done: false, value: new TextEncoder().encode("event: done\ndata: [DONE]\n\n") };
            },
          };
        },
      },
    };
  };

  try {
    await api.streamAssistantChat({ chatId: "chat-1", message: "hello" });
    assert.equal(refreshCaptured, true);
    assert.equal(fetchCalls.length, 2);
    assert.equal(fetchCalls[0].options.headers.Authorization, "Bearer expired-token");
    assert.equal(fetchCalls[1].options.headers.Authorization, "Bearer fresh-token");
    assert.equal(stored.get("accessToken"), "fresh-token");
  } finally {
    apiClient.defaults.adapter = previousAdapter;
    global.fetch = previousFetch;
    global.localStorage = previousLocalStorage;
  }
});

test("streamAssistantChat throws when backend sends an SSE error event", async () => {
  const previousFetch = global.fetch;
  let capturedError = null;

  global.fetch = async () => ({
    ok: true,
    status: 200,
    body: {
      getReader() {
        let sent = false;
        return {
          async read() {
            if (sent) return { done: true };
            sent = true;
            return { done: false, value: new TextEncoder().encode("event: error\ndata: stream failed\n\n") };
          },
        };
      },
    },
  });

  try {
    await assert.rejects(
      () => api.streamAssistantChat(
        { chatId: "chat-1", message: "hello" },
        { onError: (error) => { capturedError = error; } }
      ),
      /stream failed/
    );
    assert.equal(capturedError?.message, "stream failed");
  } finally {
    global.fetch = previousFetch;
  }
});

await expectRequest("listTasks", "GET", "/farmer/tasks", (fn) => fn({ page: 1 }));
await expectRequest("getTask", "GET", "/farmer/tasks/task-1", (fn) => fn("task-1"));
await expectRequest("acceptTask", "POST", "/farmer/tasks/task-1/accept", (fn) => fn("task-1"));
await expectRequest("submitTask", "POST", "/farmer/tasks/task-1/submit", (fn) =>
  fn("task-1", { resultSummary: "done" })
);
await expectRequest("addTaskEvidence", "POST", "/farmer/tasks/task-1/evidence", (fn) =>
  fn("task-1", { type: "text", content: "done" })
);
await expectRequest("listSupplyDemands", "GET", "/farmer/supply-demands", (fn) =>
  fn({ mine: true })
);
await expectRequest("listAdminSupplyDemands", "GET", "/admin/supply-demands", (fn) =>
  fn({ auditStatus: "pending" })
);
await expectRequest("auditSupplyDemand", "POST", "/admin/supply-demands/item-1/audit", (fn) =>
  fn("item-1", { auditStatus: "needs_more_info", auditComment: "补充联系方式" })
);
await expectRequest("createSupplyDemand", "POST", "/farmer/supply-demands", (fn) =>
  fn({ type: "supply", title: "title" })
);
await expectRequest("updateSupplyDemand", "PATCH", "/farmer/supply-demands/item-1", (fn) =>
  fn("item-1", { title: "title" })
);
await expectRequest("archiveSupplyDemand", "DELETE", "/farmer/supply-demands/item-1", (fn) =>
  fn("item-1")
);
await expectRequest("listDiagnoses", "GET", "/farmer/diagnoses", (fn) => fn({ page: 1 }));
await expectRequest("listAdminDiagnoses", "GET", "/admin/diagnoses", (fn) => fn({ page: 1 }));
await expectRequest("createDiagnosis", "POST", "/farmer/diagnoses", (fn) =>
  fn({ assetId: "asset-1", imageFileIds: ["file-1"] })
);
await expectRequest("getDiagnosis", "GET", "/farmer/diagnoses/diagnosis-1", (fn) =>
  fn("diagnosis-1")
);
await expectRequest("getDiagnosisReport", "GET", "/farmer/diagnoses/diagnosis-1/report", (fn) =>
  fn("diagnosis-1")
);
await expectRequest("createDiagnosisReport", "POST", "/farmer/diagnoses/diagnosis-1/report", (fn) =>
  fn("diagnosis-1")
);
await expectRequest("listExpertChatSessions", "GET", "/farmer/expert-chat/sessions", (fn) =>
  fn({ page: 1 })
);
await expectRequest("createExpertChatSession", "POST", "/farmer/expert-chat/sessions", (fn) =>
  fn({ title: "新的专家问答", contextType: "diagnosis" })
);
await expectRequest("listExpertChatMessages", "GET", "/farmer/expert-chat/sessions/session-1/messages", (fn) =>
  fn("session-1")
);
await expectRequest("sendExpertChatMessage", "POST", "/farmer/expert-chat/sessions/session-1/messages", (fn) =>
  fn("session-1", { message: "hello" })
);
await expectRequest("listGrowthRecords", "GET", "/farmer/assets/asset-1/growth-records", (fn) =>
  fn("asset-1", { stage: "fruiting" })
);
await expectRequest("createGrowthRecord", "POST", "/farmer/assets/asset-1/growth-records", (fn) =>
  fn("asset-1", { stage: "fruiting", fileId: "file-1", note: "长势正常" })
);
await expectRequest("listAssets", "GET", "/farmer/assets", (fn) =>
  fn({ type: "greenhouse", page: 1, pageSize: 20 })
);
await expectRequest("getAssetDetail", "GET", "/farmer/assets/asset-1", (fn) =>
  fn("asset-1")
);
await expectRequest("getAssetMetrics", "GET", "/farmer/assets/asset-1/metrics", (fn) =>
  fn("asset-1", { metricKeys: "temperature,humidity,soilMoisture", hours: 168 })
);
await expectRequest("getAssetThresholds", "GET", "/farmer/assets/asset-1/thresholds", (fn) =>
  fn("asset-1")
);
await expectRequest("updateAssetThreshold", "PUT", "/farmer/assets/asset-1/thresholds/soilMoisture", (fn) =>
  fn("asset-1", "soilMoisture", { minValue: 45, enabled: true })
);
await expectRequest("getAssetDiseaseStatistics", "GET", "/farmer/assets/asset-1/disease-statistics", (fn) =>
  fn("asset-1")
);
await expectRequest("listAdminAssets", "GET", "/admin/assets", (fn) =>
  fn({ type: "plot", page: 1, pageSize: 20 })
);
await expectRequest("getAdminFarmOverview", "GET", "/admin/dashboard/farm-overview", (fn) =>
  fn()
);
await expectRequest("listDevices", "GET", "/farmer/devices", (fn) => fn({ page: 1 }));
await expectRequest("getDevice", "GET", "/farmer/devices/device-1", (fn) => fn("device-1"));
await expectRequest("issueDeviceCommand", "POST", "/farmer/devices/device-1/commands", (fn) =>
  fn("device-1", { commandType: "start" })
);
await expectRequest("listDeviceAlerts", "GET", "/farmer/device-alerts", (fn) => fn({ page: 1 }));
await expectRequest("acknowledgeAlert", "POST", "/farmer/device-alerts/alert-1/acknowledge", (fn) =>
  fn("alert-1")
);
await expectRequest("listCommunityPosts", "GET", "/farmer/community/posts", (fn) =>
  fn({ category: "disease" })
);
await expectRequest("listAdminCommunityPosts", "GET", "/admin/community/posts", (fn) =>
  fn({ auditStatus: "pending" })
);
await expectRequest("auditCommunityPost", "POST", "/admin/community/posts/post-1/audit", (fn) =>
  fn("post-1", { auditStatus: "approved", auditComment: "内容真实" })
);
await expectRequest("createCommunityPost", "POST", "/farmer/community/posts", (fn) =>
  fn({ type: "experience", title: "title" })
);
await expectRequest("updateCommunityPost", "PATCH", "/farmer/community/posts/post-1", (fn) =>
  fn("post-1", { title: "title" })
);
await expectRequest("favoriteCommunityPost", "POST", "/farmer/community/posts/post-1/favorite", (fn) =>
  fn("post-1")
);
await expectRequest("unfavoriteCommunityPost", "DELETE", "/farmer/community/posts/post-1/favorite", (fn) =>
  fn("post-1")
);
await expectRequest("commentCommunityPost", "POST", "/farmer/community/posts/post-1/comments", (fn) =>
  fn("post-1", { content: "comment" })
);
await expectRequest("listNotifications", "GET", "/farmer/notifications", (fn) =>
  fn({ page: 1 })
);
await expectRequest("markNotificationRead", "PATCH", "/farmer/notifications/notification-1/read", (fn) =>
  fn("notification-1")
);
await expectRequest("markAllNotificationsRead", "PATCH", "/farmer/notifications/read-all", (fn) =>
  fn({ type: "system" })
);
await expectRequest("getDictionaries", "GET", "/dictionaries", (fn) => fn({ types: ["role"] }));
