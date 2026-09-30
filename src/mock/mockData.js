/**
 * 智耕云枢 前端 Mock 数据层
 * ----------------------------------------------------------------
 * 作用:在后端不可用时,提供与后端一致结构的假数据,支撑前端独立演示。
 * 数据格式严格对齐后端统一响应:{ success, data, message, error, traceId }
 * 简历亮点:使用 mock 层实现前端独立演示,支持 82 个接口的 mock 分发。
 */

// ============ 工具:生成 traceId ============
const traceId = () => "mock-" + Math.random().toString(36).slice(2, 10);

// ============ 1. 认证模块 ============
const auth = {
  loginResponse: {
    accessToken: "mock-access-token-" + Date.now(),
    refreshToken: "mock-refresh-token-" + Date.now(),
    user: {
      id: "user_001",
      displayName: "张三",
      phone: "13800138000",
      account: "zhangsan",
      roleId: "farmer",
      farmName: "阳光农场",
    },
  },
  registerResponse: { id: "user_new", success: true },
  refreshResponse: {
    accessToken: "mock-access-token-refreshed-" + Date.now(),
    refreshToken: "mock-refresh-token-refreshed-" + Date.now(),
  },
  currentUser: {
    id: "user_001",
    displayName: "张三",
    phone: "13800138000",
    account: "zhangsan",
    roleId: "farmer",
    farmName: "阳光农场",
  },
};

// ============ 2. Dashboard 综合大屏 ============
const dashboard = {
  user: { id: "user_001", displayName: "张三", roleId: "farmer" },
  farm: { id: "farm_001", name: "阳光农场", address: "四川省成都市" },
  stats: {
    pendingTaskCount: 7,
    responsibleAssetCount: 42,
    warningDeviceCount: 3,
    unreadNotificationCount: 13,
    assignedAssetCount: 42,
    warningAssetCount: 5,
    activeTaskCount: 7,
    pendingCommunityReplies: 8,
    activeSupplyCount: 6,
  },
  weather: {
    summary: "多云转晴 26°C",
    rainProbability: "20%",
    humidityPercent: 68,
    tip: "适宜灌溉,注意通风降湿",
  },
  priorityTasks: [
    {
      id: "task_001",
      assetId: "greenhouse_a01",
      assetName: "大棚 A-01",
      type: "irrigation",
      title: "大棚 A-01 土壤湿度偏低,需要灌溉",
      status: "pending",
      priority: "high",
      deadline: "2026-09-29T18:00:00",
    },
    {
      id: "task_002",
      assetId: "greenhouse_a02",
      assetName: "大棚 A-02",
      type: "fertilization",
      title: "大棚 A-02 进入白果期,建议追肥",
      status: "pending",
      priority: "medium",
      deadline: "2026-09-30T12:00:00",
    },
    {
      id: "task_003",
      assetId: "plot_b01",
      assetName: "地块 B-01",
      type: "inspection",
      title: "地块 B-01 例行巡检",
      status: "accepted",
      priority: "low",
      deadline: "2026-09-29T18:00:00",
    },
  ],
  alerts: [
    {
      id: "alert_001",
      level: "warning",
      type: "低湿度",
      deviceId: "dev_001",
      deviceName: "土壤传感器-12",
      assetId: "greenhouse_a01",
      assetName: "大棚 A-01",
      metricKey: "soilMoisture",
      metricValue: 22.5,
      threshold: 30,
      message: "土壤湿度(22.5%)低于最低阈值(30%)",
      status: "pending",
      createdAt: "2026-09-24T10:15:00",
    },
    {
      id: "alert_002",
      level: "error",
      type: "设备离线",
      deviceId: "dev_005",
      deviceName: "灌溉控制器-03",
      assetId: "greenhouse_a03",
      assetName: "大棚 A-03",
      metricKey: null,
      metricValue: null,
      threshold: null,
      message: "灌溉控制器-03 离线超过 30 分钟",
      status: "pending",
      createdAt: "2026-09-24T09:30:00",
    },
    {
      id: "alert_003",
      level: "warning",
      type: "温度偏高",
      deviceId: "dev_008",
      deviceName: "气象站-01",
      assetId: "plot_b01",
      assetName: "地块 B-01",
      metricKey: "temperature",
      metricValue: 38.5,
      threshold: 35,
      message: "温度传感器读数 38.5°C 超过预警阈值 35°C",
      status: "pending",
      createdAt: "2026-09-24T08:45:00",
    },
  ],
  latestDiagnosis: {
    id: "diag_001",
    assetId: "greenhouse_a01",
    assetName: "大棚 A-01",
    crop: "草莓",
    growthStage: "红熟期",
    result: "白粉病",
    confidence: 0.92,
    status: "completed",
    createdAt: "2026-09-24T08:00:00",
  },
  attentionAssets: [
    { id: "greenhouse_a01", name: "大棚 A-01", crop: "草莓", growthStage: "红熟期", statusLabel: "需关注", attentionReason: "土壤湿度偏低" },
    { id: "greenhouse_a02", name: "大棚 A-02", crop: "草莓", growthStage: "白果期", statusLabel: "需关注", attentionReason: "温度偏高" },
    { id: "greenhouse_a03", name: "大棚 A-03", crop: "番茄", growthStage: "结果期", statusLabel: "需关注", attentionReason: "设备离线" },
    { id: "plot_b01", name: "地块 B-01", crop: "玉米", growthStage: "灌浆期", statusLabel: "需关注", attentionReason: "温度预警" },
  ],
  farmMap: {
    assets: [
      { assetId: "greenhouse_a01", id: "greenhouse_a01", name: "大棚 A-01", type: "greenhouse", summary: { cropName: "草莓", growthStage: "红熟期" }, transform: { position: { x: -24, z: -11 } } },
      { assetId: "greenhouse_a02", id: "greenhouse_a02", name: "大棚 A-02", type: "greenhouse", summary: { cropName: "草莓", growthStage: "白果期" }, transform: { position: { x: -5, z: -11 } } },
      { assetId: "greenhouse_a03", id: "greenhouse_a03", name: "大棚 A-03", type: "greenhouse", summary: { cropName: "番茄", growthStage: "结果期" }, transform: { position: { x: 14, z: -11 } } },
      { assetId: "plot_b01", id: "plot_b01", name: "地块 B-01", type: "plot", summary: { cropName: "玉米", growthStage: "灌浆期" }, transform: { position: { x: -24, z: 10.5 } } },
      { assetId: "plot_b02", id: "plot_b02", name: "地块 B-02", type: "plot", summary: { cropName: "水稻", growthStage: "抽穗期" }, transform: { position: { x: -5, z: 10.5 } } },
      { assetId: "plot_b03", id: "plot_b03", name: "地块 B-03", type: "plot", summary: { cropName: "大豆", growthStage: "结荚期" }, transform: { position: { x: 14, z: 10.5 } } },
    ],
  },
};

