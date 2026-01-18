Here's an expanded prompt for a **multi-provider agentic AI system** (supporting OpenAI, Anthropic, Groq, Google, Ollama, and more):

---

**PROMPT: "Build a Universal Agentic AI System with Next.js"**

```
Create a Next.js 14+ production-ready agentic AI system that orchestrates multiple LLM providers through a unified interface.

## 🌐 UNIFIED LLM PROVIDER ARCHITECTURE

**Supported Providers**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3.5 Sonnet, Haiku)
- Groq (Llama 3, Mixtral)
- Google (Gemini 1.5)
- Ollama (local models)
- Azure OpenAI
- Perplexity

**Provider Abstraction Layer**:
- Single interface: `llm.generate()` works across all providers
- Automatic fallback on provider failures
- Smart model routing based on task type, cost, rate limits
- Real-time cost tracking per provider/token
- Streaming support normalized across all platforms

## 🏗️ TECHNICAL STACK

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript 5.3+
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis for rate limiting & session storage
- **Queue**: BullMQ for async agent tasks
- **State**: Zustand + React Context for runtime state
- **API Layer**: tRPC or Next.js API Routes with Zod validation
- **UI**: shadcn-ui + Tailwind CSS + Radix UI
- **Testing**: Vitest + Playwright

## 🤖 AGENT SYSTEM CAPABILITIES

### 1. Universal Tool Calling
- **OpenAI Functions** format as standard (adapts to each provider)
- Built-in tools: web search, file operations, API calls, calculations
- Dynamic tool registration from `/lib/tools/registry.ts`
- Tool execution sandbox (VM2 for security)
- Automatic tool result chunking for context limits

### 2. Advanced Memory System
- **Short-term**: In-memory conversation buffers
- **Long-term**: Vector embeddings in PostgreSQL (pgvector)
- **Entity extraction**: Automatic NER into knowledge graph
- **Semantic search**: Hybrid keyword + vector search
- **Conversation summarization**: Running summaries to manage context

### 3. Multi-Agent Orchestration Engine
- **Agent Types**: Researcher, Coder, Analyst, Planner, Critic, Executor
- **Orchestration Modes**:
  - `sequential`: Agent A → Agent B → Agent C
  - `parallel`: Agents run simultaneously, aggregator combines
  - `hierarchical`: Manager agent delegates to workers
  - `consensus`: Multiple agents vote on output
- **Agent communication**: Shared memory + message passing
- **Task decomposition**: Automatic splitting of complex tasks

### 4. Planning & Reasoning
- **ReAct pattern**: Thought → Action → Observation loops
- **Chain-of-thought**: Explicit reasoning in output
- **Self-reflection**: Agents review their own work
- **Plan generation**: Create step-by-step plans before execution
- **Plan execution**: Track progress through plan steps

## 📁 PROJECT STRUCTURE

```
/app
  /api
    /agent
      /chat/route.ts           # Main agent endpoint
      /thread/[id]/route.ts    # Thread CRUD
      /task/route.ts           # Task orchestration
    /provider
      /models/route.ts         # Available models
      /cost/route.ts           # Cost tracking
/lib
  /llm
    /providers
      openai.ts                # OpenAI adapter
      anthropic.ts             # Anthropic adapter
      groq.ts                  # Groq adapter
      google.ts                # Google adapter
      ollama.ts                # Ollama adapter
    llm-router.ts              # Smart routing logic
    cost-calculator.ts         # Cost per token tracking
  /agent
    Agent.ts                   # Base agent class
    AgentManager.ts            # Multi-agent orchestrator
    MemoryManager.ts           # Memory operations
    ToolExecutor.ts            # Tool execution with sandbox
  /tools
    registry.ts                # Tool registration
    web-search.ts
    code-executor.ts
    file-system.ts
  /memory
    vector-store.ts            # pgvector operations
    knowledge-graph.ts         # Entity relationships
  /types
    llm.types.ts               # Unified LLM interfaces
    agent.types.ts
    tool.types.ts
/prisma
  schema.prisma
```

## 🔌 PROVIDER ADAPTER SPECIFICATION

Each provider adapter implements:
```typescript
interface LLMProvider {
  name: string;
  generate: (params: LLMParams) => Promise<LLMResponse>;
  stream: (params: LLMParams) => AsyncGenerator<string>;
  embed: (text: string) => Promise<number[]>;
  getCost: (tokens: number) => number; // per million tokens
  isAvailable: () => boolean;
}
```

**Smart Routing Rules**:
- Code → Claude 3.5 Sonnet (best for code)
- Speed → Groq (fastest)
- Cost → Ollama (free local) or Gemini (cheapest)
- Complex reasoning → GPT-4
- Fallback chain: Primary → Secondary → Tertiary

## 🎯 API ENDPOINTS

### Agent Chat
```typescript
POST /api/agent/chat
{
  "message": string,
  "agentId": string,
  "threadId"?: string,
  "provider"?: "auto" | "openai" | "anthropic" | "groq" | "google" | "ollama",
  "model"?: string, // auto-selected if not specified
  "tools"?: string[], // ["web-search", "calculator"]
  "stream"?: boolean
}
```

### Multi-Agent Task
```typescript
POST /api/agent/task
{
  "task": string,
  "strategy": "sequential" | "parallel" | "hierarchical",
  "agents": string[], // ["researcher", "analyst"]
  "maxIterations": number,
  "timeout": number
}
```

### Provider Management
```typescript
GET /api/provider/models      # List available models per provider
GET /api/provider/cost        # Current session cost breakdown
POST /api/provider/rotate-key # Rotate API keys securely
```

## 💾 DATABASE SCHEMA

```prisma
model ProviderKey {
  id        String   @id @default(cuid())
  provider  String   // openai, anthropic, etc.
  keyHash   String   // encrypted
  isActive  Boolean  @default(true)
  usage     Int      @default(0) // token count
  cost      Float    @default(0)
}

