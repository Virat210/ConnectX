# ConnectX — Production Coturn TURN/STUN Infrastructure Guide

This guide details how to deploy and configure a production-grade **Coturn** TURN/STUN relay server for **ConnectX**.

---

## 1. Why is a TURN Server Required?

In standard peer-to-peer WebRTC:
- **Direct P2P / STUN**: Works when peers are on the same local network or behind lenient NATs (Full Cone, Restricted Cone).
- **Symmetric NAT / Restrictive Firewalls**: In corporate networks, universities, 4G/5G mobile carriers, and hotel Wi-Fi, direct peer-to-peer connections are blocked by symmetric NATs.
- **TURN (Traversal Using Relays around NAT)**: Acts as an encrypted media relay. When direct peer connection fails, WebRTC media streams are relayed through your Coturn server, guaranteeing connection success between any two users worldwide.

> **CRITICAL NOTE ON CLOUDFLARE TUNNEL**:
> Cloudflare Tunnels (`trycloudflare.com` / `cloudflared`) only proxy HTTP/HTTPS and WebSockets. **They do not support raw UDP/TCP media relaying**. You cannot use Cloudflare Tunnel as a TURN server.

---

## 2. Server & VPS Requirements

A minimal Linux VPS is sufficient to relay thousands of audio/video minutes per month:
- **OS**: Ubuntu 22.04 LTS / Ubuntu 24.04 LTS or Debian 12
- **Specifications**: 1 vCPU, 1 GB RAM, 20 GB SSD
- **Network**: Dedicated Public IPv4 address
- **Affordable Providers**:
  - DigitalOcean ($4 - $6/month)
  - Hetzner Cloud (~€3.50/month)
  - Vultr / Linode ($5/month)
  - AWS Lightsail ($3.50/month) or EC2 `t4g.nano`
  - Oracle Cloud Free Tier (Always Free Compute Instance)

---

## 3. Required Firewall / Security Group Ports

Before starting Coturn, open these ports in your cloud provider's firewall (AWS Security Group, DigitalOcean Firewall, Hetzner Firewall, etc.):

| Port Range | Protocol | Purpose |
|---|---|---|
| **3478** | **UDP & TCP** | Standard STUN & TURN listening port |
| **5349** | **UDP & TCP** | Encrypted TURNS (TLS/DTLS) listening port |
| **49152 – 65535** | **UDP** | Dynamic media relay port range (RTP/RTCP packets) |
| **22** | **TCP** | SSH remote server management |

---

## 4. Automated 2-Minute Deployment

### Option A: Using the Automated Script (Recommended)

1. SSH into your Linux VPS:
   ```bash
   ssh root@YOUR_SERVER_IP
   ```

2. Download and run the setup script:
   ```bash
   # Upload setup-coturn.sh to your server or curl it:
   chmod +x setup-coturn.sh
   sudo ./setup-coturn.sh
   ```

3. The script will:
   - Install `coturn`, `ufw`, and `openssl`.
   - Prompt for your domain or default to your public IP.
   - Generate a secure 32-byte hex secret (`openssl rand -hex 32`).
   - Configure `/etc/turnserver.conf`.
   - Open all necessary firewall ports in `ufw`.
   - Enable and launch the systemd service.
   - Print the exact `.env` lines to paste into your ConnectX backend.

---

### Option B: Manual Installation

1. Install Coturn:
   ```bash
   sudo apt-get update
   sudo apt-get install -y coturn
   ```

2. Enable the daemon in `/etc/default/coturn`:
   ```bash
   sudo sed -i 's/#TURNSERVER_ENABLED=1/TURNSERVER_ENABLED=1/' /etc/default/coturn
   ```

3. Copy `coturn/turnserver.conf` to `/etc/turnserver.conf`.

4. Generate a secret and replace `YOUR_STATIC_AUTH_SECRET`:
   ```bash
   openssl rand -hex 32
   ```

5. Restart the service:
   ```bash
   sudo systemctl restart coturn
   sudo systemctl enable coturn
   ```

6. Verify that Coturn is listening on port 3478:
   ```bash
   sudo ss -tulpn | grep 3478
   ```

---

## 5. SSL / TLS Setup for TURNS (Port 5349)

To support corporate firewalls that block all non-TLS traffic, configure Let's Encrypt SSL:

1. Point your domain A-record to your server IP (e.g. `turn.yourdomain.com -> 203.0.113.50`).
2. Install Certbot:
   ```bash
   sudo apt-get install -y certbot
   sudo certbot certonly --standalone -d turn.yourdomain.com
   ```
3. Update `/etc/turnserver.conf` with the certificate paths:
   ```ini
   cert=/etc/letsencrypt/live/turn.yourdomain.com/fullchain.pem
   pkey=/etc/letsencrypt/live/turn.yourdomain.com/privkey.pem
   ```
4. Restart Coturn:
   ```bash
   sudo systemctl restart coturn
   ```

---

## 6. Configuring ConnectX Backend

Once your Coturn server is live, update `backend/.env`:

```env
# Point to your TURN domain or public IP:
WEBRTC_STUN_SERVER=stun:turn.yourdomain.com:3478
WEBRTC_TURN_SERVER=turn.yourdomain.com
WEBRTC_TURN_PORT=3478
WEBRTC_TURN_TLS_PORT=5349
WEBRTC_TURN_REALM=turn.yourdomain.com

# The exact static-auth-secret from your turnserver.conf:
WEBRTC_TURN_SECRET=your_32_byte_generated_hex_secret_here
```

Restart your ConnectX server:
```bash
npm start
```

---

## 7. How to Test Your TURN Server

### Test with WebRTC Trickle ICE Tool
1. Visit the standard WebRTC test tool: [Trickle ICE (WebRTC Test)](https://webrtc.github.io/samples/src/content/peerconnection/trickle-ice/)
2. Under **ICE servers**, add your TURN server:
   - STUN or TURN URI: `turn:YOUR_SERVER_IP:3478?transport=udp`
   - TURN username: `testuser` (or generated ephemeral user)
   - TURN password: `testpassword` (or generated token)
3. Click **Gather candidates**.
4. If you see candidate components with type **`relay`**, your TURN server is working!
