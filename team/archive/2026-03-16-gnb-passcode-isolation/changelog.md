# Changelog — GNB 多租户 Passcode 网络隔离策略

## [1.1.0] — 2026-03-16

### 新增

- **GNB 网络管理模块** (`server/src/gnb/`)
  - `types.ts` — 12 个领域类型 + GNB_CONFIG 配置常量
  - `store.ts` — IStore 接口 + MemoryStore 实现（后续替换 PG）
  - `passcode-manager.ts` — Passcode/VIP/NodeID 分配与管理
  - `tier-engine.ts` — Tier 1/2 分级判定 + 升级迁移编排
  - `container-manager.ts` — IGnbContainerManager 接口 + MockContainerManager
  - `device-registrar.ts` — 幂等设备注册 + 参数校验
  - `command-dispatcher.ts` — 指令创建/推送/重试/心跳补发 + 去抖

- **设备端脚本** (`server/device-scripts/`)
  - `provision.sh` — 设备首次注册自动化
  - `firewall.sh` — Tier 1 iptables 隔离规则
  - `gnb-bridge.service` — socat 桥接 systemd 服务
  - `heartbeat.sh` — 60s 心跳上报

- **测试** (`server/src/gnb/__tests__/`)
  - 4 组测试文件，30 个测试用例，全部通过
  - P0 场景 100% 覆盖

### 变更

- `package.json` — 新增 `test:server` 脚本
