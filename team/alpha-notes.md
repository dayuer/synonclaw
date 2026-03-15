# Alpha Notes — 设备自助添加

## 变更摘要

从管理员后台 `DevicesPage.tsx` 移除了所有设备添加相关的 UI 和逻辑：

| 移除项 | 具体内容 |
|--------|----------|
| UI | 「+ 添加设备」按钮 |
| UI | 设备添加模态框（Token/Endpoint/客户选择） |
| UI | 配额提示（x/y 设备配额） |
| 代码 | `AddDeviceForm` 接口、`EMPTY_FORM` 常量 |
| 代码 | `handleAdd()`、`validate()`、`handleCustomerChange()` |
| 代码 | `showAddModal`、`form`、`errors`、`quotaError` 状态 |
| Import | `addDevice`、`canAddDevice`、`getCustomers` |

## 保留项

- 设备列表查看 + 状态筛选
- 设备详情 + 远程配置入口
- 解除托管（removeDevice）
- 数据层 `addDevice` 函数（供未来客户端 API 使用）

## 空状态文案变更

- Before: "暂无设备 — 点击'添加设备'通过 Token 托管 OpenClaw 节点"
- After: "暂无托管设备 — 设备将在客户绑定 Token 后自动出现"

## 验证结果

- TS 编译: 0 错误
- Vitest: 29/29 通过
- 浏览器: 已确认无添加按钮

## Beta TODO

- S 级无需 Beta 补充
