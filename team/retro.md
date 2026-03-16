# 迭代复盘 — GNB 多租户 Passcode 网络隔离策略

## 做得好的

- TDD 流程严格执行，先写测试再实现，2 个 Bug 在测试阶段即发现修复
- IStore 依赖倒置设计优秀，MemoryStore 让测试零外部依赖
- 类型定义（`types.ts`）集中管理，领域语言清晰
- BA 场景矩阵驱动测试设计，P0 场景 100% 覆盖

## 需要改进的

- PasscodeManager 的 VIP 分配与设备注册不在同一事务，存在竞态风险
- `deriveSubnetOctet` 哈希映射碰撞未做运行时检查
- 设备端脚本用 grep 解析 JSON，应预装 jq
- P1 场景覆盖率仅 40%，需要后续迭代补充

## 行动项

- 后续 PG 迁移时，VIP/NodeID 分配必须使用数据库事务
- `createDedicatedNetwork` 需增加子网唯一性检查
- 生产镜像 Dockerfile 预装 jq
