'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AuthDialog } from '@/components/auth/auth-dialog';
import Link from 'next/link';
import {
  Video, Youtube, ShoppingBag, MessageSquare, Film, Camera,
  UserPlus, Image as ImageIcon, ArrowRight, Layers, Sparkles,
  LogIn, LogOut, Coins, Zap, Clock,
} from 'lucide-react';

const features = [
  {
    title: 'UGC Video Studio',
    description: 'Upload your product, write a script, and generate natural-looking UGC video ads with AI.',
    icon: Video,
    href: '/ugc-studio',
    gradient: 'from-violet-600/20 to-violet-600/5',
    color: 'text-violet-400',
    badge: 'Video',
  },
  {
    title: 'YouTube Cloner',
    description: 'Paste a trending YouTube URL and create AI-generated content inspired by the original.',
    icon: Youtube,
    href: '/youtube-clone',
    gradient: 'from-red-600/20 to-red-600/5',
    color: 'text-red-400',
    badge: 'Video',
  },
  {
    title: 'AI Product Shots',
    description: 'Upload one product photo. Pick a style or describe it. AI generates a full photoshoot.',
    icon: ShoppingBag,
    href: '/product-shots',
    gradient: 'from-emerald-600/20 to-emerald-600/5',
    color: 'text-emerald-400',
    badge: 'Photo',
  },
  {
    title: 'AI Chat Creator',
    description: 'Talk to AI like a creative team. Describe what you want, get scripts, scenes, and content back.',
    icon: MessageSquare,
    href: '/ai-chat',
    gradient: 'from-cyan-600/20 to-cyan-600/5',
    color: 'text-cyan-400',
    badge: 'Chat',
  },
  {
    title: 'Video Editor',
    description: 'Tweak scripts, change scenes, swap moods — all before rendering. No wasted credits.',
    icon: Film,
    href: '/video-editor',
    gradient: 'from-amber-600/20 to-amber-600/5',
    color: 'text-amber-400',
    badge: 'Edit',
  },
  {
    title: 'Photo Studio',
    description: 'Generate stunning AI model photos with full control over scene, lighting, pose, and outfit.',
    icon: Camera,
    href: '/studio',
    gradient: 'from-fuchsia-600/20 to-fuchsia-600/5',
    color: 'text-fuchsia-400',
    badge: 'Photo',
  },
];

const howItWorks = [
  { step: 1, title: 'Choose Your Tool', description: 'Pick from UGC videos, product shots, YouTube cloning, or AI chat.', icon: Layers, color: 'violet' },
  { step: 2, title: 'Upload & Describe', description: 'Add your product image, paste a URL, or describe what you want in plain English.', icon: Sparkles, color: 'cyan' },
  { step: 3, title: 'Tweak & Perfect', description: 'Modify scripts, scenes, and styles before generating. No wasted credits.', icon: Film, color: 'fuchsia' },
  { step: 4, title: 'Generate & Download', description: 'AI creates your content. Download high-res files ready for ads and social media.', icon: Zap, color: 'emerald' },
];

