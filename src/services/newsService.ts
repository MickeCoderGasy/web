// Service to fetch market news from the webhook

export interface NewsItem {
  id: string;
  created_at: string;
  title: string;
  description: string;
  sentiment: "Positive" | "Negative" | "Neutral";
}

const NEWS_WEBHOOK_URL = "https://n8n.qubextai.tech/webhook/Rss";

export async function fetchMarketNews(token: string): Promise<NewsItem[]> {
  try {
    const response = await fetch(NEWS_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        token: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch news: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching market news:', error);
    throw error;
  }
}

// Helper function to format time ago
export function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInMinutes = Math.floor(diffInMs / 60000);
  const diffInHours = Math.floor(diffInMs / 3600000);
  const diffInDays = Math.floor(diffInMs / 86400000);

  if (diffInMinutes < 1) {
    return 'Just now';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else if (diffInDays === 1) {
    return 'Yesterday';
  } else {
    return `${diffInDays}d ago`;
  }
}

// Helper function to extract source from description or title
export function extractSource(description: string): string {
  // Try to extract common news sources
  const sources = ['Bloomberg', 'Reuters', 'CNBC', 'WSJ', 'Financial Times', 'MarketWatch', 'FXStreet'];
  for (const source of sources) {
    if (description.includes(source)) {
      return source;
    }
  }
  return 'Market News';
}