// ============ 3. 资产(大棚/地块)列表 ============
const assets = [
  {
    id: "greenhouse_a01", name: "大棚 A-01", type: "greenhouse", crop: "草莓", growthStage: "红熟期",
    status: "warning", ownerName: "张三", ownerId: "user_001",
    openAlertCount: 2, activeTaskCount: 1,
    metrics: { temperature: 27.4, humidity: 68.5, soilMoisture: 42.3, light: 32000, co2: 410 },
    deviceSummary: { total: 5, online: 3 },
    updatedAt: "2026-09-24T14:30:00",
  },
  {
    id: "greenhouse_a02", name: "大棚 A-02", type: "greenhouse", crop: "草莓", growthStage: "白果期",
    status: "warning", ownerName: "张三", ownerId: "user_001",
    openAlertCount: 3, activeTaskCount: 2,
    metrics: { temperature: 31.2, humidity: 55.0, soilMoisture: 28.6, light: 28000, co2: 380 },
    deviceSummary: { total: 4, online: 4 },
    updatedAt: "2026-09-24T13:00:00",
  },
  {
    id: "greenhouse_a03", name: "大棚 A-03", type: "greenhouse", crop: "番茄", growthStage: "结果期",
    status: "offline", ownerName: "张三", ownerId: "user_001",
    openAlertCount: 1, activeTaskCount: 0,
    metrics: { temperature: 29.5, humidity: 70.2, soilMoisture: 50.1, light: 30000, co2: 420 },
    deviceSummary: { total: 6, online: 2 },
    updatedAt: "2026-09-24T12:30:00",
  },
  {
    id: "greenhouse_a04", name: "大棚 A-04", type: "greenhouse", crop: "番茄", growthStage: "开花期",
    status: "active", ownerName: "张三", ownerId: "user_001",
    openAlertCount: 0, activeTaskCount: 1,
    metrics: { temperature: 25.8, humidity: 65.0, soilMoisture: 45.2, light: 35000, co2: 405 },
    deviceSummary: { total: 4, online: 4 },
    updatedAt: "2026-09-24T11:00:00",
  },
  {
    id: "greenhouse_a05", name: "大棚 A-05", type: "greenhouse", crop: "黄瓜", growthStage: "苗期",
    status: "active", ownerName: "张三", ownerId: "user_001",
    openAlertCount: 0, activeTaskCount: 0,
    metrics: { temperature: 24.0, humidity: 72.0, soilMoisture: 55.0, light: 26000, co2: 395 },
    deviceSummary: { total: 3, online: 3 },
    updatedAt: "2026-09-24T10:30:00",
  },
  {
    id: "plot_b01", name: "地块 B-01", type: "plot", crop: "玉米", growthStage: "灌浆期",
    status: "warning", ownerName: "张三", ownerId: "user_001",
    openAlertCount: 1, activeTaskCount: 1,
    metrics: { temperature: 33.5, humidity: 50.0, soilMoisture: 35.0, light: 45000 },
    deviceSummary: { total: 2, online: 1 },
    updatedAt: "2026-09-24T09:30:00",
  },
  {
    id: "plot_b02", name: "地块 B-02", type: "plot", crop: "水稻", growthStage: "抽穗期",
    status: "active", ownerName: "张三", ownerId: "user_001",
    openAlertCount: 0, activeTaskCount: 1,
    metrics: { temperature: 28.0, humidity: 75.0, soilMoisture: 60.0, light: 40000 },
    deviceSummary: { total: 3, online: 3 },
    updatedAt: "2026-09-24T08:30:00",
  },
  {
    id: "plot_b03", name: "地块 B-03", type: "plot", crop: "大豆", growthStage: "结荚期",
    status: "active", ownerName: "张三", ownerId: "user_001",
    openAlertCount: 0, activeTaskCount: 0,
    metrics: { temperature: 27.5, humidity: 68.0, soilMoisture: 48.0, light: 42000 },
    deviceSummary: { total: 2, online: 2 },
    updatedAt: "2026-09-24T07:30:00",
  },
];

