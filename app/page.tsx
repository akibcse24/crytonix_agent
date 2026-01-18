import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Terminal, Zap, Brain, Code2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="relative min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black overflow-hidden">
      {/* Scan Lines Effect */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(transparent_50%,rgba(0,217,255,0.02)_50%)] bg-[length:100%_4px] opacity-20"></div>

      {/* Grid Background */}
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(rgba(0,217,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(0,217,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_80%)]"></div>

      <div className="relative max-w-7xl mx-auto px-6 py-20">
        {/* Header */}
        <div className="text-center space-y-8 mb-16">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="relative">
              <img
                src="/crytonix-logo.png"
                alt="Crytonix Logo"
                className="w-32 h-32 md:w-40 md:h-40 drop-shadow-[0_0_30px_rgba(0,217,255,0.5)] animate-pulse"
              />
              <div className="absolute -bottom-2 -right-2 bg-cyan-500 text-black px-2 py-1 rounded text-xs font-mono font-bold">
                v0.1.0
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-2 font-mono text-cyan-500 text-sm">
              <Terminal className="w-4 h-4" />
              <span>INITIALIZING SYSTEM...</span>
            </div>
            <h1 className="text-6xl md:text-7xl font-bold font-mono tracking-tight">
              <span className="bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-400 bg-clip-text text-transparent">
                CRYTONIX
              </span>
            </h1>
            <p className="text-xl text-cyan-100 max-w-2xl mx-auto font-mono">
              &gt; Universal AI Agent System with Multi-Provider Support
            </p>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-950/20 font-mono">
              <Zap className="w-3 h-3 mr-1" />
              5+ LLM PROVIDERS
            </Badge>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-950/20 font-mono">
              <Code2 className="w-3 h-3 mr-1" />
              23+ TOOLS
            </Badge>
            <Badge variant="outline" className="border-cyan-500/50 text-cyan-400 bg-cyan-950/20 font-mono">
              <Brain className="w-3 h-3 mr-1" />
              RAG ENABLED
            </Badge>
          </div>

          {/* CTAs */}
          <div className="flex gap-4 justify-center pt-8">
            <Link href="/dashboard">
              <Button
                size="lg"
                className="bg-cyan-600 hover:bg-cyan-500 text-black font-mono font-bold group"
              >
                ACCESS TERMINAL
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="https://github.com/akibcse24/crytonix_agent" target="_blank">
              <Button
                size="lg"
                variant="outline"
                className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-950/20 font-mono"
              >
                VIEW SOURCE
              </Button>
            </Link>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              title: 'MULTI-AGENT',
              desc: 'Orchestrate multiple AI agents with sequential, parallel, hierarchical, and consensus modes',
              icon: '🤖',
            },
            {
              title: 'SMART ROUTING',
              desc: 'Automatic provider selection based on cost, speed, quality, and capability requirements',
              icon: '⚡',
            },
            {
              title: 'TOOL EXECUTION',
              desc: 'Built-in tools for web scraping, code execution, file operations, and database queries',
              icon: '🔧',
            },
          ].map((feature, i) => (
            <div
              key={i}
              className="bg-black border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-400/50 transition-all hover:shadow-[0_0_20px_rgba(0,217,255,0.1)] group"
            >
              <div className="text-4xl mb-3">{feature.icon}</div>
              <h3 className="font-mono font-bold text-cyan-400 mb-2 group-hover:text-cyan-300 transition-colors">
                [{feature.title}]
              </h3>
              <p className="text-sm text-cyan-100/70 font-mono leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Terminal Preview */}
        <div className="mt-16 max-w-4xl mx-auto">
          <div className="bg-black border border-cyan-500/30 rounded-lg overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-cyan-950/20 border-b border-cyan-500/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <span className="font-mono text-xs text-cyan-400 ml-2">crytonix@terminal:~$</span>
            </div>
            <div className="p-6 font-mono text-sm space-y-2">
              <div className="text-green-400">&gt; crytonix --status</div>
              <div className="text-cyan-100 pl-4">
                ✓ System initialized<br />
                ✓ 5 LLM providers connected<br />
                ✓ 23 tools loaded<br />
                ✓ RAG pipeline active<br />
                <span className="text-cyan-500">[READY]</span> Awaiting commands...
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
