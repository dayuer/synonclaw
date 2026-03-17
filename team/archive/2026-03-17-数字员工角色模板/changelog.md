# Changelog — 数字员工角色模板

> 2026-03-17

## 新增

- **数字员工角色模板系统** — 创建数字员工时可从 8 个预置模板中选择，自动填充角色名/描述/System Prompt/插件
- 模板分组：通用（智能助手、客服专员、财务助手）/ 金融（基本面分析师、情绪分析师、新闻分析师、技术分析师）/ 技术（代码助手）
- 新增 `WorkerTemplate` 类型和 `WORKER_TEMPLATES` 常量
- 新增 5 个模板数据完整性测试

## 变更文件

- `src/admin/data/types.ts` — 新增 `WorkerTemplate`, `WorkerTemplateGroup`, `WORKER_TEMPLATES`, `WORKER_TEMPLATE_GROUPS`
- `src/admin/pages/WorkersPage.tsx` — 创建模态框增加模板选择器
- `src/admin/data/__tests__/mockData.test.ts` — 新增 5 个测试用例（总计 83）