// ============ 4. 任务列表 ============
const tasks = [
  {
    id: "task_001", type: "irrigation", status: "pending", priority: "high",
    title: "大棚 A-01 灌溉任务", description: "土壤湿度低于阈值,需对大棚 A-01 灌溉",
    asset: { id: "greenhouse_a01", name: "大棚 A-01", type: "greenhouse" },
    assignedTo: "张三", createdAt: "2026-09-24T10:00:00", deadline: "2026-09-25T18:00:00",
    evidence: [],
  },
  {
    id: "task_002", type: "fertilization", status: "pending", priority: "medium",
    title: "大棚 A-02 追肥任务", description: "草莓白果期,建议追施磷钾肥",
    asset: { id: "greenhouse_a02", name: "大棚 A-02", type: "greenhouse" },
    assignedTo: "张三", createdAt: "2026-09-24T09:30:00", deadline: "2026-09-26T12:00:00",
    evidence: [],
  },
  {
    id: "task_003", type: "inspection", status: "accepted", priority: "low",
    title: "地块 B-01 例行巡检", description: "检查玉米灌浆期生长状况",
    asset: { id: "plot_b01", name: "地块 B-01", type: "plot" },
    assignedTo: "张三", createdAt: "2026-09-24T08:00:00", deadline: "2026-09-25T18:00:00",
    evidence: [],
  },
  {
    id: "task_004", type: "pest_control", status: "pending", priority: "high",
    title: "大棚 A-03 病虫害防治", description: "番茄发现蚜虫,需喷药防治",
    asset: { id: "greenhouse_a03", name: "大棚 A-03", type: "greenhouse" },
    assignedTo: "张三", createdAt: "2026-09-23T16:00:00", deadline: "2026-09-25T12:00:00",
    evidence: [],
  },
  {
    id: "task_005", type: "harvest", status: "submitted", priority: "medium",
    title: "大棚 A-01 草莓采收", description: "红熟期草莓待采收",
    asset: { id: "greenhouse_a01", name: "大棚 A-01", type: "greenhouse" },
    assignedTo: "张三", createdAt: "2026-09-23T10:00:00", deadline: "2026-09-24T18:00:00",
    evidence: [{ type: "image", url: "/uploads/evidence/harvest_001.jpg" }],
  },
  {
    id: "task_006", type: "ventilation", status: "done", priority: "low",
    title: "大棚 A-04 通风操作", description: "湿度偏高,开启通风口",
    asset: { id: "greenhouse_a04", name: "大棚 A-04", type: "greenhouse" },
    assignedTo: "张三", createdAt: "2026-09-22T14:00:00", deadline: "2026-09-23T18:00:00",
    evidence: [],
  },
];

