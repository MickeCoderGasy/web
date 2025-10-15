// Service to fetch AI Market Insights from Supabase database
import { supabase } from '@/integrations/supabase/client';

export interface AiInsight {
  output: string;
}

export interface NewsAndEventsRow {
  id: number;
  created_at: string;
  pair: string | null;
  content: string | null;
}

// Major currency pairs available for analysis
export const MAJOR_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "USD/CHF", "USD/CAD", "AUD/USD", "NZD/USD", 
  "EUR/GBP", "EUR/JPY", "EUR/CHF", "EUR/CAD", "EUR/AUD", "EUR/NZD",
  "GBP/JPY", "GBP/CHF", "GBP/CAD", "GBP/AUD", "GBP/NZD",
  "CHF/JPY", "CAD/JPY", "AUD/JPY", "NZD/JPY",
  "AUD/CHF", "AUD/CAD", "AUD/NZD", "NZD/CHF", "NZD/CAD", "CAD/CHF", 
  "XAU/USD"
] as const;

export type MajorPair = typeof MAJOR_PAIRS[number];

export async function fetchAiInsight(pair: MajorPair): Promise<AiInsight> {
  try {
    console.log(`Fetching AI insight for pair: ${pair}`);
    
    // Query Supabase for the latest insight for the selected pair
    // Table 'news and events' is not in the generated types yet, using type assertion
    // Don't use .single() to avoid PGRST116 error when no rows exist
    const { data, error } = await (supabase as any)
      .from('news_and_events')
      .select('*')
      .eq('pair', pair)

    console.log('Supabase response:', { data, error });

    if (error) {
      throw new Error(`Database error: ${error.message} (${error.code})`);
    }

    // Check if we got any results
    if (!data || data.length === 0) {
      // Fetch available pairs to help the user
      const { data: availablePairs } = await (supabase as any)
        .from('news_and_events')
        .select('pair')
      
      const uniquePairs = [...new Set(availablePairs?.map((p: any) => p.pair) || [])];
      console.log('Available pairs in database:', uniquePairs);
      
      if (uniquePairs.length === 0) {
        throw new Error(`The database is empty. No analysis available for any pair yet. The database will be automatically populated within the hour.`);
      }
      
      throw new Error(`No analysis found for ${pair}. Available pairs: ${uniquePairs.join(', ')}. The database is updated every hour.`);
    }

    const typedData = data[0] as NewsAndEventsRow;

    if (!typedData.content) {
      throw new Error(`No content available for ${pair}. Please try another pair.`);
    }

    console.log(`Successfully fetched insight for ${pair}, content length: ${typedData.content.length}`);

    return {
      output: typedData.content
    };
  } catch (error: any) {
    console.error('Error fetching AI insight:', error);
    throw error;
  }
}

// Helper function to format markdown text for display
export function formatMarkdownText(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>') // Bold
    .replace(/\n/g, '<br />') // Line breaks
    .replace(/\* /g, '• '); // Bullet points
}

