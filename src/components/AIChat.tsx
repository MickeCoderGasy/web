import { useState, useRef, useEffect } from "react";
import "@/styles/chat.css";
import llmService, { StockAnalysisResponse } from "@/services/llmService";
import grokService from "@/services/grokService";
import { ChatHeader } from "@/components/ChatHeader";
import { ChatSessionsManager } from "@/components/ChatSessionsManager";
import { ContextSettings, defaultContextSettings } from "@/config/grok-config";
import { ParsedContent, StreamingParsedContent } from "@/components/ParsedContent";
import chatHistoryServiceSupabase, { ChatMessage, ChatSession } from "@/services/chatHistoryServiceSupabase";
import analysisHistoryService from "@/services/analysisHistoryService";
import { Send, Bot, User, TrendingUp, AlertTriangle, History, X, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  analysis?: StockAnalysisResponse;
}

const initialMessages: Message[] = [
  {
    id: "1",
    role: "assistant",
    content:
      "Bonjour! Je suis votre assistant de trading IA. Posez-moi une question sur un symbole boursier (ex: AAPL, TSLA, EUR/USD) pour obtenir une analyse détaillée, ou discutez avec moi de stratégies de trading!",
  },
];

export function AIChat() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showAnalysis, setShowAnalysis] = useState<{ [key: string]: boolean }>({});
  const [contextSettings, setContextSettings] = useState<ContextSettings>(defaultContextSettings);
  const [useGrok, setUseGrok] = useState(true);
  const [streamingResponse, setStreamingResponse] = useState("");
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [isRefreshingOHLC, setIsRefreshingOHLC] = useState(false);
  const [historyRefreshKey, setHistoryRefreshKey] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Vérifier si Grok est configuré
  const isGrokConfigured = () => {
    const config = grokService.getConfig();
    return !!config.apiKey;
  };

  // Créer une nouvelle session
  const createNewSession = async () => {
    try {
      // Test de connexion Supabase
      console.log('🧪 [AIChat] Test de connexion Supabase...');
      const connectionOk = await chatHistoryServiceSupabase.testConnection();
      if (!connectionOk) {
        throw new Error('Connexion Supabase échouée');
      }
      
      const title = "Nouvelle conversation";
      // Créer la session avec le contexte actuellement sélectionné
      const session = await chatHistoryServiceSupabase.createChatSession(
        title,
        contextSettings.selectedAnalysisId || undefined,
        useGrok ? 'grok' : 'standard'
      );
      setCurrentSessionId(session.id);
      setMessages(initialMessages);
      setShowHistory(false);
      
      // Log pour debug
      console.log('🆕 [AIChat] Nouvelle session créée avec contexte:', contextSettings.selectedAnalysisId || 'aucun');
      console.log('🆕 [AIChat] ID de la session créée:', session.id);
      
      // Forcer le rechargement de l'historique
      setHistoryRefreshKey(prev => prev + 1);
      
      toast({
        title: "Nouvelle session",
        description: `Nouvelle conversation créée${contextSettings.selectedAnalysisId ? ' avec le contexte actuel' : ''}`,
      });
    } catch (error) {
      console.error('❌ [AIChat] Erreur lors de la création de la session:', error);
      toast({
        title: "Erreur",
        description: `Impossible de créer la session: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  // Charger une session existante
  const loadSession = async (sessionId: string) => {
    const session = await chatHistoryServiceSupabase.getChatSession(sessionId);
    if (session) {
      setCurrentSessionId(sessionId);
      setMessages(session.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        analysis: undefined // On ne stocke pas les analyses dans l'historique
      })));
      setUseGrok(session.model === 'grok');
      
      // Resélectionner automatiquement le contexte correspondant à la session
      if (session.contextAnalysisId) {
        setContextSettings(prev => ({
          ...prev,
          selectedAnalysisId: session.contextAnalysisId
        }));
        console.log('🔄 [AIChat] Contexte automatiquement resélectionné:', session.contextAnalysisId);
      } else {
        // Si aucune analyse n'était associée à cette session, réinitialiser le contexte
        setContextSettings(prev => ({
          ...prev,
          selectedAnalysisId: undefined
        }));
        console.log('🔄 [AIChat] Aucun contexte associé à cette session');
      }
      
      setShowHistory(false);
      toast({
        title: "Session chargée",
        description: `Conversation "${session.title}" restaurée${session.contextAnalysisId ? ' avec son contexte' : ''}`,
      });
    }
  };

  // Sauvegarder un message dans la session actuelle
  const saveMessageToHistory = async (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    if (currentSessionId) {
      const savedMessage = await chatHistoryServiceSupabase.addMessageToSession(currentSessionId, message);
      if (savedMessage && message.role === 'user' && messages.length === 1) {
        // Mettre à jour le titre avec le premier message utilisateur
        const autoTitle = chatHistoryServiceSupabase.generateAutoTitle(message.content);
        await chatHistoryServiceSupabase.updateSessionTitle(currentSessionId, autoTitle);
        // Forcer le rechargement de l'historique après mise à jour du titre
        setHistoryRefreshKey(prev => prev + 1);
      }
    }
  };

  // Mettre à jour le contexte de la session actuelle
  const updateCurrentSessionContext = async (newContextId?: string) => {
    if (currentSessionId) {
      await chatHistoryServiceSupabase.updateSessionContext(currentSessionId, newContextId);
      console.log('🔄 [AIChat] Contexte de session actuelle mis à jour:', newContextId || 'aucun');
    }
  };

  // Gérer les changements de paramètres de contexte
  const handleContextSettingsChange = (newSettings: ContextSettings) => {
    setContextSettings(newSettings);
    // Mettre à jour le contexte de la session actuelle
    updateCurrentSessionContext(newSettings.selectedAnalysisId);
  };

  // Fonction pour rafraîchir les données OHLC et renvoyer le contexte
  const refreshOHLCAndResendContext = async () => {
    if (!contextSettings.selectedAnalysisId) {
      toast({
        title: "Erreur",
        description: "Aucune analyse sélectionnée pour rafraîchir les données OHLC",
        variant: "destructive",
      });
      return;
    }

    setIsRefreshingOHLC(true);
    
    try {
      // Récupérer l'analyse sélectionnée
      const selectedAnalysis = await (await import("@/services/analysisHistoryService")).default.getAnalysisById(contextSettings.selectedAnalysisId);
      if (!selectedAnalysis) {
        throw new Error('Analyse sélectionnée introuvable');
      }

      // Créer un message système pour indiquer le rafraîchissement
      const refreshMessage: Message = {
        id: Date.now().toString(),
        role: "assistant",
        content: "🔄 **Rafraîchissement des données OHLC en cours...**\n\nLes données de marché ont été mises à jour avec les informations les plus récentes.",
      };
      
      setMessages(prev => [...prev, refreshMessage]);
      
      // Envoyer le contexte rafraîchi à Grok
      const conversationHistory = messages
        .filter(msg => msg.role !== 'assistant' || !msg.analysis)
        .map(msg => ({
          role: msg.role,
          content: msg.content
        }));

      // Forcer l'envoi du contexte complet (comme un premier message)
      const response = await grokService.sendMessageStream(
        "Rafraîchis l'analyse avec les nouvelles données OHLC et fournis une mise à jour complète du contexte de trading.",
        (chunk) => {
          setStreamingResponse(prev => prev + chunk);
        },
        conversationHistory,
        true // Force l'envoi du contexte complet
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Sauvegarder dans l'historique
      saveMessageToHistory({
        role: 'assistant',
        content: response,
        model: 'grok'
      });
      
      setStreamingResponse("");
      
      toast({
        title: "Données OHLC rafraîchies",
        description: "Les données de marché ont été mises à jour avec succès",
      });
      
    } catch (error: any) {
      console.error('Erreur lors du rafraîchissement OHLC:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `❌ **Erreur lors du rafraîchissement des données OHLC**\n\n${error.message || 'Impossible de mettre à jour les données de marché.'}`,
      };
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Erreur de rafraîchissement",
        description: error.message || "Impossible de rafraîchir les données OHLC",
        variant: "destructive",
      });
    } finally {
      setIsRefreshingOHLC(false);
    }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };

    const userInput = input.trim();
    setMessages((prev) => [...prev, userMessage]);
    
    // Sauvegarder le message utilisateur
    saveMessageToHistory({
      role: 'user',
      content: userInput,
      model: useGrok ? 'grok' : 'standard'
    });
    
    setInput("");
    setIsLoading(true);
    setStreamingResponse("");

    try {
      if (useGrok) {
        // Vérifier qu'une analyse est sélectionnée avant d'envoyer à Grok
        if (!contextSettings.selectedAnalysisId) {
          throw new Error('Veuillez d\'abord sélectionner une analyse dans les paramètres de contexte (icône ⚙️) pour utiliser Grok.');
        }

        // Utiliser Grok avec contexte
        // Préparer l'historique de conversation pour Grok
        const conversationHistory = messages
          .filter(msg => msg.role !== 'assistant' || !msg.analysis) // Exclure les messages avec analyses
          .map(msg => ({
            role: msg.role,
            content: msg.content
          }));

        // Détecter si c'est le premier message de la conversation
        // Un message est considéré comme "premier" s'il n'y a que des messages d'assistant dans l'historique
        // OU si on vient de charger une session (car Grok n'a pas de mémoire persistante)
        const userMessages = conversationHistory.filter(msg => msg.role === 'user');
        const isFirstMessage = userMessages.length === 0;
        
        console.log('🔍 Détection premier message:', {
          totalMessages: conversationHistory.length,
          userMessages: userMessages.length,
          currentSessionId: currentSessionId,
          isFirstMessage: isFirstMessage
        });

        const response = await grokService.sendMessageStream(
          userInput,
          (chunk) => {
            setStreamingResponse(prev => prev + chunk);
          },
          conversationHistory,
          isFirstMessage
        );

               const assistantMessage: Message = {
                 id: (Date.now() + 1).toString(),
                 role: "assistant",
                 content: response,
               };
               setMessages((prev) => [...prev, assistantMessage]);
               
               // Sauvegarder la réponse de l'assistant
               saveMessageToHistory({
                 role: 'assistant',
                 content: response,
                 model: 'grok'
               });
               
               setStreamingResponse("");
      } else {
        // Utiliser l'ancien service LLM
        const isStockSymbol = /^[A-Za-z]{1,5}(\/[A-Za-z]{3})?$/.test(userInput);
        
        if (isStockSymbol) {
          const analysis = await llmService.analyzeStock(userInput);
                 const assistantMessage: Message = {
                   id: (Date.now() + 1).toString(),
                   role: "assistant",
                   content: `Voici mon analyse pour **${analysis.symbol}**:`,
                   analysis: analysis,
                 };
                 setMessages((prev) => [...prev, assistantMessage]);
                 
                 // Sauvegarder la réponse de l'assistant
                 saveMessageToHistory({
                   role: 'assistant',
                   content: `Voici mon analyse pour **${analysis.symbol}**:`,
                   model: 'standard'
                 });
      } else {
        const response = await llmService.chat(userInput);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
        
        // Sauvegarder la réponse de l'assistant
        saveMessageToHistory({
          role: 'assistant',
          content: response,
          model: 'standard'
        });
        }
      }
    } catch (error: any) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: error.message || "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer.",
      };
      setMessages((prev) => [...prev, errorMessage]);
      
      toast({
        title: "Erreur",
        description: error.message || "Une erreur est survenue",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      setStreamingResponse("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col chat-fullscreen bg-background rounded-lg border border-border/50 overflow-hidden">
      {/* En-tête du chat */}
      <ChatHeader
        useGrok={useGrok}
        onToggleModel={setUseGrok}
        isGrokConfigured={isGrokConfigured()}
        settings={contextSettings}
        onSettingsChange={handleContextSettingsChange}
        onSaveSettings={() => {
          grokService.updateContextSettings(contextSettings);
          toast({
            title: "Paramètres sauvegardés",
            description: "Les paramètres de contexte ont été mis à jour.",
          });
        }}
        onShowHistory={() => setShowHistory(!showHistory)}
        onNewSession={createNewSession}
      />

      {/* Panneau d'historique */}
      {showHistory && (
        <div className="border-b border-border/50 p-4 bg-secondary/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <History className="w-5 h-5" />
              Historique des Conversations
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <ChatSessionsManager
            key={historyRefreshKey}
            currentSessionId={currentSessionId}
            onSessionSelect={loadSession}
            onNewSession={createNewSession}
          />
        </div>
      )}

      {/* Zone de messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 chat-message ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
              )}
                     <div
                       className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${
                         message.role === "user"
                           ? "bg-primary text-primary-foreground"
                           : "bg-secondary/50 border border-border/50"
                       }`}
                     >
                       <ParsedContent content={message.content} className="text-sm leading-relaxed" />
                
                {/* Display analysis if available */}
                {message.analysis && (
                  <div className="mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAnalysis(prev => ({ ...prev, [message.id]: !prev[message.id] }))}
                      className="mb-2 w-full"
                    >
                      {showAnalysis[message.id] ? "Masquer l'analyse" : "Voir l'analyse détaillée"}
                      <TrendingUp className="w-4 h-4 ml-2" />
                    </Button>
                    
                    {showAnalysis[message.id] && (
                      <div className="mt-3 p-4 rounded-lg bg-background/50 border border-border/30 space-y-3">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-base">{message.analysis.symbol}</h4>
                          <Badge 
                            variant={
                              message.analysis.recommendation === 'BUY' ? 'default' :
                              message.analysis.recommendation === 'SELL' ? 'destructive' :
                              'secondary'
                            }
                          >
                            {message.analysis.recommendation}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">Confiance:</span>
                            <p className="font-semibold">{message.analysis.confidence}%</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Risque:</span>
                            <p className="font-semibold">{message.analysis.riskLevel}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cible:</span>
                            <p className="font-semibold text-green-500">{message.analysis.targetPrice}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Stop Loss:</span>
                            <p className="font-semibold text-red-500">{message.analysis.stopLoss}</p>
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Période:</p>
                          <p className="text-sm">{message.analysis.timeframe}</p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">Analyse:</p>
                          <p className="text-sm leading-relaxed">{message.analysis.analysis}</p>
                        </div>
                        
                        {message.analysis.keyFactors && message.analysis.keyFactors.length > 0 && (
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Facteurs clés:</p>
                            <ul className="space-y-1">
                              {message.analysis.keyFactors.map((factor, idx) => (
                                <li key={idx} className="text-xs flex items-start gap-1">
                                  <AlertTriangle className="w-3 h-3 mt-0.5 text-primary flex-shrink-0" />
                                  <span>{factor}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
              {message.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3 animate-slide-up">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-primary" />
              </div>
                     <div className="bg-secondary/50 border border-border/50 rounded-2xl px-4 py-3 max-w-[80%] sm:max-w-[70%]">
                       {streamingResponse ? (
                         <div className="text-sm leading-relaxed">
                           <StreamingParsedContent content={streamingResponse} />
                           <span className="streaming-cursor">|</span>
                         </div>
                       ) : (
                <div className="flex gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 rounded-full bg-primary/60 animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
                )}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 chat-input-area">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Posez une question sur l'analyse sélectionnée..."
            className="flex-1 bg-secondary/50 border-border/50 focus-visible:ring-primary"
            disabled={isLoading}
          />
          
          {/* Bouton de rafraîchissement OHLC */}
          {useGrok && contextSettings.selectedAnalysisId && (
            <Button
              onClick={refreshOHLCAndResendContext}
              disabled={isLoading || isRefreshingOHLC}
              variant="outline"
              size="icon"
              title="Rafraîchir les données OHLC et renvoyer le contexte"
              className="border-orange-500/50 hover:border-orange-500 hover:bg-orange-500/10"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshingOHLC ? 'animate-spin' : ''}`} />
            </Button>
          )}
          
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Indicateur de rafraîchissement OHLC */}
        {useGrok && contextSettings.selectedAnalysisId && (
          <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
            <RefreshCw className="w-3 h-3" />
            <span>Bouton orange : Rafraîchir les données OHLC en temps réel</span>
          </div>
        )}
      </div>
    </div>
  );
}
