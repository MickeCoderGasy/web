// Service pour gérer l'historique des conversations de chat
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  analysisId?: string; // ID de l'analyse utilisée comme contexte
  model?: 'grok' | 'standard'; // Modèle utilisé
}

export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  lastMessageAt: string;
  messages: ChatMessage[];
  contextAnalysisId?: string;
  model: 'grok' | 'standard';
}

class ChatHistoryService {
  private readonly STORAGE_KEY = 'tradapp_chat_history';
  private readonly MAX_SESSIONS = 50; // Limite du nombre de sessions
  private readonly MAX_MESSAGES_PER_SESSION = 1000; // Limite des messages par session

  /**
   * Récupère toutes les sessions de chat
   */
  getChatSessions(): ChatSession[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      console.log('🔍 [ChatHistoryService] localStorage raw data:', stored);
      
      if (!stored) {
        console.log('📭 [ChatHistoryService] Aucune donnée dans localStorage');
        return [];
      }
      
      const sessions = JSON.parse(stored);
      console.log('📚 [ChatHistoryService] Sessions parsées:', sessions.length, sessions);
      
      const sortedSessions = sessions.sort((a: ChatSession, b: ChatSession) => 
        new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime()
      );
      
      console.log('📚 [ChatHistoryService] Sessions triées:', sortedSessions.length);
      return sortedSessions;
    } catch (error) {
      console.error('❌ [ChatHistoryService] Erreur lors de la récupération des sessions:', error);
      return [];
    }
  }

  /**
   * Récupère une session spécifique
   */
  getChatSession(sessionId: string): ChatSession | null {
    try {
      const sessions = this.getChatSessions();
      return sessions.find(session => session.id === sessionId) || null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la session:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle session de chat
   */
  createChatSession(
    title: string, 
    contextAnalysisId?: string, 
    model: 'grok' | 'standard' = 'grok'
  ): ChatSession {
    const session: ChatSession = {
      id: this.generateSessionId(),
      title,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString(),
      messages: [],
      contextAnalysisId,
      model
    };

    console.log('🆕 [ChatHistoryService] Création d\'une nouvelle session:', session);
    this.saveSession(session);
    console.log('✅ [ChatHistoryService] Session créée et sauvegardée:', session.id);
    return session;
  }

  /**
   * Ajoute un message à une session
   */
  addMessageToSession(
    sessionId: string, 
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): ChatMessage | null {
    try {
      const session = this.getChatSession(sessionId);
      if (!session) {
        console.error('Session non trouvée:', sessionId);
        return null;
      }

      const newMessage: ChatMessage = {
        ...message,
        id: this.generateMessageId(),
        timestamp: new Date().toISOString()
      };

      session.messages.push(newMessage);
      session.lastMessageAt = newMessage.timestamp;

      // Limiter le nombre de messages par session
      if (session.messages.length > this.MAX_MESSAGES_PER_SESSION) {
        session.messages = session.messages.slice(-this.MAX_MESSAGES_PER_SESSION);
      }

      this.saveSession(session);
      return newMessage;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du message:', error);
      return null;
    }
  }

  /**
   * Met à jour le titre d'une session
   */
  updateSessionTitle(sessionId: string, newTitle: string): boolean {
    try {
      const session = this.getChatSession(sessionId);
      if (!session) return false;

      session.title = newTitle;
      this.saveSession(session);
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du titre:', error);
      return false;
    }
  }

  /**
   * Met à jour le contexte d'une session
   */
  updateSessionContext(sessionId: string, contextAnalysisId?: string): boolean {
    try {
      const session = this.getChatSession(sessionId);
      if (!session) return false;

      session.contextAnalysisId = contextAnalysisId;
      this.saveSession(session);
      console.log('🔄 [ChatHistoryService] Contexte de session mis à jour:', sessionId, contextAnalysisId || 'aucun');
      return true;
    } catch (error) {
      console.error('Erreur lors de la mise à jour du contexte:', error);
      return false;
    }
  }

  /**
   * Supprime une session
   */
  deleteSession(sessionId: string): boolean {
    try {
      const sessions = this.getChatSessions();
      const filteredSessions = sessions.filter(session => session.id !== sessionId);
      this.saveAllSessions(filteredSessions);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de la session:', error);
      return false;
    }
  }

  /**
   * Supprime tous les historiques
   */
  clearAllHistory(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'historique:', error);
      return false;
    }
  }

  /**
   * Génère un titre automatique basé sur le premier message
   */
  generateAutoTitle(firstMessage: string): string {
    // Prendre les premiers 50 caractères et nettoyer
    const cleanTitle = firstMessage
      .replace(/[#*`]/g, '') // Supprimer les caractères Markdown
      .replace(/\n/g, ' ') // Remplacer les sauts de ligne
      .trim()
      .substring(0, 50);
    
    return cleanTitle + (firstMessage.length > 50 ? '...' : '');
  }

  /**
   * Récupère les sessions récentes (dernières 10)
   */
  getRecentSessions(limit: number = 10): ChatSession[] {
    const sessions = this.getChatSessions();
    return sessions.slice(0, limit);
  }

  /**
   * Sauvegarde une session
   */
  private saveSession(session: ChatSession): void {
    try {
      const sessions = this.getChatSessions();
      const existingIndex = sessions.findIndex(s => s.id === session.id);
      
      if (existingIndex >= 0) {
        sessions[existingIndex] = session;
      } else {
        sessions.unshift(session);
      }

      // Limiter le nombre de sessions
      const limitedSessions = sessions.slice(0, this.MAX_SESSIONS);
      this.saveAllSessions(limitedSessions);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde de la session:', error);
    }
  }

  /**
   * Sauvegarde toutes les sessions
   */
  private saveAllSessions(sessions: ChatSession[]): void {
    try {
      console.log('💾 [ChatHistoryService] Sauvegarde de', sessions.length, 'sessions');
      console.log('💾 [ChatHistoryService] Sessions à sauvegarder:', sessions);
      const jsonData = JSON.stringify(sessions);
      console.log('💾 [ChatHistoryService] Données JSON:', jsonData.substring(0, 200) + '...');
      localStorage.setItem(this.STORAGE_KEY, jsonData);
      console.log('✅ [ChatHistoryService] Sessions sauvegardées avec succès');
    } catch (error) {
      console.error('❌ [ChatHistoryService] Erreur lors de la sauvegarde des sessions:', error);
    }
  }

  /**
   * Génère un ID unique pour une session
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Génère un ID unique pour un message
   */
  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Exporte l'historique (pour sauvegarde)
   */
  exportHistory(): string {
    try {
      const sessions = this.getChatSessions();
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      return '[]';
    }
  }

  /**
   * Importe un historique (pour restauration)
   */
  importHistory(historyData: string): boolean {
    try {
      const sessions = JSON.parse(historyData);
      if (Array.isArray(sessions)) {
        this.saveAllSessions(sessions);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'import:', error);
      return false;
    }
  }
}

// Instance singleton
const chatHistoryService = new ChatHistoryService();
export default chatHistoryService;
