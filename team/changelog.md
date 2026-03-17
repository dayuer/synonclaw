# Changelog — SynonClaw 官网重新定义

## [2026-03-17] 官网全站重新定义

### 新增
- **技术能力页** `/technology` — 安全架构可视化 + 方案对比表 + 四层全栈架构图
- **产品线页** `/products` — Desk + Rack 并排对比 + 规格表 + 场景匹配器
- **Canvas 网络动画** — 首页 Hero 粒子连线背景
- **rAF 数字动画** — 社会证明区数字滚动

### 变更
- **首页** — 核心定位重塑为「安全/可管控/统一知识库」
- **AI 引擎定位** — 从纯本地调整为本地+云混合架构
- **Navbar** — 导航重组为 产品/技术/生态/开发者/控制台
- **Footer** — 五列布局（品牌/产品/技术/开发者/公司）
- **软件生态页** — AI 引擎三能力 + 低代码平台三能力 + 工作流
- **开发者页** — 新增技术文档入口卡片（API/SDK/CLI）+ GitHub 链接

### 删除
- `/desk` 和 `/enterprise` 路由（重定向至 `/products`）
- 所有内部技术栈名称（GNB/ARC4/XOR/OpenClaw/云兔）从官网文案中移除

### 文件变更

| 操作 | 文件 |
|------|------|
| 重写 | `HomePage.tsx` + `HomePage.css` |
| 重写 | `EcosystemPage.tsx` + `EcosystemPage.css` |
| 重写 | `DeveloperPage.tsx` + `DeveloperPage.css` |
| 重写 | `Navbar.tsx` + `Footer.tsx` |
| 重写 | `App.tsx` |
| 新增 | `TechnologyPage.tsx` + `TechnologyPage.css` |
| 新增 | `ProductsPage.tsx` + `ProductsPage.css` |
