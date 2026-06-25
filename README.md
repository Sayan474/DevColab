# 🌌 DevCollab

**DevCollab** is a premium, real-time collaboration ecosystem designed for high-performance engineering teams. It integrates Kanban boards, shared code snippet repositories, collaborative wikis, and an AI-powered workspace assistant into a single, cohesive, and blazing-fast interface.

---

## 🚀 Features

*   **Realtime Kanban Board**: Dynamic task planning and execution with instantaneous synchronization across all team members via WebSockets.
*   **Shared Code Snippets**: Repository for code templates and reusable utilities featuring code highlight previews and instant query lookups.
*   **Collaborative Documentation Wiki**: A Markdown-backed team knowledge hub to organize api specs, guidelines, and guides.
*   **AI Workspace Assistant**: Built-in AI helper to automate documentation, summarize wiki records, generate task descriptions, and review code.
*   **Secure Authentication**: OAuth integration (Google & GitHub) alongside cookie-based JWT sessions and OTP confirmation logins.

---

## 🏗️ Architecture & Tech Stack

DevCollab is divided into two decoupled layers:

### 💻 Frontend
*   **Framework**: [React 19](https://react.dev/) + [Vite](https://vite.dev/) for high-speed compiling and rendering.
*   **Routing**: [React Router v7](https://reactrouter.com/) client-side routing.
*   **Styling**: [TailwindCSS v4](https://tailwindcss.com/) for fluid, hardware-accelerated layouts, and glassmorphic designs.
*   **Realtime**: [Socket.IO Client](https://socket.io/) integration.
*   **Networking**: [Axios](https://axios-http.com/) with session credentials management.
*   **Icons**: [Lucide React](https://lucide.dev/).

### ⚙️ Backend
*   **Runtime**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/) REST API.
*   **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose ORM](https://mongoosejs.com/).
*   **Realtime Gateway**: [Socket.IO Server](https://socket.io/) broadcasting actions and sync states.
*   **Authentication**: Secure HTTP-only cookies, JWT, bcryptjs, and Passport.js (Google & GitHub OAuth 2.0).
*   **AI Integration**: Groq API integration using `groq-sdk` for fast, server-side code and document inference.
*   **Asset Management**: Multer for handling file attachments.

---

## 🛠️ Local Development Setup

### Prerequisites
*   [Node.js](https://nodejs.org/) (v18+ recommended)
*   [MongoDB](https://www.mongodb.com/try/download/community) (Local instance or Atlas connection URI)

---

### 1. Backend Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `backend/` directory:
    ```env
    PORT=5000
    MONGODB_URI=your_mongodb_connection_uri
    JWT_SECRET=your_jwt_secret_token
    COOKIE_SECRET=your_cookie_secret_token
    CLIENT_URL=http://localhost:5173
    
    # Mail service (OTP & Invite Deliveries)
    EMAIL_SERVICE=gmail
    EMAIL_USER=your_email_address
    EMAIL_PASS=your_email_app_password
    
    # OAuth Configurations (Optional)
    GOOGLE_CLIENT_ID=your_google_oauth_client_id
    GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
    GITHUB_CLIENT_ID=your_github_oauth_client_id
    GITHUB_CLIENT_SECRET=your_github_oauth_client_secret
    
    # AI Engine (Optional)
    GROQ_API_KEY=your_groq_api_key
    ```
4.  Run the development server (uses `nodemon` for auto-reloading):
    ```bash
    npm run dev
    ```

---

### 2. Frontend Setup

1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in the `frontend/` directory:
    ```env
    VITE_API_URL=http://localhost:5000/api
    VITE_SOCKET_URL=http://localhost:5000
    ```
4.  Run the development server:
    ```bash
    npm run dev
    ```
5.  Open `http://localhost:5173` in your browser.

---

## 📁 Repository Structure

```
dev-collab/
├── backend/                  # Express REST API & Websockets
│   ├── config/               # DB & Auth configurations
│   ├── controllers/          # Business logic handlers
│   ├── middleware/           # JWT, validations, & CORS checks
│   ├── models/               # MongoDB Mongoose schemas
│   ├── routes/               # Express endpoints (auth, projects, wikis)
│   ├── sockets/              # Socket.IO connection event maps
│   ├── server.js             # Main server entrypoint
│   └── package.json
│
├── frontend/                 # React & Vite client
│   ├── src/
│   │   ├── assets/           # Icons, utilities, & configurations
│   │   ├── components/       # Shared UI & layout components
│   │   ├── context/          # State providers (auth, theme, workspaces)
│   │   ├── lib/              # API clients & socket configurations
│   │   ├── pages/            # Core views (Landing, Board, Snippets, Wikis)
│   │   ├── App.jsx           # Routing configuration
│   │   └── main.jsx          # Mount configuration
│   ├── index.html            # Entry layout document
│   └── package.json
└── README.md
```
