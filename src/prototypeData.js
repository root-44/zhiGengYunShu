export const screens = [
  {
    id: "notes",
    title: "说明",
    nav: "说明",
    layout: "notes",
    subtitle: "根据 PPT 线稿重绘农户端功能页面，并融入智慧农业控制台视觉。",
    bullets: ["16:9 原型画布", "深绿导航与浅色数据面板", "页面按 PPT 原始顺序组织", "所有控件均为 React 绘制"]
  },
  {
    id: "dashboard",
    title: "综合大屏",
    nav: "大屏",
    layout: "dashboard",
    subtitle: "个人地块/大棚、任务、告警和农情汇总。",
    stats: [
      ["我的地块/大棚", "42", "需要特别关注"],
      ["灌溉任务", "1", "地块 P-07 进行中"],
      ["社区回复", "13", "条新回复"],
      ["最近告警", "3", "湿度偏低 / 离线"]
    ],
    weather: ["今日天气", "降雨概率", "空气湿度", "农事建议"],
    mapCards: [
      ["大棚 A-01", "草莓 / 红熟期", "湿度偏高"],
      ["草莓棚 C-03", "草莓 / 白果期", "需要巡检"],
      ["地块 P-07", "小麦 / 孕穗期", "灌溉中"],
      ["地块 P-08", "小麦 / 抽穗期", "状态正常"]
    ]
  },
  {
    id: "greenhouse-list",
    title: "大棚管理",
    nav: "大棚",
    layout: "asset-list",
    assetType: "大棚",
    subtitle: "负责大棚 42 个，需要特别关注。",
    stats: [
      ["在线设备", "38/41", "3 台离线"],
      ["平均温度", "27.4℃", "实时采集"],
      ["待处理警告", "3", "湿度偏低 / 离线"],
      ["今日任务", "6", "巡检与灌溉"]
    ],
    assets: ["大棚 A-01", "大棚 A-02", "大棚 B-01", "大棚 B-03"]
  },
  {
    id: "greenhouse-detail",
    title: "大棚 A-01",
    nav: "棚详情",
    layout: "detail",
    detailType: "greenhouse",
    subtitle: "草莓红熟期，展示作物、设备、告警、生长记录与灌溉控制。",
    tabs: ["种植作物", "绑定设备", "当前告警"],
    stages: ["绿果", "白果", "初转色", "后转色", "红熟"],
    metrics: ["株高 xx cm", "果径 xx mm", "叶色指数 xx 分", "坐果率 xx%"],
    sensors: ["室内温度", "室外温度", "室内湿度", "室外湿度"],
    records: ["绿果 xx 张", "白果 xx 张", "初转色 xx 张", "后转色 xx 张", "红熟 xx 张"]
  },
  {
    id: "greenhouse-tasks",
    title: "大棚 A-01 相关任务",
    nav: "棚任务",
    layout: "related-tasks",
    subtitle: "和这个大棚相关的待办任务，点击后进入待办任务处理。",
    tabs: ["种植作物", "绑定设备", "当前告警"],
    taskScope: "当前大棚摘要"
  },
  {
    id: "plot-list",
    title: "地块管理",
    nav: "地块",
    layout: "asset-list",
    assetType: "地块",
    subtitle: "负责地块 42 个，需要特别关注。",
    stats: [
      ["平均土壤水分", "43.8%", "实时采集"],
      ["灌溉任务", "1", "地块 P-07 进行中"],
      ["最近告警", "3", "低湿度 / 离线"],
      ["今日巡检", "8", "待确认"]
    ],
    assets: ["地块 A-01", "地块 A-02", "地块 B-01", "地块 B-03"]
  },
  {
    id: "plot-detail",
    title: "地块 A-01",
    nav: "地详情",
    layout: "detail",
    detailType: "plot",
    subtitle: "小麦孕穗期，展示作物、环境、记录和灌溉控制。",
    tabs: ["种植作物", "绑定设备", "当前告警"],
    stages: ["出苗", "分蘖", "拔节", "孕穗", "抽穗", "灌浆", "成熟"],
    metrics: ["分蘖数 xx", "株高 xx cm", "叶色 SPAD xx 分", "长势指数 xx 分"],
    sensors: ["地块温度", "土壤水分", "土壤 pH", "光照强度"],
    records: ["出苗 xx 张", "分蘖 xx 张", "拔节 xx 张", "孕穗 xx 张", "抽穗 xx 张"]
  },
  {
    id: "plot-tasks",
    title: "地块 A-01 相关任务",
    nav: "地任务",
    layout: "related-tasks",
    subtitle: "和这个地块相关的待办任务，结构与大棚相关任务一致。",
    tabs: ["种植作物", "绑定设备", "当前告警"],
    taskScope: "当前地块摘要"
  },
  {
    id: "tasks",
    title: "全部任务",
    nav: "任务",
    layout: "task-table",
    subtitle: "待开始、进行中、紧急/待确认任务统一入口。",
    stats: [
      ["待开始", "7", "需要今天处理"],
      ["进行中", "2", "可提交"],
      ["紧急 / 待确认", "5", "优先处理"]
    ]
  },
  {
    id: "irrigation-task",
    title: "灌溉任务",
    nav: "灌溉",
    layout: "operation",
    operation: "irrigation",
    subtitle: "控制硬件进行灌溉。",
    summary: [["关联区域", "地块 P-08"], ["设备编号", "AGRI_008"], ["当前状态", "灌溉中"], ["目标水分", "45%"]],
    panels: ["灌溉控制台", "实时状态", "命令时间线", "操作记录"],
    actions: ["下发灌溉指令", "紧急停止", "暂停 x 分钟"]
  },
  {
    id: "inspection-task",
    title: "环境巡检",
    nav: "巡检",
    layout: "operation",
    operation: "inspection",
    subtitle: "按日巡检大棚或地块环境，上传照片并提交巡检结果。",
    summary: [["关联区域", "草莓棚 C-03"], ["巡检项", "温湿度 / 光照 / 设备"], ["告警等级", "普通"], ["处理状态", "待处理"]],
    panels: ["巡检信息", "巡检清单", "巡检时间线", "巡检结果"],
    actions: ["记录温湿度", "拍摄现场照片", "复核设备状态", "提交巡检结果"]
  },
  {
    id: "growth-anomaly-task",
    title: "生长异常",
    nav: "生长",
    layout: "operation",
    operation: "growth_anomaly",
    subtitle: "复核模型识别和经验日历不一致的作物生长状态。",
    summary: [["关联区域", "草莓棚 C-03"], ["模型阶段", "白果期"], ["经验阶段", "转色期"], ["任务状态", "待复核"]],
    panels: ["异常复核", "历史图片", "分析时间线", "提交结果"],
    actions: ["复核作物长势", "补充历史图片", "记录异常原因", "提交异常结论"]
  },
  {
    id: "disease-detection-task",
    title: "病害检测",
    nav: "病害",
    layout: "operation",
    operation: "disease_detection",
    subtitle: "复核后台自动识别出的病害风险，提交现场处置结果。",
    summary: [["关联区域", "大棚 A-01"], ["作物", "草莓"], ["风险等级", "中"], ["任务状态", "待处理"]],
    panels: ["病害复核", "处理清单", "检测时间线", "提交结果"],
    actions: ["复核病害图片", "上传处置照片", "记录防治措施", "提交检测结果"]
  },
  {
    id: "disease-detection",
    title: "病虫害检测",
    nav: "识别",
    layout: "detection",
    subtitle: "上传图片，点击识别，生成识别结果并跳转专家问答。",
    report: false
  },
  {
    id: "disease-report",
    title: "防治报告",
    nav: "报告",
    layout: "detection",
    subtitle: "点击生成防治报告后，展示建议一、二、三。",
    report: true
  },
  {
    id: "expert-context-chat",
    title: "专家问答（携带诊断上下文）",
    nav: "问答1",
    layout: "chat-context",
    subtitle: "携带病虫害检测上下文，与大模型继续对话。",
    hasContext: true
  },
  {
    id: "expert-direct-chat",
    title: "专家问答（直接问答）",
    nav: "问答2",
    layout: "chat-context",
    subtitle: "无图片诊断上下文时直接输入农业问题。",
    hasContext: false
  },
  {
    id: "community",
    title: "经验交流",
    nav: "社区",
    layout: "community",
    subtitle: "经验、求助、收藏与热门话题入口。",
    tabs: ["全部", "病虫害经验", "灌溉经验", "施肥经验", "大棚管理", "设备使用"]
  },
  {
    id: "community-category-disease",
    title: "病虫害经验",
    nav: "病虫害",
    layout: "community-category",
    subtitle: "按作物、区域、时间和热度筛选病虫害处理经验。"
  },
  {
    id: "community-category-irrigation",
    title: "灌溉经验",
    nav: "灌溉",
    layout: "community-category",
    subtitle: "按作物、地块、灌溉方式和复查结果筛选灌溉经验。"
  },
  {
    id: "community-category-fertilization",
    title: "施肥经验",
    nav: "施肥",
    layout: "community-category",
    subtitle: "按作物阶段、肥料类型和执行方式筛选施肥经验。"
  },
  {
    id: "community-category-greenhouse",
    title: "大棚管理",
    nav: "大棚",
    layout: "community-category",
    subtitle: "按温湿度控制、通风、巡检和作物阶段筛选大棚管理经验。"
  },
  {
    id: "community-category-device",
    title: "设备使用",
    nav: "设备",
    layout: "community-category",
    subtitle: "按设备类型、异常处理、绑定维护和通信状态筛选设备使用经验。"
  },
  {
    id: "community-publish",
    title: "发布经验",
    nav: "发经验",
    layout: "community-publish",
    subtitle: "填写种植经验、处理过程和图片，发布后回到经验交流首页。"
  },
  {
    id: "community-help",
    title: "发布求助",
    nav: "求助",
    layout: "community-help",
    subtitle: "当农户不确定如何处理时，可以发布求助，也可以同步跳转到智能服务的专家问答。"
  },
  {
    id: "community-detail",
    title: "草莓红熟期叶斑病处理经验",
    nav: "经验详情",
    layout: "community-detail",
    subtitle: "发布人：李四；关联大棚 A-01；适用于结果期草莓叶片局部病斑。"
  },
  {
    id: "supply-demand",
    title: "供需大厅",
    nav: "供需",
    layout: "supply",
    subtitle: "供需发布审核与搜索列表。",
    filters: ["关键词", "类型（供/求）", "区域"]
  },
  {
    id: "supply-publish",
    title: "供需发布",
    nav: "发供需",
    layout: "supply-publish",
    subtitle: "农户在这里发布采购、求助或供给信息，提交后会流转到农场管理员审核。"
  }
];
