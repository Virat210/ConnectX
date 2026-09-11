# ConnectX Backend — Production Realtime & REST Services

ConnectX is an enterprise-grade video conferencing platform built with Node.js, Express, TypeScript, MongoDB, Socket.IO, WebRTC, and Resend.

- **Developer & Owner**: Virat Singh
- **Contact Email**: `viratchauhan1010@gmail.com`
- **Phone**: `+91 8303639037`

---

## 1. System Architecture

```
                       CONNECTX FRONTEND (React 19 + Vite)
                                    |
                -----------------------------------------
                |                                       |
           REST APIs                                SOCKET.IO
                |                             (Signaling & Chat)
                v                                       v
    EXPRESS + TYPESCRIPT BACKEND <-------------> WEBRTC MESH
                |
                v
      MONGODB (Mongoose ODM)
                |
                v
      RESEND EMAIL SERVICE
  (viratchauhan1010@gmail.com)
```

---

## 2. Setup & Installation

### Prerequisites
- Node.js 18+ (Node 20 or 22 recommended)
- MongoDB 6+ running locally on port 27017 or a MongoDB Atlas URI

### Installation
```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Build TypeScript
npm run build

# Start development server with auto-reload
npm run dev
```

The backend server runs on `http://localhost:5000`.

---

## 3. Environment Variables

Create a `.env` file in the `backend/` directory based on `.env.example`:

```env
# Server
NODE_ENV=development
PORT=5000

# Database
MONGODB_URI=mongodb://127.0.0.1:27017/connectx

# Authentication
JWT_SECRET=connectx_jwt_secret_dev_key_2026_super_secure
JWT_REFRESH_SECRET=connectx_refresh_secret_dev_key_2026_super_secure

# CORS & Client
FRONTEND_URL=http://localhost:5173

# Resend Email Integration
RESEND_API_KEY=your_resend_api_key_here
RESEND_FROM_EMAIL=onboarding@resend.dev
SUPPORT_EMAIL=viratchauhan1010@gmail.com

# WebRTC STUN / TURN Infrastructure
WEBRTC_STUN_SERVER=stun:stun.l.google.com:19302
WEBRTC_TURN_SERVER=
WEBRTC_TURN_USERNAME=
WEBRTC_TURN_CREDENTIAL=
```

> **Security Note**: Never commit `.env` to source control. Ensure `RESEND_API_KEY` is kept strictly server-side.

---

## 4. Database Models (MongoDB / Mongoose)

- **`User`**: Secure credential storage (`passwordHash` via bcrypt), profile info, organization, preferences, timestamps, and indexing.
- **`Meeting`**: Meeting identifiers (`meetingId` formatted as `cnx-xxxx-xxxx`), host reference, lifecycle state (`upcoming` | `active` | `ended`), start/end timestamps, and meeting settings.
- **`Participant`**: Tracks participant join/leave timestamps, roles (`host` | `co-host` | `participant`), media states, and socket connections.
- **`Message`**: Realtime in-meeting chat persistence with sender associations and timestamps.
- **`SupportTicket`**: Helpdesk ticketing system with human-readable ticket IDs (`TKT-XXXXXX`) and resolution tracking.
- **`Notification`**: System and user notifications with unread state tracking.

---

## 5. REST APIs

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/auth/register` | Register new user account | No |
| POST | `/api/auth/login` | Log in and receive JWT accessToken + refreshToken | No |
| POST | `/api/auth/logout` | Revoke session and clear cookies | No |
| POST | `/api/auth/refresh` | Exchange refreshToken for new accessToken | No |
| GET | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer) |

### Meetings (`/api/meetings`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/meetings` | Create or schedule a meeting | Yes (Bearer) |
| GET | `/api/meetings` | List current user's hosted and participated meetings | Yes (Bearer) |
| GET | `/api/meetings/:meetingId` | Validate and retrieve meeting room info | Yes (Bearer) |
| POST | `/api/meetings/:meetingId/join` | Record participation entry | Yes (Bearer) |
| POST | `/api/meetings/:meetingId/leave` | Record participation exit | Yes (Bearer) |
| POST | `/api/meetings/:meetingId/end` | Host-only: terminate meeting for everyone | Yes (Bearer, Host) |

### Users & Notifications (`/api/users`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/users/me` | Get profile details | Yes (Bearer) |
| PATCH | `/api/users/me` | Update name, title, timezone, settings | Yes (Bearer) |
| PATCH | `/api/users/me/password` | Update account password | Yes (Bearer) |
| GET | `/api/users/me/notifications` | Get user notifications | Yes (Bearer) |
| PATCH | `/api/users/me/notifications/read` | Mark all notifications read | Yes (Bearer) |

### Helpdesk / Support (`/api/support`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| POST | `/api/support` | Create support ticket and trigger Resend email to owner | No (Rate-limited) |

### Admin (`/api/admin`)
| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| GET | `/api/admin/users` | List platform users with status | Yes (Admin) |
| GET | `/api/admin/analytics` | Fetch platform usage statistics | Yes (Admin) |
| PATCH | `/api/admin/users/:id/status` | Suspend or activate user | Yes (Admin) |

---

## 6. Realtime Communication (Socket.IO & WebRTC)

Socket.IO handles connection signaling and synchronized real-time state for meetings:

### Meeting Signaling Events
- `meeting:join`: Join a meeting room. Transmits local peer state and receives the list of active peers.
- `participant:joined`: Broadcasts to all peers in the room when a new member joins.
- `signal:offer`: Routes WebRTC SDP offer from caller to callee.
- `signal:answer`: Routes WebRTC SDP answer from callee back to caller.
- `signal:ice-candidate`: Exchanges ICE candidate tokens for NAT/firewall traversal.
- `participant:left`: Notifies remaining peers to close local `RTCPeerConnection` for the departed user.

### Media & Collaboration Events
- `participant:mute`: Synchronizes microphone toggle state.
- `participant:camera`: Synchronizes camera toggle state.
- `participant:speaking`: Audio energy wave pulse broadcast.
- `screen:start` / `screen:stop`: Realtime screen-sharing stream broadcast.
- `chat:message`: Instant chat delivery and database persistence.
- `reaction:send`: Realtime floating reaction emojis (👍, ❤️, 😂, 👏, 🎉, 😮).

### Host Moderation Events
- `host:mute-participant`: Host forces mute on a specific participant.
- `host:remove-participant`: Host ejects a participant from the meeting room.
- `meeting:end-all`: Host forcibly ends the session for all participants and redirects them to dashboard.

---

## 7. Helpdesk & Resend Email Service

Support tickets submitted on `/helpdesk` trigger:
1. Support ticket record created in MongoDB with ticket ID `TKT-XXXXXX`.
2. Resend API service dispatches an email notification to `viratchauhan1010@gmail.com` with sender details, subject, and ticket body.
3. Fallback: If `RESEND_API_KEY` is not yet configured, the email payload is safely logged to the server console with structured details without crashing the application.

---

## 8. Production Deployment

### Process Management
Use PM2, Docker, or systemd:
```bash
npm run build
NODE_ENV=production node dist/server.js
```

### Security Checklist
- Set strong, random strings for `JWT_SECRET` and `JWT_REFRESH_SECRET`.
- Configure CORS `FRONTEND_URL` to match your deployed client domain.
- Set up a TURN server (e.g., Coturn or Twilio Network Traversal Service) for strict NAT/firewall environments.
- Protect database with authenticated connection strings and IP whitelisting.