// ============ 5. 设备列表 ============
const devices = [
  {
    id: "dev_001", name: "土壤传感器-12", type: "soil_sensor", model: "AGRI-SENSE-V2",
    firmwareVersion: "2.1.0", online: true, assetId: "greenhouse_a01", assetName: "大棚 A-01",
    latestReport: { timestamp: "2026-09-24T14:30:00", metrics: { temperature: 27.4, humidity: 68.5, soilMoisture: 42.3 } },
    alertSummary: { total: 2, open: 1 },
  },
  {
    id: "dev_002", name: "温湿度计-08", type: "temp_humidity", model: "TH-PRO-X1",
    firmwareVersion: "1.8.5", online: true, assetId: "greenhouse_a01", assetName: "大棚 A-01",
    latestReport: { timestamp: "2026-09-24T14:25:00", metrics: { temperature: 27.4, humidity: 68.5 } },
    alertSummary: { total: 0, open: 0 },
  },
  {
    id: "dev_003", name: "灌溉控制器-01", type: "irrigation_controller", model: "AGRI-CTRL-V2",
    firmwareVersion: "2.1.0", online: true, assetId: "greenhouse_a02", assetName: "大棚 A-02",
    latestReport: { timestamp: "2026-09-24T14:20:00", metrics: { valveStatus: "closed", flowRate: 0 } },
    alertSummary: { total: 1, open: 0 },
  },
  {
    id: "dev_004", name: "CO2 传感器-05", type: "co2_sensor", model: "CO2-MINI",
    firmwareVersion: "3.0.1", online: true, assetId: "greenhouse_a02", assetName: "大棚 A-02",
    latestReport: { timestamp: "2026-09-24T14:15:00", metrics: { co2: 380 } },
    alertSummary: { total: 0, open: 0 },
  },
  {
    id: "dev_005", name: "灌溉控制器-03", type: "irrigation_controller", model: "AGRI-CTRL-V2",
    firmwareVersion: "2.0.8", online: false, assetId: "greenhouse_a03", assetName: "大棚 A-03",
    latestReport: { timestamp: "2026-09-24T08:30:00", metrics: { valveStatus: "unknown", flowRate: 0 } },
    alertSummary: { total: 3, open: 1 },
  },
  {
    id: "dev_006", name: "气象站-01", type: "weather_station", model: "WS-PRO",
    firmwareVersion: "4.2.0", online: true, assetId: "plot_b01", assetName: "地块 B-01",
    latestReport: { timestamp: "2026-09-24T14:30:00", metrics: { temperature: 33.5, humidity: 50, windSpeed: 3.2, rainfall: 0 } },
    alertSummary: { total: 1, open: 1 },
  },
  {
    id: "dev_007", name: "光照传感器-02", type: "light_sensor", model: "LX-PRO",
    firmwareVersion: "1.5.2", online: true, assetId: "greenhouse_a04", assetName: "大棚 A-04",
    latestReport: { timestamp: "2026-09-24T14:28:00", metrics: { light: 35000 } },
    alertSummary: { total: 0, open: 0 },
  },
  {
    id: "dev_008", name: "土壤传感器-15", type: "soil_sensor", model: "AGRI-SENSE-V2",
    firmwareVersion: "2.1.0", online: true, assetId: "plot_b02", assetName: "地块 B-02",
    latestReport: { timestamp: "2026-09-24T14:30:00", metrics: { temperature: 28.0, humidity: 75, soilMoisture: 60 } },
    alertSummary: { total: 0, open: 0 },
  },
];

