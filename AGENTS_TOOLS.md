# Agent System with Tools

## 🤖 Built-in Tools

The agent system comes with comprehensive built-in tools:

### Web & API Tools
- **web_search** - Search the web for information
- **http_request** - Make HTTP requests to external APIs

### Data Tools
- **analyze_text** - Analyze text (word count, character count, etc.)
- **parse_json** - Parse and validate JSON

### Utility Tools
- **calculator** - Perform mathematical calculations
- **get_current_time** - Get current date and time

## 🔧 Custom Tools

Create custom tools easily:

```typescript
import { toolRegistry } from '@/lib/tools';

// Register a custom tool
toolRegistry.registerCustomTool(
  'my_custom_tool',
  'Description of what this tool does',
  async (params) => {
    // Your tool logic here
    return { result: 'success' };
  },
  'utility' // category
);
```

## 🌐 MCP Server Integration

Integrate external MCP (Model Context Protocol) servers:

```typescript
import { toolRegistry } from '@/lib/tools';

// Register an MCP server
await toolRegistry.registerMCPServer('my-mcp-server', {
  command: 'node',
  args: ['path/to/mcp-server.js'],
  env: {
    API_KEY: 'your-key',
  },
});

// The server's tools will be automatically available
```

## 📖 Usage

```typescript
import { Agent, AgentManager, toolRegistry } from '@/lib/agent';

// Create an agent with tools
const agent = new Agent({
  id: 'agent-1',
  name: 'Research Agent',
  role: 'researcher',
  systemPrompt: 'You are a helpful research assistant',
  provider: 'openai',
  tools: ['web_search', 'calculator', 'my_custom_tool'],
  isActive: true,
});

// Register built-in tools with the agent
const webSearch = toolRegistry.get('web_search');
if (webSearch) {
  agent.registerTool('web_search', webSearch.execute);
}

// Run the agent
const result = await agent.run('Search for information about AI agents');
console.log(result);
```

## 🎯 Multi-Agent Orchestration

```typescript
import { AgentManager } from '@/lib/agent';

const manager = new AgentManager();

// Register agents
const researcher = manager.registerAgent({
  id: 'researcher',
  name: 'Researcher',
  role: 'researcher',
  systemPrompt: 'Research and gather information',
  provider: 'openai',
  tools: ['web_search'],
  isActive: true,
});

const analyst = manager.registerAgent({
  id: 'analyst',
  name: 'Analyst',
  role: 'analyst',
  systemPrompt: 'Analyze data and draw conclusions',
  provider: 'anthropic',
  tools: ['calculator'],
  isActive: true,
});

// Execute multi-agent task
const result = await manager.executeTask({
  id: 'task-1',
  task: 'Research AI trends and analyze the data',
  strategy: 'sequential', // researcher → analyst
  agents: ['researcher', 'analyst'],
  maxIterations: 10,
  timeout: 60000,
});

console.log(result.output);
```

## 📊 Available Orchestration Modes

- **sequential**: Agents execute one after another (A → B → C)
- **parallel**: All agents execute simultaneously
- **hierarchical**: Manager agent delegates to worker agents
- **consensus**: Multiple agents vote on the best output

## 💾 Memory Management

Agents have built-in short-term and long-term memory:

```typescript
const agent = new Agent(config);

// Memory is automatic, but you can access it
const state = agent.getState();
console.log(state.memory.shortTerm); // Recent messages
console.log(state.memory.longTerm); // Important memories
console.log(state.memory.entityGraph); // Extracted entities
```

## 🧠 ReAct Pattern

Agents use the ReAct pattern (Reason + Act):

1. **Thought**: Agent thinks about what to do
2. **Action**: Agent decides to use a tool
3. **Observation**: Agent sees the tool result
4. **Repeat** until final answer

```typescript
// Get ReAct steps for debugging
const steps = agent.getReActSteps();
console.log(steps);
// [
//   { thought: "I need to search for...", action: {...}, observation: "..." },
//   { thought: "Based on that...", action: {...}, observation: "..." },
// ]
```
