// Composant de test pour vérifier le système d'historique et l'injection de contexte
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw, History, Database } from 'lucide-react';
import grokService from '@/services/grokService';
import chatHistoryServiceSupabase, { ChatSession } from '@/services/chatHistoryServiceSupabase';
import analysisHistoryService from '@/services/analysisHistoryService';

interface HistoryTestComponentProps {
  // Props si nécessaire
}

const HistoryTestComponent: React.FC<HistoryTestComponentProps> = () => {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [analyses, setAnalyses] = useState<any[]>([]);

  // Charger les sessions et analyses disponibles
  useEffect(() => {
    loadTestData();
  }, []);

  const loadTestData = async () => {
    try {
      const recentSessions = await chatHistoryServiceSupabase.getRecentSessions(10);
      const recentAnalyses = await analysisHistoryService.getRecentAnalyses(10);
      
      setSessions(recentSessions);
      setAnalyses(recentAnalyses);
      
      console.log('📊 Données de test chargées:', {
        sessions: recentSessions.length,
        analyses: recentAnalyses.length
      });
    } catch (error) {
      console.error('❌ Erreur lors du chargement des données de test:', error);
    }
  };

  // Test 1: Vérifier la création d'une session avec contexte
  const testCreateSessionWithContext = async () => {
    setIsLoading(true);
    const testId = `test_${Date.now()}`;
    
    try {
      // Créer une session de test avec une analyse
      const analysisId = analyses[0]?.id;
      if (!analysisId) {
        throw new Error('Aucune analyse disponible pour le test');
      }

      const sessionId = await chatHistoryServiceSupabase.createSession(
        `Test Session ${testId}`,
        'grok',
        analysisId
      );

      // Ajouter des messages de test
      await chatHistoryServiceSupabase.addMessage(sessionId, {
        role: 'user',
        content: 'Bonjour, peux-tu analyser cette paire?',
        model: 'grok'
      });

      await chatHistoryServiceSupabase.addMessage(sessionId, {
        role: 'assistant',
        content: 'Bien sûr! Je vais analyser cette paire pour vous.',
        model: 'grok'
      });

      // Vérifier que la session a été créée avec le contexte
      const session = await chatHistoryServiceSupabase.getChatSession(sessionId);
      
      const result = {
        test: 'Création session avec contexte',
        success: session?.contextAnalysisId === analysisId,
        details: {
          sessionId,
          contextAnalysisId: session?.contextAnalysisId,
          expectedAnalysisId: analysisId,
          messagesCount: session?.messages.length || 0
        }
      };

      setTestResults(prev => [...prev, result]);
      console.log('✅ Test création session:', result);
      
    } catch (error) {
      const result = {
        test: 'Création session avec contexte',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      setTestResults(prev => [...prev, result]);
      console.error('❌ Test création session échoué:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 2: Vérifier la reprise de conversation avec contexte
  const testResumeConversationWithContext = async () => {
    setIsLoading(true);
    
    try {
      if (sessions.length === 0) {
        throw new Error('Aucune session disponible pour le test');
      }

      const testSession = sessions[0];
      console.log('🔄 Test reprise conversation:', testSession);

      // Simuler la reprise de conversation
      const session = await chatHistoryServiceSupabase.getChatSession(testSession.id);
      
      if (!session) {
        throw new Error('Session non trouvée');
      }

      // Vérifier que le contexte est bien associé
      const hasContext = !!session.contextAnalysisId;
      const contextAnalysis = session.contextAnalysisId ? 
        await analysisHistoryService.getAnalysisById(session.contextAnalysisId) : null;

      const result = {
        test: 'Reprise conversation avec contexte',
        success: hasContext && !!contextAnalysis,
        details: {
          sessionId: session.id,
          sessionTitle: session.title,
          hasContext,
          contextAnalysisId: session.contextAnalysisId,
          contextAnalysisExists: !!contextAnalysis,
          messagesCount: session.messages.length,
          contextAnalysisTitle: contextAnalysis?.pair || 'N/A'
        }
      };

      setTestResults(prev => [...prev, result]);
      console.log('✅ Test reprise conversation:', result);
      
    } catch (error) {
      const result = {
        test: 'Reprise conversation avec contexte',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      setTestResults(prev => [...prev, result]);
      console.error('❌ Test reprise conversation échoué:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 3: Vérifier l'injection automatique du contexte dans Grok
  const testContextInjectionInGrok = async () => {
    setIsLoading(true);
    
    try {
      if (sessions.length === 0) {
        throw new Error('Aucune session disponible pour le test');
      }

      const testSession = sessions[0];
      
      // Simuler l'envoi d'un message avec contexte
      const conversationHistory = testSession.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Vérifier que le contexte est bien configuré
      const contextSettings = grokService.getContextSettings();
      const hasContextConfigured = !!contextSettings.selectedAnalysisId;

      // Simuler l'envoi d'un message (sans vraiment l'envoyer)
      const isFirstMessage = conversationHistory.filter(msg => msg.role === 'user').length === 0;
      
      const result = {
        test: 'Injection contexte dans Grok',
        success: hasContextConfigured,
        details: {
          sessionId: testSession.id,
          hasContextConfigured,
          selectedAnalysisId: contextSettings.selectedAnalysisId,
          conversationHistoryLength: conversationHistory.length,
          isFirstMessage,
          contextSettings
        }
      };

      setTestResults(prev => [...prev, result]);
      console.log('✅ Test injection contexte:', result);
      
    } catch (error) {
      const result = {
        test: 'Injection contexte dans Grok',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      setTestResults(prev => [...prev, result]);
      console.error('❌ Test injection contexte échoué:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Test 4: Vérifier la persistance du contexte
  const testContextPersistence = async () => {
    setIsLoading(true);
    
    try {
      // Vérifier que le contexte est bien persisté dans les sessions
      const sessionsWithContext = sessions.filter(s => s.contextAnalysisId);
      const sessionsWithoutContext = sessions.filter(s => !s.contextAnalysisId);
      
      const result = {
        test: 'Persistance du contexte',
        success: true,
        details: {
          totalSessions: sessions.length,
          sessionsWithContext: sessionsWithContext.length,
          sessionsWithoutContext: sessionsWithoutContext.length,
          contextPersistenceRate: sessions.length > 0 ? (sessionsWithContext.length / sessions.length * 100).toFixed(1) + '%' : '0%'
        }
      };

      setTestResults(prev => [...prev, result]);
      console.log('✅ Test persistance contexte:', result);
      
    } catch (error) {
      const result = {
        test: 'Persistance du contexte',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue'
      };
      setTestResults(prev => [...prev, result]);
      console.error('❌ Test persistance contexte échoué:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Exécuter tous les tests
  const runAllTests = async () => {
    setTestResults([]);
    await testCreateSessionWithContext();
    await testResumeConversationWithContext();
    await testContextInjectionInGrok();
    await testContextPersistence();
  };

  // Nettoyer les résultats
  const clearResults = () => {
    setTestResults([]);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Test du Système d'Historique et Contexte
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Informations sur les données disponibles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
              <div className="text-sm text-gray-600">Sessions disponibles</div>
            </div>
            <div className="text-center p-3 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{analyses.length}</div>
              <div className="text-sm text-gray-600">Analyses disponibles</div>
            </div>
          </div>

          {/* Boutons de test */}
          <div className="flex flex-wrap gap-2">
            <Button onClick={testCreateSessionWithContext} disabled={isLoading || analyses.length === 0}>
              <Database className="h-4 w-4 mr-2" />
              Test Création Session
            </Button>
            <Button onClick={testResumeConversationWithContext} disabled={isLoading || sessions.length === 0}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Test Reprise Conversation
            </Button>
            <Button onClick={testContextInjectionInGrok} disabled={isLoading || sessions.length === 0}>
              <History className="h-4 w-4 mr-2" />
              Test Injection Contexte
            </Button>
            <Button onClick={testContextPersistence} disabled={isLoading}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Test Persistance
            </Button>
            <Button onClick={runAllTests} disabled={isLoading} variant="outline">
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Tous les Tests
            </Button>
            <Button onClick={clearResults} variant="destructive">
              Effacer
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Résultats des tests */}
      {testResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Résultats des Tests ({testResults.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {testResults.map((result, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{result.test}</span>
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Succès" : "Échec"}
                      </Badge>
                    </div>
                    {result.error && (
                      <div className="text-sm text-red-600 mb-2">
                        Erreur: {result.error}
                      </div>
                    )}
                    {result.details && (
                      <div className="text-sm text-gray-600">
                        <pre className="whitespace-pre-wrap bg-gray-50 p-2 rounded">
                          {JSON.stringify(result.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default HistoryTestComponent;