// ============ 6. 社区帖子 ============
const communityPosts = [
  {
    id: "post_001", title: "草莓红熟期叶斑病处理经验", content: "最近大棚里草莓叶子上出现褐色斑点,经过诊断是叶斑病。我用苯醚甲环唑喷施了两次,同时加强通风降湿,一周后病情明显好转。",
    category: "disease", images: ["/uploads/post/img_001.jpg"],
    author: { id: "user_002", name: "李四", avatar: null },
    commentCount: 8, favoriteCount: 15, createdAt: "2026-09-23T09:00:00",
  },
  {
    id: "post_002", title: "大棚滴灌系统安装分享", content: "分享我安装滴灌系统的经验:主管道用 PE32mm,支管用 PE16mm,滴头间距 30cm。安装后节水约 40%,效果很好。",
    category: "irrigation", images: [],
    author: { id: "user_003", name: "王五", avatar: null },
    commentCount: 12, favoriteCount: 23, createdAt: "2026-09-22T15:30:00",
  },
  {
    id: "post_003", title: "番茄结果期施肥配方", content: "番茄结果期建议用 15-15-30 的水溶肥,配合海藻肥和钙肥,能有效防止脐腐病。",
    category: "fertilization", images: ["/uploads/post/img_002.jpg"],
    author: { id: "user_004", name: "赵六", avatar: null },
    commentCount: 5, favoriteCount: 18, createdAt: "2026-09-21T11:00:00",
  },
  {
    id: "post_004", title: "大棚夏季降温小技巧", content: "夏天大棚温度容易超 35°C,我用遮阳网+雾化降温+顶部通风组合,能把温度控制在 30°C 以内。",
    category: "greenhouse", images: [],
    author: { id: "user_005", name: "钱七", avatar: null },
    commentCount: 20, favoriteCount: 35, createdAt: "2026-09-20T14:00:00",
  },
  {
    id: "post_005", title: "土壤传感器使用心得", content: "用了 AGRI-SENSE-V2 半年,数据准确度不错,但要注意定期校准,否则土壤湿度会有偏差。",
    category: "device", images: [],
    author: { id: "user_002", name: "李四", avatar: null },
    commentCount: 7, favoriteCount: 11, createdAt: "2026-09-19T10:30:00",
  },
];

// ============ 7. 病害诊断 ============
const diagnoses = [
  {
    id: "diag_001", status: "completed", assetId: "greenhouse_a01", assetName: "大棚 A-01",
    crop: "草莓", growthStage: "红熟期",
    result: "白粉病",
    disease: "白粉病",
    confidence: 0.92,
    riskLevel: "high",
    report: {
      cause: "病原为白粉菌,高温高湿环境下易爆发,近期大棚内湿度持续超过 65%。",
      suggestion: "1. 清除病叶,减少病源传播\n2. 加强通风,降低田间湿度\n3. 建议喷施代森锰锌或苯醚甲环唑防治",
      prevention: "定期巡检,保持通风,合理密植,避免偏施氮肥",
    },
    createdAt: "2026-09-24T08:00:00",
  },
  {
    id: "diag_002", status: "completed", assetId: "greenhouse_a03", assetName: "大棚 A-03",
    crop: "番茄", growthStage: "结果期",
    result: "蚜虫危害",
    disease: "蚜虫危害",
    confidence: 0.88,
    riskLevel: "medium",
    report: {
      cause: "叶片背面发现蚜虫聚集,蚜虫吸食汁液导致叶片卷曲。",
      suggestion: "1. 释放瓢虫等天敌进行生物防治\n2. 严重时喷施吡虫啉\n3. 清除周围杂草减少虫源",
      prevention: "定期检查叶片背面,保持大棚清洁,安装防虫网",
    },
    createdAt: "2026-09-23T16:00:00",
  },
  {
    id: "diag_003", status: "completed", assetId: "plot_b01", assetName: "地块 B-01",
    crop: "玉米", growthStage: "灌浆期",
    result: "玉米锈病",
    disease: "玉米锈病",
    confidence: 0.85,
    riskLevel: "medium",
    report: {
      cause: "叶片出现黄褐色锈斑,为玉米锈病典型症状,多雨高湿环境易发。",
      suggestion: "1. 喷施三唑酮或戊唑醇防治\n2. 合理密植,改善通风透光\n3. 增施磷钾肥提高抗病性",
      prevention: "选用抗病品种,及时清除病残体,注意排水",
    },
    createdAt: "2026-09-22T11:00:00",
  },
  {
    id: "diag_004", status: "pending", assetId: "greenhouse_a02", assetName: "大棚 A-02",
    crop: "草莓", growthStage: "白果期",
    result: null, report: null,
    createdAt: "2026-09-24T15:00:00",
  },
];

