// ─── AI Model (Persona) ────────────────────────────────────────
export interface AIModel {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  thumbnail?: string;
  face: FaceConfig;
  body: BodyConfig;
  style: StyleConfig;
  referenceImages: string[];
  seed?: number;
}

export interface FaceConfig {
  ethnicity: string;
  age: string;
  gender: string;
  skinTone: string;
  faceShape: string;
  eyeColor: string;
  eyeShape: string;
  hairColor: string;
  hairStyle: string;
  hairLength: string;
  features: string[]; // freckles, dimples, beauty mark, etc.
  expression: string;
}

export interface BodyConfig {
  bodyType: string;
  height: string;
  build: string;
  skinTexture: string;
}

export interface StyleConfig {
  aesthetic: string;
  fashionStyle: string;
  colorPalette: string[];
  vibeKeywords: string[];
  influencerNiche: string;
}

// ─── Photo Generation ──────────────────────────────────────────
export interface GenerationRequest {
  modelId: string;
  scene: SceneConfig;
  output: OutputConfig;
}

export interface SceneConfig {
  setting: string;
  pose: string;
  outfit: string;
  outfitDetails: string;
  lighting: string;
  cameraAngle: string;
  cameraDistance: string;
  mood: string;
  props: string[];
  background: string;
  timeOfDay: string;
  customPrompt: string;
}

export interface OutputConfig {
  aspectRatio: string;
  quality: 'standard' | 'hd' | 'ultra';
  count: number;
  format: string;
}

export interface GeneratedImage {
  id: string;
  modelId: string;
  url: string;
  prompt: string;
  scene: SceneConfig;
  output: OutputConfig;
  createdAt: string;
  tags: string[];
  isFavorite: boolean;
  seed?: number;
}

// ─── Credits ───────────────────────────────────────────────────
export type CreditTier = 10 | 50 | 100;

export interface CreditPack {
  tier: CreditTier;
  credits: number;
  price: number;
  enhanceEnabled: boolean;
  label: string;
  description: string;
  renewable: boolean;
}

// ─── User Auth ─────────────────────────────────────────────────
export interface AppUser {
  id: string;
  name: string;
  email: string;
}

// ─── App State ─────────────────────────────────────────────────
export interface AppSettings {
  defaultModel: string;
  defaultQuality: 'standard' | 'hd' | 'ultra';
  theme: 'dark' | 'light';
  credits: number;
  creditTier: CreditTier | null;
  freeTrialUsed: boolean;
}

// ─── Generation Status ─────────────────────────────────────────
export interface GenerationJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  result?: string[];
  error?: string;
  startedAt: string;
}

// ─── Export Presets ─────────────────────────────────────────────
export interface ExportPreset {
  name: string;
  platform: string;
  width: number;
  height: number;
  aspectRatio: string;
  icon: string;
}

// ─── FUNCTIONAL HUB: Projects ──────────────────────────────────
export interface Project {
  id: string;
  type: 'ugc-video' | 'youtube-clone' | 'product-shot' | 'chat-creation';
  title: string;
  status: 'draft' | 'generating' | 'completed' | 'failed';
  productImage?: string;
  script?: string;
  sceneDescription?: string;
  mood?: string;
  style?: string;
  youtubeUrl?: string;
  youtubeTitle?: string;
  youtubeThumbnail?: string;
  result?: { url: string; type: 'image' | 'video' };
  createdAt: string;
  updatedAt: string;
}

// ─── FUNCTIONAL HUB: Chat ──────────────────────────────────────
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  attachments?: { url: string; type: 'image' | 'video' }[];
  createdAt: string;
}

// ─── FUNCTIONAL HUB: Video Jobs ────────────────────────────────
export interface VideoJob {
  id: string;
  projectId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  resultUrl?: string;
  error?: string;
  startedAt: string;
}
