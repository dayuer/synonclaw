# Alpha 技术笔记

## 技术决策

1. **路由隔离策略**：在 `App.tsx` 中通过 `useLocation()` 检测 `/admin` 前缀，admin 路由使用完全独立的布局树，不加载 Navbar/Footer。
2. **Mock 数据层**：使用模块级 `let` 变量 + 纯函数操作，无需 Context/useReducer。跨页面状态一致性通过模块闭包天然保证。
3. **计数器动画**：Dashboard StatCard 使用 `requestAnimationFrame` + `easeOutExpo` 缓动，避免 `setInterval` 的性能损耗。
4. **CSS 架构**：`admin.css` 独立于官网样式，通过 `AdminLayout.tsx` import，仅在 admin 路由下加载。全部复用 `tokens.css` 变量。
5. **OpenClaw 集成预留**：基于 `oss/routers/openclaw.py` 的 22 个 REST 端点研究，在 Settings 页预留了 Token + Endpoint 配置入口和 RPC 接口文档展示。

## 测试结果

```
✅ tsc -b: 0 errors
✅ vite build: 70 modules, 471ms
✅ 浏览器验证: 6 页面全部正常渲染，无控制台错误
```

## 文件清单（17 个新增 + 1 个修改）

| 文件 | 职责 |
|------|------|
| `src/admin/data/types.ts` | 领域实体类型 + 状态标签映射 |
| `src/admin/data/mockData.ts` | Mock 数据 + CRUD 函数 |
| `src/admin/styles/admin.css` | Admin 完整样式系统 (600+ 行) |
| `src/admin/layout/AdminLayout.tsx` | 主布局 + 嵌套路由 |
| `src/admin/layout/AdminSidebar.tsx` | 侧边栏导航 |
| `src/admin/layout/AdminTopBar.tsx` | 顶栏 |
| `src/admin/pages/DashboardPage.tsx` | 仪表盘 |
| `src/admin/pages/ProductsPage.tsx` | 产品管理 |
| `src/admin/pages/CustomersPage.tsx` | 客户管理 |
| `src/admin/pages/OrdersPage.tsx` | 订单管理 |
| `src/admin/pages/DevelopersPage.tsx` | 开发者网络 |
| `src/admin/pages/SettingsPage.tsx` | 系统设置 |
| `src/App.tsx` (修改) | admin 路由集成 |

## Beta TODO

- 边界测试覆盖（空状态、长文本、窄屏适配）
- 表单校验的更多边界（负数价格、超长名称）
- 产品管理的删除功能（当前仅有上下架）
