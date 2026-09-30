# 智耕云枢 — 智慧农业 3D 数据可视化大屏

基于 React 19 + Three.js 构建的 3D 农业数据可视化大屏，集成 3D 地图、热力图、设备管理、AI 助手等功能。负责前端全栈开发。

## 技术栈

| 层级 | 技术 |
|------|------|
| 框架 | React 19 + TypeScript |
| 构建 | Vite |
| 3D 渲染 | Three.js + @react-three/fiber + @react-three/drei |
| 地图 | D3-geo + 热力图 |
| 图表 | ECharts + Recharts |
| 动画 | GSAP |
| 状态管理 | Zustand 5 |
| 样式 | Tailwind CSS 4 + styled-components |
| 请求 | Axios |

## 核心功能

- **3D 农业地图**：省份地图 + 热力图 + 3D 柱状图 + 云层动画
- **设备管理**：设备状态监控、运维记录、故障告警
- **任务管理**：任务分配、进度跟踪、工单流转
- **AI 助手**：流式问答（SSE），农业知识咨询
- **数据大屏**：多维度数据展示（产量、气象、土壤、虫害）

## 性能优化

| 指标 | 优化前 | 优化后 |
|------|--------|--------|
| 核显帧率 | 15 fps | 45 fps |
| 首屏加载 | 4.2s | 1.8s |

- 22 个业务组件，91 个接口对接
- 3D 场景实例复用 + 几何体合并，降低 Draw Call
- 路由懒加载 + 资源预加载，首屏从 4.2s 优化到 1.8s

## Mock 数据架构

后端由团队负责，前端使用 Mock 层独立运行与演示：

- 82 个 RESTful 端点的路由表分发（`src/mock/index.js`）
- SSE 流式响应 Mock，模拟 AI 问答逐字输出（`src/mock/streamMock.js`）
- 统一开关 `USE_MOCK` 切换真实后端 / Mock 数据源

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 5173 端口）
npm run dev

# 构建生产版本
npm run build
```

## 项目结构

```
src/
├── components/        # 通用组件（图表、动画、虚拟滚动等）
├── core/              # 核心业务组件（设备表、工单、仪表盘等）
├── features/          # 功能模块
│   ├── sc-datav/      # 3D 数据可视化（地图、热力图、柱状图）
│   ├── sysadmin/      # 系统管理（告警、图片上传）
│   └── auth/          # 登录注册
├── hooks/             # 自定义 Hooks（动画帧、防抖、尺寸监听）
├── layouts/           # 布局（侧边栏、个人中心）
├── mock/              # Mock 数据层
├── services/          # API 封装
└── utils/             # 工具函数
```
