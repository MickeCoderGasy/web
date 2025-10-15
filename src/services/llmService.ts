// Service to communicate with n8n LLM webhook for chat analysis

const LLM_WEBHOOK_URL = "https://n8n.qubextai.tech/webhook/llm-chat";

export interface StockAnalysisRequest {
  symbol: string;
  message: string;
}

export interface StockAnalysisResponse {
  symbol: string;
  recommendation: string;
  confidence: number;
  riskLevel: string;
  timeframe: string;
  targetPrice: number | string;
  stopLoss: number | string;
  analysis: string;
  keyFactors: string[];
}

class LLMService {
  async analyzeStock(symbol: string): Promise<StockAnalysisResponse> {
    try {
      console.log(`Analyzing stock: ${symbol}`);
      
      const response = await fetch(LLM_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          symbol: symbol.trim().toUpperCase(),
          message: `Analyze stock ${symbol}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validate response format
      if (data.error) {
        throw new Error(data.error);
      }

      return {
        symbol: data.symbol || symbol,
        recommendation: data.recommendation || 'HOLD',
        confidence: data.confidence || 50,
        riskLevel: data.riskLevel || 'MEDIUM',
        timeframe: data.timeframe || 'Short-term',
        targetPrice: data.targetPrice || 'N/A',
        stopLoss: data.stopLoss || 'N/A',
        analysis: data.analysis || 'Analysis not available',
        keyFactors: data.keyFactors || [],
      };
    } catch (error) {
      console.error('LLM Service Error:', error);
      throw new Error('Failed to get AI analysis. Please try again.');
    }
  }

  async chat(message: string): Promise<string> {
    try {
      const response = await fetch(LLM_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: message,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || data.analysis || 'No response from AI';
    } catch (error) {
      console.error('LLM Chat Error:', error);
      throw new Error('Failed to get AI response. Please try again.');
    }
  }
}

export default new LLMService();