export default function Dashboard() {
  const { projects, images, settings, user } = useAppStore();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>('signIn');

  const recentProjects = projects.slice(0, 4);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-white/[0.06] bg-gradient-to-br from-violet-600/10 via-fuchsia-600/5 to-transparent p-8">
        <div className="absolute right-0 top-0 h-64 w-64 bg-violet-500/10 blur-[100px]" />
        <div className="absolute left-1/2 bottom-0 h-48 w-48 bg-fuchsia-500/10 blur-[80px]" />
        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl overflow-hidden">
              <img src="/icons/icon-192.png" alt="FUNCTIONAL HUB" className="h-14 w-14 object-cover" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">FUNCTIONAL HUB</span>
              <p className="text-[11px] font-medium uppercase tracking-widest text-violet-400">Your Swiss Army Knife for Content Creation</p>
            </div>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Create Everything from One Dashboard</h1>
          <p className="text-zinc-400 max-w-xl mb-6">
            UGC videos, product photography, YouTube-inspired content, and AI chat — all powered by AI, all in one place.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Link href="/ugc-studio"><Video className="h-4 w-4" />Create UGC Video</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
              <Link href="/product-shots"><ShoppingBag className="h-4 w-4" />Product Photoshoot</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
              <Link href="/ai-chat"><MessageSquare className="h-4 w-4" />Chat with AI</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Auth Section */}
      <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6">
        {user ? (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-violet-600 to-fuchsia-500 text-sm font-bold text-white">
                {user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-zinc-400">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-xs text-zinc-400">
                <span className="text-white font-semibold">{settings.credits}</span> credits remaining
              </div>
              <Button
                onClick={async () => { const sb = createClient(); await sb.auth.signOut(); }}
                variant="outline" size="sm"
                className="border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2"
              >
                <LogOut className="h-4 w-4" /> Sign Out
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-white mb-1">Get Started</h3>
              <p className="text-sm text-zinc-400">Sign in or create an account to start generating content.</p>
            </div>
            <div className="flex gap-3">
              <Button onClick={() => { setAuthMode('signIn'); setShowAuth(true); }} className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                <LogIn className="h-4 w-4" /> Sign In
              </Button>
              <Button onClick={() => { setAuthMode('signUp'); setShowAuth(true); }} variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
                <UserPlus className="h-4 w-4" /> Sign Up
              </Button>
            </div>
          </div>
        )}
      </div>
      <AuthDialog open={showAuth} onOpenChange={setShowAuth} defaultMode={authMode} />

      {/* Feature Grid */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">Your Creative Tools</h2>
        <p className="text-xs text-zinc-500 mb-5">Everything you need to create viral content</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <Link key={feat.href} href={feat.href}>
                <Card className={`bg-gradient-to-br ${feat.gradient} border-white/[0.06] hover:border-white/[0.15] transition-all cursor-pointer group h-full`}>
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <Icon className={`h-8 w-8 ${feat.color} group-hover:scale-110 transition-transform`} />
                      <Badge variant="secondary" className="bg-white/5 text-zinc-400 text-[10px]">{feat.badge}</Badge>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{feat.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{feat.description}</p>
                    <div className="flex items-center gap-1 text-xs text-violet-400 mt-3 group-hover:gap-2 transition-all">
                      Open <ArrowRight className="h-3 w-3" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* How It Works */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-1">How It Works</h2>
        <p className="text-xs text-zinc-500 mb-5">From idea to download in 4 simple steps</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {howItWorks.map((step) => {
            const Icon = step.icon;
            const colorMap: Record<string, string> = {
              violet: 'from-violet-600/20 to-violet-600/5 text-violet-400 border-violet-500/20',
              cyan: 'from-cyan-600/20 to-cyan-600/5 text-cyan-400 border-cyan-500/20',
              fuchsia: 'from-fuchsia-600/20 to-fuchsia-600/5 text-fuchsia-400 border-fuchsia-500/20',
              emerald: 'from-emerald-600/20 to-emerald-600/5 text-emerald-400 border-emerald-500/20',
            };
            const classes = colorMap[step.color] || colorMap.violet;
            return (
              <div key={step.step} className={`relative rounded-xl bg-gradient-to-b ${classes.split(' ').slice(0, 2).join(' ')} border p-4`}>
                <div className="flex items-center gap-2 mb-2">
                  <div className={`flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br ${classes.split(' ').slice(0, 2).join(' ')}`}>
                    <Icon className={`h-3.5 w-3.5 ${classes.split(' ')[2]}`} />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase">Step {step.step}</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">{step.title}</h4>
                <p className="text-[11px] text-zinc-400 leading-relaxed">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard title="Projects" value={projects.length} icon={Layers} color="violet" />
        <StatCard title="Generated Photos" value={images.length} icon={ImageIcon} color="fuchsia" />
        <StatCard title="Credits" value={settings.credits} icon={Coins} color="cyan" />
      </div>

      {/* Recent Projects */}
      {recentProjects.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-white mb-4">Recent Projects</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentProjects.map((project) => {
              const typeMap: Record<string, { icon: React.ElementType; color: string; label: string }> = {
                'ugc-video': { icon: Video, color: 'text-violet-400', label: 'UGC Video' },
                'youtube-clone': { icon: Youtube, color: 'text-red-400', label: 'YouTube Clone' },
                'product-shot': { icon: ShoppingBag, color: 'text-emerald-400', label: 'Product Shot' },
                'chat-creation': { icon: MessageSquare, color: 'text-cyan-400', label: 'Chat Creation' },
              };
              const info = typeMap[project.type] || typeMap['ugc-video'];
              const TypeIcon = info.icon;
              return (
                <Card key={project.id} className="bg-white/[0.02] border-white/[0.06] hover:border-violet-500/30 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <TypeIcon className={`h-4 w-4 ${info.color}`} />
                      <Badge variant="secondary" className="bg-white/5 text-zinc-400 text-[10px]">{info.label}</Badge>
                      <Badge variant="secondary" className={`text-[10px] ${project.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : project.status === 'failed' ? 'bg-red-500/10 text-red-400' : 'bg-amber-500/10 text-amber-400'}`}>
                        {project.status}
                      </Badge>
                    </div>
                    <h3 className="font-medium text-white text-sm truncate">{project.title}</h3>
                    <p className="text-[11px] text-zinc-500 mt-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{new Date(project.createdAt).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state for new users */}
      {projects.length === 0 && images.length === 0 && (
        <div className="text-center py-16">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-500 flex items-center justify-center mb-4">
            <Layers className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">Welcome to FUNCTIONAL HUB</h3>
          <p className="text-zinc-400 max-w-md mx-auto mb-6">Your Swiss Army knife for AI content creation. Pick a tool above to get started.</p>
          <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
            <Link href="/ugc-studio"><Sparkles className="h-4 w-4" />Create Your First Video</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number; icon: React.ElementType; color: string }) {
  const colorMap: Record<string, string> = {
    violet: 'from-violet-600/20 to-violet-600/5 text-violet-400',
    fuchsia: 'from-fuchsia-600/20 to-fuchsia-600/5 text-fuchsia-400',
    cyan: 'from-cyan-600/20 to-cyan-600/5 text-cyan-400',
  };
  return (
    <Card className="bg-white/[0.02] border-white/[0.06]">
      <CardContent className="p-4 flex items-center gap-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${colorMap[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">{value}</p>
          <p className="text-xs text-zinc-500">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}
