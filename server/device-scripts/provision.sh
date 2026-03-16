#!/bin/bash
# 设备首次注册脚本 — 通电后自动执行
# @alpha: 通过 HTTPS 向 SaaS 注册，获取 GNB 配置，启动所有服务
set -euo pipefail

SAAS_API="${SAAS_API_URL:-https://api.synonclaw.com}"
SERIAL_NO=$(cat /etc/openclaw/serial_no 2>/dev/null || hostname)
HW_FINGERPRINT=$(cat /sys/class/dmi/id/product_uuid 2>/dev/null || uuidgen)
CONFIG_DIR="/opt/openclaw/config/gnb"
LOG_FILE="/var/log/openclaw/provision.log"
MAX_RETRIES=3

log() { echo "[$(date '+%Y-%m-%d %H:%M:%S')] $*" | tee -a "$LOG_FILE"; }

register_device() {
  local response
  response=$(curl -sS --max-time 30 \
    -X POST "${SAAS_API}/api/devices/register" \
    -H 'Content-Type: application/json' \
    -d "{\"serialNo\":\"${SERIAL_NO}\",\"hwFingerprint\":\"${HW_FINGERPRINT}\"}")

  echo "$response"
}

write_gnb_config() {
  local passcode="$1" vip="$2" node_id="$3" index_addr="$4"

  mkdir -p "$CONFIG_DIR"
  cat > "${CONFIG_DIR}/node.conf" <<EOF
nodeid ${node_id}
listen 9001
EOF

  cat > "${CONFIG_DIR}/address.conf" <<EOF
# SaaS 控制节点
node 1001 ${index_addr}
EOF

  # 写入 Passcode（GNB 启动参数）
  echo "$passcode" > "${CONFIG_DIR}/passcode"
  echo "$vip" > "${CONFIG_DIR}/vip"

  log "GNB 配置已写入: node_id=${node_id}, vip=${vip}"
}

start_services() {
  local vip="$1"

  # 启动 GNB
  systemctl enable gnb --now 2>/dev/null || log "WARN: systemctl 不可用，手动启动 GNB"

  # 配置 socat 桥接
  sed -i "s|bind=.*,|bind=${vip},|" /etc/systemd/system/openclaw-gnb-bridge.service 2>/dev/null || true
  systemctl enable openclaw-gnb-bridge --now 2>/dev/null || true

  # 配置防火墙
  bash /opt/openclaw/config/firewall.sh

  log "所有服务已启动"
}

# --- 主流程 ---
log "=== 开始设备注册 ==="
log "Serial: ${SERIAL_NO}, Fingerprint: ${HW_FINGERPRINT}"

for attempt in $(seq 1 $MAX_RETRIES); do
  log "注册尝试 ${attempt}/${MAX_RETRIES}..."
  response=$(register_device) && break || {
    log "ERROR: 注册失败，${attempt}/${MAX_RETRIES}"
    sleep $((attempt * 60))
  }
done

if [ -z "${response:-}" ]; then
  log "FATAL: 注册失败，已重试 ${MAX_RETRIES} 次"
  exit 1
fi

# 解析响应
passcode=$(echo "$response" | grep -o '"passcode":"[^"]*"' | cut -d'"' -f4)
vip=$(echo "$response" | grep -o '"vip":"[^"]*"' | cut -d'"' -f4)
node_id=$(echo "$response" | grep -o '"nodeId":[0-9]*' | cut -d: -f2)
index_addr=$(echo "$response" | grep -o '"indexAddress":"[^"]*"' | cut -d'"' -f4)

write_gnb_config "$passcode" "$vip" "$node_id" "$index_addr"
start_services "$vip"

log "=== 设备注册完成 ==="
