'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store/use-app-store';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Loader2, ArrowUp, Sparkles, Terminal,
    Briefcase, CheckSquare, ShoppingBag, Cloud,
    MessageSquare, LayoutDashboard, Calculator,
    FileText, Rocket
} from 'lucide-react';

const SUGGESTIONS = [
    {
        label: "Portfolio",
        prompt: "Create a stunning portfolio website with a hero section, animated project showcase, skills display, and contact form with modern design.",
        icon: Briefcase,
        gradient: "from-purple-500 to-pink-500"
    },
    {
        label: "Todo App",
        prompt: "Build a beautiful task management app with categories, priority levels, filtering, drag-and-drop, and local storage persistence.",
        icon: CheckSquare,
        gradient: "from-blue-500 to-cyan-500"
    },
    {
        label: "E-commerce",
        prompt: "Create a modern product grid with filters, shopping cart, product cards with images and prices, and a clean checkout flow.",
        icon: ShoppingBag,
        gradient: "from-green-500 to-emerald-500"
    },
    {
        label: "Weather",
        prompt: "Build a beautiful weather app with current conditions, 7-day forecast, location search, and dynamic background based on weather.",
        icon: Cloud,
        gradient: "from-sky-400 to-blue-500"
    },
    {
        label: "Chat UI",
        prompt: "Create a modern messaging app UI with message bubbles, typing indicators, timestamps, and a clean dark theme like iMessage.",
        icon: MessageSquare,
        gradient: "from-indigo-500 to-purple-500"
    },
    {
        label: "Dashboard",
        prompt: "Build a data-rich admin panel with sidebar navigation, stat cards, charts, user table, and responsive dark design.",
        icon: LayoutDashboard,
        gradient: "from-violet-500 to-purple-600"
    },
    {
        label: "Calculator",
        prompt: "Create a sleek calculator with number pad, scientific functions, history tracking, keyboard support, and satisfying animations.",
        icon: Calculator,
        gradient: "from-amber-500 to-orange-500"
    },
    {
        label: "Blog",
        prompt: "Build a beautiful blog interface with article cards, featured images, reading time, tags, author info, and typography-focused design.",
        icon: FileText,
        gradient: "from-rose-500 to-pink-500"
    },
    {
        label: "Landing Page",
        prompt: "Create a conversion-optimized SaaS landing page with hero section, features, testimonials, pricing cards, and strong CTAs.",
        icon: Rocket,
        gradient: "from-cyan-500 to-teal-500"
    },
];

