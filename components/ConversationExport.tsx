/**
 * Conversation Export Component
 * Export chat history as JSON or Markdown
 */

'use client';

import { Download, FileJson, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from './ThemeProvider';

interface Message {
    role: string;
    content: string;
    timestamp: Date;
}

interface ConversationExportProps {
    messages: Message[];
}

export function ConversationExport({ messages }: ConversationExportProps) {
    const { theme } = useTheme();
    const isCyberpunk = theme === 'cyberpunk';

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const exportAsJSON = () => {
        const data = {
            exportDate: new Date().toISOString(),
            messageCount: messages.length,
            messages: messages.map((msg) => ({
                role: msg.role,
                content: msg.content,
                timestamp: msg.timestamp.toISOString(),
            })),
        };

        downloadFile(
            JSON.stringify(data, null, 2),
            `crytonix-chat-${Date.now()}.json`,
            'application/json'
        );
    };

    const exportAsMarkdown = () => {
        let md = `# Crytonix Conversation Export\n\n`;
        md += `**Exported:** ${new Date().toLocaleString()}\n`;
        md += `**Messages:** ${messages.length}\n\n`;
        md += `---\n\n`;

        messages.forEach((msg, i) => {
            const role = msg.role === 'user' ? '👤 **User**' : msg.role === 'assistant' ? '🤖 **Crytonix**' : '⚙️ **System**';
            md += `### ${role}\n`;
            md += `*${msg.timestamp.toLocaleTimeString()}*\n\n`;
            md += `${msg.content}\n\n`;
            md += `---\n\n`;
        });

        downloadFile(md, `crytonix-chat-${Date.now()}.md`, 'text/markdown');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className={isCyberpunk ? 'hover:bg-cyan-950/50 text-cyan-400' : 'hover:bg-purple-100 text-purple-600'}
                    title="Export conversation"
                >
                    <Download className="w-4 h-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
                className={
                    isCyberpunk
                        ? 'bg-black border-cyan-500/50 text-cyan-100 font-mono'
                        : 'bg-white border-gray-200'
                }
            >
                <DropdownMenuLabel className={isCyberpunk ? 'text-cyan-400' : 'text-gray-700'}>
                    Export Conversation
                </DropdownMenuLabel>
                <DropdownMenuSeparator className={isCyberpunk ? 'bg-cyan-500/30' : 'bg-gray-200'} />
                <DropdownMenuItem
                    onClick={exportAsJSON}
                    className={`${isCyberpunk
                            ? 'hover:bg-cyan-950/50 focus:bg-cyan-950/50'
                            : 'hover:bg-purple-50 focus:bg-purple-50'
                        }`}
                >
                    <FileJson className="mr-2 h-4 w-4" />
                    Export as JSON
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={exportAsMarkdown}
                    className={`${isCyberpunk
                            ? 'hover:bg-cyan-950/50 focus:bg-cyan-950/50'
                            : 'hover:bg-purple-50 focus:bg-purple-50'
                        }`}
                >
                    <FileText className="mr-2 h-4 w-4" />
                    Export as Markdown
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
