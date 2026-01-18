# Crytonix API Documentation

Base URL: `http://localhost:3000/api`

## 🤖 Agent Endpoints

### POST /api/agent/chat
Chat with an AI agent (supports streaming).

**Request:**
```json
{
  "message": "What is 25 * 8?",
  "agentConfig": {
    "name": "Crytonix Assistant",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "temperature": 0.7
  },
  "tools": ["calculator", "get_current_time"],
  "stream": true
}
```

**Response (Non-streaming):**
```json
{
  "response": "25 * 8 = 200",
  "reactSteps": [...],
  "conversationHistory": [...]
}
```

**Streaming:** Set `stream: true` for Server-Sent Events (SSE) format.

---

### POST /api/agent/task
Execute multi-agent tasks with orchestration.

**Request:**
```json
{
  "task": "Research AI trends and create a summary",
  "agents": [
    {
      "id": "researcher",
      "name": "Research Agent",
      "role": "researcher",
      "provider": "openai",
      "tools": ["web_search"]
    },
    {
      "id": "writer",
      "name": "Writer Agent",
      "role": "custom",
      "provider": "anthropic"
    }
  ],
  "strategy": "sequential",
  "maxIterations": 10,
  "timeout": 60000
}
```

**Orchestration Modes:**
- `sequential` - Agents execute one after another
- `parallel` - All agents run simultaneously
- `hierarchical` - Manager delegates to workers
- `consensus` - Multiple agents vote on output

**Response:**
```json
{
  "success": true,
  "output": "Combined agent output...",
  "executions": [...],
  "totalCost": 0.05,
  "totalTokens": 2500,
  "executionTime": 5000
}
```

---

## 📚 Knowledge Base Endpoints

### GET /api/knowledge
Search or filter knowledge entries.

**Query Parameters:**
- `query` - Semantic search query
- `category` - Filter by category
- `tag` - Filter by tag
- `limit` - Max results (default: 10)

**Response:**
```json
{
  "results": [
    {
      "id": "uuid",
      "title": "Entry Title",
      "content": "Entry content...",
      "category": "technical",
      "tags": ["ai", "agents"],
      "createdAt": "2026-01-18T...",
      "updatedAt": "2026-01-18T..."
    }
  ],
  "count": 1
}
```

---

### POST /api/knowledge
Add a new knowledge entry.

**Request:**
```json
{
  "title": "Introduction to RAG",
  "content": "RAG combines retrieval with generation...",
  "category": "technical",
  "tags": ["rag", "ai"],
  "source": "research paper"
}
```

**Response:**
```json
{
  "id": "uuid",
  "success": true
}
```

---

### PUT /api/knowledge
Update an existing entry.

**Request:**
```json
{
  "id": "uuid",
  "title": "Updated Title",
  "content": "Updated content..."
}
```

---

### DELETE /api/knowledge?id=uuid
Delete a knowledge entry.

---

## 🧠 RAG Endpoint

### POST /api/rag
Query with Retrieval-Augmented Generation.

**Request:**
```json
{
  "query": "Explain how RAG works",
  "topK": 5,
  "temperature": 0.7,
  "maxTokens": 2000
}
```

**Response:**
```json
{
  "response": "RAG works by...",
  "tokens": {
    "prompt": 500,
    "completion": 300,
    "total": 800
  },
  "cost": 0.008,
  "latency": 2500
}
```

---

## 🔧 Tools Endpoints

### GET /api/tools
List all available tools.

**Query Parameters:**
- `category` - Filter by category (web, code, file, data, api, utility)

**Response:**
```json
{
  "tools": [
    {
      "name": "calculator",
      "description": "Perform mathematical calculations",
      "category": "utility",
      "parameters": [...]
    }
  ],
  "count": 23
}
```

---

### POST /api/tools
Execute a tool.

**Request:**
```json
{
  "toolName": "calculator",
  "params": {
    "expression": "25 * 8"
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "result": 200
  },
  "executionTime": 5,
  "toolName": "calculator"
}
```

---

## 📊 System Status

### GET /api/status
Get system health and statistics.

**Response:**
```json
{
  "system": {
    "name": "Crytonix",
    "version": "0.1.0",
    "status": "operational",
    "uptime": 12345,
    "memory": {
      "used": 150000000,
      "total": 300000000,
      "rss": 200000000
    }
  },
  "providers": {
    "openai": true,
    "anthropic": true,
    "groq": false,
    "google": true,
    "ollama": false
  },
  "tools": {
    "total": 23,
    "categories": {
      "web": 5,
      "code": 4,
      "file": 5,
      "data": 6,
      "utility": 3
    }
  },
  "knowledge": {
    "entries": 10,
    "categories": 3,
    "tags": 8,
    "vectorStore": {
      "documents": 10,
      "enabled": false
    }
  }
}
```

---

## Error Responses

All endpoints return errors in this format:

```json
{
  "error": "Error message description"
}
```

**Status Codes:**
- `200` - Success
- `400` - Bad Request
- `404` - Not Found
- `500` - Internal Server Error