export function ChatPanel() {
    const [inputValue, setInputValue] = useState('');
    const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant', text: string }>>([]);
    const [status, setStatus] = useState<'idle' | 'generating' | 'success' | 'no-api-key'>('idle');

    const {
        loadGeneratedFiles,
        isGenerating,
        setIsGenerating,
        currentCode
    } = useAppStore();

    const handleGenerate = async (prompt: string) => {
        if (!prompt.trim() || isGenerating) return;

        setIsGenerating(true);
        setStatus('generating');

        // Add user message immediately
        setMessages(prev => [...prev, { role: 'user', text: prompt }]);

        try {
            // Prepare context
            const filesMap: Record<string, string> = {};
            for (const [path, file] of Object.entries(currentCode)) {
                filesMap[path] = typeof file === 'string' ? file : file.code;
            }

            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    prompt,
                    existingFiles: Object.keys(filesMap).length > 0 ? filesMap : undefined,
                }),
            });

            const data = await response.json();

            // Handle API Key Errors
            if (data.error && (data.error.includes('API') || data.error.includes('key') || data.error.includes('client'))) {
                setStatus('no-api-key');
                setMessages(prev => [...prev, { role: 'assistant', text: '🔑 Configure your API key in .env to enable AI generation.' }]);
                return;
            }

            if (!response.ok || data.error) {
                setStatus('no-api-key');
                setMessages(prev => [...prev, { role: 'assistant', text: data.error || 'Generation failed.' }]);
                return;
            }

            if (data.files && Object.keys(data.files).length > 0) {
                loadGeneratedFiles(data.files);
                setStatus('success');

                const msg = data.isDemo
                    ? '✨ Demo template loaded. Add API key for custom generation!'
                    : `✅ Generated ${Object.keys(data.files).length} files.`;

                setMessages(prev => [...prev, { role: 'assistant', text: msg }]);
            }

        } catch (error) {
            setStatus('no-api-key');
            setMessages(prev => [...prev, { role: 'assistant', text: '❌ Connection failed. Check your setup.' }]);
        } finally {
            setIsGenerating(false);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (inputValue.trim()) {
            handleGenerate(inputValue.trim());
            setInputValue('');
        }
    };

    const hasMessages = messages.length > 0;

    return (
        <div className="flex flex-col h-full bg-gradient-to-br from-[#0a0a14] via-[#0f0f1e] to-[#13111f] relative overflow-hidden">

            {/* Animated Background Orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse-glow" />
                <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-pulse-glow" style={{ animationDelay: '1s' }} />
            </div>

            {/* Header / Brand */}
            <div className="relative z-10 px-6 py-6 border-b border-purple-500/20 flex items-center justify-between backdrop-blur-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
                        <Terminal size={20} className="text-white" />
                    </div>
                    <div>
                        <h1 className="font-bold text-xl tracking-tight bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                            Neura
                        </h1>
                        <div className="text-xs text-purple-400/60 -mt-0.5">AI App Builder</div>
                    </div>
                </div>
                {status === 'no-api-key' && (
                    <span className="text-[10px] font-medium text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
                        Demo Mode
                    </span>
                )}
            </div>

            {/* Scrollable Area */}
            <div className="relative z-10 flex-1 overflow-y-auto p-6 space-y-6">
                {!hasMessages ? (
                    <div className="h-full flex flex-col justify-center animate-fade-in">
                        <div className="mb-6 text-center">
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="mb-8"
                            >
                                <h2 className="text-2xl font-bold mb-2 tracking-tight bg-gradient-to-r from-purple-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
                                    What shall we build?
                                </h2>
                                <p className="text-purple-300/60 text-sm leading-relaxed">
                                    Choose a template or describe your vision
                                </p>
                            </motion.div>
                        </div>

                        {/* GRID LAYOUT FOR TEMPLATES - 3x3 */}
                        <div className="grid grid-cols-3 gap-3 max-w-lg mx-auto">
                            {SUGGESTIONS.map((s, i) => {
                                const Icon = s.icon;
                                return (
                                    <motion.button
                                        key={i}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: i * 0.05 }}
                                        onClick={() => handleGenerate(s.prompt)}
                                        disabled={isGenerating}
                                        className="group relative aspect-square p-4 rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-purple-500/20 hover:border-purple-500/40 hover:from-white/10 hover:to-white/5 transition-all duration-300 overflow-hidden flex flex-col items-center justify-center"
                                    >
                                        {/* Gradient overlay on hover */}
                                        <div className={`absolute inset-0 bg-gradient-to-r ${s.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

                                        <div className="relative flex flex-col items-center gap-2">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${s.gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                <Icon size={20} className="text-white" />
                                            </div>
                                            <span className="text-xs font-semibold text-white/80 group-hover:text-white transition-colors text-center">
                                                {s.label}
                                            </span>
                                        </div>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <>
                        {messages.map((m, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col gap-1 ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                            >
                                <span className="text-[9px] uppercase tracking-wider text-purple-400/40 font-medium mb-1">
                                    {m.role === 'user' ? 'You' : 'Neura'}
                                </span>
                                <div className={`
                                    max-w-[90%] text-sm leading-relaxed rounded-xl px-4 py-3 shadow-lg
                                    ${m.role === 'user'
                                        ? 'bg-gradient-to-br from-purple-500 to-cyan-500 text-white font-medium'
                                        : 'bg-gradient-to-br from-white/10 to-white/5 text-purple-100 border border-purple-500/20'
                                    }
                                `}>
                                    {m.text}
                                </div>
                            </motion.div>
                        ))}

                        {isGenerating && (
                            <div className="flex items-start gap-3 pt-2">
                                <div className="w-5 h-5 mt-0.5 rounded-lg bg-gradient-to-br from-purple-500 to-cyan-500 flex items-center justify-center">
                                    <Loader2 className="animate-spin text-white" size={12} />
                                </div>
                                <span className="text-sm text-purple-300 animate-pulse">Generating your app...</span>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Input Area */}
            <div className="relative z-10 p-5 border-t border-purple-500/20 bg-gradient-to-br from-black/20 to-black/10 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="relative group">
                    <div className="relative">
                        <input
                            className="
                                w-full bg-gradient-to-br from-white/10 to-white/5 text-white text-base rounded-2xl pl-5 pr-14 py-4
                                border border-purple-500/20
                                focus:outline-none focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                                placeholder-purple-300/30 transition-all
                            "
                            placeholder="Describe your app idea..."
                            value={inputValue}
                            onChange={(e) => setInputValue(e.target.value)}
                            disabled={isGenerating}
                        />
                        <button
                            type="submit"
                            disabled={!inputValue.trim() || isGenerating}
                            className="
                                absolute right-2 top-1/2 -translate-y-1/2
                                p-2.5 rounded-xl
                                bg-gradient-to-br from-purple-500 to-cyan-500
                                text-white shadow-lg shadow-purple-500/30
                                disabled:opacity-0 disabled:pointer-events-none
                                hover:shadow-purple-500/50 hover:scale-105 transition-all duration-200
                            "
                        >
                            <ArrowUp size={18} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Animated corner accents */}
                    <div className="absolute -bottom-px -left-px w-3 h-3 border-l-2 border-b-2 border-purple-500/0 group-focus-within:border-purple-500/60 transition-all duration-300 rounded-bl" />
                    <div className="absolute -top-px -right-px w-3 h-3 border-r-2 border-t-2 border-purple-500/0 group-focus-within:border-purple-500/60 transition-all duration-300 rounded-tr" />
                </form>
            </div>
        </div>
    );
}
