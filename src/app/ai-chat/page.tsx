'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  MessageSquare, Send, Loader2, Trash2, Sparkles,
  Video, ShoppingBag, Camera, Bot, User,
} from 'lucide-react';

export default function AIChat() {
  const { chatMessages, addChatMessage, clearChat } = useAppStore();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');

    addChatMessage({ role: 'user', content: userMsg });
    setIsLoading(true);

    try {
      const messages = [
        ...chatMessages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: userMsg },
      ];

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });

      const data = await res.json();
      if (data.error) {
        addChatMessage({ role: 'assistant', content: `Error: ${data.error}` });
      } else {
        addChatMessage({ role: 'assistant', content: data.reply });
      }
    } catch {
      addChatMessage({ role: 'assistant', content: 'Sorry, something went wrong. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { label: 'UGC Script', icon: Video, prompt: 'Write a 30-second UGC video script for a skincare serum that glows. Make it feel authentic and natural.' },
    { label: 'Product Shot Ideas', icon: ShoppingBag, prompt: 'Give me 5 creative product photography ideas for a matte black water bottle. Include scene descriptions I can use.' },
    { label: 'Ad Campaign', icon: Sparkles, prompt: 'Create a complete social media ad campaign concept for a new fitness app. Include 3 different ad angles.' },
    { label: 'YouTube Concept', icon: Camera, prompt: 'Come up with 3 trending YouTube video concepts I could clone/recreate for my beauty brand.' },
  ];

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] md:h-[calc(100vh-48px)] max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 shrink-0">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl font-bold text-white">AI Chat Creator</h1>
          </div>
          <p className="text-sm text-zinc-400">Talk to AI like a creative team. Describe what you want, get scripts, scenes, and content ideas.</p>
        </div>
        {chatMessages.length > 0 && (
          <Button onClick={clearChat} variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1">
            <Trash2 className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-4 pb-4">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-600/20 to-violet-600/20 flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-cyan-400" />
            </div>
            <h3 className="text-sm font-medium text-white mb-2">How can I help you create today?</h3>
            <p className="text-xs text-zinc-500 max-w-sm mb-6">
              I can write UGC scripts, brainstorm product photography concepts, plan ad campaigns, and more.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
              {quickPrompts.map((qp) => {
                const Icon = qp.icon;
                return (
                  <button
                    key={qp.label}
                    onClick={() => { setInput(qp.prompt); }}
                    className="flex items-center gap-3 p-3 rounded-lg border border-white/[0.06] bg-white/[0.02] hover:bg-cyan-600/10 hover:border-cyan-500/20 transition-all text-left group"
                  >
                    <Icon className="h-5 w-5 text-cyan-400/60 group-hover:text-cyan-400 shrink-0" />
                    <div>
                      <span className="text-[12px] font-medium text-white block">{qp.label}</span>
                      <span className="text-[10px] text-zinc-500 line-clamp-1">{qp.prompt}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          chatMessages.map((msg) => (
            <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-violet-600">
                  <Bot className="h-4 w-4 text-white" />
                </div>
              )}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === 'user'
                  ? 'bg-violet-600/20 border border-violet-500/20 text-white'
                  : 'bg-white/[0.03] border border-white/[0.06] text-zinc-300'
              }`}>
                <div className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                <p className="text-[9px] text-zinc-600 mt-1.5">{new Date(msg.createdAt).toLocaleTimeString()}</p>
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500">
                  <User className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-cyan-600 to-violet-600">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="bg-white/[0.03] border border-white/[0.06] rounded-2xl px-4 py-3">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-white/[0.06] pt-4">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
            placeholder="Describe what you want to create..."
            className="flex-1 bg-white/[0.03] border-white/[0.06] text-white text-sm placeholder:text-zinc-500 h-11"
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-cyan-600 hover:bg-cyan-700 text-white h-11 px-5">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
        <p className="text-[10px] text-zinc-600 mt-2 text-center">Powered by AI. Use suggestions in UGC Studio, Product Shots, or YouTube Cloner.</p>
      </div>
    </div>
  );
}
