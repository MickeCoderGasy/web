// Service pour récupérer les données RSI depuis Polygon API
export interface RSIData {
  pair: string;
  rsi: number;
  timestamp: number;
  status: 'overbought' | 'oversold' | 'neutral';
}

export interface RSIApiResponse {
  results: {
    underlying: {
      url: string;
    };
    values: Array<{
      timestamp: number;
      value: number;
    }>;
  };
  status: string;
  request_id: string;
}

class RSIService {
  private readonly API_KEY: string;
  private readonly BASE_URL = 'https://api.polygon.io/v1/indicators/rsi';

  constructor() {
    this.API_KEY = import.meta.env.VITE_POLYGON_API_KEY || '';
    if (!this.API_KEY) {
      console.warn('VITE_POLYGON_API_KEY non définie dans les variables d\'environnement');
    }
  }

  // Paires majeures à analyser
  private readonly MAJOR_PAIRS = [
    'EUR/USD',
    'GBP/USD', 
    'USD/JPY',
    'USD/CHF',
    'AUD/USD',
    'USD/CAD',
    'NZD/USD',
    'XAU/USD' // Or
  ];

  // Convertir le format de paire pour l'API Polygon
  private formatPairForAPI(pair: string): string {
    // Convertir EUR/USD en C:EURUSD pour l'API Polygon
    return `C:${pair.replace('/', '')}`;
  }

  // Déterminer le statut RSI
  private getRSIStatus(rsi: number): 'overbought' | 'oversold' | 'neutral' {
    if (rsi >= 70) return 'overbought';
    if (rsi <= 30) return 'oversold';
    return 'neutral';
  }

  // Récupérer les données RSI pour une paire
  async getRSIForPair(pair: string): Promise<RSIData | null> {
    try {
      if (!this.API_KEY) {
        throw new Error('Clé API Polygon non configurée');
      }

      const formattedPair = this.formatPairForAPI(pair);
      const url = `${this.BASE_URL}/${formattedPair}?timespan=hour&adjusted=true&window=12&series_type=close&order=desc&limit=1&apiKey=${this.API_KEY}`;
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Erreur API: ${response.status} ${response.statusText}`);
      }

      const data: RSIApiResponse = await response.json();
      
      if (data.status !== 'OK' || !data.results?.values?.length) {
        throw new Error('Aucune donnée RSI disponible');
      }

      const latestRSI = data.results.values[0];
      const rsiValue = latestRSI.value;
      
      return {
        pair,
        rsi: rsiValue,
        timestamp: latestRSI.timestamp,
        status: this.getRSIStatus(rsiValue)
      };
    } catch (error) {
      console.error(`Erreur lors de la récupération du RSI pour ${pair}:`, error);
      return null;
    }
  }

  // Récupérer les données RSI pour toutes les paires majeures
  async getAllRSIData(): Promise<RSIData[]> {
    try {
      const promises = this.MAJOR_PAIRS.map(pair => this.getRSIForPair(pair));
      const results = await Promise.allSettled(promises);
      
      return results
        .filter((result): result is PromiseFulfilledResult<RSIData> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value);
    } catch (error) {
      console.error('Erreur lors de la récupération des données RSI:', error);
      return [];
    }
  }

  // Obtenir les paires surachetées (RSI >= 70)
  async getOverboughtPairs(): Promise<RSIData[]> {
    const allData = await this.getAllRSIData();
    return allData.filter(data => data.status === 'overbought');
  }

  // Obtenir les paires surventes (RSI <= 30)
  async getOversoldPairs(): Promise<RSIData[]> {
    const allData = await this.getAllRSIData();
    return allData.filter(data => data.status === 'oversold');
  }

  // Obtenir les paires neutres (30 < RSI < 70)
  async getNeutralPairs(): Promise<RSIData[]> {
    const allData = await this.getAllRSIData();
    return allData.filter(data => data.status === 'neutral');
  }
}

export default new RSIService();
