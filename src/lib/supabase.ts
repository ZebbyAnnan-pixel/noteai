import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Notebook = {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
};

export type Document = {
  id: string;
  notebook_id: string;
  user_id: string;
  name: string;
  type: 'pdf' | 'text' | 'link' | 'doc' | 'image' | 'file';
  content: string | null;
  file_url: string | null;
  status: 'processing' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
};

export type ChatMessage = {
  id: string;
  notebook_id: string;
  user_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Array<{ source: string; text: string }> | null;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
};
