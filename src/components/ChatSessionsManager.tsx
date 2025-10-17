import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  History, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Clock, 
  Bot, 
  Zap, 
  Sparkles,
  Download,
  Upload,
  AlertTriangle
} from 'lucide-react';
import chatHistoryServiceSupabase, { ChatSession } from '@/services/chatHistoryServiceSupabase';
import { useToast } from '@/hooks/use-toast';

interface ChatSessionsManagerProps {
  currentSessionId?: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
}

export function ChatSessionsManager({ 
  currentSessionId, 
  onSessionSelect, 
  onNewSession 
}: ChatSessionsManagerProps) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importData, setImportData] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setIsLoading(true);
    try {
      const recentSessions = await chatHistoryServiceSupabase.getRecentSessions(20);
      console.log('📚 [ChatSessionsManager] Sessions chargées:', recentSessions.length);
      console.log('📚 [ChatSessionsManager] Détails des sessions:', recentSessions.map(s => ({ id: s.id, title: s.title, messages: s.messages.length })));
      setSessions(recentSessions);
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des conversations",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      const success = await chatHistoryServiceSupabase.deleteSession(sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        toast({
          title: "Session supprimée",
          description: "La conversation a été supprimée de l'historique",
        });
      } else {
        throw new Error('Échec de la suppression');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la session",
        variant: "destructive",
      });
    }
  };

  const handleClearAllHistory = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer tout l\'historique des conversations ?')) {
      try {
        const success = await chatHistoryServiceSupabase.clearAllHistory();
        if (success) {
          setSessions([]);
          toast({
            title: "Historique supprimé",
            description: "Toutes les conversations ont été supprimées",
          });
        }
      } catch (error) {
        toast({
          title: "Erreur",
          description: "Impossible de supprimer l'historique",
          variant: "destructive",
        });
      }
    }
  };

  const handleExportHistory = () => {
    try {
      const historyData = chatHistoryService.exportHistory();
      const blob = new Blob([historyData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tradapp-chat-history-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export réussi",
        description: "L'historique a été téléchargé",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'exporter l'historique",
        variant: "destructive",
      });
    }
  };

  const handleImportHistory = () => {
    try {
      const success = chatHistoryService.importHistory(importData);
      if (success) {
        loadSessions();
        setShowImportDialog(false);
        setImportData('');
        toast({
          title: "Import réussi",
          description: "L'historique a été restauré",
        });
      } else {
        throw new Error('Format invalide');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Format d'import invalide",
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Il y a moins d\'1h';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const getModelIcon = (model: 'grok' | 'standard') => {
    return model === 'grok' ? <Zap className="w-3 h-3" /> : <Sparkles className="w-3 h-3" />;
  };

  const getModelColor = (model: 'grok' | 'standard') => {
    return model === 'grok' ? 'bg-blue-500/20 text-blue-600' : 'bg-purple-500/20 text-purple-600';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Historique des Conversations</h3>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onNewSession}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Nouvelle
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
          <span className="ml-2 text-sm text-muted-foreground">Chargement...</span>
        </div>
      ) : sessions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune conversation dans l'historique</p>
          <p className="text-sm">Commencez une nouvelle conversation</p>
        </div>
      ) : (
        <ScrollArea className="h-96">
          <div className="space-y-2">
            {sessions.map((session) => (
              <Card
                key={session.id}
                className={`cursor-pointer transition-all hover:bg-secondary/20 ${
                  currentSessionId === session.id ? 'ring-2 ring-primary bg-primary/5' : ''
                }`}
                onClick={() => onSessionSelect(session.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium truncate">{session.title}</h4>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getModelColor(session.model)}`}
                        >
                          {getModelIcon(session.model)}
                          <span className="ml-1 capitalize">{session.model}</span>
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDate(session.lastMessageAt)}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="w-3 h-3" />
                          {session.messages.length} messages
                        </div>
                        {session.contextAnalysisId && (
                          <div className="flex items-center gap-1">
                            <Bot className="w-3 h-3" />
                            Contexte
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSession(session.id);
                      }}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      )}

      {sessions.length > 0 && (
        <div className="flex items-center gap-2 pt-4 border-t">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportHistory}
            className="flex items-center gap-1"
          >
            <Download className="w-4 h-4" />
            Exporter
          </Button>
          
          <Dialog open={showImportDialog} onOpenChange={setShowImportDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Upload className="w-4 h-4" />
                Importer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Importer l'historique</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="import-data">Données JSON</Label>
                  <textarea
                    id="import-data"
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    placeholder="Collez ici les données JSON de l'historique..."
                    className="w-full h-32 p-3 border rounded-md resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowImportDialog(false)}>
                    Annuler
                  </Button>
                  <Button onClick={handleImportHistory}>
                    Importer
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearAllHistory}
            className="flex items-center gap-1"
          >
            <AlertTriangle className="w-4 h-4" />
            Tout supprimer
          </Button>
        </div>
      )}
    </div>
  );
}
