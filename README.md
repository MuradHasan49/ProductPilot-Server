# ProductPilot — AI-Powered Product Development Platform

> **Turn ideas into polished product roadmaps, user stories, and AI-generated docs—all in one place.**

[![Live Site (Vercel)](https://img.shields.io/badge/Live%20Site-product--pilot--mu.vercel.app-6C47FF?style=for-the-badge)](https://product-pilot-mu.vercel.app/)
[![Client Repo](https://img.shields.io/badge/GitHub-Client-161827?style=for-the-badge&logo=github)](https://github.com/MuradHasan49/ProductPilot)
[![Server Repo](https://img.shields.io/badge/GitHub-Server-161827?style=for-the-badge&logo=github)](https://github.com/MuradHasan49/ProductPilot-Server)

---

## 🌐 Live Site

**URL:** `https://product-pilot-mu.vercel.app/`

---

## 📂 Repositories

- **Client Repository:** `https://github.com/MuradHasan49/ProductPilot`
- **Server Repository:** `https://github.com/MuradHasan49/ProductPilot-Server`

---

## 🚀 Key Features

1. **Universal Auth** — Email/password and Google OAuth powered by Better-Auth (JWT stored in secure `SameSite=None` cookies).
2. **Dashboard Overview** — Real-time stats (active projects, AI documents generated, recent activity) visualised with Recharts.
3. **Project Management** — Create, edit, delete, clone, and bulk-classify projects. Toggle private and public visibility.
4. **AI Workspace** — Generate AI-assisted documents (PRDs, user stories, feature specs) for each project.
5. **Document Management** — Upload, list, edit, and delete project-related documents.
6. **Server-Side Proxy** — `/api/auth` proxy runs on the same domain as the frontend, effectively bypassing strict third-party cookie blocking for OAuth redirects.
7. **Robust CORS & Security** — Whitelisted origins via `CLIENT_URL` and secure cookies prevent cross-site attacks.
8. **Responsive UI** — Tailwind-styled components, glass-morphism cards, smooth micro-animations, and mobile-first layout.
9. **Type-Safe End-to-End** — Full TypeScript coverage on both client and server, with runtime validation via Zod.

---

## 🛠️ Technology Stack

### Frontend
| Tech             | Version  | Purpose                          |
|------------------|----------|----------------------------------|
| Next.js          | 16.2.10  | React framework with App Router  |
| React            | 19.2.4   | UI rendering                     |
| TypeScript       | 5.9.x    | Type safety                      |
| Tailwind CSS     | v4       | Utility-first styling            |
| TanStack Query   | v5       | Server state management          |
| Zustand          | v5       | Client state (auth, ui state)    |
| Axios            | v1       | HTTP client with interceptors    |
| Better-Auth      | latest   | Auth client                      |
| Framer Motion    | v11      | Animations                       |
| Recharts         | v2       | Dashboard charts                 |
| Sonner           | v1       | Toast notifications              |

### Backend
| Tech        | Version | Purpose                     |
|-------------|---------|-----------------------------|
| Node.js     | 20+     | Runtime                     |
| Express     | 5.x     | Web framework               |
| TypeScript  | 5.x     | Type safety                 |
| MongoDB     | Atlas   | Database                    |
| Mongoose    | v8      | ODM (schema & models)       |
| Better-Auth | latest  | JWT auth & session handling |
| Zod         | v3      | Request validation          |
| cors        | v2      | Cross-origin requests       |
| dotenv      | v17     | Environment variables       |

---

## 📂 Project Structure

```text
ProductPilot/
├── client/                     # Next.js 16 frontend
│   ├── src/
│   │   ├── app/                # App Router pages (dashboard, login, explore, etc.)
│   │   ├── components/         # UI primitives and Layouts
│   │   ├── lib/                # Axios instance & Auth client
│   │   ├── store/              # Zustand stores
│   │   └── middleware.ts       # Edge middleware (protected route guard)
│
└── Server/                     # Express 5 backend
    ├── src/
    │   ├── models/             # Mongoose schemas (Project, ActivityLog, etc.)
    │   ├── controllers/        # Route controllers
    │   ├── middleware/         # Auth header extraction & Error handling
    │   ├── routes/             # API routes
    │   ├── auth.ts             # Initialize Better-Auth with dynamic imports
    │   └── server.ts           # App bootstrap, DB connection, API proxy
    ├── .env                    # Secret keys
    └── package.json
```

---

## ⚙️ Local Setup

### Prerequisites
- Node.js 20+
- MongoDB Atlas account (or local MongoDB)
- Google OAuth credentials

### 1. Clone Repositories

**Client:**
```bash
git clone https://github.com/MuradHasan49/ProductPilot.git
cd ProductPilot
```

**Server:**
```bash
git clone https://github.com/MuradHasan49/ProductPilot-Server.git
cd ProductPilot-Server
```

### 2. Server Setup

```bash
cd ProductPilot-Server
npm install
```

Create `.env`:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster0.mongodb.net/productpilot
JWT_SECRET=super_secret_jwt_key_at_least_32_chars
CLIENT_URL=http://localhost:3000
BETTER_AUTH_URL=http://localhost:3000/api/auth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

```bash
npm run dev    # starts on http://localhost:8000
```

### 3. Client Setup

```bash
cd ProductPilot
npm install
```

Create `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev    # starts on http://localhost:3000
```

---

## 🌍 Deployment

| Component | Platform | Configuration |
|-----------|----------|---------------|
| **Frontend** | Vercel | Auto-detects `next.config.ts`. Includes proxy rewrites to bypass CORS. |
| **Backend**  | Vercel | Serverless Functions via `/api/*`. |
| **Database** | MongoDB | Atlas Cloud |

---

## 📞 Contact & Links

- **LinkedIn:** [linkedin.com/in/murad-hasan](https://linkedin.com/in/murad-hasan)
- **Portfolio:** [muradhasan49.vercel.app](https://muradhasan49.vercel.app/)