// ============ 8. 供需信息 ============
const supplyDemands = [
  {
    id: "sd_001", type: "supply", title: "供应:新鲜草莓 200 斤", content: "大棚 A-01 红熟期草莓,品质优良,欢迎洽谈。",
    category: "fruit", price: 25.0, unit: "斤", quantity: 200,
    author: { id: "user_001", name: "张三" }, status: "approved", createdAt: "2026-09-23T10:00:00",
  },
  {
    id: "sd_002", type: "demand", title: "求购:有机肥 5 吨", content: "需要有机肥用于底肥,要求腐熟充分。",
    category: "fertilizer", price: 800.0, unit: "吨", quantity: 5,
    author: { id: "user_003", name: "王五" }, status: "approved", createdAt: "2026-09-22T14:00:00",
  },
  {
    id: "sd_003", type: "supply", title: "供应:番茄苗 1000 株", content: "育苗棚培育的番茄苗,品种优良,成活率高。",
    category: "seedling", price: 1.5, unit: "株", quantity: 1000,
    author: { id: "user_004", name: "赵六" }, status: "pending", createdAt: "2026-09-21T09:30:00",
  },
  {
    id: "sd_004", type: "demand", title: "求购:滴灌设备一套", content: "需要一套大棚滴灌设备,含主管+支管+滴头。",
    category: "equipment", price: 3000.0, unit: "套", quantity: 1,
    author: { id: "user_002", name: "李四" }, status: "approved", createdAt: "2026-09-20T16:00:00",
  },
  {
    id: "sd_005", type: "supply", title: "供应:玉米 3000 斤", content: "地块 B-01 玉米即将收获,预售后采收。",
    category: "grain", price: 1.3, unit: "斤", quantity: 3000,
    author: { id: "user_001", name: "张三" }, status: "pending", createdAt: "2026-09-19T11:00:00",
  },
];

// ============ 9. 通知 ============
const notifications = [
  { id: "n_001", type: "alert", title: "土壤湿度预警", content: "大棚 A-01 土壤湿度 22.5% 低于阈值 30%", read: false, createdAt: "2026-09-24T10:15:00" },
  { id: "n_002", type: "task", title: "新任务分配", content: "大棚 A-01 灌溉任务已分配给您", read: false, createdAt: "2026-09-24T10:00:00" },
  { id: "n_003", type: "diagnosis", title: "诊断报告完成", content: "大棚 A-01 白粉病诊断报告已生成", read: false, createdAt: "2026-09-24T08:00:00" },
  { id: "n_004", type: "community", title: "评论提醒", content: "李四评论了您的帖子《草莓红熟期叶斑病处理经验》", read: false, createdAt: "2026-09-23T16:30:00" },
  { id: "n_005", type: "supply", title: "供需审核通过", content: "您的供应信息《供应:新鲜草莓 200 斤》已审核通过", read: true, createdAt: "2026-09-23T11:00:00" },
  { id: "n_006", type: "device", title: "设备离线告警", content: "灌溉控制器-03 已离线 30 分钟", read: false, createdAt: "2026-09-24T09:30:00" },
];

