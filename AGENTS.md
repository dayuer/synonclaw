# SynonClaw 项目架构

> 自动维护 — 每次架构级变更时同步更新

## 目录结构

```
synonclaw/
├── public/images/              # 产品渲染图
├── src/
│   ├── admin/                  # 🆕 Admin 管理后台子系统
│   │   ├── layout/
│   │   │   ├── AdminLayout.tsx     # 主布局（Sidebar + TopBar + Outlet）
│   │   │   ├── AdminSidebar.tsx    # 侧边栏导航（折叠 + 移动端浮层）
│   │   │   └── AdminTopBar.tsx     # 顶栏（管理员信息 + 退出）
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx   # 仪表盘（StatCard 动画 + 最近订单 + 系统状态）
│   │   │   ├── ProductsPage.tsx    # 产品管理（CRUD + Toggle）
│   │   │   ├── CustomersPage.tsx   # 客户管理（搜索/筛选 + 详情）
│   │   │   ├── OrdersPage.tsx      # 订单管理（状态推进 + 时间线）
│   │   │   ├── DevelopersPage.tsx  # 开发者网络（认证等级 + 任务记录）
│   │   │   └── SettingsPage.tsx    # 系统设置（OpenClaw Token + 主题）
│   │   ├── data/
│   │   │   ├── types.ts            # 领域实体类型定义
│   │   │   └── mockData.ts         # Mock 数据 + CRUD 操作函数
│   │   └── styles/
│   │       └── admin.css           # Admin 专用样式（复用 tokens.css）
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
├── team/                       # 团队协作文档（临时）
├── vite.config.ts
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
                       ├── AdminSidebar (useLocation + useNavigate)
                       ├── AdminTopBar
                       └── Pages (通过 <Routes> 嵌套渲染)
                           ├── DashboardPage ← mockData (getStatCards, getRecentOrders, getSystemInfo)
                           ├── ProductsPage  ← mockData (getProducts, addProduct, updateProduct, toggleProductStatus)
                           ├── CustomersPage ← mockData (getCustomers, getOrdersByCustomerId)
                           ├── OrdersPage    ← mockData (getOrders, advanceOrderStatus)
                           ├── DevelopersPage← mockData (getDevelopers, updateDeveloperCertLevel)
                           └── SettingsPage  ← mockData (getSystemInfo)

styles: tokens.css → global.css → 页面 CSS
        tokens.css → admin.css (admin 独立引用)
```

## 每文件核心职责

| 文件 | 职责 |
|------|------|
| `App.tsx` | 根据 pathname 分流官网/Admin 布局 |
| `AdminLayout.tsx` | Admin 主框架，管理 Sidebar 折叠状态，渲染嵌套子路由 |
| `AdminSidebar.tsx` | 导航菜单 + 路由高亮 + 折叠模式 + 移动端浮层 |
| `AdminTopBar.tsx` | 系统标题 + 管理员头像 + 退出操作 |
| `types.ts` | 全部领域实体类型 + 枚举标签映射 + 状态流转常量 |
| `mockData.ts` | 模拟数据存储 + 查询函数 + 变更函数（模块闭包持久化） |
| `admin.css` | Admin 完整视觉系统（布局/表格/表单/卡片/徽章/模态框/时间线） |
| `DashboardPage.tsx` | 统计卡片（rAF 计数器动画）+ 最近订单表 + 系统指标面板 |
| `ProductsPage.tsx` | 产品 CRUD（模态框表单 + 校验）+ 上下架 Toggle Switch |
| `CustomersPage.tsx` | 客户列表（三维搜索/筛选）+ 详情页（关联设备/订单） |
| `OrdersPage.tsx` | 订单列表 + 详情（状态推进按钮 + 时间线） |
| `DevelopersPage.tsx` | 开发者列表（技能标签）+ 详情（认证历史 + 任务记录 + 等级变更） |
| `SettingsPage.tsx` | 系统信息 + OpenClaw Token/RPC 配置 + 主题展示 |
