#!/bin/bash
# 心跳上报脚本 — cron 每 60 秒执行
# @alpha: 设备主动向 SaaS 上报在线状态
set -euo pipefail

SAAS_VIP="${SAAS_VIP:-10.1.0.1}"
SERIAL_NO=$(cat /etc/openclaw/serial_no 2>/dev/null || hostname)
GNB_IF="${GNB_IF:-gnb_tun}"

# 通过 GNB 虚拟网络上报心跳
curl -sS --max-time 10 \
  --interface "$GNB_IF" \
  -X GET "http://${SAAS_VIP}:8080/api/heartbeat?serialNo=${SERIAL_NO}" \
  > /dev/null 2>&1 || true