// ============ 10. 系统告警(系统管理员) ============
const sysadminAlerts = [
  { id: "alert_sys_001", level: "error", type: "设备离线", source: "灌溉控制器-03", location: "大棚 A-03", time: "2026-09-24T09:30:00", message: "灌溉控制器-03 离线超过 30 分钟,请立即排查", status: "pending", operator: null, resolveTime: null },
  { id: "alert_sys_002", level: "warning", type: "温度偏高", source: "气象站-01", location: "地块 B-01", time: "2026-09-24T08:45:00", message: "温度传感器读数 38.5°C 超过预警阈值 35°C", status: "pending", operator: null, resolveTime: null },
  { id: "alert_sys_003", level: "warning", type: "低湿度", source: "土壤传感器-12", location: "大棚 A-01", time: "2026-09-24T10:15:00", message: "土壤湿度 22.5% 低于最低阈值 30%", status: "pending", operator: null, resolveTime: null },
  { id: "alert_sys_004", level: "info", type: "固件更新", source: "CO2 传感器-05", location: "大棚 A-02", time: "2026-09-23T20:00:00", message: "CO2 传感器-05 固件从 3.0.0 更新到 3.0.1", status: "resolved", operator: "系统", resolveTime: "2026-09-23T20:05:00" },
  { id: "alert_sys_005", level: "error", type: "通信异常", source: "土壤传感器-09", location: "地块 B-03", time: "2026-09-23T15:20:00", message: "传感器通信中断,最后上报时间 2 小时前", status: "resolved", operator: "管理员", resolveTime: "2026-09-23T16:00:00" },
];

// ============ 11. 字典数据 ============
const dictionaries = {
  cropTypes: [
    { value: "strawberry", label: "草莓" },
    { value: "tomato", label: "番茄" },
    { value: "corn", label: "玉米" },
    { value: "rice", label: "水稻" },
    { value: "soybean", label: "大豆" },
    { value: "cucumber", label: "黄瓜" },
  ],
  taskTypes: [
    { value: "irrigation", label: "灌溉" },
    { value: "fertilization", label: "施肥" },
    { value: "pest_control", label: "病虫害防治" },
    { value: "inspection", label: "巡检" },
    { value: "harvest", label: "采收" },
    { value: "ventilation", label: "通风" },
  ],
  assetTypes: [
    { value: "greenhouse", label: "大棚" },
    { value: "plot", label: "地块" },
  ],
};

// ============ 12. 专家会话 ============
const expertChatSessions = [
  { id: "sess_001", title: "草莓白粉病咨询", lastMessage: "建议喷施苯醚甲环唑...", updatedAt: "2026-09-23T15:00:00" },
  { id: "sess_002", title: "番茄蚜虫防治", lastMessage: "可以释放瓢虫进行生物防治...", updatedAt: "2026-09-22T11:00:00" },
];

const expertChatMessages = {
  sess_001: [
    { id: "m_001", role: "user", content: "我的草莓叶子上有白粉,是什么病?", createdAt: "2026-09-23T14:50:00" },
    { id: "m_002", role: "assistant", content: "根据您的描述,很可能是白粉病。白粉病由白粉菌引起,高温高湿环境易爆发。建议:1. 清除病叶;2. 加强通风降湿;3. 喷施苯醚甲环唑防治。", createdAt: "2026-09-23T14:51:00" },
  ],
};

// ============ 13. 生长记录 ============
const growthRecords = {
  greenhouse_a01: [
    { id: "gr_001", assetId: "greenhouse_a01", stage: "苗期", note: "定植,浇透水", recordedAt: "2026-08-01T09:00:00", imageUrl: "/uploads/growth/gr_001.jpg" },
    { id: "gr_002", assetId: "greenhouse_a01", stage: "生长期", note: "开始追肥,长势良好", recordedAt: "2026-08-15T09:00:00", imageUrl: "/uploads/growth/gr_002.jpg" },
    { id: "gr_003", assetId: "greenhouse_a01", stage: "开花期", note: "进入开花期,注意控温", recordedAt: "2026-09-01T09:00:00", imageUrl: "/uploads/growth/gr_003.jpg" },
    { id: "gr_004", assetId: "greenhouse_a01", stage: "红熟期", note: "果实转红,准备采收", recordedAt: "2026-09-20T09:00:00", imageUrl: "/uploads/growth/gr_004.jpg" },
  ],
};

