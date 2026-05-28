# LifeSync

![Status](https://img.shields.io/badge/status-active-success)
![Backend](https://img.shields.io/badge/backend-FastAPI-009688)
![Frontend](https://img.shields.io/badge/frontend-React%20%2B%20Vite-61DAFB)
![Database](https://img.shields.io/badge/database-PostgreSQL-336791)
![Deployment](https://img.shields.io/badge/deployment-Docker-blue)
![CI%2FCD](https://img.shields.io/badge/CI%2FCD-GitHub_Actions-orange)

---

## 🧠 Overview

LifeSync is a full-stack personal productivity and mental wellness system designed to help users track habits, mood patterns, journaling insights, and long-term goals.

It is built using a **fully containerized distributed architecture** consisting of:

- React + Vite frontend (Docker container)
- FastAPI backend (Docker container)
- PostgreSQL database (Docker volume persistence)
- Nginx reverse proxy
- CI/CD pipeline via GitHub Actions
- AWS EC2 deployment

The project demonstrates production-grade engineering practices including asynchronous APIs, modular architecture, secure authentication, and automated cloud deployment.

---

## 🚀 Key Features

### 📝 Personal Journaling
Daily journaling system for self-reflection and emotional tracking.

### 🔁 Habit Tracking
- Streak-based logic
- Calendar-based visualization
- Persistent progress history

### 😊 Mood Tracking
- Daily mood logging
- Trend visualization
- Emotional pattern analysis

### 📊 Smart Dashboard
Unified overview of:
- Habits
- Journals
- Mood trends
- Daily progress

### 💡 Daily Inspiration
External API integration for motivational quotes

### 🔐 Authentication System
- JWT-based authentication
- Secure password hashing (bcrypt)
- Protected API routes

---

## 🏗️ System Architecture

```text id="arch_final"
                ┌────────────────────────────┐
                │   React Frontend Container  │
                │     (Vite + React)         │
                └────────────┬───────────────┘
                             │ /api
                             ▼
                ┌────────────────────────────┐
                │        Nginx Proxy         │
                │  (Reverse Proxy Layer)     │
                └────────────┬───────────────┘
                             │
                ┌────────────▼───────────────┐
                │     FastAPI Backend         │
                │   (Docker Container)        │
                └────────────┬───────────────┘
                             │
                ┌────────────▼───────────────┐
                │   PostgreSQL Database       │
                │ (Docker + Persistent Volume)│
                └────────────────────────────┘
````

---

## 🌐 Production Request Flow (AWS EC2)

In production, the system runs behind an **Nginx reverse proxy on AWS EC2**.

```text id="flow_final"
Browser
   ↓
https://your-domain.com (or EC2 Public IP)
   ↓
Nginx (port 80 / 443)
   ├── / → React Frontend Container
   └── /api → FastAPI Backend Container (port 8000)
```

---

## 🔁 API Communication Flow

Frontend calls:

```js id="api_final"
fetch("/api/users")
```

Nginx internally forwards it to:

```text id="proxy_final"
http://backend:8000/users
```

The backend is NOT exposed directly to the internet.

---

## 🔒 Why This Architecture

* Prevents CORS issues completely
* Single domain for frontend + backend
* Backend remains private
* Fully containerized microservice-style architecture
* Clean reverse proxy routing with Nginx
* Production-grade deployment pattern
* Scalable via Docker Compose

---

## 🧱 Tech Stack

### Frontend

* React 19
* Vite
* TypeScript
* Tailwind CSS v4
* Context API + Hooks
* Lucide Icons

### Backend

* FastAPI (Python 3.11+)
* SQLModel ORM
* PostgreSQL 15
* JWT Authentication
* Alembic migrations
* Passlib (bcrypt hashing)

### DevOps & Infrastructure

* Docker & Docker Compose
* Nginx reverse proxy
* GitHub Actions CI/CD
* AWS EC2 deployment

---

## 🐳 Infrastructure Model

* React frontend runs in a Docker container
* FastAPI backend runs in a separate container
* PostgreSQL runs with persistent Docker volume storage
* Nginx acts as a single entry point (reverse proxy)
* All services communicate over a Docker internal network

---

## ⚠️ Docker Image Naming Clarification

The GitHub repository name and Docker image names are intentionally different.

* GitHub Repository: **LifeSync**
* Docker Images:

  * `neonbluewhale/rumi-frontend`
  * `neonbluewhale/rumi-backend`

### Why this exists:

* Docker images are published under a Docker Hub namespace
* Image naming originated from an earlier project structure
* CI/CD pipeline is independent of repository naming
* This does NOT affect functionality or deployment

---

## 🔄 CI/CD Pipeline (GitHub Actions)

Automated workflow:

1. Trigger on push or PR to `frontend/` or `backend/`
2. Build Docker images for services
3. Push images to Docker Hub
4. SSH into AWS EC2 instance
5. Pull latest images
6. Restart services using `docker compose up -d`

---

## ☁️ Deployment to AWS EC2 (Production Setup)

LifeSync is deployed on AWS EC2 using Docker and Nginx.

### 🏗️ Production Architecture

```text id="ec2_arch"
Browser
   ↓
EC2 Public URL (Domain / Elastic IP)
   ↓
Nginx (Port 80 / 443)
   ├── /      → React Frontend Container
   └── /api   → FastAPI Backend Container
```

---

### 🚀 Deployment Steps

#### 1. EC2 Setup

Install:

* Docker
* Docker Compose

#### 2. Clone repository

```bash id="clone"
git clone <repo-url>
cd project
```

#### 3. Configure environment

```env id="env_final"
SECRET_KEY=your_secret_key
DATABASE_URL=postgresql://user:password@db:5432/lifesync
```

#### 4. Start services

```bash id="start"
docker compose up -d --build
```

This starts:

* Frontend container
* Backend container
* PostgreSQL (persistent volume)
* Nginx reverse proxy

---

## 🌐 Accessing the Application

```text id="access"
http://<EC2-PUBLIC-IP>
```

or (recommended):

```text id="domain"
https://your-domain.com
```

---

## 📌 Highlights

* Fully containerized production-grade architecture
* Real-world reverse proxy setup using Nginx
* Microservice-style service separation
* Persistent database layer using Docker volumes
* Fully automated CI/CD pipeline with GitHub Actions
* Secure JWT authentication system
* AWS EC2 cloud deployment experience
* Clean separation of frontend, backend, and infrastructure

---








<!--
---

## 📸 Demo & Screenshots

Add this section near the top (after Overview or Key Features).

---

## 📸 Demo & Screenshots

> 🚧 This section will be updated with live UI previews and walkthrough GIFs.

### 🖥️ Live Application Preview

- 🌐 Live URL: `https://your-domain.com` *(or EC2 public IP)*

---

### 🧾 UI Screenshots

#### 🏠 Dashboard
_Add screenshot here_

```text
![Dashboard](assets/dashboard.png)
````

---

#### 📝 Journaling Page

*Add screenshot here*

```text
![Journal](assets/journal.png)
```

---

#### 🔁 Habit Tracker

*Add screenshot here*

```text
![Habits](assets/habits.png)
```

---

#### 😊 Mood Tracking

*Add screenshot here*

```text
![Mood Tracker](assets/mood.png)
```

---

### 🎥 Feature Walkthrough (GIF Demo)

*Add a short GIF showing full app flow*

```text
![Demo GIF](assets/lifesync-demo.gif)
```

---

### 📌 Suggested Demo Flow (for recording GIF)

* Login / Signup
* Create a journal entry
* Mark a habit complete
* View streak update
* Log mood
* Show dashboard analytics update in real-time

````

---

## folder structure 
assets/
 ├── dashboard.png
 ├── journal.png
 ├── habits.png
 ├── mood.png
 └── lifesync-demo.gif


-->
