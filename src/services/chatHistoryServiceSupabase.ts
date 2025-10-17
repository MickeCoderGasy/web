// Service pour gérer l'historique des conversations de chat avec Supabase
import { supabase } from '../integrations/supabase/client';

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

// Interface pour la base de données Supabase
interface HistoriqueRow {
  id: number;
  created_at: string;
  updated_at: string;
  content: any;
  history_id: string;
  user: string | null;
  title: string;
  last_message_at: string;
  context_analysis_id: string | null;
  model: 'grok' | 'standard';
}

class ChatHistoryServiceSupabase {
  private readonly MAX_SESSIONS = 50; // Limite du nombre de sessions
  private readonly MAX_MESSAGES_PER_SESSION = 1000; // Limite des messages par session

  /**
   * Récupère l'utilisateur actuel
   */
  private async getCurrentUser() {
    console.log('🔍 [ChatHistoryServiceSupabase] Vérification de l\'authentification...');
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la récupération de l\'utilisateur:', error);
      throw new Error('Utilisateur non authentifié');
    }
    
    if (!user) {
      console.error('❌ [ChatHistoryServiceSupabase] Aucun utilisateur connecté');
      throw new Error('Utilisateur non authentifié');
    }
    
    console.log('✅ [ChatHistoryServiceSupabase] Utilisateur authentifié:', user.id, user.email);
    return user;
  }

  /**
   * Convertit une ligne de base de données en ChatSession
   */
  private dbRowToChatSession(row: HistoriqueRow): ChatSession {
    return {
      id: row.history_id,
      title: row.title,
      createdAt: row.created_at,
      lastMessageAt: row.last_message_at,
      messages: row.content || [],
      contextAnalysisId: row.context_analysis_id || undefined,
      model: row.model
    };
  }

  /**
   * Convertit une ChatSession en ligne de base de données
   */
  private chatSessionToDbRow(session: ChatSession, userId: string): Partial<HistoriqueRow> {
    return {
      history_id: session.id,
      user: userId,
      title: session.title,
      last_message_at: session.lastMessageAt,
      content: session.messages,
      context_analysis_id: session.contextAnalysisId || null,
      model: session.model
    };
  }

  /**
   * Récupère toutes les sessions de chat
   */
  async getChatSessions(): Promise<ChatSession[]> {
    try {
      const user = await this.getCurrentUser();
      console.log('🔍 [ChatHistoryServiceSupabase] Récupération des sessions pour l\'utilisateur:', user.id);

      const { data, error } = await supabase
        .from('historique')
        .select('*')
        .eq('user', user.id)
        .order('last_message_at', { ascending: false })
        .limit(this.MAX_SESSIONS);

      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la récupération des sessions:', error);
        throw error;
      }

      console.log('📚 [ChatHistoryServiceSupabase] Sessions récupérées:', data?.length || 0);
      return data?.map(row => this.dbRowToChatSession(row)) || [];
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la récupération des sessions:', error);
      return [];
    }
  }

  /**
   * Récupère une session spécifique
   */
  async getChatSession(sessionId: string): Promise<ChatSession | null> {
    try {
      const user = await this.getCurrentUser();
      console.log('🔍 [ChatHistoryServiceSupabase] Récupération de la session:', sessionId);

      const { data, error } = await supabase
        .from('historique')
        .select('*')
        .eq('history_id', sessionId)
        .eq('user', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          console.log('📭 [ChatHistoryServiceSupabase] Session non trouvée:', sessionId);
          return null;
        }
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la récupération de la session:', error);
        throw error;
      }

      console.log('✅ [ChatHistoryServiceSupabase] Session récupérée:', sessionId);
      return this.dbRowToChatSession(data);
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la récupération de la session:', error);
      return null;
    }
  }

  /**
   * Crée une nouvelle session de chat
   */
  async createChatSession(
    title: string, 
    contextAnalysisId?: string, 
    model: 'grok' | 'standard' = 'grok'
  ): Promise<ChatSession> {
    try {
      console.log('🆕 [ChatHistoryServiceSupabase] === DÉBUT CRÉATION SESSION ===');
      console.log('🆕 [ChatHistoryServiceSupabase] Paramètres:', { title, contextAnalysisId, model });
      
      const user = await this.getCurrentUser();
      const session: ChatSession = {
        id: this.generateSessionId(),
        title,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        messages: [],
        contextAnalysisId,
        model
      };

      console.log('🆕 [ChatHistoryServiceSupabase] Session créée:', session);

      const dbRow = this.chatSessionToDbRow(session, user.id);
      console.log('🆕 [ChatHistoryServiceSupabase] Données à insérer:', dbRow);

      const { data, error } = await supabase
        .from('historique')
        .insert(dbRow)
        .select()
        .single();

      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la création de la session:', error);
        console.error('❌ [ChatHistoryServiceSupabase] Détails de l\'erreur:', {
          code: error.code,
          message: error.message,
          details: error.details,
          hint: error.hint
        });
        throw error;
      }

      console.log('✅ [ChatHistoryServiceSupabase] Session créée et sauvegardée:', session.id);
      console.log('✅ [ChatHistoryServiceSupabase] Données retournées par Supabase:', data);
      return session;
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la création de la session:', error);
      throw error;
    }
  }

  /**
   * Ajoute un message à une session
   */
  async addMessageToSession(
    sessionId: string, 
    message: Omit<ChatMessage, 'id' | 'timestamp'>
  ): Promise<ChatMessage | null> {
    try {
      const user = await this.getCurrentUser();
      const session = await this.getChatSession(sessionId);
      
      if (!session) {
        console.error('❌ [ChatHistoryServiceSupabase] Session non trouvée:', sessionId);
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

      // Mettre à jour en base
      const { error } = await supabase
        .from('historique')
        .update({
          content: session.messages,
          last_message_at: session.lastMessageAt,
          updated_at: new Date().toISOString()
        })
        .eq('history_id', sessionId)
        .eq('user', user.id);

      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de l\'ajout du message:', error);
        throw error;
      }

      console.log('✅ [ChatHistoryServiceSupabase] Message ajouté à la session:', sessionId);
      return newMessage;
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de l\'ajout du message:', error);
      return null;
    }
  }

  /**
   * Met à jour le titre d'une session
   */
  async updateSessionTitle(sessionId: string, newTitle: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      console.log('📝 [ChatHistoryServiceSupabase] Mise à jour du titre:', sessionId, newTitle);

      const { error } = await supabase
        .from('historique')
        .update({
          title: newTitle,
          updated_at: new Date().toISOString()
        })
        .eq('history_id', sessionId)
        .eq('user', user.id);

      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la mise à jour du titre:', error);
        return false;
      }

      console.log('✅ [ChatHistoryServiceSupabase] Titre mis à jour:', sessionId);
      return true;
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la mise à jour du titre:', error);
      return false;
    }
  }

  /**
   * Met à jour le contexte d'une session
   */
  async updateSessionContext(sessionId: string, contextAnalysisId?: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      console.log('🔄 [ChatHistoryServiceSupabase] Mise à jour du contexte:', sessionId, contextAnalysisId || 'aucun');

      const { error } = await supabase
        .from('historique')
        .update({
          context_analysis_id: contextAnalysisId || null,
          updated_at: new Date().toISOString()
        })
        .eq('history_id', sessionId)
        .eq('user', user.id);

      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la mise à jour du contexte:', error);
        return false;
      }

      console.log('✅ [ChatHistoryServiceSupabase] Contexte mis à jour:', sessionId);
      return true;
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la mise à jour du contexte:', error);
      return false;
    }
  }

  /**
   * Supprime une session
   */
  async deleteSession(sessionId: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      console.log('🗑️ [ChatHistoryServiceSupabase] Suppression de la session:', sessionId);

      const { error } = await supabase
        .from('historique')
        .delete()
        .eq('history_id', sessionId)
        .eq('user', user.id);

      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la suppression de la session:', error);
        return false;
      }

      console.log('✅ [ChatHistoryServiceSupabase] Session supprimée:', sessionId);
      return true;
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la suppression de la session:', error);
      return false;
    }
  }

  /**
   * Supprime tous les historiques
   */
  async clearAllHistory(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      console.log('🗑️ [ChatHistoryServiceSupabase] Suppression de tout l\'historique pour l\'utilisateur:', user.id);

      const { error } = await supabase
        .from('historique')
        .delete()
        .eq('user', user.id);

      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la suppression de l\'historique:', error);
        return false;
      }

      console.log('✅ [ChatHistoryServiceSupabase] Historique supprimé');
      return true;
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la suppression de l\'historique:', error);
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
  async getRecentSessions(limit: number = 10): Promise<ChatSession[]> {
    try {
      const sessions = await this.getChatSessions();
      return sessions.slice(0, limit);
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de la récupération des sessions récentes:', error);
      return [];
    }
  }

  /**
   * Exporte l'historique (pour sauvegarde)
   */
  async exportHistory(): Promise<string> {
    try {
      const sessions = await this.getChatSessions();
      return JSON.stringify(sessions, null, 2);
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de l\'export:', error);
      return '[]';
    }
  }

  /**
   * Importe un historique (pour restauration)
   */
  async importHistory(historyData: string): Promise<boolean> {
    try {
      const sessions = JSON.parse(historyData);
      if (!Array.isArray(sessions)) {
        return false;
      }

      const user = await this.getCurrentUser();
      
      // Convertir les sessions pour l'import
      const dbRows = sessions.map(session => this.chatSessionToDbRow(session, user.id));
      
      const { error } = await supabase
        .from('historique')
        .insert(dbRows);

      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de l\'import:', error);
        return false;
      }

      console.log('✅ [ChatHistoryServiceSupabase] Historique importé:', sessions.length, 'sessions');
      return true;
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Erreur lors de l\'import:', error);
      return false;
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
   * Test de connexion à Supabase
   */
  async testConnection(): Promise<boolean> {
    try {
      console.log('🧪 [ChatHistoryServiceSupabase] Test de connexion à Supabase...');
      
      // Test 1: Vérifier l'authentification
      const user = await this.getCurrentUser();
      console.log('✅ [ChatHistoryServiceSupabase] Authentification OK:', user.id);
      
      // Test 2: Vérifier l'accès à la table
      const { data, error } = await supabase
        .from('historique')
        .select('id')
        .limit(1);
      
      if (error) {
        console.error('❌ [ChatHistoryServiceSupabase] Erreur d\'accès à la table:', error);
        return false;
      }
      
      console.log('✅ [ChatHistoryServiceSupabase] Accès à la table OK');
      console.log('✅ [ChatHistoryServiceSupabase] Connexion Supabase fonctionnelle');
      return true;
    } catch (error) {
      console.error('❌ [ChatHistoryServiceSupabase] Test de connexion échoué:', error);
      return false;
    }
  }
}

// Instance singleton
const chatHistoryServiceSupabase = new ChatHistoryServiceSupabase();
export default chatHistoryServiceSupabase;