// ============ 14. 资产指标历史(用于折线图) ============
function generateMetricHistory(assetId, hours = 24) {
  const now = Date.now();
  const data = [];
  for (let i = hours; i >= 0; i--) {
    const t = new Date(now - i * 60 * 60 * 1000);
    data.push({
      timestamp: t.toISOString(),
      temperature: 22 + Math.sin(i / 3) * 5 + Math.random() * 2,
      humidity: 60 + Math.cos(i / 4) * 15 + Math.random() * 5,
      soilMoisture: 40 + Math.sin(i / 5) * 10 + Math.random() * 3,
      light: Math.max(0, 30000 + Math.sin((i - 6) / 4) * 20000),
      co2: 400 + Math.random() * 30,
    });
  }
  return data;
}

// ============ 15. 资产阈值 ============
const assetThresholds = {
  temperature: { min: 15, max: 32 },
  humidity: { min: 50, max: 85 },
  soilMoisture: { min: 30, max: 70 },
  light: { min: 10000, max: 60000 },
  co2: { min: 350, max: 800 },
};

// ============ 16. 资产病害统计 ============
function diseaseStatistics(assetId) {
  return {
    total: 3,
    items: [
      { disease: "白粉病", count: 2, lastAt: "2026-09-24T08:00:00" },
      { disease: "叶斑病", count: 1, lastAt: "2026-09-15T10:00:00" },
    ],
  };
}

// ============ 17. 管理员农场概览 ============
const adminFarmOverview = {
  totalAssets: 42,
  totalDevices: 128,
  onlineDevices: 115,
  totalUsers: 8,
  totalFarmers: 5,
  totalAdmins: 2,
  totalSysadmins: 1,
  pendingTasks: 23,
  pendingAlerts: 12,
  pendingPosts: 4,
  pendingSupplyDemands: 2,
};

// ============ 18. 设备日志 ============
const deviceLogs = [
  { id: "log_001", deviceId: "dev_001", level: "info", message: "数据上报成功", timestamp: "2026-09-24T14:30:00" },
  { id: "log_002", deviceId: "dev_001", level: "info", message: "数据上报成功", timestamp: "2026-09-24T14:25:00" },
  { id: "log_003", deviceId: "dev_005", level: "error", message: "设备离线", timestamp: "2026-09-24T08:30:00" },
  { id: "log_004", deviceId: "dev_005", level: "warning", message: "通信信号弱", timestamp: "2026-09-24T08:25:00" },
  { id: "log_005", deviceId: "dev_006", level: "warning", message: "温度超过阈值", timestamp: "2026-09-24T08:45:00" },
];

// ============ 19. 设备告警 ============
const deviceAlerts = [
  { id: "alert_001", level: "warning", type: "低湿度", deviceId: "dev_001", deviceName: "土壤传感器-12", assetId: "greenhouse_a01", assetName: "大棚 A-01", metricKey: "soilMoisture", metricValue: 22.5, threshold: 30, message: "土壤湿度 22.5% 低于阈值 30%", status: "pending", createdAt: "2026-09-24T10:15:00" },
  { id: "alert_002", level: "error", type: "设备离线", deviceId: "dev_005", deviceName: "灌溉控制器-03", assetId: "greenhouse_a03", assetName: "大棚 A-03", message: "设备离线超 30 分钟", status: "pending", createdAt: "2026-09-24T09:30:00" },
  { id: "alert_003", level: "warning", type: "温度偏高", deviceId: "dev_006", deviceName: "气象站-01", assetId: "plot_b01", assetName: "地块 B-01", metricKey: "temperature", metricValue: 38.5, threshold: 35, message: "温度 38.5°C 超阈值 35°C", status: "pending", createdAt: "2026-09-24T08:45:00" },
];

export const mockData = {
  auth,
  dashboard,
  assets,
  tasks,
  devices,
  communityPosts,
  diagnoses,
  supplyDemands,
  notifications,
  sysadminAlerts,
  dictionaries,
  expertChatSessions,
  expertChatMessages,
  growthRecords,
  assetThresholds,
  adminFarmOverview,
  deviceLogs,
  deviceAlerts,
  generateMetricHistory,
  diseaseStatistics,
};

export { traceId };
