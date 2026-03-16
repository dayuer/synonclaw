# Beta 补充笔记 — GNB 多租户 Passcode 网络隔离策略

## 已完成（Alpha TODO 勾选）

- [x] 边界情况：B4 心跳去抖（`CommandDispatcher.onHeartbeat` 60s 时间窗口）
- [x] 测试修复：device.lastSeen 初始化为 null 避免去抖拦截测试
- [x] 测试修复：PasscodeManager 并发分配测试 — 模拟设备注册写入 store

## 未完成（留待后续迭代）

- [ ] B6 provision.sh 断网 cron 重试
- [ ] B7 Redis 宕机降级
- [ ] B8 Tier 升级回滚
- [ ] VIP_POOL_EXHAUSTED / NODE_ID_EXHAUSTED 的 HTTP 响应封装
- [ ] hw_fingerprint UUID 格式校验
- [ ] 场景 5.2, 5.3 容器异常/删除测试

## 发现的问题

| # | 问题 | 严重度 | 建议 |
|---|------|--------|------|
| 1 | `deriveSubnetOctet` 哈希碰撞风险 | Medium | 在 `createDedicatedNetwork` 中检查已用网段 |
| 2 | 设备端脚本用 grep 解析 JSON | Low | 生产镜像预装 jq |
| 3 | `isVipAllocated` 查设备列表性能 | Low | PG 迁移后用索引查询 |

## 对 Alpha 架构的反馈

- 💡 IStore 接口设计清晰，依赖倒置到位，PG 迁移将非常顺滑
- 💡 建议 PasscodeManager 内部维护一个 Set 追踪「已分配但未注册」的 VIP，防止分配-注册之间的竞态

## 测试结果

- ✅ 全部通过 30/30
