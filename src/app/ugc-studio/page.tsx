'use client';

import { useState, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';
import {
  Video, Upload, Link2, Image as ImageIcon, Sparkles,
  Play, Download, Trash2, Film, Wand2, ArrowRight, Loader2,
} from 'lucide-react';

const SCENE_PRESETS = [
  { id: 'confident-hold', label: 'Product in Hand', description: 'Holding the product while speaking confidently' },
  { id: 'unboxing', label: 'Unboxing', description: 'Exciting unboxing reveal with natural reactions' },
  { id: 'testimonial', label: 'Testimonial', description: 'Genuine review sitting in a natural setting' },
  { id: 'before-after', label: 'Before & After', description: 'Showing transformation with the product' },
  { id: 'lifestyle', label: 'Lifestyle', description: 'Using the product in everyday life' },
  { id: 'closeup', label: 'Close-up Demo', description: 'Detailed product demonstration up close' },
];

const MOOD_OPTIONS = ['Confident', 'Excited', 'Casual', 'Professional', 'Warm & Friendly', 'Energetic'];
const LIGHTING_OPTIONS = ['Soft Natural', 'Ring Light', 'Golden Hour', 'Studio', 'Bright & Clean'];

export default function UGCStudio() {
  const { addProject, updateProject, settings, deductCredits } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Step tracking
  const [step, setStep] = useState(1);

  // Step 1: Product
  const [productImage, setProductImage] = useState<string | null>(null);
  const [productUrl, setProductUrl] = useState('');
  const [productTitle, setProductTitle] = useState('');
  const [isLoadingUrl, setIsLoadingUrl] = useState(false);
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('upload');

  // Step 2: Script & Scene
  const [script, setScript] = useState('');
  const [scenePreset, setScenePreset] = useState('confident-hold');
  const [sceneDescription, setSceneDescription] = useState('');
  const [mood, setMood] = useState('Confident');
  const [lighting, setLighting] = useState('Soft Natural');

  // Step 3: Generation
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setProductImage(reader.result as string);
      setProductTitle(file.name.replace(/\.[^.]+$/, ''));
    };
    reader.readAsDataURL(file);
  };

  const handleProductUrlFetch = async () => {
    if (!productUrl) return;
    setIsLoadingUrl(true);
    setError('');
    try {
      const res = await fetch('/api/product-url/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: productUrl }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setProductImage(data.image);
      setProductTitle(data.title || 'Product');
    } catch {
      setError('Failed to fetch product URL.');
    } finally {
      setIsLoadingUrl(false);
    }
  };

  const handleGenerate = async () => {
    if (!script && !sceneDescription) {
      setError('Please write a script or describe the scene.');
      return;
    }
    if (settings.credits < 3) {
      setError('Not enough credits. Video generation costs 3 credits.');
      return;
    }

    setError('');
    setIsGenerating(true);

    const preset = SCENE_PRESETS.find((p) => p.id === scenePreset);
    const prompt = [
      script ? `The person says: "${script}"` : '',
      `Scene: ${preset?.description || scenePreset}`,
      sceneDescription ? `Additional details: ${sceneDescription}` : '',
      `Mood: ${mood}. Lighting: ${lighting}.`,
      productTitle ? `Product: ${productTitle}` : '',
    ].filter(Boolean).join('. ');

    try {
      const project = addProject({
        type: 'ugc-video',
        title: productTitle || 'UGC Video',
        status: 'generating',
        productImage: productImage || undefined,
        script,
        sceneDescription: `${preset?.description || ''}. ${sceneDescription}`,
        mood,
        style: lighting,
      });

      const res = await fetch('/api/video/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          productImageUrl: productImage?.startsWith('http') ? productImage : undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        updateProject(project.id, { status: 'failed' });
      } else {
        setGeneratedVideoUrl(data.output);
        deductCredits(3);
        updateProject(project.id, { status: 'completed', result: { url: data.output, type: 'video' } });
        setStep(3);
      }
    } catch (err) {
      setError(`Generation failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Video className="h-6 w-6 text-violet-400" />
          <h1 className="text-2xl font-bold text-white">UGC Video Studio</h1>
        </div>
        <p className="text-sm text-zinc-400">Create natural-looking UGC video ads with AI. Upload your product, write your lines, and generate.</p>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { n: 1, label: 'Product' },
          { n: 2, label: 'Script & Scene' },
          { n: 3, label: 'Generate' },
        ].map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.n)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                step === s.n ? 'bg-violet-600/20 text-white border border-violet-500/30' :
                step > s.n ? 'bg-white/[0.04] text-violet-400 border border-white/[0.06]' :
                'bg-white/[0.02] text-zinc-500 border border-white/[0.04]'
              }`}
            >
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-bold">{s.n}</span>
              <span className="hidden sm:inline">{s.label}</span>
            </button>
            {i < 2 && <div className={`h-px w-8 ${step > s.n ? 'bg-violet-500/30' : 'bg-white/[0.06]'}`} />}
          </div>
        ))}
      </div>

      <div className="flex gap-6 min-h-[60vh]">
        {/* Left: Controls */}
        <div className="w-full lg:w-[420px] shrink-0 space-y-5">
          {/* Step 1: Product */}
          {step === 1 && (
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Upload or Select Your Product</h3>

                <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as 'upload' | 'url')}>
                  <TabsList className="bg-white/[0.03] border border-white/[0.06] w-full">
                    <TabsTrigger value="upload" className="text-xs flex-1 data-[state=active]:bg-violet-600/20 data-[state=active]:text-white gap-1">
                      <Upload className="h-3 w-3" /> Upload Image
                    </TabsTrigger>
                    <TabsTrigger value="url" className="text-xs flex-1 data-[state=active]:bg-violet-600/20 data-[state=active]:text-white gap-1">
                      <Link2 className="h-3 w-3" /> Paste URL
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="upload" className="mt-3">
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-violet-500/30 hover:bg-violet-600/5 transition-all"
                    >
                      {productImage ? (
                        <img src={productImage} alt="Product" className="max-h-48 mx-auto rounded-lg object-contain" />
                      ) : (
                        <>
                          <Upload className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
                          <p className="text-sm text-zinc-400">Click to upload your product image</p>
                          <p className="text-[11px] text-zinc-600 mt-1">PNG, JPG, WebP up to 10MB</p>
                        </>
                      )}
                    </div>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </TabsContent>

                  <TabsContent value="url" className="mt-3 space-y-3">
                    <div>
                      <Label className="text-[10px] text-zinc-500 mb-1 block">Product Page URL</Label>
                      <div className="flex gap-2">
                        <Input
                          value={productUrl}
                          onChange={(e) => setProductUrl(e.target.value)}
                          placeholder="https://example.com/product"
                          className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 h-9 flex-1"
                        />
                        <Button onClick={handleProductUrlFetch} disabled={isLoadingUrl || !productUrl} size="sm" className="bg-violet-600 hover:bg-violet-700 text-white h-9 px-4">
                          {isLoadingUrl ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Fetch'}
                        </Button>
                      </div>
                    </div>
                    {productImage && (
                      <div className="rounded-lg border border-white/[0.06] p-3">
                        <img src={productImage} alt="Product" className="max-h-36 mx-auto rounded-lg object-contain" />
                        {productTitle && <p className="text-xs text-zinc-400 text-center mt-2">{productTitle}</p>}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">Product Name</Label>
                  <Input
                    value={productTitle}
                    onChange={(e) => setProductTitle(e.target.value)}
                    placeholder="e.g. Glow Serum, Wireless Earbuds..."
                    className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 h-9"
                  />
                </div>

                <Button onClick={() => setStep(2)} className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
                  Next: Write Script <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Script & Scene */}
          {step === 2 && (
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white">Write Your Lines & Describe the Scene</h3>

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">What should the person say?</Label>
                  <Textarea
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                    placeholder={`e.g. "I've been using this serum for two weeks and honestly, my skin has never looked better. The glow is real."`}
                    className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 min-h-[100px]"
                  />
                </div>

                <Separator className="bg-white/[0.06]" />

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-2 block">Scene Preset</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SCENE_PRESETS.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setScenePreset(preset.id)}
                        className={`p-2.5 rounded-lg border text-left transition-all ${
                          scenePreset === preset.id
                            ? 'bg-violet-600/20 border-violet-500/50 text-white'
                            : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]'
                        }`}
                      >
                        <span className="text-[11px] font-medium block">{preset.label}</span>
                        <span className="text-[9px] text-zinc-500 block mt-0.5">{preset.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-1 block">Additional Scene Details (optional)</Label>
                  <Textarea
                    value={sceneDescription}
                    onChange={(e) => setSceneDescription(e.target.value)}
                    placeholder="e.g. speaking confidently under soft lighting, modern apartment background..."
                    className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 min-h-[60px]"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-2 block">Mood</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {MOOD_OPTIONS.map((m) => (
                      <button key={m} onClick={() => setMood(m)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${mood === m ? 'bg-violet-600/20 border-violet-500/50 text-violet-300' : 'bg-white/[0.02] border-white/[0.04] text-zinc-500 hover:bg-white/[0.05]'}`}>
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-[10px] text-zinc-500 mb-2 block">Lighting</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {LIGHTING_OPTIONS.map((l) => (
                      <button key={l} onClick={() => setLighting(l)} className={`px-2.5 py-1 rounded-md text-[11px] font-medium border transition-all ${lighting === l ? 'bg-violet-600/20 border-violet-500/50 text-violet-300' : 'bg-white/[0.02] border-white/[0.04] text-zinc-500 hover:bg-white/[0.05]'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 gap-2">
                    <Link href="/video-editor"><Film className="h-4 w-4" />Edit First</Link>
                  </Button>
                  <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-700 hover:to-fuchsia-700 text-white gap-2">
                    {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Sparkles className="h-4 w-4" />Generate Video</>}
                  </Button>
                </div>

                <p className="text-[10px] text-zinc-500 text-center">3 credits per video generation</p>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Result */}
          {step === 3 && (
            <Card className="bg-white/[0.02] border-white/[0.06]">
              <CardContent className="p-5 space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-violet-400" /> Video Generated!
                </h3>
                <p className="text-xs text-zinc-400">Your UGC video is ready. Download it or create another.</p>
                <div className="flex gap-2">
                  <Button onClick={() => { setStep(1); setGeneratedVideoUrl(null); setProductImage(null); setScript(''); }} variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5 gap-2">
                    <Video className="h-4 w-4" /> New Video
                  </Button>
                  {generatedVideoUrl && (
                    <a href={generatedVideoUrl} download target="_blank" rel="noopener noreferrer" className="flex-1">
                      <Button className="w-full bg-violet-600 hover:bg-violet-700 text-white gap-2">
                        <Download className="h-4 w-4" /> Download
                      </Button>
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">{error}</p>
          )}
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
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600/20 to-fuchsia-600/20 flex items-center justify-center mb-4">
                  <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
                </div>
                <h3 className="text-sm font-medium text-white mb-1">Generating Your Video...</h3>
                <p className="text-xs text-zinc-500 max-w-xs">This usually takes 30-90 seconds. AI is creating natural motion, expressions, and tone.</p>
              </div>
            ) : productImage ? (
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-6 text-center">
                <img src={productImage} alt="Product" className="max-h-64 mx-auto rounded-lg object-contain mb-4" />
                {productTitle && <p className="text-sm font-medium text-white">{productTitle}</p>}
                <p className="text-xs text-zinc-500 mt-1">Your product image is ready. Write a script to continue.</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600/10 to-fuchsia-600/10 flex items-center justify-center mb-4">
                  <Video className="h-8 w-8 text-violet-400/40" />
                </div>
                <h3 className="text-sm font-medium text-zinc-400 mb-1">Upload a product to get started</h3>
                <p className="text-xs text-zinc-500 max-w-xs">Upload an image or paste a product URL, then write your script.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
