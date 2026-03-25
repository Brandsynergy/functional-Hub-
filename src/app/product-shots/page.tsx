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
import {
  ShoppingBag, Upload, Sparkles, Download, Loader2,
  Camera, Trash2, RotateCcw, Sun, Mountain,
} from 'lucide-react';

const STYLE_TEMPLATES = [
  { id: 'kitchen-morning', label: 'Kitchen Morning', description: 'Kitchen counter, warm morning light', icon: '☀️' },
  { id: 'marble-luxury', label: 'Marble Luxury', description: 'White marble, gold accents, premium', icon: '💎' },
  { id: 'nature-outdoor', label: 'Nature Outdoor', description: 'Stone surface, green bokeh, golden hour', icon: '🌿' },
  { id: 'studio-white', label: 'Studio White', description: 'Clean white background, professional', icon: '⬜' },
  { id: 'studio-dark', label: 'Studio Dark', description: 'Dark surface, dramatic side lighting', icon: '⬛' },
  { id: 'beach-tropical', label: 'Beach Tropical', description: 'Sand, turquoise ocean, vacation vibe', icon: '🏖️' },
  { id: 'wooden-rustic', label: 'Wooden Rustic', description: 'Rustic wood, warm light, artisanal', icon: '🪵' },
  { id: 'minimalist-pastel', label: 'Minimalist Pastel', description: 'Soft pastel, modern aesthetic', icon: '🎨' },
  { id: 'desk-workspace', label: 'Desk Workspace', description: 'Modern desk, natural window light', icon: '🖥️' },
  { id: 'fabric-texture', label: 'Fabric Texture', description: 'Linen fabric, editorial style', icon: '🧵' },
];

const ASPECT_OPTIONS = [
  { value: '1:1', label: 'Square', desc: 'Instagram' },
  { value: '4:5', label: 'Portrait', desc: 'Feed' },
  { value: '16:9', label: 'Landscape', desc: 'Banner' },
  { value: '3:4', label: 'Classic', desc: 'Pinterest' },
];

