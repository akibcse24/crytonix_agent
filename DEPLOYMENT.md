# Crytonix Deployment Guide

Complete guide for deploying Crytonix AI Agent to production.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Local Development with Docker](#local-development-with-docker)
- [Production Deployment Options](#production-deployment-options)
  - [Docker Deployment](#docker-deployment)
  - [Vercel Deployment](#vercel-deployment)
  - [Railway Deployment](#railway-deployment)
  - [Render Deployment](#render-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Setup](#database-setup)
- [Post-Deployment](#post-deployment)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required
- **Node.js 20+** (for local development)
- **Docker & Docker Compose** (for containerized deployment)
- **PostgreSQL 16+** (for database)
- **At least one LLM API key** (OpenAI, Anthropic, Groq, Google, or OpenRouter)

### Optional
- **Redis** (for caching and rate limiting)
- **Ollama** (for local LLM models)
- **Upstash Redis** (for serverless rate limiting)

---

## Local Development with Docker

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/crytonix.git
cd crytonix

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your API keys
```

### 2. Configure Environment

Edit `.env.local`:

```env
# Required
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
ENCRYPTION_KEY=<run: openssl rand -hex 32>

# At least one LLM provider
OPENAI_API_KEY=sk-...
# or
ANTHROPIC_API_KEY=sk-ant-...
# or
GROQ_API_KEY=gsk_...

# Database (handled by docker-compose)
DATABASE_URL=postgresql://crytonix:crytonix_password@postgres:5432/crytonix
```

### 3. Start Services

```bash
# Start all services (app, postgres, redis, ollama)
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop services
docker-compose down
```

Access at: **http://localhost:3000**

---

## Production Deployment Options

### Option 1: Docker Deployment

**Best for:** VPS, self-hosted, full control

#### Build and Run

```bash
# Build production image
docker build -t crytonix:latest .

# Run with environment file
docker run -d \
  --name crytonix \
  -p 3000:3000 \
  --env-file .env.production \
  crytonix:latest

# Or use docker-compose
docker-compose -f docker-compose.yml up -d
```

#### Docker Compose Production

```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  app:
    image: ghcr.io/your-username/crytonix:latest
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    ports:
      - "3000:3000"
    restart: always
```

```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

### Option 2: Vercel Deployment

**Best for:** Serverless, easy deployment, auto-scaling

#### One-Click Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/your-username/crytonix)

#### Manual Deploy

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Environment Variables

In Vercel Dashboard, add:
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your vercel domain)
- All LLM API keys
- `DATABASE_URL` (use Vercel Postgres or Neon)

**Note:** Vercel has **10-second function timeout** on hobby plan. Consider upgrading for long-running LLM tasks.

---

### Option 3: Railway Deployment

**Best for:** Simple deployment, built-in PostgreSQL/Redis

#### Deploy Steps

1. Visit [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub"
3. Select your Crytonix repository
4. Add PostgreSQL and Redis services
5. Configure environment variables
6. Deploy!

Railway automatically:
- Detects Next.js
- Builds and deploys
- Provides domain
- Scales on demand

---

### Option 4: Render Deployment

**Best for:** Docker-based, affordable hosting

#### Deploy Steps

1. Create `render.yaml`:

```yaml
services:
  - type: web
    name: crytonix
    env: docker
    plan: starter
    envVars:
      - key: DATABASE_URL
        fromDatabase:
          name: crytonix-db
          property: connectionString
      - key: NEXTAUTH_SECRET
        generateValue: true
      - key: OPENAI_API_KEY
        sync: false

databases:
  - name: crytonix-db
    plan: starter
```

2. Push to GitHub
3. Connect on Render dashboard
4. Deploy!

---

## Environment Configuration

### Required Variables

```env
# Auth
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=<32-byte-secret>
ENCRYPTION_KEY=<32-byte-hex>

# Database
DATABASE_URL=postgresql://user:pass@host:5432/db

# LLM Providers (at least one)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GROQ_API_KEY=gsk_...
GOOGLE_API_KEY=...
OPENROUTER_API_KEY=sk-or-...
```

### Optional Variables

```env
# OAuth
GITHUB_ID=...
GITHUB_SECRET=...
GOOGLE_ID=...
GOOGLE_SECRET=...

# Rate Limiting (Upstash)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Ollama (local models)
OLLAMA_HOST=http://localhost:11434
ENABLE_OLLAMA=true

# Custom Domains
ALLOWED_ORIGINS=https://your-domain.com,https://www.your-domain.com
```

---

## Database Setup

### Option 1: Docker PostgreSQL

Included in `docker-compose.yml`:

```bash
docker-compose up -d postgres
```

### Option 2: Managed PostgreSQL

**Providers:**
- **Vercel Postgres** (Vercel deployments)
- **Neon** (serverless PostgreSQL)
- **Supabase** (PostgreSQL + auth)
- **Railway** (built-in)
- **Render** (built-in)

### Run Migrations

```bash
# Install Prisma CLI
npm install -g prisma

# Run migrations
npx prisma migrate deploy

# Seed database (optional)
npx prisma db seed
```

---

## Post-Deployment

### 1. Verify Health

```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "uptime": 123.45,
  "providers": {
    "openai": true,
    "anthropic": false,
    ...
  }
}
```

### 2. Test Authentication

1. Visit `/auth/signin`
2. Login with GitHub or Google
3. Should redirect to `/dashboard`

### 3.Test LLM Providers

```bash
curl -X POST https://your-domain.com/api/agent/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Hello, test!"}'
```

### 4. Monitor Logs

```bash
# Docker
docker logs -f crytonix

# Vercel
vercel logs

# Railway
railway logs

# Render
# View in dashboard
```

---

## Monitoring

### Health Checks

- **Endpoint:** `GET /api/health`
- **Frequency:** Every 30 seconds
- **Timeout:** 3 seconds

### Metrics

- **Endpoint:** `GET /api/metrics?window=3600`
- **Data:** Costs, latency, errors, tokens

### Logs

Logs are stored in:
- **Development:** Console + `logs/` directory
- **Production:** `logs/` directory (configure rotation)

### Log Levels

```env
LOG_LEVEL=info  # debug|info|warn|error
```

---

## Troubleshooting

### Issue: "API key for openai not found"

**Solution:** Add `OPENAI_API_KEY` to environment variables and restart.

### Issue: "Database connection failed"

**Solution:**app Check `DATABASE_URL` format:
```
postgresql://username:password@host:5432/database?schema=public
```

### Issue: "Rate limit exceeded"

**Solution:** Configure Upstash Redis or increase in-memory limit.

### Issue: "CORS error"

**Solution:** Add your domain to `ALLOWED_ORIGINS`:
```env
ALLOWED_ORIGINS=https://your-domain.com
```

### Issue: "OAuth callback error"

**Solution:**
1. Check `NEXTAUTH_URL` matches your domain
2. Update OAuth redirect URIs in GitHub/Google console
3. Verify `NEXTAUTH_SECRET` is set

### Issue: "Docker build fails"

**Solution:**
1. Check Node version: `node --version` (need 20+)
2. Clear build cache: `docker builder prune`
3. Rebuild: `docker-compose build --no-cache`

### Issue: "High memory usage"

**Solution:**
1. Limit Node memory: `NODE_OPTIONS=--max-old-space-size=2048`
2. Use Redis for caching
3. Enable response streaming

---

## Performance Optimization

### 1. Enable Caching

```env
ENABLE_CACHE=true
CACHE_TTL=3600  # 1 hour
```

### 2. Use CDN

For static assets, use:
- Vercel CDN (automatic on Vercel)
- Cloudflare CDN
- CloudFront

### 3. Database Connection Pooling

```env
# Prisma connection pooling
DATABASE_URL="postgresql://...?connection_limit=10&pool_timeout=10"
```

### 4. Redis Caching

Use Redis for:
- LLM response caching
- Rate limiting
- Session storage

---

## Scaling

### Horizontal Scaling

```bash
# Docker Swarm
docker service scale crytonix=3

# Kubernetes
kubectl scale deployment crytonix --replicas=3
```

### Serverless Scaling

Vercel/Railway automatically scale based on traffic.

### Database Scaling

- Use read replicas
- Enable connection pooling
- Consider PgBouncer

---

## Backup & Recovery

### Database Backup

```bash
# PostgreSQL backup
pg_dump -U crytonix crytonix > backup.sql

# Restore
psql -U crytonix crytonix < backup.sql
```

### Automated Backups

Configure with your hosting provider:
- **Vercel:** Automatic Postgres backups
- **Railway:** Daily backups
- **Render:** Point-in-time recovery

---

## Security Checklist

- ✅ Use HTTPS in production
- ✅ Rotate secrets regularly
- ✅ Enable rate limiting
- ✅ Configure CORS properly
- ✅ Use environment variables (never commit secrets)
- ✅ Enable authentication
- ✅ Monitor logs for suspicious activity
- ✅ Keep dependencies updated
- ✅ Use strong `NEXTAUTH_SECRET` and `ENCRYPTION_KEY`

---

## Support

- **Documentation:** `/docs`
- **Health Check:** `/api/health`
- **Metrics:** `/api/metrics`
- **Security:** `SECURITY.md`
- **API Docs:** `API.md`

---

**Happy Deploying! 🚀**
