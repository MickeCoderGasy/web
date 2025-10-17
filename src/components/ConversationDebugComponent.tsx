// Composant de debug pour tester la sauvegarde des conversations
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Database, MessageSquare, User } from 'lucide-react';
import chatHistoryServiceSupabase, { ChatSession } from '@/services/chatHistoryServiceSupabase';
import grokService from '@/services/grokService';

const ConversationDebugComponent: React.FC = () => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null);

  // Charger les sessions
  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const recentSessions = await chatHistoryServiceSupabase.getRecentSessions(10);
      setSessions(recentSessions);
      console.log('📚 Sessions chargées:', recentSessions.length);
    } catch (error) {
      console.error('❌ Erreur lors du chargement des sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Tester la connexion Supabase
  const testSupabaseConnection = async () => {
    try {
      const isConnected = await chatHistoryServiceSupabase.testConnection();
      setConnectionStatus(isConnected);
      
      const result = {
        test: 'Connexion Supabase',
        success: isConnected,
        timestamp: new Date().toLocaleString('fr-FR')
      };
      
      setTestResults(prev => [...prev, result]);
      console.log('🧪 Test connexion:', result);
    } catch (error) {
      const result = {
        test: 'Connexion Supabase',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toLocaleString('fr-FR')
      };
      setTestResults(prev => [...prev, result]);
      console.error('❌ Test connexion échoué:', error);
    }
  };

  // Tester la création d'une session
  const testCreateSession = async () => {
    try {
      const sessionId = await chatHistoryServiceSupabase.createChatSession(
        `Test Session ${Date.now()}`,
        undefined,
        'grok'
      );
      
      const result = {
        test: 'Création de session',
        success: true,
        sessionId,
        timestamp: new Date().toLocaleString('fr-FR')
      };
      
      setTestResults(prev => [...prev, result]);
      console.log('✅ Session créée:', sessionId);
      
      // Recharger les sessions
      await loadSessions();
    } catch (error) {
      const result = {
        test: 'Création de session',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toLocaleString('fr-FR')
      };
      setTestResults(prev => [...prev, result]);
      console.error('❌ Création session échouée:', error);
    }
  };

  // Tester l'ajout d'un message
  const testAddMessage = async () => {
    if (sessions.length === 0) {
      alert('Aucune session disponible pour le test');
      return;
    }

    try {
      const testSession = sessions[0];
      const testMessage = {
        role: 'user' as const,
        content: `Message de test ${Date.now()}`,
        model: 'grok' as const
      };

      const savedMessage = await chatHistoryServiceSupabase.addMessageToSession(
        testSession.id,
        testMessage
      );

      const result = {
        test: 'Ajout de message',
        success: !!savedMessage,
        sessionId: testSession.id,
        messageId: savedMessage?.id,
        timestamp: new Date().toLocaleString('fr-FR')
      };
      
      setTestResults(prev => [...prev, result]);
      console.log('✅ Message ajouté:', savedMessage);
      
      // Recharger les sessions
      await loadSessions();
    } catch (error) {
      const result = {
        test: 'Ajout de message',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toLocaleString('fr-FR')
      };
      setTestResults(prev => [...prev, result]);
      console.error('❌ Ajout message échoué:', error);
    }
  };

  // Tester la récupération d'une session
  const testGetSession = async () => {
    if (sessions.length === 0) {
      alert('Aucune session disponible pour le test');
      return;
    }

    try {
      const testSession = sessions[0];
      const retrievedSession = await chatHistoryServiceSupabase.getChatSession(testSession.id);
      
      const result = {
        test: 'Récupération de session',
        success: !!retrievedSession,
        sessionId: testSession.id,
        messagesCount: retrievedSession?.messages.length || 0,
        timestamp: new Date().toLocaleString('fr-FR')
      };
      
      setTestResults(prev => [...prev, result]);
      console.log('✅ Session récupérée:', retrievedSession);
    } catch (error) {
      const result = {
        test: 'Récupération de session',
        success: false,
        error: error instanceof Error ? error.message : 'Erreur inconnue',
        timestamp: new Date().toLocaleString('fr-FR')
      };
      setTestResults(prev => [...prev, result]);
      console.error('❌ Récupération session échouée:', error);
    }
  };

  // Exécuter tous les tests
  const runAllTests = async () => {
    setTestResults([]);
    await testSupabaseConnection();
    await testCreateSession();
    await testAddMessage();
    await testGetSession();
  };

  // Charger les sessions au démarrage
  useEffect(() => {
    loadSessions();
  }, []);

  return (
    <div className="space-y-4">
      {/* Statut de connexion */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Statut de Connexion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            {connectionStatus === null && <span className="text-gray-500">Non testé</span>}
            {connectionStatus === true && (
              <>
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-green-600">Connexion OK</span>
              </>
            )}
            {connectionStatus === false && (
              <>
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-red-600">Connexion échouée</span>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Sessions disponibles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Sessions Disponibles ({sessions.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center text-gray-500 py-4">
              Aucune session trouvée
            </div>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sessions.map((session, index) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{session.title}</div>
                    <div className="text-sm text-gray-500">
                      {session.messages.length} messages • {new Date(session.createdAt).toLocaleString('fr-FR')}
                    </div>
                    {session.contextAnalysisId && (
                      <Badge variant="secondary" className="mt-1">
                        Contexte: {session.contextAnalysisId}
                      </Badge>
                    )}
                  </div>
                  <div className="text-right">
                    <Badge variant="outline">{session.model}</Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Tests de Sauvegarde
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button onClick={testSupabaseConnection} disabled={isLoading}>
              Test Connexion
            </Button>
            <Button onClick={testCreateSession} disabled={isLoading}>
              Test Création
            </Button>
            <Button onClick={testAddMessage} disabled={isLoading || sessions.length === 0}>
              Test Message
            </Button>
            <Button onClick={testGetSession} disabled={isLoading || sessions.length === 0}>
              Test Récupération
            </Button>
            <Button onClick={runAllTests} disabled={isLoading} variant="outline">
              Tous les Tests
            </Button>
            <Button onClick={loadSessions} disabled={isLoading} variant="outline">
              Actualiser
            </Button>
          </div>

          {/* Résultats des tests */}
          {testResults.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium">Résultats des Tests:</h4>
              {testResults.map((result, index) => (
                <div key={index} className="flex items-center gap-2 p-2 border rounded">
                  {result.success ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-500" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{result.test}</div>
                    {result.error && (
                      <div className="text-sm text-red-600">{result.error}</div>
                    )}
                    {result.sessionId && (
                      <div className="text-sm text-gray-600">Session: {result.sessionId}</div>
                    )}
                    <div className="text-xs text-gray-500">{result.timestamp}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ConversationDebugComponent;
