# ProductPilot — AI-Powered Product Development Platform

> **Turn ideas into polished product roadmaps, user stories, and AI-generated docs—all in one place.**

[![Live Site (Vercel)](https://img.shields.io/badge/Live%20Site-product--pilot--mu.vercel.app-6C47FF?style=for-the-badge)](https://product-pilot-mu.vercel.app/)
[![Client Repo](https://img.shields.io/badge/GitHub-Client-161827?style=for-the-badge&logo=github)](https://github.com/MuradHasan49/ProductPilot)
[![Server Repo](https://img.shields.io/badge/GitHub-Server-161827?style=for-the-badge&logo=github)](https://github.com/MuradHasan49/ProductPilot-Server)

---

## 🌐 Live Site

**URL:** [https://product-pilot-mu.vercel.app/](https://product-pilot-mu.vercel.app/)

---

## 📂 Repositories

- **Client Repository:** [https://github.com/MuradHasan49/ProductPilot](https://github.com/MuradHasan49/ProductPilot)
- **Server Repository:** [https://github.com/MuradHasan49/ProductPilot-Server](https://github.com/MuradHasan49/ProductPilot-Server)

---

## 🔑 Demo Credentials

**Standard User (Builder):**
- Email: `mhs@gmail.com`
- Password: `Aa123456`

*(Note: You can also instantly log in using the Google OAuth provider on the login page!)*

---

## 🚀 Key Features

- 🤖 **AI-Powered Document Generation**  
  Leverages the blazing-fast Groq LLM API to instantly generate PRDs (Product Requirements Documents), User Stories, and Sprint Plans based on a simple project description.

- 🔐 **Universal Authentication**  
  Secure Email/Password and Google OAuth powered by Better-Auth. JWT session tokens are securely stored in `SameSite=None` `httpOnly` cookies.

- 🛡️ **Server-Side Proxy Architecture**  
  Eliminates aggressive third-party cookie blocking for OAuth redirects by proxying frontend `/api/auth` requests directly to the backend through Next.js rewrites.

- 📂 **Project Management Workflow**  
  Full CRUD functionality to manage product ideas. Users can toggle project visibility (public vs private) and organize their workspaces efficiently.

- 💬 **Interactive AI Workspace**  
  Features a dedicated AI chat interface allowing users to brainstorm features, refine requirements, and chat with an AI "co-founder".

- 📄 **Comprehensive Document Hub**  
  Centralized management of all generated Project Documents, Features, Roadmaps, and Sprint Plans with capabilities to edit and delete.

- 📊 **Dashboard & Analytics**  
  A beautiful visual dashboard utilizing Recharts to display real-time statistics like active projects, generated AI docs, and a chronological timeline of recent activity logs.

- 🔍 **Public Explore Page**  
  A robust discovery page featuring full-text search, category filters, visibility toggles, and pagination, allowing users to browse public projects created by the community.

- 📝 **Activity Logging System**  
  Automatically tracks and records critical user actions in the database to maintain an audit trail visible directly on the user's dashboard.

- ⚡ **State Management & Caching**  
  Utilizes Zustand for lightweight global state (auth, UI) alongside TanStack Query v5 for efficient server-state caching, automatic refetching, and optimistic UI updates.

- 🎨 **Responsive Glassmorphism UI**  
  Modern interface built with Tailwind CSS v4, featuring Framer Motion micro-animations, Swiper carousels, and a mobile-first responsive dashboard sidebar.

- ✅ **Full-Stack Type Safety**  
  End-to-end TypeScript integration with Zod schemas strictly validating all API payloads, request queries, and frontend form inputs.

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
| React Hook Form  | v7       | Form management                  |
| Better-Auth      | latest   | Auth client                      |
| Framer Motion    | v11      | Animations                       |
| Recharts         | v2       | Dashboard charts                 |

### Backend
| Tech        | Version | Purpose                     |
|-------------|---------|-----------------------------|
| Node.js     | 20+     | Runtime                     |
| Express     | 5.x     | Web framework               |
| TypeScript  | 5.x     | Type safety                 |
| MongoDB     | Atlas   | Database                    |
| Mongoose    | v8      | ODM (schema & models)       |
| Better-Auth | latest  | JWT auth & session handling |
| Groq API    | latest  | High-speed LLM inference    |
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
    │   ├── models/             # Mongoose schemas (Project, AIConversation, UserStory, etc.)
    │   ├── controllers/        # Route controllers (ai.controller, project.controller, etc.)
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
- Google OAuth credentials (optional, for Google Login)
- Groq API Key (required for AI generation features)

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

Create `.env` in the Server directory:
```env
PORT=8000
MONGODB_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/productpilot
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CLIENT_URL=http://localhost:3000

# Better Auth Configuration
BETTER_AUTH_SECRET=your_super_secret_jwt_key_min_32_chars
BETTER_AUTH_URL=http://localhost:8000

# AI Configuration
GROQ_API_KEY=your_groq_api_key_here

# Google OAuth Credentials
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

Create `.env.local` in the client directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

*(Note: During local development, the Next.js frontend automatically proxies requests from `http://localhost:3000/api/*` to `http://localhost:8000/api/*`)*

```bash
npm run dev    # starts on http://localhost:3000
```

---

## 🎭 User Permissions & Access

| Feature                  | Guest (Unauthenticated) | Logged-in User |
|--------------------------|:-----------------------:|:--------------:|
| Browse Public Projects   | ✅                      | ✅             |
| View Public Documents    | ✅                      | ✅             |
| Create New Projects      | —                       | ✅             |
| Access AI Workspace      | —                       | ✅             |
| Generate AI Documents    | —                       | ✅             |
| Edit / Delete Projects   | —                       | ✅ (Own only)  |

---

## 🌍 Deployment

| Service  | Platform        | Details |
|----------|-----------------|---------|
| Frontend | Vercel          | Utilizes `next.config.ts` rewrites to proxy `/api` requests to the backend to bypass strict CORS & cookie blocking. |
| Backend  | Vercel          | Deployed as serverless functions. Database connection string and keys are managed in Vercel Environment Variables. |
| Database | MongoDB Atlas   | Cloud-hosted NoSQL database. |

---

## 📞 Contact & Links

- **LinkedIn:** [linkedin.com/in/muradhasan49](https://www.linkedin.com/in/muradhasan49/)
- **Portfolio:** [muradhasan49.vercel.app](https://muradhasan49.vercel.app/)
