# 🤖 Crytonix - Universal AI Agent System

A powerful, multi-provider agentic AI platform built with Next.js 14+, featuring intelligent routing, tool execution, RAG capabilities, and comprehensive knowledge management.

**Optimized for Render's Hobby Plan** - Production-ready with <300MB memory footprint.

![Crytonix Logo](./public/crytonix-logo.png)

## ✨ Features

- **🌐 Multi-Provider Support**: OpenAI, Anthropic (Claude), Groq, Google (Gemini), Ollama, Azure OpenAI
- **🤖 Smart Routing**: Automatic provider selection based on cost, speed, and capability
- **⚡ Multi-Agent Orchestration**: Sequential, parallel, hierarchical, and consensus modes
- **🔧 Tool Execution**: Secure sandboxed execution with web search, code running, and API calls
- **🧠 Advanced Memory**: Vector embeddings, knowledge graphs, and semantic search
- **📊 Cost Tracking**: Real-time token usage and cost monitoring across providers
- **🎨 Modern UI**: Built with shadcn-ui and Tailwind CSS

## 🚀 Quick Start

### Prerequisites

- Node.js 20+ and npm
- PostgreSQL database (free tier on Render works)
- At least one LLM provider API key

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd ai_agents

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local and add your API keys

# Run development server
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 📦 Project Structure

```
/app                      # Next.js App Router
  /api                    # API routes
    /agent                # Agent endpoints
    /provider             # Provider management
/lib                      # Core business logic
  /llm                    # LLM provider layer
    /providers            # Individual provider adapters
  /agent                  # Agent system
  /tools                  # Tool implementations
  /memory                 # Memory & knowledge systems
  /types                  # TypeScript definitions
/components               # React components
  /ui                     # shadcn-ui components
  /chat                   # Chat interface
  /dashboard              # Dashboard
  /agent-builder          # Agent builder
/prisma                   # Database schema
```

## ⚙️ Environment Configuration

Required environment variables (see `.env.example`):

```env
# Database
DATABASE_URL="postgresql://..."

# At least one LLM provider
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
GOOGLE_API_KEY="..."

# NextAuth
NEXTAUTH_SECRET="..." # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"
```

## 🎯 Deployment to Render

This app is optimized for Render's hobby plan (512MB RAM):

### 1. Create PostgreSQL Database

- Go to Render Dashboard → New → PostgreSQL
- Use the free tier
- Copy the Internal Database URL

### 2. Create Web Service

- Go to Render Dashboard → New → Web Service
- Connect your GitHub repository
- Configure:
  - **Build Command**: `npm install && npm run build`
  - **Start Command**: `npm start`
  - **Instance Type**: Starter ($7/mo) or Free

### 3. Add Environment Variables

Add all variables from `.env.example` in Render's environment settings:

```
DATABASE_URL=<your-postgres-url>
OPENAI_API_KEY=<your-key>
NEXTAUTH_SECRET=<generate-with-openssl>
NEXTAUTH_URL=<your-render-url>
NODE_ENV=production
```

### 4. Deploy

- Click "Create Web Service"
- Render will automatically deploy on git push

## 🛠️ Development

```bash
# Run dev server with turbopack
npm run dev

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format

# Build for production
npm run build
```

## 📊 Optimization for Render Hobby Plan

- **Memory Efficient**: In-memory caching instead of Redis
- **Connection Pooling**: Limited database connections (5 max)
- **Lazy Loading**: Dynamic imports for heavy components
- **Edge Functions**: Using Next.js edge runtime where possible
- **Small Bundle**: Tree-shaking and dependency optimization

## 🗺️ Roadmap

- [x] Phase 1: Project Foundation & Setup
- [ ] Phase 2: Database & Infrastructure (optimized for Render)
- [ ] Phase 3: LLM Provider Abstraction Layer
- [ ] Phase 4: Agent Core System
- [ ] Phase 5: Tool System
- [ ] Phase 6: Memory & Knowledge System
- [ ] Phase 7: API Layer
- [ ] Phase 8-11: Frontend Components
- [ ] Phase 12: Security & Authentication
- [ ] Phase 13-16: Monitoring, Deployment, Testing, Documentation

## 🤝 Contributing

This is an active development project. Contributions are welcome!

## 📄 License

MIT License

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Radix UI](https://www.radix-ui.com/)
