# ConnectX

> A professional, real-world video conferencing web application engineered for secure, low-latency communication, real-time collaboration, and enterprise scalability.

[![Node.js](https://img.shields.io/badge/Node.js-v20%2B-green?logo=node.js)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-8.3-purple?logo=vite)](https://vitejs.dev)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.8-black?logo=socket.io)](https://socket.io)
[![WebRTC](https://img.shields.io/badge/WebRTC-Peer--to--Peer-orange?logo=webrtc)](https://webrtc.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%208-emerald?logo=mongodb)](https://mongodb.com)
[![License](https://img.shields.io/badge/License-MIT-green)](LICENSE)

---

## 1. Project Overview

**ConnectX** is a modern, full-stack video conferencing application built with React 19, Node.js, Express, Socket.IO, and WebRTC. It delivers seamless peer-to-peer audio/video streaming, instant meeting creation, room management, screen sharing, in-meeting chat, real-time reactions, audio visualizers, and interactive 3D network visuals.

The application is engineered with an integrated full-stack architecture: the backend provides a high-throughput REST API, secure JWT authentication with HTTP-only refresh cookies, real-time WebSocket signaling, dynamic WebRTC ICE server provisioning (STUN/TURN), and optionally serves the compiled frontend single-page application (SPA) from a single production instance.

---

## 2. Key Features

- **High-Definition Video & Audio**: Real-time peer-to-peer WebRTC mesh network with adaptive track management.
- **Audio & Video Controls**: Toggle camera, microphone, screen sharing, and audio visualizer in real time.
- **Instant & Scheduled Meetings**: Generate unique 9-digit meeting codes (`xxx-xxx-xxx`) or custom room identifiers.
- **Dynamic STUN/TURN Provisioning**: Ephemeral HMAC-SHA1 credentials via TURN REST API (RFC 5766) and Coturn automation for reliable symmetric NAT and firewall traversal.
- **Signaling Diagnostics**: Real-time logging of ICE candidate types (`host`, `srflx`, `relay`) and connection states (`connecting`, `connected`, `failed`, `disconnected`).
- **In-Meeting Chat**: Instant messaging between participants with timestamps and unread counters.
- **Real-Time Reactions**: Floating emoji reactions (👏, ❤️, 🎉, 👍, 🚀, 🔥) animated across all connected peers.
- **Screen Sharing**: One-click screen and application window capture with seamless stream renegotiation.
- **Meeting Host Controls**: Mute participants, manage access, end meetings for all, and view participant rosters.
- **Participant Roster**: Live list of active meeting attendees with mute and camera state indicators.
- **Authentication & Security**: Secure user registration, login, profile photo uploads (Base64 avatar), password updates, and account deletion.
- **JWT Authentication**: Short-lived access tokens with rotating HTTP-only refresh cookies and bcrypt password hashing.
- **Time-Aware Personalized Dashboard**: Dynamic greeting (Good Morning, Afternoon, Evening) based on the client's local time, meeting metrics, and recent meetings history.
- **Admin & Helpdesk**: Admin analytics overview, user status moderation, and integrated support ticket submission with email notifications (Resend).
- **Responsive 3D Experience**: Three.js particle mesh background on the landing page, dark/light theme switching, and glassmorphic UI.

---

## 3. Tech Stack

### Frontend
- **Framework**: React 19.2.8
- **Build Tool**: Vite 8.3.0
- **Routing**: React Router DOM 7.18.3
- **Styling**: Tailwind CSS v4, Lucide React icons
- **Animations**: Framer Motion 13.2.0, Three.js 0.186.0
- **Real-time Client**: Socket.IO Client 4.8.3

### Backend
- **Runtime**: Node.js (v20+)
- **Framework**: Express 4.21 with Express 5 TypeScript definitions
- **Language**: TypeScript 5.8.2 (compiled via `tsc`, hot-reloaded with `tsx`)
- **Database**: MongoDB with Mongoose 8.12.0
- **Signaling Server**: Socket.IO 4.8.1
- **Security**: Helmet, CORS, Express Rate Limit, Cookie-Parser, Zod validation
- **Authentication**: JSON Web Tokens (`jsonwebtoken`), Bcryptjs
- **Email Delivery**: Resend API 4.1.2

### WebRTC & Infrastructure
- **Signaling Protocol**: WebSocket (Socket.IO) with mesh renegotiation
- **NAT Traversal**: Google Public STUN (`stun:stun.l.google.com:19302`)
- **TURN Relay**: Coturn RFC 5766 TURN REST API with HMAC-SHA1 ephemeral credentials

---

## 4. Architecture

ConnectX supports both **Unified Full-Stack Deployment** (single service) and **Separated Multi-Tier Deployment**:

```
+---------------------------------------------------------------------------------+
|                                 CLIENT BROWSER                                  |
|                                                                                 |
|   +--------------------------+             +--------------------------------+   |
|   |   React 19 Frontend SPA  |             |      WebRTC Peer Connection    |   |
|   |  - MediaStream Controls  |             |  - getUserMedia (Cam/Mic)      |   |
|   |  - Audio Visualizer      |             |  - getDisplayMedia (Screen)    |   |
|   |  - Real-time Chat / Emojis             |  - ICE Gathering (STUN/TURN)   |   |
|   +------------+-------------+             +---------------+----------------+   |
+----------------|-------------------------------------------|--------------------+
                 | HTTP / REST API                           | WebSocket (Signaling)
                 v                                           v
+---------------------------------------------------------------------------------+
|                        CONNECTX PRODUCTION BACKEND SERVER                       |
|                             (Node.js / Express / TypeScript)                    |
|                                                                                 |
|   +-------------------------+                     +-------------------------+   |
|   |   REST API Endpoints    |                     |   Socket.IO Gateway     |   |
|   | - /api/auth             |                     | - Room Join/Leave       |   |
|   | - /api/meetings         |                     | - Offer / Answer Relay  |   |
|   | - /api/users            |                     | - ICE Candidate Relay   |   |
|   | - /api/webrtc           |                     | - Chat & Reaction Relay |   |
|   | - /api/support & admin  |                     | - Participant Sync      |   |
|   +------------+------------+                     +------------+------------+   |
|                |                                               |                |
|   +------------v-----------------------------------------------v------------+   |
|   |                   Static Single-Page Application Host                   |   |
|   |    Serves production client bundle from dist/ on root and SPA routes    |   |
|   +-------------------------------------------------------------------------+   |
+----------------------+------------------------------------+---------------------+
                       |                                    |
                       v                                    v
+-------------------------------+  +----------------------------------------------+
|     MongoDB Database          |  |           Coturn TURN / STUN Server          |
|  - Users & Profiles           |  |  - RFC 5766 Ephemeral Token Authentication   |
|  - Meeting History & Logs     |  |  - Relays RTP Audio/Video for Restricted NAT |
|  - Support Tickets            |  |  - Ports: 3478 UDP/TCP, 5349 TLS, 49152-65535|
+-------------------------------+  +----------------------------------------------+
```

---

## 5. Project Structure

```
connectX/
├── backend/                        # Node.js + Express + TypeScript backend
│   ├── src/
│   │   ├── config/                 # Environment validation (Zod) & DB connection
│   │   │   ├── db.ts
│   │   │   └── env.ts
│   │   ├── controllers/            # Request handlers (auth, meeting, user, admin, etc.)
│   │   ├── middleware/             # Auth, error handling, rate limiting
│   │   ├── models/                 # Mongoose schemas (User, Meeting, SupportTicket)
│   │   ├── routes/                 # Express API routes (/api/*)
│   │   │   ├── admin.routes.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── meeting.routes.ts
│   │   │   ├── support.routes.ts
│   │   │   ├── user.routes.ts
│   │   │   └── webrtc.routes.ts
│   │   ├── services/               # Business logic & email delivery (Resend)
│   │   ├── sockets/                # Socket.IO WebRTC signaling & room management
│   │   │   └── meeting.socket.ts
│   │   ├── utils/                  # Logger, token generators, HMAC credentials
│   │   ├── validators/             # Zod input schemas
│   │   ├── app.ts                  # Express application setup & static SPA serving
│   │   └── server.ts               # HTTP & Socket.IO server initialization
│   ├── .env.example                # Backend environment variable template
│   ├── package.json                # Backend dependencies and scripts
│   ├── README.md                   # Backend architecture documentation
│   └── tsconfig.json               # TypeScript compiler configuration
├── coturn/                         # TURN / STUN Server Setup & Configuration
│   ├── docker-compose.yml          # Containerized Coturn deployment
│   ├── README.md                   # Step-by-step Coturn setup & firewall guide
│   ├── setup-coturn.sh             # 1-click automated installation script for Ubuntu/Debian
│   └── turnserver.conf             # Production Coturn configuration template
├── public/                         # Static icons and assets
├── src/                            # React 19 Frontend application
│   ├── assets/                     # Graphic assets and branding
│   ├── components/                 # UI components (VideoGrid, VideoTile, ControlBar, etc.)
│   ├── context/                    # React Contexts (Auth, Meeting, Theme, Toast)
│   ├── hooks/                      # Custom hooks (useAuth, useMeeting, useSound)
│   ├── layouts/                    # MainLayout, DashboardLayout
│   ├── pages/                      # Views (Home, Dashboard, MeetingRoom, Profile, etc.)
│   ├── routes/                     # React Router definition
│   ├── utils/                      # API client (fetch) & Socket.IO client singleton
│   ├── App.jsx                     # Root application component
│   ├── index.css                   # Tailwind CSS imports and custom design tokens
│   └── main.jsx                    # React DOM entry point
├── .dockerignore                   # Exclusions for container builds
├── .env.example                    # Full-stack environment template
├── .gitignore                      # Git tracking exclusion rules
├── Dockerfile                      # Multi-stage production container build
├── index.html                      # HTML entry point with metadata & SEO tags
├── package.json                    # Root package manifest & deployment scripts
├── render.yaml                     # Render Blueprint specification for 1-click deployment
└── vite.config.js                  # Vite bundler configuration
```

---

## 6. Prerequisites

- **Node.js**: Version 20.0.0 or higher ([Download](https://nodejs.org))
- **npm**: Version 9.0.0 or higher
- **MongoDB**: Local MongoDB instance (v6+) or a free cloud database on [MongoDB Atlas](https://www.mongodb.com/atlas)
- **Git**: Version 2.30 or higher

---

## 7. Installation

Clone the repository and install all dependencies:

```bash
# 1. Clone the repository
git clone https://github.com/Virat210/ConnectX.git
cd ConnectX

# 2. Install root and frontend dependencies
npm install

# 3. Install backend dependencies (automatically triggered by postinstall, or run manually)
npm --prefix backend install
```

---

## 8. Environment Variables

Create your local `.env` files from the provided templates:

### Root / Frontend `.env.example`
For unified deployment, no variables are required in the frontend because API calls use relative paths. For separated deployment, create `.env` at root:
```env
# Optional: Only needed if frontend is hosted on a different domain than backend
VITE_API_URL=http://localhost:5000
VITE_SOCKET_URL=http://localhost:5000
```

### Backend `backend/.env`
Create `backend/.env` (or copy from `backend/.env.example`):
```env
NODE_ENV=development
PORT=5000

# MongoDB Connection String
MONGODB_URI=mongodb://127.0.0.1:27017/connectx

# Cryptographic JWT Secrets (minimum 16 characters each)
JWT_SECRET=connectx_super_secret_access_jwt_key_2026
JWT_REFRESH_SECRET=connectx_super_secret_refresh_jwt_key_2026

# Allowed Frontend URL for CORS
FRONTEND_URL=http://localhost:5173

# Optional: Email Service (Resend)
RESEND_API_KEY=
RESEND_FROM_EMAIL=onboarding@resend.dev
SUPPORT_EMAIL=viratchauhan1010@gmail.com

# WebRTC STUN & TURN
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=
WEBRTC_TURN_PORT=3478
WEBRTC_TURN_TLS_PORT=5349
WEBRTC_TURN_REALM=
WEBRTC_TURN_SECRET=
WEBRTC_TURN_USERNAME=
WEBRTC_TURN_CREDENTIAL=
```

> **IMPORTANT**: Never commit `.env` files to version control. Both `.env` and `backend/.env` are strictly excluded in `.gitignore`.

---

## 9. Local Development

You can run ConnectX locally using two terminal sessions:

### Terminal 1: Backend Server
```bash
npm run backend:dev
```
*Runs the Express + Socket.IO server at `http://localhost:5000` with TypeScript hot-reloading (`tsx watch`).*

### Terminal 2: Frontend Client
```bash
npm run dev
```
*Runs the Vite development server at `http://localhost:5173` with instant Hot Module Replacement (HMR).*

Open your browser and navigate to `http://localhost:5173`.

---

## 10. Frontend Setup

The frontend is a Vite + React 19 application configured with Tailwind CSS v4.

```bash
# Run frontend locally in dev mode
npm run dev

# Run Oxlint code analysis
npm run lint

# Build optimized production bundle
npm run build
```

---

## 11. Backend Setup

The backend is built with TypeScript and compiles to standard JavaScript:

```bash
# Navigate to backend directory
cd backend

# Run with hot reload (tsx)
npm run dev

# Compile TypeScript to dist/
npm run build

# Start compiled production server
npm start
```

---

## 12. Database Setup

ConnectX uses **MongoDB** via Mongoose.

### Option A: Local MongoDB
Ensure MongoDB service is active locally:
```bash
# Windows
net start MongoDB

# macOS (Homebrew)
brew services start mongodb-community

# Linux (systemd)
sudo systemctl start mongod
```
Set `MONGODB_URI=mongodb://127.0.0.1:27017/connectx` in `backend/.env`.

### Option B: MongoDB Atlas (Free Cloud Database)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas).
2. Create a free M0 cluster.
3. In **Database Access**, create a user with read/write privileges.
4. In **Network Access**, add `0.0.0.0/0` (allow access from anywhere) or your server's IP.
5. Copy your connection string into `backend/.env`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/connectx?retryWrites=true&w=majority
   ```

---

## 13. WebRTC Configuration

ConnectX establishes a full peer-to-peer mesh WebRTC architecture:
1. When a user creates or joins a meeting room, their browser fetches ICE server configurations from `/api/webrtc/ice-servers`.
2. Each participant joins the room via Socket.IO (`join-room`).
3. The server notifies existing peers (`user-connected`).
4. Connected peers create WebRTC `RTCPeerConnection` objects, exchange SDP offers/answers (`offer`, `answer`), and negotiate network paths (`ice-candidate`).
5. Audio and video tracks (`MediaStream`) are rendered in dynamic responsive video tiles.

---

## 14. STUN/TURN Configuration

### Why STUN and TURN are Required
- **STUN** allows peers behind basic NATs to discover their public IP and port. ConnectX uses Google's public STUN by default (`stun:stun.l.google.com:19302`).
- **TURN** is required when users are behind symmetric NATs, university firewalls, or cellular carriers that block direct peer-to-peer UDP traffic. TURN relays encrypted media traffic between peers.

### Coturn Setup
A production-ready Coturn configuration and automated setup script are included in the `coturn/` directory:

```bash
# 1-Click Coturn setup on an Ubuntu/Debian VPS
cd coturn
sudo chmod +x setup-coturn.sh
sudo ./setup-coturn.sh
```

The script configures `/etc/turnserver.conf`, opens required ports (`3478`, `5349`, and `49152-65535/udp`), generates a 32-byte HMAC secret, and outputs the exact environment variables to add to your backend `.env`.

See [`coturn/README.md`](coturn/README.md) for full instructions.

---

## 15. Authentication

ConnectX implements enterprise-grade dual-layer JWT authentication:
- **Access Token**: Short-lived JSON Web Token (15 minutes) passed in the `Authorization: Bearer <token>` header.
- **Refresh Token**: Long-lived token (7 days) stored securely in an `httpOnly`, `SameSite` cookie for automatic silent renewal without logging out the user.
- **Password Security**: Passwords are salted and hashed using `bcryptjs` with 12 salt rounds.

---

## 16. API Overview

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Register a new user account | No |
| `POST` | `/api/auth/login` | Log in and receive tokens | No |
| `POST` | `/api/auth/refresh` | Renew access token via refresh cookie | No |
| `POST` | `/api/auth/logout` | Invalidate tokens and clear cookie | Yes |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes |
| `GET` | `/api/meetings` | List meetings hosted by user | Yes |
| `POST` | `/api/meetings` | Create a new instant or scheduled meeting | Yes |
| `GET` | `/api/meetings/:id` | Get meeting details and access validation | Optional |
| `POST` | `/api/meetings/:id/end` | End meeting for all participants | Yes (Host) |
| `PATCH` | `/api/users/me` | Update name, avatar photo (Base64), or bio | Yes |
| `PATCH` | `/api/users/me/password` | Change account password | Yes |
| `DELETE` | `/api/users/me` | Permanently delete account | Yes |
| `GET` | `/api/webrtc/ice-servers` | Get dynamic STUN/TURN ICE configurations | Optional |
| `POST` | `/api/support` | Submit helpdesk inquiry | Optional |
| `GET` | `/api/admin/users` | List all registered users (Admin) | Admin |
| `GET` | `/api/admin/analytics` | Platform metrics and usage statistics | Admin |
| `GET` | `/api/health` | Health check endpoint for uptime monitors | No |

---

## 17. WebSocket / Signaling

ConnectX uses **Socket.IO** for real-time signaling:

| Event Name | Direction | Payload / Purpose |
| :--- | :--- | :--- |
| `join-room` | Client &rarr; Server | `{ roomId, user: { id, name, avatar } }` |
| `user-connected` | Server &rarr; Client | Broadcast new peer to existing room members |
| `offer` | Client &rarr; Client | Relays WebRTC SDP offer to target peer |
| `answer` | Client &rarr; Client | Relays WebRTC SDP answer back to caller |
| `ice-candidate` | Client &rarr; Client | Relays interactive connectivity candidates |
| `chat-message` | Client &harr; Server | Broadcast text message with sender metadata |
| `send-reaction` | Client &harr; Server | Broadcast floating emoji reaction to all peers |
| `user-toggle-audio` | Client &harr; Server | Sync participant mute status |
| `user-toggle-video` | Client &harr; Server | Sync participant camera status |
| `user-disconnected` | Server &rarr; Client | Notify room members when a peer leaves |

---

## 18. Production Deployment

### Architecture 1: Unified Full-Stack (Recommended)
Deploy ConnectX as a single container or web service on **Render**, **Railway**, **Fly.io**, or any VPS. The Express server serves both the REST API, Socket.IO WebSockets, and the compiled frontend static files from `dist/`.

#### Deploying to Render via Blueprint (1-Click)
1. Push your code to GitHub.
2. Sign in to [Render](https://dashboard.render.com).
3. Click **New +** &rarr; **Blueprint**.
4. Select your `ConnectX` repository.
5. Render reads [`render.yaml`](render.yaml) and automatically creates the Web Service with:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Health Check**: `/api/health`
6. Fill in the required secret values (`MONGODB_URI`, `RESEND_API_KEY`, and optional TURN credentials).
7. Deploy! Your app will be live at `https://connectx.onrender.com`.

#### Deploying with Docker
```bash
# Build production Docker image
docker build -t connectx:latest .

# Run container with environment variables
docker run -d \
  -p 5000:5000 \
  -e NODE_ENV=production \
  -e PORT=5000 \
  -e MONGODB_URI="your_mongodb_atlas_uri" \
  -e JWT_SECRET="your_secure_jwt_secret" \
  -e JWT_REFRESH_SECRET="your_secure_jwt_refresh_secret" \
  --name connectx_app \
  connectx:latest
```

---

### Architecture 2: Separated Deployment (Vercel + Render)
If you prefer hosting the frontend on Vercel and the backend on Render:

1. **Deploy Backend on Render**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Environment Variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `FRONTEND_URL=https://your-vercel-site.vercel.app`.
2. **Deploy Frontend on Vercel**:
   - Framework Preset: `Vite`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Environment Variables:
     - `VITE_API_URL=https://your-backend.onrender.com`
     - `VITE_SOCKET_URL=https://your-backend.onrender.com`

---

## 19. Build Commands

| Command | Action |
| :--- | :--- |
| `npm run build` | Builds both frontend SPA (`vite build`) and backend (`tsc`) |
| `npm start` | Starts compiled backend production server (`node dist/server.js`) |
| `npm run dev` | Starts Vite frontend dev server with HMR (`http://localhost:5173`) |
| `npm run backend:dev` | Starts backend dev server with `tsx watch` (`http://localhost:5000`) |
| `npm run lint` | Runs `oxlint` linter on frontend source code |
| `npm run preview` | Previews production frontend build locally |

---

## 20. Security

- **Environment Isolation**: All sensitive credentials (`MONGODB_URI`, `JWT_SECRET`, `RESEND_API_KEY`) are managed strictly via environment variables and never committed to source control.
- **HTTP Security Headers**: Powered by `helmet` to mitigate clickjacking, MIME sniffing, and cross-site scripting attacks.
- **Rate Limiting**: Express Rate Limiting prevents brute-force login attempts and API abuse.
- **CORS Protection**: Dynamic origin checking with credentials support.
- **Data Validation**: Strict runtime schema validation using `zod` for all incoming JSON payloads.
- **Ephemeral WebRTC Credentials**: TURN credentials use time-limited HMAC-SHA1 tokens to prevent unauthorized relay bandwidth theft.

---

## 21. Troubleshooting

### 1. WebRTC Call fails between users on different Wi-Fi / cellular networks
- **Cause**: Symmetric NAT or restrictive firewall blocking direct peer-to-peer UDP.
- **Fix**: Configure Coturn TURN server credentials in `backend/.env` (`WEBRTC_TURN_SERVER`, `WEBRTC_TURN_SECRET`). Verify firewall allows UDP/TCP on port `3478` and UDP relay ports `49152:65535`.

### 2. Camera or Microphone permissions denied
- **Cause**: Browser requires HTTPS for `navigator.mediaDevices.getUserMedia` in production.
- **Fix**: Ensure your deployed application is served over SSL/HTTPS (`https://`).

### 3. Socket.IO connection failed
- **Cause**: Mismatched backend URL or blocked WebSocket connections.
- **Fix**: Check that `VITE_SOCKET_URL` points to your active backend and that reverse proxies (e.g. Nginx, Cloudflare) have WebSocket upgrade headers enabled (`Upgrade $http_upgrade`, `Connection "Upgrade"`).

---

## 22. Testing

You can test WebRTC connectivity and dynamic TURN token generation using the included diagnostic tests:

```bash
# Test dynamic ICE token generation endpoint
curl http://localhost:5000/api/webrtc/ice-servers

# Test backend health check
curl http://localhost:5000/api/health
```

---

## 23. Future Improvements

- [ ] Multi-party SFU (Selective Forwarding Unit) using Mediasoup / LiveKit for 50+ participants.
- [ ] Native cloud recording and storage to Amazon S3 / Google Cloud Storage.
- [ ] Real-time AI live transcription and automated meeting summaries.
- [ ] End-to-End Encryption (E2EE) with WebRTC Insertable Streams.
- [ ] Breakout rooms and live polling features.

---

## 24. License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

### Author & Developer
**Virat Singh** &mdash; [viratchauhan1010@gmail.com](mailto:viratchauhan1010@gmail.com)
GitHub: [@Virat210](https://github.com/Virat210)
