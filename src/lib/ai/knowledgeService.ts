import { supabase } from "../supabase";

export interface KnowledgeRecord {
  id: string;
  content: string;
  metadata: {
    title?: string;
    source?: string;
    tags?: string[];
  };
  rank?: number;
}

/**
 * Performs a high-performance native PostgreSQL Full-Text Search in Supabase.
 * This replaces the need for external vector embeddings while maintaining 
 * natural language matching capabilities.
 */
export async function searchKnowledge(
  queryText: string,
  matchCount: number = 5
): Promise<KnowledgeRecord[]> {
  if (!queryText.trim()) return [];

  try {
    const { data, error } = await supabase.rpc('search_knowledge', {
      query_text: queryText,
      match_count: matchCount,
    });

    if (error) {
      console.error('Supabase Native Search Error:', error);
      return [];
    }

    return (data || []).map((d: any) => ({
      id: d.id,
      content: d.content,
      metadata: d.metadata || {},
      rank: d.rank
    }));
  } catch (error) {
    console.error("Native search failed:", error);
    return [];
  }
}

/**
 * Utility for bulk seeding knowledge chunks.
 */
export async function uploadKnowledgeChunks(chunks: { content: string, metadata: any }[]): Promise<void> {
  const { error } = await supabase
    .from('knowledge_base')
    .insert(chunks);

  if (error) throw error;
}
