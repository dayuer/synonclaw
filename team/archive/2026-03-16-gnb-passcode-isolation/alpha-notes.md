# Alpha 实现笔记 — GNB 多租户 Passcode 网络隔离策略

## 技术决策

| 决策 | 选项 A | 选项 B | 选择 | 理由 |
|------|--------|--------|------|------|
| 存储层 | 直接 PG | IStore 接口 + MemoryStore | B | 解耦存储实现，测试零依赖，后续一行代码切 PG |
| VIP 分配 | 随机分配 | 顺序遍历首个空闲 | B | 顺序分配可预测、调试友好，随机分配碎片化 |
| Passcode 生成 | UUID 截取 | crypto.randomBytes(4) | B | 符合 GNB 32 位 hex 规范 |
| 容器管理 | 直接调 Docker API | 接口抽象 + Mock | B | 当前阶段无 Docker 环境，接口设计到位后续对接零改动 |
| 设备不存在时推送 | 静默跳过 | 进入 RETRY 状态 | B | 设备可能后续才注册完成，保证指令不丢失 |

## 已完成

- [x] 领域类型定义 (`types.ts`) — 12 个类型 + 配置常量
- [x] 存储层 (`store.ts`) — IStore 接口 + MemoryStore 实现
- [x] PasscodeManager — 共享/独立网络创建 + VIP/NodeID 分配
- [x] TierEngine — Tier 判定 + 升级迁移编排
- [x] ContainerManager — 接口 + Mock 实现
- [x] DeviceRegistrar — 幂等注册 + 参数校验
- [x] CommandDispatcher — 指令创建/推送/重试/心跳补发
- [x] 4 组测试全部通过 (30/30)
- [x] 4 个设备端脚本 (provision/firewall/bridge/heartbeat)

## Beta TODO（交接给 Beta 的任务）

- [ ] 错误处理：VIP_POOL_EXHAUSTED 和 NODE_ID_EXHAUSTED 的 HTTP 503 响应封装
- [ ] 边界情况：B4 心跳去抖（60s 内不重复触发补发）
- [ ] 边界情况：B6 provision.sh 断网重试的 cron job 配置
- [ ] 边界情况：B7 Redis 宕机时的降级逻辑
- [ ] 边界情况：B8 Tier 升级回滚机制
- [ ] 参数校验：hw_fingerprint 格式校验（UUID 格式）
- [ ] 补充测试：覆盖 BA 场景 1.5, 1.6 (池耗尽场景)
- [ ] 补充测试：覆盖 BA 场景 5.2, 5.3 (容器异常退出/租户删除)
- [ ] socat 桥接服务：provision.sh 中 VIP 占位符替换逻辑
- [ ] 心跳去抖：CommandDispatcher.onHeartbeat 添加 60s 时间窗口检查

## 已知风险

- ⚠️ PasscodeManager 的 VIP 分配依赖 store.isVipAllocated（查设备列表），分配和设备创建不在同一事务 — PG 实现时需原子操作
- ⚠️ deriveSubnetOctet 用哈希映射可能产生碰撞（不同 tenantId 映射到同一 subnet） — 需在 createDedicatedNetwork 中检查冲突
- ⚠️ 设备端脚本使用 grep 解析 JSON 响应而非 jq — 生产环境应替换为 jq
