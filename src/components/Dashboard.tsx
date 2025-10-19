import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertCircle, 
  Sparkles, 
  DollarSign, 
  BarChart3, 
  PieChart, 
  Clock,
  Newspaper,
  ArrowUpRight,
  ArrowDownRight,
  Wallet,
  Target,
  Shield,
  Loader2,
  BarChart,
  Trophy
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchMarketNews, formatTimeAgo, extractSource, NewsItem } from "@/services/newsService";
import { fetchAiInsight, MAJOR_PAIRS, MajorPair } from "@/services/aiInsightService";
import analysisHistoryService, { AnalysisHistoryItem } from "@/services/analysisHistoryService";
import rsiService, { RSIData } from "@/services/rsiService";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


// Default fallback news
const defaultNews = [
  { id: "1", title: "Market analysis in progress", description: "Loading latest market updates...", sentiment: "Neutral" as const, created_at: new Date().toISOString() },
];

export function Dashboard() {
  const portfolioValue = 125840.52;
  const dailyChange = 2840.21;
  const dailyChangePercent = 2.31;
  const monthlyReturn = 8.5;
  const totalReturn = 24.7;
  const riskScore = 68;

  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [marketNews, setMarketNews] = useState<NewsItem[]>(defaultNews);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<MajorPair>("EUR/USD");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(true);
  const [recentAnalyses, setRecentAnalyses] = useState<AnalysisHistoryItem[]>([]);
  const [analysesLoading, setAnalysesLoading] = useState(true);
  const [totalAnalysesCount, setTotalAnalysesCount] = useState<number>(0);
  const [totalAnalysesLoading, setTotalAnalysesLoading] = useState(true);
  const [signalsFoundCount, setSignalsFoundCount] = useState<number>(0);
  const [signalsNotFoundCount, setSignalsNotFoundCount] = useState<number>(0);
  const [signalsLoading, setSignalsLoading] = useState(true);
  const [mostAnalyzedPairs, setMostAnalyzedPairs] = useState<{ pair: string; count: number }[]>([]);
  const [pairsLoading, setPairsLoading] = useState(true);
  const [overboughtPairs, setOverboughtPairs] = useState<RSIData[]>([]);
  const [oversoldPairs, setOversoldPairs] = useState<RSIData[]>([]);
  const [allRSIData, setAllRSIData] = useState<RSIData[]>([]);
  const [rsiLoading, setRsiLoading] = useState(true);

  // Initialiser l'utilisateur dans le service d'historique
  useEffect(() => {
    if (user?.email) {
      analysisHistoryService.setCurrentUser(user.email);
    } else {
      analysisHistoryService.setCurrentUser(null);
    }
  }, [user?.email]);

  // Load market news
  useEffect(() => {
    const loadNews = async () => {
      if (!token) {
        setNewsLoading(false);
        return;
      }

      try {
        setNewsLoading(true);
        const news = await fetchMarketNews(token);
        // Display all news items
        setMarketNews(news);
      } catch (error) {
        console.error('Failed to load market news:', error);
        // Keep default news on error
      } finally {
        setNewsLoading(false);
      }
    };

    loadNews();
    
    // Refresh news every 5 minutes
    const interval = setInterval(loadNews, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [token]);

  // Load recent analyses
  useEffect(() => {
    const loadRecentAnalyses = async () => {
      try {
        setAnalysesLoading(true);
        const analyses = await analysisHistoryService.getRecentAnalyses(10);
        // Filtrer seulement les analyses avec un signal BUY ou SELL
        const analysesWithSignal = analyses.filter(analysis => 
          analysis.signal === 'BUY' || analysis.signal === 'SELL'
        ).slice(0, 3); // Prendre seulement les 3 premiers
        setRecentAnalyses(analysesWithSignal);
      } catch (error) {
        console.error('Failed to load recent analyses:', error);
        setRecentAnalyses([]);
      } finally {
        setAnalysesLoading(false);
      }
    };

    loadRecentAnalyses();
  }, []);

  // Load total analyses count
  useEffect(() => {
    const loadTotalAnalysesCount = async () => {
      try {
        setTotalAnalysesLoading(true);
        const count = await analysisHistoryService.getTotalAnalysesCount();
        setTotalAnalysesCount(count);
      } catch (error) {
        console.error('Failed to load total analyses count:', error);
        setTotalAnalysesCount(0);
      } finally {
        setTotalAnalysesLoading(false);
      }
    };

    loadTotalAnalysesCount();
  }, []);

  // Load signals count
  useEffect(() => {
    const loadSignalsCount = async () => {
      try {
        setSignalsLoading(true);
        const [foundCount, notFoundCount] = await Promise.all([
          analysisHistoryService.getSignalsFoundCount(),
          analysisHistoryService.getSignalsNotFoundCount()
        ]);
        setSignalsFoundCount(foundCount);
        setSignalsNotFoundCount(notFoundCount);
      } catch (error) {
        console.error('Failed to load signals count:', error);
        setSignalsFoundCount(0);
        setSignalsNotFoundCount(0);
      } finally {
        setSignalsLoading(false);
      }
    };

    loadSignalsCount();
  }, []);

  // Load most analyzed pairs
  useEffect(() => {
    const loadMostAnalyzedPairs = async () => {
      try {
        setPairsLoading(true);
        const pairs = await analysisHistoryService.getMostAnalyzedPairs(3); // Top 3 paires
        setMostAnalyzedPairs(pairs);
      } catch (error) {
        console.error('Failed to load most analyzed pairs:', error);
        setMostAnalyzedPairs([]);
      } finally {
        setPairsLoading(false);
      }
    };

    loadMostAnalyzedPairs();
  }, []);

  // Load RSI data
  useEffect(() => {
    const loadRSIData = async () => {
      try {
        setRsiLoading(true);
        const [allData, overbought, oversold] = await Promise.all([
          rsiService.getAllRSIData(),
          rsiService.getOverboughtPairs(),
          rsiService.getOversoldPairs()
        ]);
        setAllRSIData(allData);
        setOverboughtPairs(overbought);
        setOversoldPairs(oversold);
      } catch (error) {
        console.error('Failed to load RSI data:', error);
        setAllRSIData([]);
        setOverboughtPairs([]);
        setOversoldPairs([]);
      } finally {
        setRsiLoading(false);
      }
    };

    loadRSIData();
    
    // Rafraîchir les données RSI toutes les 5 minutes
    const interval = setInterval(loadRSIData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Fonction pour formater la date et l'heure
  const formatDateTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString('fr-FR'),
      time: date.toLocaleTimeString('fr-FR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      fullDateTime: date.toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };
  };

  // Fonction pour naviguer vers l'historique avec l'analyse sélectionnée
  const handleAnalysisClick = (analysis: AnalysisHistoryItem) => {
    // Stocker l'ID de l'analyse dans le localStorage pour que l'historique puisse l'afficher
    localStorage.setItem('selectedAnalysisId', analysis.id);
    navigate('/history');
  };

  // Load AI insights when pair changes
  useEffect(() => {
    const loadAiInsight = async () => {
      try {
        setInsightLoading(true);
        const insight = await fetchAiInsight(selectedPair);
        setAiInsight(insight.output);
      } catch (error: any) {
        console.error('Failed to load AI insight:', error);
        // Display the specific error message
        const errorMessage = error?.message || "Unable to load AI insights at the moment. Please try again later.";
        setAiInsight(`⚠️ **Analyse Non Disponible**\n\n${errorMessage}\n\n**Que faire ?**\n• La base de données est mise à jour automatiquement toutes les heures\n• Essayez une autre paire de devises dans le menu déroulant\n• Vérifiez la console du navigateur (F12) pour plus de détails\n\n**Note:** Cette fonctionnalité nécessite que la table Supabase soit préalablement remplie avec les données d'analyse.`);
      } finally {
        setInsightLoading(false);
      }
    };

    loadAiInsight();
  }, [selectedPair]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Analyses Overview - Main Card */}
      <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 shadow-2xl shadow-primary/10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Total d'Analyses Générées</p>
          {totalAnalysesLoading ? (
            <div className="flex items-center gap-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="text-lg text-muted-foreground">Chargement...</span>
            </div>
          ) : (
            <>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
                {totalAnalysesCount.toLocaleString("fr-FR")}
              </h1>
              <div className="flex items-center gap-2 pt-2">
                <BarChart className="w-5 h-5 text-primary" />
                <span className="text-lg font-semibold text-primary">
                  Analyses complètes
                </span>
                
              </div>
            </>
          )}
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Signaux Trouvés</p>
                {signalsLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Chargement...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-success">{signalsFoundCount}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Signaux Non Trouvés</p>
                {signalsLoading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Chargement...</span>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-destructive">{signalsNotFoundCount}</p>
                )}
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <TrendingDown className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Risk Score</p>
                <p className="text-2xl font-bold">{riskScore}/100</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-destructive/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-destructive" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground font-medium">Paires les Plus Analysées</p>
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <BarChart className="w-6 h-6 text-primary" />
                </div>
              </div>
              {pairsLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Chargement...</span>
                </div>
              ) : mostAnalyzedPairs.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucune donnée disponible</p>
              ) : (
                <div className="space-y-2">
                  {mostAnalyzedPairs.map((pairData, index) => {
                    // Définir la couleur et l'icône selon le rang
                    const getTrophyStyle = (index: number) => {
                      switch (index) {
                        case 0: // 1er place - Or
                          return {
                            icon: <Trophy className="w-4 h-4" />,
                            color: "text-yellow-500",
                            bgColor: "bg-yellow-500/20"
                          };
                        case 1: // 2ème place - Argent
                          return {
                            icon: <Trophy className="w-4 h-4" />,
                            color: "text-gray-400",
                            bgColor: "bg-gray-400/20"
                          };
                        case 2: // 3ème place - Bronze
                          return {
                            icon: <Trophy className="w-4 h-4" />,
                            color: "text-amber-600",
                            bgColor: "bg-amber-600/20"
                          };
                        default:
                          return {
                            icon: <Trophy className="w-4 h-4" />,
                            color: "text-muted-foreground",
                            bgColor: "bg-muted/20"
                          };
                      }
                    };

                    const trophyStyle = getTrophyStyle(index);

                    return (
                      <div key={pairData.pair} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-full ${trophyStyle.bgColor} flex items-center justify-center`}>
                            <div className={trophyStyle.color}>
                              {trophyStyle.icon}
                            </div>
                          </div>
                          <span className="text-sm font-medium">{pairData.pair}</span>
                        </div>
                        <span className="text-sm font-bold text-primary">{pairData.count}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RSI Analysis - Full Width */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Suracheté */}
          <Card className="glass-card border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                
                Suracheté 
                {rsiLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rsiLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-destructive" />
                  <span className="ml-2 text-sm text-muted-foreground">Chargement RSI...</span>
                </div>
              ) : overboughtPairs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune paire surachetée</p>
                </div>
              ) : (
                overboughtPairs.map((pair) => (
                  <div
                    key={pair.pair}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono font-bold text-destructive">
                        {pair.pair}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        RSI: {pair.rsi.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-destructive" />
                      <span className="font-semibold text-destructive">
                        Suracheté
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          {/* Survente */}
          <Card className="glass-card border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                
                Survente 
                {rsiLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {rsiLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-success" />
                  <span className="ml-2 text-sm text-muted-foreground">Chargement RSI...</span>
                </div>
              ) : oversoldPairs.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Aucune paire survente</p>
                </div>
              ) : (
                oversoldPairs.map((pair) => (
                  <div
                    key={pair.pair}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="font-mono font-bold text-success">
                        {pair.pair}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        RSI: {pair.rsi.toFixed(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-4 h-4 text-success" />
                      <span className="font-semibold text-success">
                        Survente
                      </span>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
      </div>

      {/* AI Insights */}
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Market Insights
              {insightLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </CardTitle>
            <Select value={selectedPair} onValueChange={(value) => setSelectedPair(value as MajorPair)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Select pair" />
              </SelectTrigger>
              <SelectContent>
                {MAJOR_PAIRS.map((pair) => (
                  <SelectItem key={pair} value={pair}>
                    {pair}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="max-h-[600px] overflow-y-auto pr-2 scrollbar-thin">
            {insightLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="prose prose-sm max-w-none prose-invert">
                <div 
                  className="text-sm leading-relaxed whitespace-pre-wrap"
                  dangerouslySetInnerHTML={{ 
                    __html: aiInsight
                      .replace(/^---+$/gm, '') // Supprimer seulement les lignes de tirets seules
                      .replace(/^---+[\s]*$/gm, '') // Supprimer les lignes de tirets avec espaces
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                      .replace(/\n/g, '<br />')
                      .replace(/- \*\*/g, '<br />• <strong class="text-foreground font-semibold">')
                      .replace(/\* /g, '• ')
                      .trim() // Supprimer les espaces en début et fin
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* RSI Overview - Toutes les paires majeures */}
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5 text-primary" />
            Indicateurs RSI - Paires Majeures
            {rsiLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {rsiLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <span className="ml-2 text-sm text-muted-foreground">Chargement des données RSI...</span>
            </div>
          ) : allRSIData.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Aucune donnée RSI disponible</p>
            </div>
          ) : (
            <>
              {/* Version mobile avec scroll horizontal */}
              <div className="lg:hidden">
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                  {allRSIData.map((pair) => {
                    // Définir les couleurs selon le statut RSI
                    const getRSIColor = (status: string, rsi: number) => {
                      switch (status) {
                        case 'overbought':
                          return {
                            bg: 'bg-destructive/10',
                            border: 'border-destructive/30',
                            text: 'text-destructive',
                            badge: 'bg-destructive/20 text-destructive'
                          };
                        case 'oversold':
                          return {
                            bg: 'bg-success/10',
                            border: 'border-success/30',
                            text: 'text-success',
                            badge: 'bg-success/20 text-success'
                          };
                        default:
                          return {
                            bg: 'bg-muted/10',
                            border: 'border-muted/30',
                            text: 'text-muted-foreground',
                            badge: 'bg-muted/20 text-muted-foreground'
                          };
                      }
                    };

                    const colors = getRSIColor(pair.status, pair.rsi);
                    const statusText = pair.status === 'overbought' ? 'Suracheté' : 
                                      pair.status === 'oversold' ? 'Survente' : 'Neutre';

                    return (
                      <div
                        key={pair.pair}
                        className={`min-w-[280px] p-4 rounded-xl ${colors.bg} border ${colors.border} hover:shadow-lg transition-all duration-300`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <Badge variant="outline" className="font-mono font-bold">
                            {pair.pair}
                          </Badge>
                          <Badge className={colors.badge}>
                            {statusText}
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">RSI</span>
                            <span className={`text-2xl font-bold ${colors.text}`}>
                              {pair.rsi.toFixed(1)}
                            </span>
                          </div>
                          <div className="w-full bg-muted/20 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all duration-500 ${
                                pair.status === 'overbought' ? 'bg-destructive' :
                                pair.status === 'oversold' ? 'bg-success' : 'bg-muted-foreground'
                              }`}
                              style={{ width: `${Math.min(100, Math.max(0, pair.rsi))}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-xs text-muted-foreground">
                            <span>0</span>
                            <span>30</span>
                            <span>50</span>
                            <span>70</span>
                            <span>100</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Version desktop avec grille normale */}
              <div className="hidden lg:grid lg:grid-cols-4 gap-4">
                {allRSIData.map((pair) => {
                  // Définir les couleurs selon le statut RSI
                  const getRSIColor = (status: string, rsi: number) => {
                    switch (status) {
                      case 'overbought':
                        return {
                          bg: 'bg-destructive/10',
                          border: 'border-destructive/30',
                          text: 'text-destructive',
                          badge: 'bg-destructive/20 text-destructive'
                        };
                      case 'oversold':
                        return {
                          bg: 'bg-success/10',
                          border: 'border-success/30',
                          text: 'text-success',
                          badge: 'bg-success/20 text-success'
                        };
                      default:
                        return {
                          bg: 'bg-muted/10',
                          border: 'border-muted/30',
                          text: 'text-muted-foreground',
                          badge: 'bg-muted/20 text-muted-foreground'
                        };
                    }
                  };

                  const colors = getRSIColor(pair.status, pair.rsi);
                  const statusText = pair.status === 'overbought' ? 'Suracheté' : 
                                    pair.status === 'oversold' ? 'Survente' : 'Neutre';

                  return (
                    <div
                      key={pair.pair}
                      className={`p-4 rounded-xl ${colors.bg} border ${colors.border} hover:shadow-lg transition-all duration-300`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="outline" className="font-mono font-bold">
                          {pair.pair}
                        </Badge>
                        <Badge className={colors.badge}>
                          {statusText}
                        </Badge>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">RSI</span>
                          <span className={`text-2xl font-bold ${colors.text}`}>
                            {pair.rsi.toFixed(1)}
                          </span>
                        </div>
                        <div className="w-full bg-muted/20 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all duration-500 ${
                              pair.status === 'overbought' ? 'bg-destructive' :
                              pair.status === 'oversold' ? 'bg-success' : 'bg-muted-foreground'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, pair.rsi))}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0</span>
                          <span>30</span>
                          <span>50</span>
                          <span>70</span>
                          <span>100</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Two Column Layout - Activity & News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity - Analyses */}
        <Card className="glass-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              Recent Activity
              {analysesLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analysesLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Chargement des analyses...</span>
              </div>
            ) : recentAnalyses.length === 0 ? (
              <div className="text-center py-8">
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Aucune analyse récente avec signal</p>
              </div>
            ) : (
              recentAnalyses.map((analysis) => {
                const { date, time, fullDateTime } = formatDateTime(analysis.timestamp);
                return (
                  <div
                    key={analysis.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300 cursor-pointer group"
                    onClick={() => handleAnalysisClick(analysis)}
                    title={`Cliquer pour voir les détails de l'analyse ${analysis.pair}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg ${
                        analysis.signal === "BUY" ? "bg-success/20" : 
                        analysis.signal === "SELL" ? "bg-destructive/20" : 
                        "bg-muted/20"
                      } flex items-center justify-center group-hover:scale-105 transition-transform`}>
                        {analysis.signal === "BUY" ? (
                          <TrendingUp className="w-4 h-4 text-success" />
                        ) : analysis.signal === "SELL" ? (
                          <TrendingDown className="w-4 h-4 text-destructive" />
                        ) : (
                          <Activity className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-xs font-mono">
                            {analysis.pair}
                          </Badge>
                          <Badge 
                            variant={analysis.signal === "BUY" ? "default" : analysis.signal === "SELL" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {analysis.signal}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          <span>{date}</span>
                          <span>•</span>
                          <span>{time}</span>
                        </div>
                        {analysis.confidence && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Confiance: {analysis.confidence}%
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      {analysis.confluenceScore && analysis.confluenceScore > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Confluence: {analysis.confluenceScore}/100
                        </p>
                      )}
                      <div className="mt-1">
                        <span className="text-xs text-primary group-hover:text-primary/80 transition-colors">
                          Voir détails →
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Market News */}
        <Card className="glass-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-primary" />
              Market News
              {newsLoading && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </CardTitle>
          </CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
            {marketNews.map((news) => (
              <div
                key={news.id}
                className="p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300 cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${
                    news.sentiment === "Positive" ? "bg-success" : 
                    news.sentiment === "Negative" ? "bg-destructive" : 
                    "bg-muted-foreground"
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm group-hover:text-primary transition-colors">
                      {news.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {news.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-muted-foreground">{extractSource(news.description)}</span>
                      <span className="text-xs text-muted-foreground">• {formatTimeAgo(news.created_at)}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          news.sentiment === "Positive" ? "text-success border-success/30" : 
                          news.sentiment === "Negative" ? "text-destructive border-destructive/30" : 
                          "text-muted-foreground"
                        }`}
                      >
                        {news.sentiment}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
