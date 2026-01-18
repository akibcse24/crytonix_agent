'use client';

import { KnowledgeExplorer } from '@/components/KnowledgeExplorer';
import { CommandNavigation } from '@/components/CommandNavigation';

export default function KnowledgePage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-black">
            <CommandNavigation />
            <KnowledgeExplorer />
        </div>
    );
}
