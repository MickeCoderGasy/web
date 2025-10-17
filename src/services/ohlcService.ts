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
   * Formate les données OHLC pour l'injection dans le contexte
   */
  formatOHLCForContext(ohlcData: any): string {
    console.log('🔍 Données OHLC à formater:', ohlcData);
    console.log('🔍 Propriétés disponibles dans ohlcData:', Object.keys(ohlcData));
    
    // Mapper les propriétés selon le format reçu (priorité aux formats courts du webhook)
    const pair = ohlcData.ticker || ohlcData.pair || ohlcData.symbol || ohlcData.instrument || 'N/A';
    const timestamp = ohlcData.date_utc || ohlcData.timestamp || ohlcData.date || ohlcData.time || ohlcData.datetime;
    const open = ohlcData.o || ohlcData.open || ohlcData.Open;
    const high = ohlcData.h || ohlcData.high || ohlcData.High;
    const low = ohlcData.l || ohlcData.low || ohlcData.Low;
    const close = ohlcData.c || ohlcData.close || ohlcData.Close;
    const volume = ohlcData.v || ohlcData.volume || ohlcData.Volume;
    const volumeWeighted = ohlcData.vw || ohlcData.volume_weighted || ohlcData.VolumeWeighted;
    const timeframe = ohlcData.t || ohlcData.timeframe || ohlcData.tf || ohlcData.interval || 'N/A';
    const tradesCount = ohlcData.n || ohlcData.trades_count || ohlcData.tradesCount;
    
    console.log('📊 Propriétés mappées:', {
      pair, timestamp, open, high, low, close, volume, volumeWeighted, timeframe, tradesCount
    });
    
    // Vérifier si on a au moins les données essentielles
    if (!pair || pair === 'N/A') {
      console.warn('⚠️ Aucune paire trouvée dans les données OHLC');
      return '=== DONNÉES OHLC ===\nAucune donnée OHLC disponible (paire non trouvée)\n===============================';
    }
    
    if (!timestamp || timestamp === 'N/A') {
      console.warn('⚠️ Aucun timestamp trouvé dans les données OHLC');
      return '=== DONNÉES OHLC ===\nAucune donnée OHLC disponible (timestamp non trouvé)\n===============================';
    }
    
    // Toujours utiliser UTC pour Grok
    const date = timestamp ? formatForGrok(timestamp) : 'N/A';
    
    return `
=== DONNÉES OHLC RÉCENTES ===
Paire: ${pair}
Timestamp: ${date}
Open: ${open || 'N/A'}
High: ${high || 'N/A'}
Low: ${low || 'N/A'}
Close: ${close || 'N/A'}
${volume ? `Volume: ${volume}` : ''}
${volumeWeighted ? `Volume Pondéré: ${volumeWeighted}` : ''}
${timeframe ? `Timeframe: ${timeframe}` : ''}
${tradesCount ? `Nombre de Trades: ${tradesCount}` : ''}
===============================`;
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
        const formattedContext = this.formatOHLCForContext(response.data);
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
