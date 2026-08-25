#!/usr/bin/env bash
set -e

BOLD="\033[1m"
GREEN="\033[0;32m"
CYAN="\033[0;36m"
YELLOW="\033[1;33m"
RED="\033[0;31m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}========================================================================${RESET}"
echo -e "${CYAN}${BOLD}       DFL TikTok Gaming Suite — Automated Linux Installer              ${RESET}"
echo -e "${CYAN}${BOLD}========================================================================${RESET}"

if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}[ERROR] Please run this installer with root privileges (sudo bash install.sh)${RESET}"
  exit 1
fi

INSTALL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
echo -e "${CYAN}[+] Installing into:${RESET} ${INSTALL_DIR}"

if command -v apt-get &>/dev/null; then
  apt-get update -qq
  apt-get install -y -qq curl git ffmpeg unzip
fi

NODE_PATH="$(which node)"
NPM_PATH="$(which npm)"

cd "$INSTALL_DIR"
mkdir -p data/uploads data/generated data/projects

$NPM_PATH install
$NPM_PATH run build

cat << SERVICE_EOF > /etc/systemd/system/dfl-tiktokgaming.service
[Unit]
Description=DFL TikTok Gaming Suite - Open-World, Survival, Crafting & Automation Video Producer
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}
ExecStart=${NODE_PATH} ${INSTALL_DIR}/dist-server/index.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production
Environment=PORT=4005

[Install]
WantedBy=multi-user.target
SERVICE_EOF

systemctl daemon-reload
systemctl enable dfl-tiktokgaming.service
systemctl restart dfl-tiktokgaming.service

LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}' || echo "localhost")

echo -e "\n${GREEN}${BOLD}========================================================================${RESET}"
echo -e "${GREEN}${BOLD}                   INSTALLATION COMPLETE! 🎮                            ${RESET}"
echo -e "${GREEN}${BOLD}========================================================================${RESET}"
echo -e "Access the studio in your browser at:"
echo -e "  ➜  ${CYAN}${BOLD}http://${LOCAL_IP}:4005${RESET}"
echo -e "  ➜  ${CYAN}${BOLD}http://localhost:4005${RESET}"