export default function ProductShots() {
  const { addProject, updateProject, addImage, settings, deductCredits } = useAppStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [productImage, setProductImage] = useState<string | null>(null);
  const [productDescription, setProductDescription] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('studio-white');
  const [customScene, setCustomScene] = useState('');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [error, setError] = useState('');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProductImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!productDescription && !productImage) {
      setError('Please upload a product image or describe your product.');
      return;
    }
    if (settings.credits < 1) {
      setError('Not enough credits. Product shots cost 1 credit each.');
      return;
    }

    setError('');
    setIsGenerating(true);

    try {
      const project = addProject({
        type: 'product-shot',
        title: productDescription || 'Product Shot',
        status: 'generating',
        productImage: productImage || undefined,
        sceneDescription: customScene || selectedStyle,
        style: selectedStyle,
      });

      const res = await fetch('/api/product-shots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productDescription,
          style: selectedStyle,
          customScene: customScene || undefined,
          aspectRatio,
          productImageUrl: productImage?.startsWith('http') ? productImage : undefined,
        }),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
        updateProject(project.id, { status: 'failed' });
      } else {
        setResults((prev) => [data.output, ...prev]);
        deductCredits(1);
        updateProject(project.id, { status: 'completed', result: { url: data.output, type: 'image' } });
        addImage({
          modelId: '',
          url: data.output,
          prompt: data.prompt || productDescription,
          scene: { setting: selectedStyle, pose: '', outfit: '', outfitDetails: '', lighting: '', cameraAngle: '', cameraDistance: '', mood: '', props: [], background: '', timeOfDay: '', customPrompt: '' },
          output: { aspectRatio, quality: 'hd', count: 1, format: 'png' },
          tags: ['product-shot', selectedStyle],
          isFavorite: false,
        });
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
          <ShoppingBag className="h-6 w-6 text-emerald-400" />
          <h1 className="text-2xl font-bold text-white">AI Product Photography</h1>
        </div>
        <p className="text-sm text-zinc-400">Upload one photo of your product. Pick a style or describe it. AI generates your photoshoot.</p>
      </div>

      <div className="flex gap-6">
        {/* Left: Controls */}
        <div className="w-full lg:w-[420px] shrink-0 space-y-5">
          {/* Upload */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Upload Your Product Photo</h3>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center cursor-pointer hover:border-emerald-500/30 hover:bg-emerald-600/5 transition-all"
              >
                {productImage ? (
                  <img src={productImage} alt="Product" className="max-h-48 mx-auto rounded-lg object-contain" />
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-zinc-500 mx-auto mb-3" />
                    <p className="text-sm text-zinc-400">Any angle, any background</p>
                    <p className="text-[11px] text-zinc-600 mt-1">Just one decent photo is all it takes</p>
                  </>
                )}
              </div>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />

              <div>
                <Label className="text-[10px] text-zinc-500 mb-1 block">Describe Your Product</Label>
                <Input
                  value={productDescription}
                  onChange={(e) => setProductDescription(e.target.value)}
                  placeholder="e.g. matte black water bottle, organic face cream jar..."
                  className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 h-9"
                />
              </div>
            </CardContent>
          </Card>

          {/* Style Selection */}
          <Card className="bg-white/[0.02] border-white/[0.06]">
            <CardContent className="p-5 space-y-4">
              <h3 className="text-sm font-semibold text-white">Pick a Style</h3>
              <div className="grid grid-cols-2 gap-2">
                {STYLE_TEMPLATES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      selectedStyle === style.id
                        ? 'bg-emerald-600/20 border-emerald-500/50 text-white'
                        : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className="text-sm mr-1">{style.icon}</span>
                    <span className="text-[11px] font-medium">{style.label}</span>
                    <span className="text-[9px] text-zinc-500 block mt-0.5">{style.description}</span>
                  </button>
                ))}
              </div>

              <div>
                <Label className="text-[10px] text-zinc-500 mb-1 block">Or describe in plain English</Label>
                <Textarea
                  value={customScene}
                  onChange={(e) => setCustomScene(e.target.value)}
                  placeholder='e.g. "kitchen counter, morning light" or "floating on water with rose petals"'
                  className="bg-white/[0.03] border-white/[0.06] text-white text-xs placeholder:text-zinc-500 min-h-[60px]"
                />
              </div>

              <Separator className="bg-white/[0.06]" />

              {/* Aspect Ratio */}
              <div>
                <Label className="text-[10px] text-zinc-500 mb-2 block">Aspect Ratio</Label>
                <div className="grid grid-cols-4 gap-2">
                  {ASPECT_OPTIONS.map((ar) => (
                    <button
                      key={ar.value}
                      onClick={() => setAspectRatio(ar.value)}
                      className={`p-2 rounded-lg border text-center transition-all ${
                        aspectRatio === ar.value
                          ? 'bg-emerald-600/20 border-emerald-500/50 text-white'
                          : 'bg-white/[0.02] border-white/[0.06] text-zinc-500 hover:bg-white/[0.05]'
                      }`}
                    >
                      <span className="text-[11px] font-medium block">{ar.label}</span>
                      <span className="text-[9px] text-zinc-500">{ar.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white gap-2">
                {isGenerating ? <><Loader2 className="h-4 w-4 animate-spin" />Generating...</> : <><Camera className="h-4 w-4" />Generate Photoshoot</>}
              </Button>
              <p className="text-[10px] text-zinc-500 text-center">1 credit per photo</p>
            </CardContent>
          </Card>

          {error && <p className="text-xs text-red-400 bg-red-500/10 rounded-lg p-3 border border-red-500/20">{error}</p>}
        </div>

        {/* Right: Results */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-white">Your Photoshoot</h2>
            {results.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => setResults([])} className="text-zinc-400 hover:text-white gap-1">
                <RotateCcw className="h-3 w-3" /> Clear
              </Button>
            )}
          </div>

          {results.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.map((url, i) => (
                <div key={`${url.slice(0, 20)}-${i}`} className="rounded-xl overflow-hidden border border-white/[0.06] hover:border-emerald-500/30 transition-all bg-white/[0.02]">
                  <div className="aspect-square">
                    <img src={url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between px-3 py-2.5 border-t border-white/[0.04]">
                    <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-400 text-[10px]">AI Generated</Badge>
                    <div className="flex gap-1">
                      <a href={url} download target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 text-emerald-300 text-[11px] font-medium hover:bg-emerald-600/30 transition-colors">
                        <Download className="h-3.5 w-3.5" /> Download
                      </a>
                      <button onClick={() => setResults((prev) => prev.filter((_, idx) => idx !== i))} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors">
                        <Trash2 className="h-4 w-4 text-zinc-500 hover:text-red-400" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-600/10 to-teal-600/10 flex items-center justify-center mb-4">
                <ShoppingBag className="h-8 w-8 text-emerald-400/40" />
              </div>
              <h3 className="text-sm font-medium text-zinc-400 mb-1">No photos generated yet</h3>
              <p className="text-xs text-zinc-500 max-w-xs">Upload a product photo, pick a style, and hit Generate to create your AI photoshoot.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
