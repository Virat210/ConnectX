#!/usr/bin/env bash
# ==============================================================================
# ConnectX — Automated Coturn TURN/STUN Server Installer for Ubuntu / Debian
# ==============================================================================
# Usage on your Linux VPS:
#   chmod +x setup-coturn.sh
#   sudo ./setup-coturn.sh
# ==============================================================================

set -e

# Color helpers
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}  ConnectX WebRTC — Automated Coturn Deployment Script ${NC}"
echo -e "${BLUE}======================================================${NC}"

# 1. Verify root privileges
if [ "$EUID" -ne 0 ]; then
  echo -e "${RED}Error: This script must be run as root (use sudo).${NC}"
  exit 1
fi

# 2. Detect Public IP address
PUBLIC_IP=$(curl -s4 https://ifconfig.me || curl -s4 https://api.ipify.org || echo "")
echo -e "${GREEN}Detected Public IP:${NC} ${PUBLIC_IP:-Unknown}"

# 3. Prompt for Domain Name (Optional, but recommended for TLS)
read -rp "Enter your TURN Domain Name (e.g. turn.yourdomain.com) or press ENTER to use Public IP: " USER_DOMAIN

if [ -n "$USER_DOMAIN" ]; then
  TURN_REALM="$USER_DOMAIN"
  TURN_HOST="$USER_DOMAIN"
else
  TURN_REALM="${PUBLIC_IP:-connectx-turn}"
  TURN_HOST="${PUBLIC_IP:-127.0.0.1}"
fi

# 4. Generate Cryptographically Secure Auth Secret
GENERATED_SECRET=$(openssl rand -hex 32)

echo -e "\n${YELLOW}Configuring Coturn with:${NC}"
echo -e "  Host / Domain: ${GREEN}$TURN_HOST${NC}"
echo -e "  Realm:         ${GREEN}$TURN_REALM${NC}"
echo -e "  Auth Secret:   ${GREEN}$GENERATED_SECRET${NC}"

# 5. Update packages and install Coturn
echo -e "\n${BLUE}--> Installing coturn package...${NC}"
apt-get update -qq
apt-get install -y coturn ufw curl openssl

# 6. Backup existing configuration if present
if [ -f /etc/turnserver.conf ]; then
  cp /etc/turnserver.conf /etc/turnserver.conf.bak."$(date +%s)"
fi

# 7. Write production turnserver.conf
echo -e "${BLUE}--> Generating /etc/turnserver.conf...${NC}"
cat > /etc/turnserver.conf <<EOF
# ConnectX Production Coturn Configuration
listening-port=3478
tls-listening-port=5349
alt-listening-port=0
alt-tls-listening-port=0

min-port=49152
max-port=65535

fingerprint
lt-cred-mech
use-auth-secret
static-auth-secret=$GENERATED_SECRET
realm=$TURN_REALM

no-multicast-peers
no-loopback-peers
no-cli
stale-nonce=600

syslog
no-stdout-log
max-allocate-lifetime=3600
channel-lifetime=600
permission-lifetime=300
EOF

# If the server is behind 1:1 NAT (like AWS EC2, GCP), map external IP
PRIVATE_IP=$(hostname -I | awk '{print $1}')
if [ -n "$PUBLIC_IP" ] && [ "$PUBLIC_IP" != "$PRIVATE_IP" ] && [ -n "$PRIVATE_IP" ]; then
  echo "external-ip=$PUBLIC_IP/$PRIVATE_IP" >> /etc/turnserver.conf
  echo -e "  Added 1:1 NAT mapping: external-ip=$PUBLIC_IP/$PRIVATE_IP"
elif [ -n "$PUBLIC_IP" ]; then
  echo "external-ip=$PUBLIC_IP" >> /etc/turnserver.conf
fi

# 8. Enable Coturn daemon in /etc/default/coturn
if [ -f /etc/default/coturn ]; then
  sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn
  sed -i 's/TURNSERVER_ENABLED=0/TURNSERVER_ENABLED=1/' /etc/default/coturn
fi

# 9. Configure Firewall (UFW)
echo -e "\n${BLUE}--> Configuring firewall ports...${NC}"
# Ensure SSH remains accessible
ufw allow 22/tcp || true
# Standard STUN/TURN listening ports
ufw allow 3478/tcp
ufw allow 3478/udp
# TLS Encrypted TURNS listening ports
ufw allow 5349/tcp
ufw allow 5349/udp
# Dynamic WebRTC Media Relay range
ufw allow 49152:65535/udp
ufw --force enable

# 10. Restart and enable Coturn systemd service
echo -e "\n${BLUE}--> Starting Coturn service...${NC}"
systemctl daemon-reload
systemctl enable coturn
systemctl restart coturn

# 11. Verify service status
sleep 2
if systemctl is-active --quiet coturn; then
  echo -e "${GREEN}✓ Coturn service is active and running!${NC}"
else
  echo -e "${RED}✗ Warning: Coturn failed to start. Check logs with: journalctl -u coturn -e${NC}"
fi

# 12. Display final environment variables for ConnectX backend
echo -e "\n${GREEN}======================================================${NC}"
echo -e "${GREEN}✓ COTURN DEPLOYMENT COMPLETE!${NC}"
echo -e "${GREEN}======================================================${NC}"
echo -e "\nAdd these variables to your ConnectX ${YELLOW}backend/.env${NC} file:\n"
echo -e "WEBRTC_STUN_SERVER=stun:$TURN_HOST:3478"
echo -e "WEBRTC_TURN_SERVER=$TURN_HOST"
echo -e "WEBRTC_TURN_PORT=3478"
echo -e "WEBRTC_TURN_TLS_PORT=5349"
echo -e "WEBRTC_TURN_REALM=$TURN_REALM"
echo -e "WEBRTC_TURN_SECRET=$GENERATED_SECRET"
echo -e "\n${BLUE}Note:${NC} Restart your ConnectX backend server after updating .env.\n"
EOF
