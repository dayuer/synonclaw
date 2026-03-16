#!/bin/bash
# Tier 1 设备防火墙规则 — 仅允许与 SaaS VIP 通信
# @alpha: 设备启动时由 provision.sh 或 systemd 调用
set -euo pipefail

SAAS_VIP="${SAAS_VIP:-10.1.0.1}"
GNB_IF="${GNB_IF:-gnb_tun}"

# 清理旧规则（幂等）
iptables -D INPUT   -i "$GNB_IF" -j DROP 2>/dev/null || true
iptables -D OUTPUT  -o "$GNB_IF" -j DROP 2>/dev/null || true
iptables -D FORWARD -i "$GNB_IF" -j DROP 2>/dev/null || true

# 默认拒绝 GNB 网卡上所有流量
iptables -A INPUT   -i "$GNB_IF" -j DROP
iptables -A OUTPUT  -o "$GNB_IF" -j DROP
iptables -A FORWARD -i "$GNB_IF" -j DROP

# 仅允许与 SaaS VIP 通信
iptables -I INPUT  1 -i "$GNB_IF" -s "$SAAS_VIP" -j ACCEPT
iptables -I OUTPUT 1 -o "$GNB_IF" -d "$SAAS_VIP" -j ACCEPT

# 允许 ICMP（链路检测）
iptables -I INPUT  2 -i "$GNB_IF" -s "$SAAS_VIP" -p icmp -j ACCEPT
iptables -I OUTPUT 2 -o "$GNB_IF" -d "$SAAS_VIP" -p icmp -j ACCEPT

echo "[$(date '+%Y-%m-%d %H:%M:%S')] iptables 防火墙已配置: 仅允许 ${SAAS_VIP} 通过 ${GNB_IF}"
