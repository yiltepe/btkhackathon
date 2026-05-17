export type Mode = 'auto' | 'price' | 'fashion' | 'home' | 'electronics' | 'beauty';
export type Lang = 'en' | 'tr';
export type Gender = 'men' | 'women' | 'unisex';
export type Budget = { min: number | null; max: number | null; currency: string };
export type ClarifyGroup = { question: string; options: string[] };
export type Clarify = { groups: ClarifyGroup[]; allowOther?: boolean };

export type Product = {
  name: string;
  price: number | null;
  currency: string;
  thumbnail: string;
  link: string;
  retailer: string;
};

export type IdentifiedItem = {
  name: string;
  type: string;
  color?: string;
  style?: string;
  material?: string;
  size?: string;
  fit?: string;
  occasion?: string;
};

export type Suggestion = {
  name: string;
  type?: string;
  searchQuery: string;
  visualDescription?: string;
  color?: string;
  reason?: string;
  sourceIndex?: number;
  swapSlot?: string;
  dupeOf?: number;
};

export type ReviewSummary = {
  rating?: number;
  sampleSize?: number;
  pros?: string[];
  cons?: string[];
};

export type ComparisonItem = {
  name: string;
  summary: string;
  pros?: string[];
  cons?: string[];
  bestFor?: string;
  sourceIndex?: number;
};

export type Comparison = {
  items: ComparisonItem[];
  winner?: string;
  verdict: string;
};

export type StandardResponse = {
  mode: Mode;
  text: string;
  identifiedItem?: IdentifiedItem;
  suggestions?: Suggestion[];
  hasVisual: boolean;
  imagePrompt?: string;
  retailers?: Product[];
  clarify?: Clarify;
  comparison?: Comparison;
  verdict?: string;
  crossSell?: Suggestion[];
  reviewSummary?: ReviewSummary;
  prefsSummary?: string;
};

export type ResolvedProduct = {
  title: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
  sourceUrl?: string;
};

export type Attachment = { kind: 'image' | 'link'; preview?: string; label?: string };

export type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  kind?: 'price' | 'fashion' | 'home' | 'electronics' | 'beauty';
  response?: StandardResponse;
  products?: Product[];
  productsByIndex?: { sourceIndex: number; label: string; items: Product[] }[];
  attachment?: Attachment;
  attachments?: Attachment[];
  resolvedProducts?: ResolvedProduct[];
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  lang: Lang;
  prefsSummary?: string;
};

export type CartItem = {
  id: string;
  name: string;
  retailer: string;
  price: number | null;
  currency?: string;
  link?: string;
  thumbnail?: string;
};
