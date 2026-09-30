import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const requiredFiles = [
  "contracts/roles.json",
  "contracts/navigation.json",
  "contracts/api-contracts.json",
  "mock-data/users.json",
  "mock-data/farms.json",
  "mock-data/assets.json",
  "mock-data/tasks.json",
  "mock-data/devices.json",
  "mock-data/diagnoses.json",
  "mock-data/community.json",
  "mock-data/supply-demand.json",
  "mock-data/notifications.json",
  "packages/design-tokens/tokens.css",
  "packages/design-tokens/tokens.dart",
  "docs/prototype-page-inventory.md"
];

const expectedRoleIds = ["farm_admin", "farmer", "system_admin"];

const expectedDomains = {
  users: "mock-data/users.json",
  farms: "mock-data/farms.json",
  assets: "mock-data/assets.json",
  tasks: "mock-data/tasks.json",
  devices: "mock-data/devices.json",
  diagnoses: "mock-data/diagnoses.json",
  community: "mock-data/community.json",
  supplyDemand: "mock-data/supply-demand.json",
  notifications: "mock-data/notifications.json"
};

async function readJson(relativePath) {
  const content = await readFile(path.join(rootDir, relativePath), "utf8");
  return JSON.parse(content);
}

function collectRoutes(sections) {
  return sections.flatMap((section) => [
    section.route,
    ...((section.children ?? []).map((child) => child.route))
  ]).filter(Boolean);
}

test("phase 0 deliverables exist in the productized fronted directory", async () => {
  const missing = [];

  for (const file of requiredFiles) {
    try {
      await access(path.join(rootDir, file));
    } catch {
      missing.push(file);
    }
  }

  assert.deepEqual(missing, []);
});

