# 🌐 NetVibe - Real-Time Internet Outage Monitoring Platform for Iran

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-green.svg)](https://fastapi.tiangolo.com/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2+-black.svg)](https://nextjs.org/)

NetVibe is a **crowdsourced, real-time internet monitoring platform** designed to track network connectivity, filtering, and outages across different ISPs in Iran. Users contribute anonymized connectivity tests, which are aggregated to provide live statistics on internet accessibility.

---

## 🚀 Features

### 🎯 Core Functionality
- **🔴 Real-Time Connectivity Testing**: Client-side browser tests for 10+ popular services (Instagram, Telegram, YouTube, GitHub, etc.)
- **📊 Live ISP Rankings**: Compare network stability across major Iranian ISPs (Hamrah-e-Aval, Irancell, Shatel, etc.)
- **🗺️ Geographic IP Detection**: Automatic ISP and location identification with multi-tier failover
- **📡 Interactive Radar Visualization**: Cyberpunk-style scanning radar showing site status in real-time
- **⚡ Rate Limiting**: Built-in spam protection (1 report per IP every 10 minutes)
- **🔒 Privacy-First**: Only hashed IPs stored, no personal data collected

### 🛠️ Technical Stack
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Lucide Icons
- **Backend**: FastAPI (Python 3.11), SQLAlchemy, Pydantic
- **Databases**: PostgreSQL (persistent storage), Redis (caching & rate limiting)
- **Proxy**: Nginx (reverse proxy with API/frontend routing)
- **Deployment**: Docker Compose (production-ready containers)

### 🎨 User Experience
- **🌙 Dark Mode Design**: Beautiful slate-based UI optimized for monitoring
- **📱 Responsive Layout**: Works seamlessly on desktop, tablet, and mobile
- **🇮🇷 Persian (RTL) Support**: Full right-to-left layout with Persian translations
- **🎭 No CORS Issues**: Uses `fetch` with `no-cors` mode to bypass browser restrictions

---

## 📋 Table of Contents

- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Security](#security)
- [Development](#development)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│  (Client-side fetch tests → no-cors mode for connectivity)  │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTP/HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      Nginx (Port 8008)                       │
│          /api/* → Backend  |  /* → Frontend (SSR/CSR)       │
└─────────────┬──────────────────────────────┬────────────────┘
              │                              │
              ▼                              ▼
    ┌──────────────────┐         ┌──────────────────────┐
    │  FastAPI Backend │         │  Next.js Frontend    │
    │   (Port 8000)    │         │    (Port 3000)       │
    │                  │         │                      │
    │ • IP Detection   │         │ • Radar UI           │
    │ • Report Storage │         │ • ISP Comparison     │
    │ • Stats API      │         │ • Test Controller    │
    └────────┬─────────┘         └──────────────────────┘
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │   Redis     │
│  (Persist)  │  │  (Cache +   │
│             │  │ Rate Limit) │
└─────────────┘  └─────────────┘
```

### Data Flow
1. **User triggers test** → Browser sends `fetch()` requests to target sites
2. **Results submitted** → Backend validates IP, checks rate limit, stores in PostgreSQL
3. **Dashboard loads** → Backend aggregates last 24h reports, caches in Redis (15s TTL)
4. **Live updates** → Users see real-time ISP comparison and network health metrics

---

## 📦 Prerequisites

- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Python** 3.11+ (for secret generation script)
- **Git** (for cloning the repository)
- **4 GB RAM** minimum (recommended: 8 GB)
- **Ports Available**: 8008 (or custom via `NGINX_PORT`)

---

## 🔧 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/netvibe.git
cd netvibe
```

### 2. Generate Secure Secrets
```bash
python3 generate_secrets.py
```
This script creates a `.env` file with:
- 🔐 Cryptographically secure 64-character PostgreSQL password
- ⚙️ Pre-configured environment variables
- 🛡️ Restrictive file permissions (600)

**⚠️ IMPORTANT**: Never commit the `.env` file! It's already in `.gitignore`.

### 3. Review Configuration (Optional)
```bash
cat .env
```
Verify the generated credentials and adjust `NGINX_PORT` if needed.

### 4. Build and Start Services
```bash
docker compose up --build -d
```

### 5. Verify Deployment
```bash
docker compose ps
```
All services should show `Up` status:
- `netvibe_postgres` (PostgreSQL)
- `netvibe_redis` (Redis)
- `netvibe_backend` (FastAPI)
- `netvibe_frontend` (Next.js)
- `netvibe_nginx` (Nginx)

### 6. Access the Application
Open your browser and navigate to:
```
http://localhost:8008
```

---

## ⚙️ Configuration

### Environment Variables (.env)

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `POSTGRES_USER` | PostgreSQL username | `netvibe_admin` | ✅ Yes |
| `POSTGRES_PASSWORD` | PostgreSQL password (64+ chars) | *Generated* | ✅ Yes |
| `POSTGRES_DB` | PostgreSQL database name | `netvibe_analytics` | ✅ Yes |
| `DATABASE_URL` | Full PostgreSQL connection string | *Auto-constructed* | ✅ Yes |
| `REDIS_URL` | Redis connection string | `redis://redis_cache:6379/0` | ✅ Yes |
| `SUBMISSION_RATE_LIMIT` | Rate limit in seconds | `600` (10 min) | ❌ No |
| `NGINX_PORT` | External port for Nginx | `8008` | ❌ No |

### Custom Port Configuration
To change the default port (8008):
```bash
# Edit .env file
NGINX_PORT=8080

# Restart services
docker compose down
docker compose up -d
```

---

## 🎮 Usage

### For End Users

1. **Visit the Platform**: Navigate to `http://localhost:8008`
2. **View Your IP Info**: See your ISP, location, and ASN automatically
3. **Start Network Test**: Click "شروع تست پایداری شبکه" (Start Network Test)
4. **Watch the Radar**: Real-time visualization of connectivity checks
5. **View Results**: See which sites are accessible vs. filtered/blocked
6. **Compare ISPs**: Scroll down to see ISP rankings across all tested services

### Site Testing List
The platform tests these 10 services:
- **Social Media**: Instagram, Telegram, YouTube
- **Developer Tools**: GitHub, Docker Hub, ChatGPT
- **General Utilities**: Google, Wikipedia
- **Local Services**: Aparat, Digikala

### Data Privacy
- ✅ **Only hashed IPs** are stored (SHA-256)
- ✅ **No cookies or tracking**
- ✅ **Anonymous submissions**
- ✅ **Client-side testing** (no proxy/VPN detection abuse)

---

## 📚 API Documentation

### Base URL
```
http://localhost:8008/api/v1
```

### Interactive Docs
- **Swagger UI**: `http://localhost:8008/api/docs`
- **ReDoc**: `http://localhost:8008/api/redoc`

### Endpoints

#### 1. Get User IP Information
```http
GET /api/v1/ip-info
```

**Response:**
```json
{
  "ip": "185.129.190.56",
  "isp": "Pishgaman Toseeh Fanavari Etelaat Co.",
  "normalized_isp": "Pishgaman",
  "asn": "AS44244",
  "city": "Tehran",
  "region": "Tehran",
  "country": "Iran",
  "country_code": "IR",
  "latitude": 35.6944,
  "longitude": 51.4215,
  "hosting": false,
  "proxy": false
}
```

#### 2. Submit Test Report
```http
POST /api/v1/submit-report
Content-Type: application/json
```

**Request Body:**
```json
{
  "results": {
    "Instagram": {
      "status": "offline",
      "ping_ms": null
    },
    "Google": {
      "status": "online",
      "ping_ms": 45
    }
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Report submitted successfully.",
  "report_id": 123,
  "isp": "Hamrah-e-Aval (MCI)"
}
```

**Rate Limit**: 429 Too Many Requests (if < 10 minutes since last submission)

#### 3. Get Dashboard Statistics
```http
GET /api/v1/dashboard-stats
```

**Response:**
```json
{
  "total_scans_24h": 1523,
  "unique_isps_count": 8,
  "isp_rankings": {
    "Hamrah-e-Aval (MCI)": {
      "Instagram": {
        "online_count": 12,
        "offline_count": 88,
        "avg_ping": null,
        "success_rate": 0.12
      }
    }
  }
}
```

**Caching**: Results cached for 15 seconds in Redis

---

## 🔒 Security

### Best Practices Implemented

#### 🛡️ Credential Management
- ✅ **No hardcoded secrets** in source code
- ✅ **Environment variable injection** for all sensitive data
- ✅ **64-character random passwords** generated cryptographically
- ✅ **`.gitignore`** prevents accidental commits of `.env`

#### 🔐 Application Security
- ✅ **IP hashing** (SHA-256) before storage
- ✅ **Rate limiting** via Redis (prevents spam)
- ✅ **CORS headers** configured appropriately
- ✅ **Input validation** with Pydantic models
- ✅ **SQL injection protection** via SQLAlchemy ORM
- ✅ **No personal data collection** (GDPR/privacy-friendly)

#### 🚨 Production Checklist
Before deploying to production:

```bash
# 1. Regenerate secrets for production
python3 generate_secrets.py

# 2. Use strong, unique passwords (64+ characters)
# 3. Enable HTTPS with SSL/TLS certificates
# 4. Configure firewall rules (allow only 443/80)
# 5. Set up automated backups for PostgreSQL
# 6. Monitor logs for suspicious activity
# 7. Keep Docker images updated
# 8. Use a secrets manager (e.g., HashiCorp Vault) for large deployments
```

### IP Detection Failover Chain
To ensure reliability, the backend uses a 3-tier IP detection system:
1. **Primary**: `ipmyp.ir` (with live nonce scraping)
2. **Failover 1**: `ip-api.com`
3. **Failover 2**: `ipapi.co`
4. **Final Fallback**: Mock data based on IP prefix

---

## 🛠️ Development

### Project Structure
```
netvibe/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # FastAPI application
│   │   ├── config.py        # Environment variable settings
│   │   ├── database.py      # SQLAlchemy setup
│   │   ├── models.py        # Database models
│   │   ├── schemas.py       # Pydantic schemas
│   │   └── utils.py         # IP detection & utilities
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── globals.css
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── components/
│   │       ├── RadarChart.tsx
│   │       ├── ISPStatsTable.tsx
│   │       └── NetworkStatusDashboard.tsx
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── next.config.js
├── nginx/
│   ├── default.conf
│   └── Dockerfile
├── docker-compose.yml
├── generate_secrets.py
├── .env.example
├── .gitignore
└── README.md
```

### Local Development (Without Docker)

#### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set environment variables
export DATABASE_URL="postgresql://user:pass@localhost/netvibe"
export REDIS_URL="redis://localhost:6379/0"

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Frontend
```bash
cd frontend
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

### Running Tests
```bash
# Backend tests (if implemented)
cd backend
pytest

# Frontend tests (if implemented)
cd frontend
npm test
```

---

## 🚀 Deployment

### Docker Compose (Recommended)
```bash
# Production build
docker compose up --build -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Stop and remove volumes (⚠️ deletes database)
docker compose down -v
```

### Cloud Deployment Options

#### VPS (Digital Ocean, Linode, Vultr)
```bash
# 1. SSH into your server
ssh root@your-server-ip

# 2. Install Docker & Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 3. Clone and deploy
git clone https://github.com/yourusername/netvibe.git
cd netvibe
python3 generate_secrets.py
docker compose up -d

# 4. Configure firewall
ufw allow 8008/tcp
ufw enable
```

#### Nginx Reverse Proxy (SSL with Let's Encrypt)
```nginx
server {
    listen 443 ssl http2;
    server_name netvibe.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:8008;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Bug Reports & Feature Requests
Open an issue on GitHub with:
- Clear description of the problem/feature
- Steps to reproduce (for bugs)
- Expected vs. actual behavior
- Screenshots (if applicable)

### Pull Requests
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- **Backend**: Follow PEP 8 (Python)
- **Frontend**: Follow ESLint rules (TypeScript/React)
- **Commits**: Use conventional commits (e.g., `feat:`, `fix:`, `docs:`)

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 NetVibe Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## 🙏 Acknowledgments

- **FastAPI** - Modern, fast web framework for Python
- **Next.js** - React framework for production
- **Tailwind CSS** - Utility-first CSS framework
- **Lucide Icons** - Beautiful open-source icons
- **PostgreSQL** - Powerful open-source database
- **Redis** - In-memory data structure store
- **Nginx** - High-performance HTTP server

---


**Made with ❤️ for a free and open internet**

*NetVibe is an independent, community-driven project. It is not affiliated with any government or ISP.*
