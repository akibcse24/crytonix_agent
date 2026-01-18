'use client';

import { useState, useEffect } from 'react';
import { Search, Plus, Tag, Folder, Download, Upload, Brain } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { useTheme } from './ThemeProvider';

interface KnowledgeEntry {
    id: string;
    title: string;
    content: string;
    category?: string;
    tags?: string[];
    source?: string;
    createdAt: string;
    updatedAt: string;
}

export function KnowledgeExplorer() {
    const { theme } = useTheme();
    const isCyberpunk = theme === 'cyberpunk';

    const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedEntry, setSelectedEntry] = useState<KnowledgeEntry | null>(null);
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [newEntry, setNewEntry] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
        source: '',
    });

    useEffect(() => {
        fetchEntries();
    }, []);

    const fetchEntries = async () => {
        setIsLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchQuery) params.set('query', searchQuery);
            if (selectedCategory) params.set('category', selectedCategory);

            const res = await fetch(`/api/knowledge?${params}`);
            const data = await res.json();
            setEntries(data.results || []);
        } catch (error) {
            console.error('Failed to fetch knowledge:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const addEntry = async () => {
        try {
            const res = await fetch('/api/knowledge', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newEntry,
                    tags: newEntry.tags.split(',').map((t) => t.trim()).filter(Boolean),
                }),
            });

            if (res.ok) {
                setIsAddDialogOpen(false);
                setNewEntry({ title: '', content: '', category: '', tags: '', source: '' });
                fetchEntries();
            }
        } catch (error) {
            console.error('Failed to add entry:', error);
        }
    };

    const deleteEntry = async (id: string) => {
        try {
            const res = await fetch(`/api/knowledge?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                fetchEntries();
                setSelectedEntry(null);
            }
        } catch (error) {
            console.error('Failed to delete entry:', error);
        }
    };

    const categories = Array.from(new Set(entries.map((e) => e.category).filter(Boolean)));

    return (
        <div className="max-w-7xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Brain className={`w-8 h-8 ${isCyberpunk ? 'text-cyan-400' : 'text-purple-600'}`} />
                    <div>
                        <h1
                            className={`text-2xl font-bold ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                                }`}
                        >
                            {isCyberpunk ? 'KNOWLEDGE BASE' : 'Knowledge Base'}
                        </h1>
                        <p className={`text-sm ${isCyberpunk ? 'text-cyan-700 font-mono' : 'text-gray-500'}`}>
                            Manage and search your AI knowledge repository
                        </p>
                    </div>
                </div>

                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            className={
                                isCyberpunk
                                    ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono'
                                    : 'bg-purple-600 hover:bg-purple-500 text-white'
                            }
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Entry
                        </Button>
                    </DialogTrigger>
                    <DialogContent
                        className={
                            isCyberpunk
                                ? 'bg-black border-cyan-500/50 text-cyan-100'
                                : 'bg-white border-gray-200'
                        }
                    >
                        <DialogHeader>
                            <DialogTitle className={isCyberpunk ? 'text-cyan-400 font-mono' : 'text-gray-900'}>
                                Add Knowledge Entry
                            </DialogTitle>
                            <DialogDescription className={isCyberpunk ? 'text-cyan-700' : 'text-gray-500'}>
                                Add new information to your knowledge base
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 mt-4">
                            <div>
                                <Label className={isCyberpunk ? 'text-cyan-500' : 'text-gray-700'}>Title</Label>
                                <Input
                                    value={newEntry.title}
                                    onChange={(e) => setNewEntry({ ...newEntry, title: e.target.value })}
                                    placeholder="Entry title"
                                    className={
                                        isCyberpunk
                                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100'
                                            : 'bg-white border-gray-200'
                                    }
                                />
                            </div>

                            <div>
                                <Label className={isCyberpunk ? 'text-cyan-500' : 'text-gray-700'}>Content</Label>
                                <Textarea
                                    value={newEntry.content}
                                    onChange={(e) => setNewEntry({ ...newEntry, content: e.target.value })}
                                    placeholder="Knowledge content..."
                                    rows={6}
                                    className={
                                        isCyberpunk
                                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100'
                                            : 'bg-white border-gray-200'
                                    }
                                />
                            </div>

                            <div>
                                <Label className={isCyberpunk ? 'text-cyan-500' : 'text-gray-700'}>Category</Label>
                                <Input
                                    value={newEntry.category}
                                    onChange={(e) => setNewEntry({ ...newEntry, category: e.target.value })}
                                    placeholder="e.g., technical, business"
                                    className={
                                        isCyberpunk
                                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100'
                                            : 'bg-white border-gray-200'
                                    }
                                />
                            </div>

                            <div>
                                <Label className={isCyberpunk ? 'text-cyan-500' : 'text-gray-700'}>
                                    Tags (comma-separated)
                                </Label>
                                <Input
                                    value={newEntry.tags}
                                    onChange={(e) => setNewEntry({ ...newEntry, tags: e.target.value })}
                                    placeholder="ai, machine-learning, python"
                                    className={
                                        isCyberpunk
                                            ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100'
                                            : 'bg-white border-gray-200'
                                    }
                                />
                            </div>

                            <Button
                                onClick={addEntry}
                                className={
                                    isCyberpunk
                                        ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono w-full'
                                        : 'bg-purple-600 hover:bg-purple-500 text-white w-full'
                                }
                            >
                                Add to Knowledge Base
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Search & Filters */}
            <div
                className={`p-4 rounded-lg border ${isCyberpunk
                        ? 'bg-black border-cyan-500/30'
                        : 'bg-white border-purple-200 glass'
                    }`}
            >
                <div className="flex gap-4">
                    <div className="flex-1 relative">
                        <Search
                            className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 ${isCyberpunk ? 'text-cyan-500' : 'text-gray-400'
                                }`}
                        />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && fetchEntries()}
                            placeholder="Search knowledge base..."
                            className={`pl-10 ${isCyberpunk
                                    ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100 font-mono'
                                    : 'bg-white border-gray-200'
                                }`}
                        />
                    </div>

                    <select
                        value={selectedCategory}
                        onChange={(e) => {
                            setSelectedCategory(e.target.value);
                            setTimeout(fetchEntries, 100);
                        }}
                        className={`px-4 py-2 rounded border ${isCyberpunk
                                ? 'bg-cyan-950/20 border-cyan-500/50 text-cyan-100 font-mono'
                                : 'bg-white border-gray-200'
                            }`}
                    >
                        <option value="">All Categories</option>
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat}
                            </option>
                        ))}
                    </select>

                    <Button
                        onClick={fetchEntries}
                        className={
                            isCyberpunk
                                ? 'bg-cyan-600 hover:bg-cyan-500 text-black font-mono'
                                : 'bg-purple-600 hover:bg-purple-500 text-white'
                        }
                    >
                        Search
                    </Button>
                </div>
            </div>

            {/* Results */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* Entries List */}
                <div
                    className={`p-6 rounded-lg border max-h-[600px] overflow-y-auto ${isCyberpunk
                            ? 'bg-black border-cyan-500/30'
                            : 'bg-white border-purple-200 glass'
                        }`}
                >
                    <h2
                        className={`text-lg font-bold mb-4 ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                            }`}
                    >
                        {isCyberpunk ? 'ENTRIES' : 'Entries'} ({entries.length})
                    </h2>

                    {isLoading ? (
                        <p className={isCyberpunk ? 'text-cyan-500 font-mono' : 'text-gray-500'}>
                            Loading...
                        </p>
                    ) : entries.length === 0 ? (
                        <p className={isCyberpunk ? 'text-cyan-700 font-mono' : 'text-gray-500'}>
                            No entries found. Add your first entry!
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {entries.map((entry) => (
                                <button
                                    key={entry.id}
                                    onClick={() => setSelectedEntry(entry)}
                                    className={`w-full text-left p-4 rounded border transition-all ${selectedEntry?.id === entry.id
                                            ? isCyberpunk
                                                ? 'bg-cyan-950/40 border-cyan-400'
                                                : 'bg-purple-100 border-purple-400'
                                            : isCyberpunk
                                                ? 'bg-cyan-950/20 border-cyan-500/30 hover:border-cyan-400'
                                                : 'bg-purple-50 border-purple-200 hover:border-purple-400'
                                        }`}
                                >
                                    <h3
                                        className={`font-bold mb-1 ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                                            }`}
                                    >
                                        {entry.title}
                                    </h3>
                                    <p
                                        className={`text-sm line-clamp-2 ${isCyberpunk ? 'text-cyan-100' : 'text-gray-600'
                                            }`}
                                    >
                                        {entry.content}
                                    </p>
                                    {entry.tags && entry.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {entry.tags.map((tag, i) => (
                                                <span
                                                    key={i}
                                                    className={`text-xs px-2 py-0.5 rounded ${isCyberpunk
                                                            ? 'bg-cyan-900/50 text-cyan-400'
                                                            : 'bg-purple-100 text-purple-600'
                                                        }`}
                                                >
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* Entry Detail */}
                <div
                    className={`p-6 rounded-lg border ${isCyberpunk
                            ? 'bg-black border-cyan-500/30'
                            : 'bg-white border-purple-200 glass'
                        }`}
                >
                    {selectedEntry ? (
                        <div className="space-y-4">
                            <div className="flex items-start justify-between">
                                <h2
                                    className={`text-xl font-bold ${isCyberpunk ? 'text-cyan-400 font-mono' : 'text-purple-600'
                                        }`}
                                >
                                    {selectedEntry.title}
                                </h2>
                                <Button
                                    onClick={() => deleteEntry(selectedEntry.id)}
                                    variant="outline"
                                    size="sm"
                                    className={
                                        isCyberpunk
                                            ? 'border-red-500/50 text-red-400 hover:bg-red-950/20'
                                            : 'border-red-200 text-red-600 hover:bg-red-50'
                                    }
                                >
                                    Delete
                                </Button>
                            </div>

                            <div
                                className={`text-sm whitespace-pre-wrap ${isCyberpunk ? 'text-cyan-100 font-mono' : 'text-gray-700'
                                    }`}
                            >
                                {selectedEntry.content}
                            </div>

                            {selectedEntry.category && (
                                <div className="flex items-center gap-2">
                                    <Folder
                                        className={`w-4 h-4 ${isCyberpunk ? 'text-cyan-500' : 'text-purple-600'}`}
                                    />
                                    <span
                                        className={`text-sm ${isCyberpunk ? 'text-cyan-500 font-mono' : 'text-purple-600'
                                            }`}
                                    >
                                        {selectedEntry.category}
                                    </span>
                                </div>
                            )}

                            {selectedEntry.tags && selectedEntry.tags.length > 0 && (
                                <div className="flex items-start gap-2">
                                    <Tag className={`w-4 h-4 mt-1 ${isCyberpunk ? 'text-cyan-500' : 'text-purple-600'}`} />
                                    <div className="flex flex-wrap gap-2">
                                        {selectedEntry.tags.map((tag, i) => (
                                            <span
                                                key={i}
                                                className={`text-xs px-2 py-1 rounded ${isCyberpunk
                                                        ? 'bg-cyan-900/50 text-cyan-400 border border-cyan-500/30'
                                                        : 'bg-purple-100 text-purple-600 border border-purple-200'
                                                    }`}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className={`text-xs ${isCyberpunk ? 'text-cyan-700' : 'text-gray-500'}`}>
                                Created: {new Date(selectedEntry.createdAt).toLocaleString()}
                            </div>
                        </div>
                    ) : (
                        <p className={`text-center ${isCyberpunk ? 'text-cyan-700 font-mono' : 'text-gray-500'}`}>
                            Select an entry to view details
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