model Agent {
  id           String   @id @default(cuid())
  name         String
  role         String
  systemPrompt String
  provider     String   // Preferred provider
  tools        Json     // Available tools
  isActive     Boolean  @default(true)
}

model Thread {
  id        String    @id @default(cuid())
  agentId   String
  provider  String    // Which provider was used
  model     String    // Specific model used
  messages  Message[]
  cost      Float     @default(0)
}

model Message {
  id        String   @id @default(cuid())
  threadId  String
  role      String   // system, user, assistant, tool
  content   String?
  toolCalls Json?    // OpenAI format
  toolResult Json?
  tokens    Int?
  cost      Float?
  latency   Int?     // ms
}
```

## 🎨 FRONTEND FEATURES

### Dashboard
- Provider health status (uptime, latency)
- Real-time cost tracking with alerts
- Token usage analytics
- Agent performance metrics

### Chat Interface
- Provider/model selection dropdown
- Streaming responses with reasoning visualization
- Tool call expansion (show/hide execution details)
- Thread branching (fork conversation)
- Export conversation (PDF, Markdown)

### Agent Builder UI
- Visual agent configuration
- System prompt editor with templates
- Tool selection checkboxes
- Test agent in playground

### Knowledge Explorer
- Search memory by keyword/semantic similarity
- Visual knowledge graph
- Edit/delete long-term memories
- Import/export knowledge

## 🔐 SECURITY & AUTH

- **NextAuth.js** with GitHub, Google, Email
- **API Key Management**:
  - Encrypted at rest (AES-256)
  - Rate limiting per key
  - Usage quotas and alerts
  - Key rotation without downtime
- **Tool Sandboxing**: VM2 for tool execution isolation
- **Input Validation**: Zod schemas for all inputs
- **CORS**: Configured for secure origins only

## 📊 MONITORING

- **Observability**: OpenTelemetry tracing
- **Logging**: Winston with structured logs
- **Metrics**: Prometheus endpoints
- **Dashboard**: Grafana for LLM metrics
- **Alerts**: High cost, provider downtime, errors

## 🚀 DEPLOYMENT

### Docker Setup
```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
...
FROM node:20-alpine AS runner
...
```

### docker-compose.yml
```yaml
services:
  web: Next.js app
  postgres: Database
  redis: BullMQ + caching
  ollama: # Optional local Ollama
```

### Environment Variables
```
# Required
DATABASE_URL="postgresql://..."
REDIS_URL="redis://..."

# At least one provider key
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
GROQ_API_KEY="gsk_..."
GOOGLE_API_KEY="..."
OLLAMA_HOST="http://localhost:11434" # Optional
```

## 💰 COST MANAGEMENT

- Per-token cost calculation per provider
- Session and daily cost limits
- Budget alerts via email/webhook
- Cost-aware routing (cheapest capable model)
- Usage analytics with cost breakdown
- Automatic provider switching on budget exceed

## 🧪 TESTING STRATEGY

- **Unit**: Provider adapters, tool execution, memory operations
- **Integration**: Multi-agent workflows, API endpoints
- **E2E**: Complete user journeys (chat, task orchestration)
- **Load**: Concurrent agent execution, rate limit handling
- **Mock**: LLM responses with standard formats

## 🎯 EXAMPLE USE CASES

1. **Research Agent**: "Research 'quantum computing breakthroughs 2024', summarize top 5 findings"
2. **Code Agent**: "Debug this error [stack trace], suggest fixes, implement the best one"
3. **Analysis Agent**: "Analyze this CSV data, generate charts, write insights report"
4. **Multi-Agent**: "Planner creates research plan → Researcher executes → Reviewer validates → Writer compiles report"

## 📚 DOCUMENTATION

- README with architecture diagram
- API documentation (Swagger/OpenAPI)
- Agent creation guide
- Tool development guide
- Deployment guide
- Troubleshooting guide
```

---

**To use**: Replace bracketed sections with your specific requirements, desired providers, and agent types. This creates a **universal AI agent platform** that can route between providers based on cost, speed, and capability.