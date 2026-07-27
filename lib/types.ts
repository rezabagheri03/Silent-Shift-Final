export type Category = { id: number; slug: string; name: string };
export type Tag = { id: number; slug: string; name: string };

export type Podcast = {
  id: number;
  slug: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  summary: string | null;
  cover_url: string | null;
  audio_url: string | null;
  duration_seconds: number;
  episode_number: number | null;
  producer: string | null;
  category_id: number | null;
  category_name?: string | null;
  apple_url: string | null;
  castbox_url: string | null;
  transcript: string | null;
  play_count: number;
  published_at: string;
  created_at: string;
  tags?: Tag[];
  chapters?: { id: number; title: string; start_seconds: number }[];
};

export type Article = {
  id: number;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string;
  cover_url: string | null;
  author: string | null;
  category_id: number | null;
  category_name?: string | null;
  view_count: number;
  published_at: string;
  created_at: string;
  read_time_minutes?: number | null;
  tags?: Tag[];
};

export type Faq = { id: number; question: string; answer: string; sort_order: number };

export type ContactMessage = {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
};

export type Paginated<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
};

export type SortMode = "new" | "popular";
