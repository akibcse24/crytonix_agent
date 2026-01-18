'use client';

import { AgentBuilder } from '@/components/AgentBuilder';
import { CommandNavigation } from '@/components/CommandNavigation';

export default function AgentsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
            <CommandNavigation />
            <AgentBuilder />
        </div>
    );
}
