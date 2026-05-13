export type Mode = 'auto' | 'price' | 'fashion' | 'home' | 'electronics' | 'beauty';
export type Lang = 'en' | 'tr';

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
};

export type Suggestion = {
  name: string;
  type?: string;
  searchQuery: string;
  reason?: string;
};

export type StandardResponse = {
  mode: Mode;
  text: string;
  identifiedItem?: IdentifiedItem;
  suggestions?: Suggestion[];
  hasVisual: boolean;
  imagePrompt?: string;
  retailers?: Product[];
};

export type ResolvedProduct = {
  title: string;
  image?: string;
  jsonLd?: Record<string, unknown>;
};

export type Message = {
  id: string;
  role: 'user' | 'ai';
  text: string;
  kind?: 'price' | 'fashion' | 'home' | 'electronics' | 'beauty';
  response?: StandardResponse;
  products?: Product[];
  attachment?: { kind: 'image' | 'link'; preview?: string; label?: string };
};

export type Chat = {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  lang: Lang;
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
