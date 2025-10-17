import { useState, useEffect } from 'react';
import { ContextSettings } from '@/config/grok-config';
import analysisHistoryService from '@/services/analysisHistoryService';
import ohlcService from '@/services/ohlcService';
import { supabase } from '@/integrations/supabase/client';

export interface OHLCEnrichmentState {
  isLoading: boolean;
  isEnriched: boolean;
  error: string | null;
  lastUpdate: Date | null;
  ohlcData: any | null;
}

export function useOHLCEnrichment(settings: ContextSettings) {
  const [state, setState] = useState<OHLCEnrichmentState>({
    isLoading: false,
    isEnriched: false,
    error: null,
    lastUpdate: null,
    ohlcData: null
  });

  useEffect(() => {
    const enrichContext = async () => {
      if (!settings.selectedAnalysisId) {
        setState(prev => ({
          ...prev,
          isEnriched: false,
          error: null,
          ohlcData: null
        }));
        return;
      }

      setState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        // Récupérer l'analyse sélectionnée
        const analysis = await analysisHistoryService.getAnalysisById(settings.selectedAnalysisId);
        
        if (!analysis || !analysis.result) {
          throw new Error('Analyse non trouvée');
        }

        // Récupérer le token d'accès Supabase
        const { data: { session } } = await supabase.auth.getSession();
        const accessToken = session?.access_token;
        
        if (!accessToken) {
          throw new Error('Aucune session d\'authentification Supabase active');
        }
        const pair = analysis.result.pair;
        const analysisDateTime = analysis.result.generated_at || analysis.timestamp;

        // Appeler le webhook OHLC
        const ohlcResponse = await ohlcService.fetchOHLCData({
          access_token: accessToken,
          pair: pair,
          date_time: analysisDateTime
        });

        if (ohlcResponse.success && ohlcResponse.data) {
          // Vérifier si c'est un tableau de données
          const dataArray = Array.isArray(ohlcResponse.data) ? ohlcResponse.data : [ohlcResponse.data];
          setState(prev => ({
            ...prev,
            isLoading: false,
            isEnriched: true,
            error: null,
            lastUpdate: new Date(),
            ohlcData: dataArray
          }));
        } else {
          // Ne pas considérer "Aucune donnée OHLC disponible" comme une erreur critique
          const isNoDataError = ohlcResponse.error?.includes('Aucune donnée OHLC disponible');
          
          setState(prev => ({
            ...prev,
            isLoading: false,
            isEnriched: false,
            error: isNoDataError ? null : ohlcResponse.error || 'Erreur lors de la récupération des données OHLC',
            ohlcData: null
          }));
          
          if (isNoDataError) {
            console.warn('⚠️ Aucune donnée OHLC disponible pour', pair, '- ce n\'est pas une erreur critique');
          }
        }
      } catch (error) {
        console.error('Erreur lors de l\'enrichissement OHLC:', error);
        setState(prev => ({
          ...prev,
          isLoading: false,
          isEnriched: false,
          error: error instanceof Error ? error.message : 'Erreur inconnue',
          ohlcData: null
        }));
      }
    };

    enrichContext();
  }, [settings.selectedAnalysisId]);

  return {
    ...state,
    // Fonction pour forcer le rechargement
    refresh: () => {
      if (settings.selectedAnalysisId) {
        setState(prev => ({ ...prev, isLoading: true, error: null }));
        // Le useEffect se déclenchera automatiquement
      }
    }
  };
}
