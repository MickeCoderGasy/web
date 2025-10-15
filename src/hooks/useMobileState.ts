import { useState, useEffect, useRef } from 'react';

interface AnalysisState {
  isAnalyzing: boolean;
  currentJobId: string | null;
  jobStatus: 'pending' | 'in_progress' | 'completed' | 'failed' | null;
  stepsStatus: Record<string, { status: string; message: string }>;
  analysisResult: any;
  interpretation: string;
  activeTab: string;
}

const STORAGE_KEY = 'tradapp_analysis_state';

export function useMobileState() {
  const [state, setState] = useState<AnalysisState>({
    isAnalyzing: false,
    currentJobId: null,
    jobStatus: null,
    stepsStatus: {},
    analysisResult: null,
    interpretation: '',
    activeTab: 'chat'
  });

  const isInitialized = useRef(false);
  const isAppVisible = useRef(true);

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    if (!isInitialized.current) {
      try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setState(parsedState);
          console.log('📱 Restored state from localStorage:', parsedState);
        }
      } catch (error) {
        console.error('Error loading state from localStorage:', error);
      }
      isInitialized.current = true;
    }
  }, []);

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    if (isInitialized.current) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
        console.log('💾 Saved state to localStorage:', state);
      } catch (error) {
        console.error('Error saving state to localStorage:', error);
      }
    }
  }, [state]);

  // Gérer les événements de visibilité de l'app
  useEffect(() => {
    const handleVisibilityChange = () => {
      isAppVisible.current = !document.hidden;
      console.log('📱 App visibility changed:', isAppVisible.current ? 'visible' : 'hidden');
    };

    const handlePageShow = () => {
      isAppVisible.current = true;
      console.log('📱 Page shown');
    };

    const handlePageHide = () => {
      isAppVisible.current = false;
      console.log('📱 Page hidden');
    };

    // Événements pour la gestion de la visibilité
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, []);

  // Fonctions pour mettre à jour l'état
  const updateState = (updates: Partial<AnalysisState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetAnalysis = () => {
    setState(prev => ({
      ...prev,
      isAnalyzing: false,
      currentJobId: null,
      jobStatus: null,
      stepsStatus: {},
      analysisResult: null,
      interpretation: ''
    }));
  };

  const clearState = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState({
      isAnalyzing: false,
      currentJobId: null,
      jobStatus: null,
      stepsStatus: {},
      analysisResult: null,
      interpretation: '',
      activeTab: 'chat'
    });
  };

  return {
    state,
    updateState,
    resetAnalysis,
    clearState,
    isAppVisible: isAppVisible.current,
    isInitialized: isInitialized.current
  };
}
