'use client';

import { useState, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Film, Save, Video, Youtube, ShoppingBag, Loader2,
  ArrowRight, AlertCircle, Sparkles,
} from 'lucide-react';

export default function VideoEditor() {
  const { projects, updateProject } = useAppStore();
  const editableProjects = projects.filter((p) => p.type === 'ugc-video' || p.type === 'youtube-clone');

  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(editableProjects[0]?.id || null);
  const [title, setTitle] = useState('');
  const [script, setScript] = useState('');
  const [sceneDescription, setSceneDescription] = useState('');
  const [mood, setMood] = useState('');
  const [style, setStyle] = useState('');
  const [saved, setSaved] = useState(false);

  const selectedProject = editableProjects.find((p) => p.id === selectedProjectId);

  useEffect(() => {
    if (selectedProject) {
      setTitle(selectedProject.title || '');
      setScript(selectedProject.script || '');
      setSceneDescription(selectedProject.sceneDescription || '');
      setMood(selectedProject.mood || '');
      setStyle(selectedProject.style || '');
      setSaved(false);
    }
  }, [selectedProjectId]);

  const handleSave = () => {
    if (!selectedProjectId) return;
    updateProject(selectedProjectId, { title, script, sceneDescription, mood, style });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Film className="h-6 w-6 text-amber-400" />
          <h1 className="text-2xl font-bold text-white">Video Editor</h1>
        </div>
        <p className="text-sm text-zinc-400">Tweak scripts, change scenes, and perfect your idea before you spend credits on rendering.</p>
      </div>

      {editableProjects.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600/10 to-violet-600/10 flex items-center justify-center mb-4">
            <Film className="h-8 w-8 text-amber-400/40" />
          </div>
          <h3 className="text-sm font-medium text-zinc-400 mb-1">No editable video projects yet</h3>
          <p className="text-xs text-zinc-500 max-w-xs mb-6">Create a UGC video or YouTube clone first, then come back here to tweak it.</p>
          <div className="flex gap-3">
            <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
              <Link href="/ugc-studio"><Video className="h-4 w-4" />UGC Studio</Link>
            </Button>
            <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
              <Link href="/youtube-clone"><Youtube className="h-4 w-4" />YouTube Cloner</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex gap-6">
          {/* Left: Project List */}
          <div className="w-full lg:w-[320px] shrink-0 space-y-3">
            <h3 className="text-sm font-semibold text-white">Your Video Projects</h3>
            {editableProjects.map((project) => {
              const Icon = project.type === 'ugc-video' ? Video : Youtube;
              return (
                <button
                  key={project.id}
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`w-full p-4 rounded-xl border text-left transition-all ${
                    selectedProjectId === project.id
                      ? 'bg-amber-600/10 border-amber-500/30'
                      : 'bg-white/[0.02] border-white/[0.06] hover:bg-white/[0.04]'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Icon className={`h-4 w-4 ${project.type === 'ugc-video' ? 'text-violet-400' : 'text-red-400'}`} />
                    <Badge variant="secondary" className="bg-white/5 text-zinc-400 text-[10px]">
                      {project.type === 'ugc-video' ? 'UGC Video' : 'YouTube Clone'}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-medium text-white truncate">{project.title}</h4>
                  <p className="text-[10px] text-zinc-500 mt-1">{project.status}</p>
                </button>
              );
            })}
          </div>

          {/* Right: Editor */}
          <div className="flex-1 min-w-0">
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Modify Before Final</h3>
                    <p className="text-xs text-zinc-500 mt-1">Change scripts, scenes, actors, mood, or style before you render.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {saved && (
                      <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-[10px]">
                        Saved
                      </Badge>
                    )}
                    <Button onClick={handleSave} className="bg-amber-600 hover:bg-amber-700 text-white gap-2">
                      <Save className="h-4 w-4" /> Save
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">Project Title</Label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="bg-white/[0.03] border-white/[0.06] text-white text-sm h-10"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">Script / What the person says</Label>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder="Write or edit the spoken lines..."
                    className="bg-white/[0.03] border-white/[0.06] text-white text-sm min-h-[120px]"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">Scene Description</Label>
                  <Textarea
                    value={sceneDescription}
                    onChange={(e) => setSceneDescription(e.target.value)}
                    placeholder="Describe the look, setting, motion, actor, and scene..."
                    className="bg-white/[0.03] border-white/[0.06] text-white text-sm min-h-[100px]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[10px] text-zinc-500 mb-1 block">Mood</Label>
                    <Input
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                      placeholder="e.g. confident, playful, luxurious..."
                      className="bg-white/[0.03] border-white/[0.06] text-white text-sm h-10"
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-zinc-500 mb-1 block">Style / Lighting</Label>
                    <Input
                      value={style}
                      onChange={(e) => setStyle(e.target.value)}
                      placeholder="e.g. soft lighting, natural, cinematic..."
                      className="bg-white/[0.03] border-white/[0.06] text-white text-sm h-10"
                    />
                  </div>
                </div>

                {/* Live Preview */}
                <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="h-4 w-4 text-amber-400" />
                    <h4 className="text-sm font-medium text-white">Live Preview</h4>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Title</span>
                      <p className="text-white mt-1">{title || <span className="text-zinc-600">No title</span>}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Script</span>
                      <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{script || <span className="text-zinc-600">No script yet</span>}</p>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase tracking-widest text-zinc-500">Scene</span>
                      <p className="text-zinc-300 mt-1 whitespace-pre-wrap">{sceneDescription || <span className="text-zinc-600">No scene description yet</span>}</p>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Mood</span>
                        <p className="text-zinc-300 mt-1">{mood || <span className="text-zinc-600">—</span>}</p>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase tracking-widest text-zinc-500">Style</span>
                        <p className="text-zinc-300 mt-1">{style || <span className="text-zinc-600">—</span>}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button asChild className="bg-violet-600 hover:bg-violet-700 text-white gap-2">
                    <Link href="/ugc-studio"><Video className="h-4 w-4" />Render in UGC Studio</Link>
                  </Button>
                  <Button asChild variant="outline" className="border-white/10 text-white hover:bg-white/5 gap-2">
                    <Link href="/youtube-clone"><Youtube className="h-4 w-4" />Render in YouTube Cloner</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
