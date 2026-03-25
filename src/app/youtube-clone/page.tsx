'use client';

import { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Youtube, Search, Sparkles, Download, Loader2,
  Video, ExternalLink, User, Wand2,
} from 'lucide-react';

export default function YouTubeCloner() {
  const { addProject, updateProject, settings, deductCredits } = useAppStore();

  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [videoInfo, setVideoInfo] = useState<{
    videoId: string; title: string; author: string; authorUrl: string; thumbnail: string;
  } | null>(null);

  const [concept, setConcept] = useState('');
  const [customTwist, setCustomTwist] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleAnalyze = async () => {
    if (!url) return;
    setIsAnalyzing(true);
    setError('');
    setVideoInfo(null);
    try {
      const res = await fetch('/api/youtube/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setVideoInfo(data);
      setConcept(`Create a video inspired by "${data.title}" by ${data.author}. `);
    } catch {
      setError('Failed to analyze YouTube URL.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGenerate = async () => {
    if (!concept) { setError('Please describe the concept for your video.'); return; }
    if (settings.credits < 3) { setError('Not enough credits. Video generation costs 3 credits.'); return; }

    setError('');
    setIsGenerating(true);

    const prompt = [
      concept,
      customTwist || '',
      'Natural-looking content, engaging delivery, high production quality.',
    ].filter(Boolean).join('. ');

    try {
      const project = addProject({
        type: 'youtube-clone',
        title: videoInfo?.title || 'YouTube Clone',
        status: 'generating',
        youtubeUrl: url,
        youtubeTitle: videoInfo?.title,
        youtubeThumbnail: videoInfo?.thumbnail,
        script: concept,
        sceneDescription: customTwist,
      });

      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        updateProject(project.id, { status: 'failed' });
      } else {
        setGeneratedVideoUrl(data.output);
        deductCredits(3);
        updateProject(project.id, { status: 'completed', result: { url: data.output, type: 'video' } });
      }
    } catch (err) {
      setError(`Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Youtube className="h-6 w-6 text-red-400" />
          <h1 className="text-2xl font-bold text-white">YouTube Video Cloner</h1>
        </div>
        <p className="text-sm text-zinc-400">Paste a trending YouTube URL, analyze it, then generate AI content inspired by the original.</p>
      </div>

      <div className="flex gap-6">
        {/* Left: Controls */}
        <div className="w-full lg:w-[420px] shrink-0 space-y-5">
          {/* URL Input */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Paste YouTube URL</h3>
              <div className="flex gap-2">
                <Input
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 h-9 flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                />
                <Button onClick={handleAnalyze} disabled={isAnalyzing || !url} size="sm" className="bg-red-600 hover:bg-red-700 text-white h-9 px-4">
                  {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Search className="h-4 w-4" /></>}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Video Info */}
          {videoInfo && (
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-5 space-y-4">
                <div className="rounded-lg overflow-hidden border border-white/[0.06]">
                  <img src={videoInfo.thumbnail} alt={videoInfo.title} className="w-full aspect-video object-cover" />
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white line-clamp-2">{videoInfo.title}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="h-3 w-3 text-zinc-500" />
                    <span className="text-[11px] text-zinc-400">{videoInfo.author}</span>
                  </div>
                </div>
                <a href={`https://youtube.com/watch?v=${videoInfo.videoId}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[11px] text-red-400 hover:text-red-300">
                  <ExternalLink className="h-3 w-3" /> Watch Original
                </a>
              </CardContent>
            </Card>
          )}

          {/* Concept Editor */}
          {videoInfo && (
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Wand2 className="h-4 w-4 text-violet-400" /> Customize Your Version
                </h3>
                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">Concept / Script</Label>
                  <Textarea
                    value={concept}
                    onChange={(e) => setConcept(e.target.value)}
                    placeholder="Describe the concept for your video..."
                    className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 min-h-[100px]"
                  />
                </div>
                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">Your Unique Twist (optional)</Label>
                  <Textarea
                    value={customTwist}
                    onChange={(e) => setCustomTwist(e.target.value)}
                    placeholder="e.g. Make it about my product, change the setting to a beach..."
                    className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 min-h-[60px]"
                  />
                </div>
                <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-red-600 to-violet-600 hover:from-red-700 hover:to-violet-700 text-white gap-2">
                  {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Generate Video</>}
                </Button>
                <p className="text-[10px] text-zinc-500 text-center">3 credits per video generation</p>
              </CardContent>
            </Card>
          )}

          {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">{error}</p>}
        </div>

        {/* Right: Preview */}
        <div className="flex-1 min-w-0 hidden lg:block">
          <div className="sticky top-6">
            {generatedVideoUrl ? (
              <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-black">
                <video src={generatedVideoUrl} controls autoPlay className="w-full aspect-video" />
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-[10px]">Generated</Badge>
                  <a href={generatedVideoUrl} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/20 text-violet-300 text-[11px] font-medium hover:bg-violet-600/30 transition-colors">
                    <Download className="h-3.5 w-3.5" /> Download
                  </a>
                </div>
              </div>
            ) : isGenerating ? (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <Loader2 className="h-10 w-10 text-red-400 animate-spin mb-4" />
                <h3 className="text-sm font-medium text-white mb-1">Generating Your Video...</h3>
                <p className="text-xs text-zinc-500">Creating AI content inspired by the original video.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/10 to-violet-600/10 flex items-center justify-center mb-4">
                  <Youtube className="h-8 w-8 text-red-400/40" />
                </div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">Paste a YouTube URL to get started</h3>
                <p className="text-xs text-zinc-500 max-w-xs">We&apos;ll analyze the video and help you create AI-generated content inspired by it.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
