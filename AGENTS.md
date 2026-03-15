# SynonClaw 项目架构

> 自动维护 — 每次架构级变更时同步更新

## 目录结构

```
synonclaw/
├── public/images/              # 产品渲染图
├── src/
│   ├── admin/                  # Admin 管理后台子系统
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx     # 主布局（Sidebar + TopBar + Routes）
│   │   │   ├── AdminSidebar.tsx    # 分组侧边栏导航（概览/设备与角色/团队/运营）
│   │   │   └── AdminTopBar.tsx     # 顶栏（管理员信息 + 退出）
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx   # 控制台总览（StatCard + 活动日志 + 订阅计划 + 系统状态）
│   │   │   ├── DevicesPage.tsx     # 设备管理（列表 + 详情 + 添加 + 配额校验）
│   │   │   ├── DeviceConfigPage.tsx# 🆕 RPC 远程配置（模型/Key/温度/Prompt/插件）
│   │   │   ├── WorkersPage.tsx     # 🆕 数字员工管理（CRUD + 设备绑定 + 成员分配）
│   │   │   ├── MembersPage.tsx     # 🆕 团队成员管理（CRUD + 角色 + 关联数字员工）
│   │   │   ├── WorkspacePage.tsx   # 🆕 成员工作台（数字员工卡片 + AI 对话界面）
│   │   │   ├── ProductsPage.tsx    # 🆕 产品管理（CRUD + Toggle）
│   │   │   ├── CustomersPage.tsx   # 客户管理（搜索/筛选 + 详情 + 关联设备）
│   │   │   ├── OrdersPage.tsx      # 订单管理（状态推进 + 时间线）
│   │   │   ├── DevelopersPage.tsx  # 开发者网络（认证等级 + 任务记录）
│   │   │   └── SettingsPage.tsx    # 系统设置（系统信息 + 主题 + RPC文档）
│   │   ├── data/
│   │   │   ├── types.ts            # 领域实体类型定义（含多租户/RPC/数字员工）
│   │   │   ├── mockData.ts         # Mock 数据 + CRUD（多租户过滤 + 配额校验 + 关联清理）
│   │   │   ├── rpcClient.ts        # 🆕 RPC 指令翻译中心（config diff → 指令 + 校验）
│   │   │   └── __tests__/
│   │   │       └── mockData.test.ts# 🆕 数据层 TDD 测试（29 用例）
│   │   └── styles/
│   │       └── admin.css           # Admin 完整视觉系统（含工作台/对话/插件等新组件）
│   ├── components/
│   │   ├── layout/             # Navbar / Footer（官网全局布局）
│   │   └── shared/             # CTAButton / SectionTitle / FeatureCard
│   ├── pages/                  # 5 个官网页面（.tsx + .css 配对）
│   ├── styles/
│   │   ├── tokens.css          # 设计系统 Token
│   │   ├── reset.css           # CSS Reset
│   │   └── global.css          # 全局样式 + 动画
│   ├── hooks.tsx               # 自定义 Hook
│   ├── App.tsx                 # 路由配置（官网 + Admin 分流）
│   └── main.tsx                # 入口
├── docs/                       # 项目文档
├── team/                       # 团队协作文档
│   ├── requirements.md         # 需求文档（6 US, 26 AC）
│   ├── ba-scenarios.md         # 业务场景拆解（35 场景, 15 边界）
│   ├── sprint.md               # Sprint 计划（9 任务, 3 里程碑）
│   ├── alpha-notes.md          # Alpha 实现笔记（技术决策 + Beta TODO）
│   └── handoff.md              # 角色交接文档
├── vite.config.ts              # Vite + Vitest 配置
├── tsconfig.json
└── package.json
```

## 模块依赖关系

```
main.tsx → App.tsx
               ├── 官网路由 (pathname != /admin)
               │   ├── Navbar + Footer (layout)
               │   └── HomePage / DeskPage / EnterprisePage / EcosystemPage / DeveloperPage
               │
               └── Admin 路由 (/admin/*)
                   └── AdminLayout
                       ├── AdminSidebar (分组导航: 概览/设备与角色/团队/运营)
                       ├── AdminTopBar
                       └── Pages (通过 <Routes> 嵌套渲染)
                           ├── DashboardPage  ← mockData (getStatCards, getActivityLogs, getTenant, getSystemInfo)
                           ├── DevicesPage     ← mockData + DeviceConfigPage
                           │   └── DeviceConfigPage ← rpcClient (translateConfigToCommands, validateRpcConfig)
                           ├── WorkersPage     ← mockData (CRUD + assignWorkerToMember)
                           ├── MembersPage     ← mockData (CRUD + getWorkersByMemberId)
                           ├── WorkspacePage   ← mockData + rpcClient (sendChatMessage)
                           ├── ProductsPage    ← mockData (getProducts, addProduct, toggleProductStatus)
                           ├── CustomersPage   ← mockData
                           ├── OrdersPage      ← mockData
                           ├── DevelopersPage  ← mockData
                           └── SettingsPage    ← mockData

数据层: types.ts → mockData.ts + rpcClient.ts
样式: tokens.css → global.css → 页面 CSS
       tokens.css → admin.css (admin 独立引用)
```

## 每文件核心职责

| 文件 | 职责 |
|------|------|
| `App.tsx` | 根据 pathname 分流官网/Admin 布局 |
| `AdminLayout.tsx` | Admin 主框架，管理 Sidebar 折叠状态，渲染嵌套子路由（10 个） |
| `AdminSidebar.tsx` | 分组导航（概览/设备与角色/团队/运营）+ 路由高亮 + 折叠 + 移动端浮层 |
| `AdminTopBar.tsx` | 系统标题 + 管理员头像 + 退出操作 |
| `types.ts` | 全部领域实体类型 + 枚举标签映射 + 多租户/RPC/数字员工类型 |
| `mockData.ts` | 模拟数据存储 + 30+ 查询/变更函数 + tenantId 过滤 + 配额校验 + 关联清理 |
| `rpcClient.ts` | RPC 指令翻译中心 — config diff → 指令列表 + 校验 + 模拟执行 + 模拟 AI 回复 |
| `admin.css` | Admin 完整视觉系统（布局/表格/表单/卡片/对话/插件/工作台/活动列表） |
| `DashboardPage.tsx` | 统计卡片(rAF 动画) + 活动日志 + 订阅计划 + 系统状态 |
| `DevicesPage.tsx` | 设备列表(配额提示) + 详情(RPC 概览) + 添加(Token 托管) + 配置入口 |
| `DeviceConfigPage.tsx` | RPC 远程配置 GUI — 模型/Key/Temperature/TopP/MaxTokens/Prompt/Plugins |
| `WorkersPage.tsx` | 数字员工 CRUD + 设备绑定 + 成员分配模态框 |
| `MembersPage.tsx` | 团队成员 CRUD + 角色管理 + 关联数字员工展示 |
| `WorkspacePage.tsx` | 成员工作台 — 数字员工卡片 + AI 对话(消息气泡/Mock 回复/打字动画) + 历史对话 |
| `ProductsPage.tsx` | 产品 CRUD + Toggle 上下架开关 |
