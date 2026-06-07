# Enterprise CRM Portal

An enterprise-grade Customer Relationship Management (CRM) portal built with a decoupled monorepo architecture. The application is designed to simulate sandbox sales operations, offering analytical dashboards, leads tracking, drag-and-drop pipelines, customer journals, email templates simulation, and system administrative role privileges.

---

## 🏗️ Architecture & Project Structure

This project is organized as an npm workspaces monorepo:

*   **[`/frontend`](./frontend)**: Client-side React application powered by **Vite**, styled with **Tailwind CSS v4** (including class-based custom dark mode variant), using **Recharts** for analytics and **Lucide** for icon vectors.
*   **[`/backend`](./backend)**: REST API service built with **Express** and Node.js. It features simulated JWT session authorization, custom route authorization middlewares, and mock database operations with local file persistence stored in a `/data` folder.

```
├── backend/                  # Express API Server
│   ├── data/                 # JSON file tables (users, leads, deals, etc.)
│   ├── server/               # Auth (JWT) & Database seeding helpers
│   ├── server.js             # Main API entry point
│   └── package.json
│
├── frontend/                 # Vite + React Client
│   ├── src/
│   │   ├── components/       # Component views (Dashboard, Leads, Deals, etc.)
│   │   ├── utils/            # Axios/Fetch API wrapper
│   │   ├── App.jsx           # Main application state and router layout
│   │   ├── index.css         # Tailwind v4 theme configurations
│   │   └── main.jsx          # Entry point mounting React
│   ├── index.html            # SPA markup entry
│   └── package.json
│
├── package.json              # Monorepo workspace settings and script triggers
└── README.md
```

---

## 🚀 Key Features

1.  **Analytical Dashboard**: High-level telemetry displaying lead volumes, active deals, closed-won revenues, conversion success rates, monthly projections, and representative leaderboards.
2.  **Leads Pipeline**: Track prospect statuses (New, Contacted, Qualified, Unqualified). Includes search, creation, editing, and an automated lead-to-customer conversion workflow.
3.  **Deals Pipeline**: A kanban-style sales pipeline where you can drag and drop deals across stages (Contacted, Qualified, Negotiation, Won, Lost) with dynamic success probabilities.
4.  **Customer Hub**: Complete customer logs showing purchase history, activity journals, and custom manager notes.
5.  **Email Hub**: Select from generic templates (Product Intro, Meeting Follow Up, SLA Agreement) and simulate sending outreach emails directly through the CRM log.
6.  **Interactions Journal**: Maintain call logs, follow-up callbacks, meetings, and email tracking records.
7.  **Reports Generator**: Generate live metrics summaries (Sales, LeadSource, Conversion, Revenue) and export them directly to downloadable CSV files.
8.  **Admin Portal**: Elevated user dashboard supporting user role configuration shifts (Admin, Sales Manager, Sales Executive) and editing organizational targets.
9.  **Dual Themes**: Seamless, selector-based toggling between Light and Dark visual modes.

---

## 💻 Getting Started

### Prerequisites
*   [Node.js](https://nodejs.org/) (Version 18+ recommended)
*   npm (installed automatically with Node.js)

### Installation

1.  Clone the repository and navigate to the project root:
    ```bash
    cd enterprise-crm
    ```
2.  Install all dependencies across the entire monorepo workspaces:
    ```bash
    npm install
    ```

### Running the Application (Local Development)

To start both the backend API (port `3000`) and frontend client (port `5173` with api proxying) concurrently:

```bash
npm run dev
```

Once loaded, open your browser and navigate to:
👉 **[http://localhost:5173](http://localhost:5173)**

---

## 🔑 Preset Credentials (Sandbox Accounts)

The database is pre-seeded with sample records. You can click the presets on the login screen or manually enter any of the following credentials to evaluate role-based user controls:

| Name | Email | Password | Role |
| :--- | :--- | :--- | :--- |
| **Sarah Jenkins** | `admin@crm.com` | `admin123` | **Admin** (Full system configurations, user removal) |
| **Marcus Vance** | `manager@crm.com` | `manager123` | **Sales Manager** (Delete entries, generate reports) |
| **Elena Rostova** | `executive1@crm.com` | `sales123` | **Sales Executive** (Standard CRM pipeline actions) |

---

## 📦 Production Build

To compile and bundle the React frontend assets for production:

```bash
npm run build
```

The production assets compile into `/frontend/dist/`. 

To serve the built assets through the Express backend in production mode:
```bash
# Set production environment variable
$env:NODE_ENV="production"   # PowerShell
# OR
export NODE_ENV=production   # Bash

# Start server
npm run start --workspace=backend
```
The application will be served directly at **`http://localhost:3000`**.
