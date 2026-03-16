# Changelog

## 2026-03-16 — GNB 操作面板

### 新增

- **节点注册**：网络页新增「注册节点」按钮 + 模态框（UUID/IP/类型/加密/Passcode 输入 + 客户端校验 + 服务端唯一性校验）
- **Passcode Web 控制**：节点详情页 Passcode 字段增加「编辑」按钮，支持在线更新安全凭证（格式校验 `0xXXXXXXXX`）
- **私域子网规划**：网络页新增第三个 Tab「私域」，支持创建/删除子网（名称/CIDR/Passcode），节点通过 CIDR 自动匹配归属子网
- **`Subnet` 类型**：`types.ts` 新增私域子网接口
- **6 个数据层函数**：`registerGnbNode`、`updateGnbPasscode`、`getSubnets`、`addSubnet`、`removeSubnet`、`getSubnetMembers`
- **`ipToCidrMatch` 工具函数**：判断 IPv4 地址是否属于 CIDR 段
- **10 个 TDD 测试用例**：覆盖节点注册（成功/UUID重复/IP重复）、Passcode 更新、子网 CRUD

### 变更

- **NetworkPage.tsx**：从只读双 Tab 拓扑展示升级为完整三 Tab GNB 操作面板
- **`ActivityType`**：扩展 4 个事件类型（`node_registered` / `passcode_changed` / `subnet_created` / `subnet_removed`）
- **`admin.css`**：新增 `subnet-grid` / `subnet-card` 样式集
- **`AGENTS.md`**：同步更新架构文档

### 测试

- 78 / 78 测试全绿
- TypeScript 编译零错误
