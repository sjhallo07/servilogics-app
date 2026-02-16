#!/usr/bin/env bash
set -euo pipefail

# assign_local_ip.sh
# Simple helper to add a temporary IPv4 address to a network interface (requires sudo)
# Usage: ./scripts/assign_local_ip.sh 192.168.100.82 eth0

SKIP_CONFIRM=false

while [[ $# -gt 0 ]]; do
  case "$1" in
    -y|--yes) SKIP_CONFIRM=true; shift ;;
    -h|--help) echo "Usage: $0 [ -y ] <IP/CIDR> [interface]"; exit 0 ;;
    *) break ;;
  esac
done

if [ "$#" -lt 1 ]; then
  echo "Usage: $0 [ -y ] <IP/CIDR> [interface]"
  echo "Example: $0 192.168.100.82/24 eth0"
  exit 1
fi

IP_CIDR="$1"
IFACE="${2:-eth0}"

if ! command -v ip >/dev/null 2>&1; then
  echo "This script requires the 'ip' command (iproute2)." >&2
  exit 1
fi

echo "About to add IP $IP_CIDR to interface $IFACE"
if [ "$SKIP_CONFIRM" = false ]; then
  read -p "Proceed? [y/N]: " ans
  ans=${ans:-N}
  if [[ ! "$ans" =~ ^[Yy]$ ]]; then
    echo "Aborted by user"
    exit 0
  fi
fi

sudo ip addr add "$IP_CIDR" dev "$IFACE"
if [ $? -eq 0 ]; then
  echo "✅ IP $IP_CIDR added to $IFACE"
  echo "To remove it later: sudo ip addr del $IP_CIDR dev $IFACE"
else
  echo "❌ Failed to add IP $IP_CIDR to $IFACE" >&2
  exit 1
fi
