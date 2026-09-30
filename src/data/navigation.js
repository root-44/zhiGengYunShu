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
        short: "大",
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
      { label: "经验审核", short: "经", targetId: "admin-experience-audit", matches: ["admin-experience-audit"] },
      { label: "供需审核", short: "供", targetId: "admin-supply-audit", matches: ["admin-supply-audit"] }
    ]
  }
];

function getActiveNavSectionId(activeId, navSections = farmerNavSections) {
  const section = navSections.find((s) => s.matches.includes(activeId));
  if (!section) return null;
  if ((section.children ?? []).length === 0) return section.id;
  return section.id;
}

function matchesNavTarget(item, activeId) {
  return (item.matches ?? []).includes(activeId);
}

const sysadminNavSections = [
  {
    id: "sysadmin-overview-nav",
    label: "系统监控",
    short: "监",
    icon: "grid",
    targetId: "sysadmin-overview",
    matches: ["sysadmin-overview"]
  }
];

export { farmerNavSections, adminNavSections, sysadminNavSections, getActiveNavSectionId, matchesNavTarget };