test("roles contract defines the three product roles with status and permissions", async () => {
  const contract = await readJson("contracts/roles.json");
  const roles = contract.roles;

  assert.equal(contract.version, 1);
  assert.deepEqual(roles.map((role) => role.id).sort(), expectedRoleIds);

  for (const role of roles) {
    assert.equal(typeof role.displayName, "string");
    assert.equal(typeof role.description, "string");
    assert.match(role.homeRoute, /^\//);
    assert.ok(["active", "reserved"].includes(role.status));
    assert.ok(Array.isArray(role.permissions));
    assert.ok(role.permissions.length > 0);
  }

  assert.equal(roles.find((role) => role.id === "system_admin").status, "reserved");
});

test("navigation contract covers each role and keeps web routes role-scoped", async () => {
  const navigation = await readJson("contracts/navigation.json");

  assert.equal(navigation.version, 1);
  assert.deepEqual(Object.keys(navigation.roles).sort(), expectedRoleIds);

  const routeExpectations = {
    farm_admin: [
      "/admin/overview",
      "/admin/assets/greenhouses",
      "/admin/tasks/dispatch",
      "/admin/devices",
      "/admin/community/experience-audit",
      "/admin/community/supply-audit"
    ],
    farmer: [
      "/farmer/dashboard",
      "/farmer/assets/greenhouses",
      "/farmer/tasks",
      "/farmer/diagnosis",
      "/farmer/community",
      "/farmer/supply"
    ],
    system_admin: [
      "/system/users",
      "/system/farms",
      "/system/audit"
    ]
  };

  for (const [roleId, config] of Object.entries(navigation.roles)) {
    assert.ok(Array.isArray(config.sections));
    assert.ok(config.sections.length > 0);

    const sectionIds = new Set();
    for (const section of config.sections) {
      assert.equal(sectionIds.has(section.id), false);
      sectionIds.add(section.id);
      assert.equal(typeof section.label, "string");
      assert.ok(section.route || section.children?.length);
    }

    const routes = collectRoutes(config.sections);
    for (const route of routes) {
      assert.match(route, /^\//);
    }

    for (const expectedRoute of routeExpectations[roleId]) {
      assert.ok(routes.includes(expectedRoute), `${roleId} missing ${expectedRoute}`);
    }
  }
});

test("api contracts map all service domains to mock files and response shapes", async () => {
  const api = await readJson("contracts/api-contracts.json");

  assert.equal(api.version, 1);
  assert.deepEqual(Object.keys(api.domains).sort(), Object.keys(expectedDomains).sort());

  for (const [domainId, mockDataFile] of Object.entries(expectedDomains)) {
    const domain = api.domains[domainId];

    assert.equal(domain.mockDataFile, mockDataFile);
    assert.ok(Array.isArray(domain.endpoints));
    assert.ok(domain.endpoints.length >= 2);

    for (const endpoint of domain.endpoints) {
      assert.match(endpoint.name, /^[a-z][A-Za-z0-9]+$/);
      assert.ok(["GET", "POST", "PATCH", "DELETE"].includes(endpoint.method));
      assert.match(endpoint.path, /^\/mock-api\//);
      assert.equal(typeof endpoint.requestShape, "object");
      assert.equal(typeof endpoint.responseShape, "object");
    }
  }

  assert.ok(api.domains.tasks.endpoints.some((endpoint) => endpoint.name === "submitTaskResult"));
  assert.ok(api.domains.diagnoses.endpoints.some((endpoint) => endpoint.name === "createDiagnosis"));
});

test("mock data fixtures share stable ids across users, farms, assets, and workflows", async () => {
  const users = await readJson("mock-data/users.json");
  const farms = await readJson("mock-data/farms.json");
  const assets = await readJson("mock-data/assets.json");
  const tasks = await readJson("mock-data/tasks.json");
  const devices = await readJson("mock-data/devices.json");
  const diagnoses = await readJson("mock-data/diagnoses.json");
  const community = await readJson("mock-data/community.json");
  const supplyDemand = await readJson("mock-data/supply-demand.json");
  const notifications = await readJson("mock-data/notifications.json");

  for (const data of [users, farms, assets, tasks, devices, diagnoses, community, supplyDemand, notifications]) {
    assert.ok(Array.isArray(data.items));
    assert.ok(data.items.length >= 2);
  }

  const userIds = new Set(users.items.map((item) => item.id));
  const farmIds = new Set(farms.items.map((item) => item.id));
  const assetIds = new Set(assets.items.map((item) => item.id));

  for (const user of users.items) {
    assert.ok(expectedRoleIds.includes(user.roleId));
    assert.ok(farmIds.has(user.farmId) || user.roleId === "system_admin");
  }

  for (const asset of assets.items) {
    assert.ok(farmIds.has(asset.farmId));
    assert.ok(["greenhouse", "plot"].includes(asset.type));
  }

  for (const task of tasks.items) {
    assert.ok(assetIds.has(task.assetId));
    assert.ok(userIds.has(task.assigneeId));
    assert.ok(["draft", "pending", "active", "submitted", "accepted"].includes(task.status));
  }

  for (const device of devices.items) {
    assert.ok(assetIds.has(device.assetId));
  }

  for (const diagnosis of diagnoses.items) {
    assert.ok(assetIds.has(diagnosis.assetId));
    assert.ok(userIds.has(diagnosis.createdBy));
  }

  assert.ok(community.items.some((item) => item.type === "experience" && item.category === "disease"));
  assert.ok(community.items.some((item) => item.type === "help"));
  assert.ok(supplyDemand.items.some((item) => item.auditStatus === "pending"));
  assert.ok(supplyDemand.items.some((item) => item.auditStatus === "approved"));

  for (const notification of notifications.items) {
    assert.ok(userIds.has(notification.userId));
  }
});

test("design tokens expose shared names for CSS and Dart consumers", async () => {
  const css = await readFile(path.join(rootDir, "packages/design-tokens/tokens.css"), "utf8");
  const dart = await readFile(path.join(rootDir, "packages/design-tokens/tokens.dart"), "utf8");

  [
    "--color-brand-primary",
    "--color-surface-default",
    "--color-status-success",
    "--color-status-warning",
    "--color-status-danger",
    "--space-md",
    "--radius-md",
    "--shadow-panel"
  ].forEach((token) => assert.match(css, new RegExp(token)));

  [
    "class AppTokens",
    "colorBrandPrimary",
    "colorSurfaceDefault",
    "colorStatusSuccess",
    "colorStatusWarning",
    "colorStatusDanger",
    "spacingMd",
    "radiusMd",
    "shadowPanel"
  ].forEach((token) => assert.match(dart, new RegExp(token)));
});

test("prototype inventory classifies existing prototype screens for productization", async () => {
  const inventory = await readFile(path.join(rootDir, "docs/prototype-page-inventory.md"), "utf8");

  ["保留", "调整", "废弃", "延后"].forEach((label) => assert.match(inventory, new RegExp(label)));
  ["综合大屏", "任务派发", "设备运维", "经验交流", "供需审核", "说明页"].forEach((page) => {
    assert.match(inventory, new RegExp(page));
  });
  assert.doesNotMatch(inventory, /TBD|TODO|待补/);
});

