// Service pour récupérer les données OHLC depuis le webhook
import { formatForGrok } from '@/utils/dateUtils';
export interface OHLCData {
  pair?: string;
  timestamp?: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  timeframe?: string;
  // Format alternatif du webhook
  ticker?: string;
  date_utc?: string;
  o?: number;
  h?: number;
  l?: number;
  c?: number;
  v?: number;
  vw?: number;
  tf?: string;
}

export interface OHLCRequest {
  access_token: string;
  pair: string;
  date_time: string; // Date/heure de l'analyse
}

export interface OHLCResponse {
  success: boolean;
  data?: OHLCData;
  error?: string;
}

class OHLCService {
  private readonly webhookUrl = 'https://n8n.qubextai.tech/webhook/ohlc';

  /**
   * Récupère les données OHLC les plus récentes pour une paire
   */
  async fetchOHLCData(request: OHLCRequest): Promise<OHLCResponse> {
    try {
      console.log('🔄 Récupération des données OHLC pour', request.pair);
      console.log('📤 Requête envoyée:', {
        pair: request.pair,
        date_time: request.date_time,
        access_token: request.access_token ? '***' + request.access_token.slice(-4) : 'non fourni'
      });
      
      const response = await fetch(this.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      console.log('📥 Réponse webhook:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur webhook:', errorText);
        throw new Error(`Erreur webhook OHLC: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Données reçues du webhook:', data);
      
      // Le webhook retourne directement un tableau de données OHLC
      if (Array.isArray(data) && data.length > 0) {
        // Prendre la donnée la plus récente (première du tableau)
        const latestOHLC = data[0];
        console.log(`✅ Données OHLC récupérées (${data.length} éléments disponibles):`, latestOHLC);
        console.log('📊 Structure complète de la première donnée:', JSON.stringify(latestOHLC, null, 2));
        console.log('📊 Propriétés disponibles:', Object.keys(latestOHLC));
        console.log('📊 Première donnée OHLC sélectionnée:', {
          pair: latestOHLC.ticker,
          timestamp: latestOHLC.date_utc,
          close: latestOHLC.c
        });
        return {
          success: true,
          data: latestOHLC
        };
      } else if (data.success && data.data) {
        // Format encapsulé (fallback)
        console.log('✅ Données OHLC récupérées (format encapsulé):', data.data);
        return {
          success: true,
          data: data.data
        };
      } else {
        console.warn('⚠️ Aucune donnée OHLC disponible pour', request.pair);
        console.warn('📋 Détails de la réponse:', {
          success: data.success,
          error: data.error,
          message: data.message,
          data: data.data,
          isArray: Array.isArray(data),
          length: Array.isArray(data) ? data.length : 'N/A'
        });
        return {
          success: false,
          error: data.error || data.message || 'Aucune donnée OHLC disponible'
        };
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des données OHLC:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
    }
  }

  /**
   * Formate les données OHLC multiples pour l'injection dans le contexte
   */
  formatOHLCForContext(ohlcDataArray: any[], analysisDateTime: string): string {
    console.log('🔍 Données OHLC multiples à formater:', ohlcDataArray);
    console.log('🔍 Nombre de données reçues:', ohlcDataArray?.length || 0);
    console.log('🔍 Date/heure d\'analyse:', analysisDateTime);
    
    if (!ohlcDataArray || !Array.isArray(ohlcDataArray) || ohlcDataArray.length === 0) {
      console.warn('⚠️ Aucune donnée OHLC reçue ou format invalide');
      return '=== DONNÉES OHLC ===\nAucune donnée OHLC disponible\n===============================';
    }

    // Convertir la date d'analyse en timestamp pour comparaison
    const analysisTimestamp = new Date(analysisDateTime).getTime();
    console.log('🕐 Timestamp d\'analyse:', analysisTimestamp);

    // Filtrer les données postérieures à l'analyse et timeframe M1
    const filteredData = ohlcDataArray.filter(item => {
      const itemTimestamp = new Date(item.date_utc || item.timestamp || item.date || item.time || item.datetime).getTime();
      const timeframe = item.t || item.timeframe || item.tf || item.interval || 'N/A';
      const isAfterAnalysis = itemTimestamp > analysisTimestamp;
      const isM1 = timeframe === 'M1' || timeframe === '1m' || timeframe === '1min';
      
      console.log('🔍 Filtrage:', {
        itemTimestamp,
        isAfterAnalysis,
        timeframe,
        isM1,
        keep: isAfterAnalysis && isM1
      });
      
      return isAfterAnalysis && isM1;
    });

    console.log('📊 Données filtrées:', filteredData.length, 'sur', ohlcDataArray.length);

    if (filteredData.length === 0) {
      console.warn('⚠️ Aucune donnée OHLC M1 postérieure à l\'analyse trouvée');
      return '=== DONNÉES OHLC ===\nAucune donnée OHLC M1 postérieure à l\'analyse disponible\n===============================';
    }

    // Trier par timestamp (plus récent en premier)
    filteredData.sort((a, b) => {
      const timestampA = new Date(a.date_utc || a.timestamp || a.date || a.time || a.datetime).getTime();
      const timestampB = new Date(b.date_utc || b.timestamp || b.date || b.time || b.datetime).getTime();
      return timestampB - timestampA; // Plus récent en premier
    });

    // Formater toutes les données sélectionnées
    let context = `=== DONNÉES OHLC M1 POSTÉRIEURES À L'ANALYSE ===\n`;
    context += `Nombre de bougies M1: ${filteredData.length}\n`;
    context += `Période: ${filteredData.length > 0 ? formatForGrok(filteredData[filteredData.length - 1].date_utc || filteredData[filteredData.length - 1].timestamp) : 'N/A'} à ${filteredData.length > 0 ? formatForGrok(filteredData[0].date_utc || filteredData[0].timestamp) : 'N/A'}\n\n`;

    filteredData.forEach((item, index) => {
      const pair = item.ticker || item.pair || item.symbol || item.instrument || 'N/A';
      const timestamp = item.date_utc || item.timestamp || item.date || item.time || item.datetime;
      const open = item.o || item.open || item.Open;
      const high = item.h || item.high || item.High;
      const low = item.l || item.low || item.Low;
      const close = item.c || item.close || item.Close;
      const volume = item.v || item.volume || item.Volume;
      const timeframe = item.t || item.timeframe || item.tf || item.interval || 'M1';
      
      const date = timestamp ? formatForGrok(timestamp) : 'N/A';
      
      context += `--- Bougie M1 #${index + 1} ---\n`;
      context += `Timestamp: ${date}\n`;
      context += `Open: ${open || 'N/A'}\n`;
      context += `High: ${high || 'N/A'}\n`;
      context += `Low: ${low || 'N/A'}\n`;
      context += `Close: ${close || 'N/A'}\n`;
      context += `Volume: ${volume ? volume.toLocaleString() : 'N/A'}\n`;
      context += `Timeframe: ${timeframe}\n\n`;
    });

    context += `===============================`;
    
    console.log('📊 Contexte OHLC formaté:', context.substring(0, 200) + '...');
    return context;
  }

  /**
   * Récupère et formate les données OHLC pour le contexte
   */
  async getOHLCContext(
    accessToken: string, 
    pair: string, 
    analysisDateTime: string
  ): Promise<string> {
    try {
      console.log('🔄 getOHLCContext appelé avec:', { pair, analysisDateTime });
      
      const request: OHLCRequest = {
        access_token: accessToken,
        pair: pair,
        date_time: analysisDateTime
      };

      console.log('📤 Requête OHLC préparée:', {
        pair: request.pair,
        date_time: request.date_time,
        access_token: request.access_token ? '***' + request.access_token.slice(-4) : 'non fourni'
      });

      const response = await this.fetchOHLCData(request);
      
      console.log('📥 Réponse OHLC reçue:', {
        success: response.success,
        hasData: !!response.data,
        error: response.error
      });
      
      if (response.success && response.data) {
        // S'assurer que les données sont sous forme de tableau
        const dataArray = Array.isArray(response.data) ? response.data : [response.data];
        const formattedContext = this.formatOHLCForContext(dataArray, analysisDateTime);
        console.log('📊 Contexte OHLC formaté:', formattedContext);
        console.log('📏 Taille du contexte formaté:', formattedContext.length, 'caractères');
        return formattedContext;
      } else {
        console.warn('⚠️ Impossible de récupérer les données OHLC:', response.error);
        return `\n=== DONNÉES OHLC ===\nAucune donnée OHLC récente disponible pour ${pair}\n====================`;
      }
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du contexte OHLC:', error);
      return `\n=== DONNÉES OHLC ===\nErreur lors de la récupération des données OHLC\n====================`;
    }
  }
}

const ohlcService = new OHLCService();
export default ohlcService;
