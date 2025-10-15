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
  Loader2
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { fetchMarketNews, formatTimeAgo, extractSource, NewsItem } from "@/services/newsService";
import { fetchAiInsight, MAJOR_PAIRS, MajorPair } from "@/services/aiInsightService";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StockItem {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

interface PortfolioHolding {
  symbol: string;
  name: string;
  shares: number;
  avgPrice: number;
  currentPrice: number;
  totalValue: number;
  changePercent: number;
  allocation: number;
}

interface Transaction {
  type: "buy" | "sell";
  symbol: string;
  shares: number;
  price: number;
  time: string;
}

const watchlist: StockItem[] = [
  { symbol: "AAPL", name: "Apple Inc.", price: 178.52, change: 2.34, changePercent: 1.33 },
  { symbol: "GOOGL", name: "Alphabet Inc.", price: 139.28, change: -1.12, changePercent: -0.80 },
  { symbol: "MSFT", name: "Microsoft Corp.", price: 378.91, change: 4.56, changePercent: 1.22 },
  { symbol: "TSLA", name: "Tesla Inc.", price: 242.84, change: -3.21, changePercent: -1.30 },
  { symbol: "NVDA", name: "NVIDIA Corp.", price: 495.22, change: 8.45, changePercent: 1.74 },
  { symbol: "AMZN", name: "Amazon.com", price: 151.94, change: -2.18, changePercent: -1.41 },
];

// Removed static insights - now fetched dynamically

const portfolioHoldings: PortfolioHolding[] = [
  { symbol: "AAPL", name: "Apple Inc.", shares: 50, avgPrice: 170.00, currentPrice: 178.52, totalValue: 8926.00, changePercent: 5.01, allocation: 35 },
  { symbol: "MSFT", name: "Microsoft Corp.", shares: 25, avgPrice: 360.00, currentPrice: 378.91, totalValue: 9472.75, changePercent: 5.25, allocation: 37 },
  { symbol: "NVDA", name: "NVIDIA Corp.", shares: 15, avgPrice: 450.00, currentPrice: 495.22, totalValue: 7428.30, changePercent: 10.05, allocation: 28 },
];

const recentTransactions: Transaction[] = [
  { type: "buy", symbol: "NVDA", shares: 5, price: 495.22, time: "2h ago" },
  { type: "sell", symbol: "TSLA", shares: 10, price: 242.84, time: "5h ago" },
  { type: "buy", symbol: "AAPL", shares: 15, price: 178.52, time: "1d ago" },
];

// Default fallback news
const defaultNews = [
  { id: "1", title: "Market analysis in progress", description: "Loading latest market updates...", sentiment: "Neutral" as const, created_at: new Date().toISOString() },
];

const topGainers = watchlist.filter(s => s.changePercent > 0).sort((a, b) => b.changePercent - a.changePercent).slice(0, 3);
const topLosers = watchlist.filter(s => s.changePercent < 0).sort((a, b) => a.changePercent - b.changePercent).slice(0, 3);

export function Dashboard() {
  const portfolioValue = 125840.52;
  const dailyChange = 2840.21;
  const dailyChangePercent = 2.31;
  const monthlyReturn = 8.5;
  const totalReturn = 24.7;
  const riskScore = 68;

  const { token } = useAuth();
  const [marketNews, setMarketNews] = useState<NewsItem[]>(defaultNews);
  const [newsLoading, setNewsLoading] = useState(true);
  const [selectedPair, setSelectedPair] = useState<MajorPair>("EUR/USD");
  const [aiInsight, setAiInsight] = useState<string>("");
  const [insightLoading, setInsightLoading] = useState(true);

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
      {/* Portfolio Overview - Main Card */}
      <div className="glass-card rounded-2xl p-6 border-2 border-primary/20 shadow-2xl shadow-primary/10">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground font-medium">Total Portfolio Value</p>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
            ${portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </h1>
          <div className="flex items-center gap-2 pt-2">
            {dailyChange >= 0 ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
            <span
              className={`text-lg font-semibold ${
                dailyChange >= 0 ? "text-success" : "text-destructive"
              }`}
            >
              {dailyChange >= 0 ? "+" : ""}${Math.abs(dailyChange).toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
            <span
              className={`text-sm ${
                dailyChange >= 0 ? "text-success/80" : "text-destructive/80"
              }`}
            >
              ({dailyChangePercent >= 0 ? "+" : ""}{dailyChangePercent.toFixed(2)}%)
            </span>
            <span className="text-xs text-muted-foreground ml-2">Today</span>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Monthly Return</p>
                <p className="text-2xl font-bold text-success">+{monthlyReturn}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-success/20 flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Total Return</p>
                <p className="text-2xl font-bold text-success">+{totalReturn}%</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Target className="w-6 h-6 text-primary" />
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
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground font-medium">Holdings</p>
                <p className="text-2xl font-bold">{portfolioHoldings.length}</p>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Portfolio Holdings */}
        <Card className="glass-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              Portfolio Holdings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {portfolioHoldings.map((holding) => (
              <div key={holding.symbol} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono font-bold">
                      {holding.symbol}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{holding.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">${holding.totalValue.toLocaleString()}</p>
                    <p className={`text-xs ${holding.changePercent >= 0 ? "text-success" : "text-destructive"}`}>
                      {holding.changePercent >= 0 ? "+" : ""}{holding.changePercent.toFixed(2)}%
                    </p>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{holding.allocation}% of portfolio</span>
                    <span>{holding.shares} shares @ ${holding.currentPrice.toFixed(2)}</span>
                  </div>
                  <Progress value={holding.allocation} className="h-1.5" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Top Performers */}
        <div className="space-y-4">
          {/* Top Gainers */}
          <Card className="glass-card border-success/20 bg-success/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-success">
                <ArrowUpRight className="w-5 h-5" />
                Top Gainers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topGainers.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono font-bold text-success">
                      {stock.symbol}
                    </Badge>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      ${stock.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-success" />
                    <span className="font-semibold text-success">
                      +{stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Top Losers */}
          <Card className="glass-card border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <ArrowDownRight className="w-5 h-5" />
                Top Losers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {topLosers.map((stock) => (
                <div
                  key={stock.symbol}
                  className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono font-bold text-destructive">
                      {stock.symbol}
                    </Badge>
                    <span className="text-sm text-muted-foreground hidden sm:inline">
                      ${stock.price.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-destructive" />
                    <span className="font-semibold text-destructive">
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
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
                      .replace(/\*\*(.+?)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>')
                      .replace(/\n/g, '<br />')
                      .replace(/- \*\*/g, '<br />• <strong class="text-foreground font-semibold">')
                      .replace(/\* /g, '• ')
                  }}
                />
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Two Column Layout - Activity & News */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card className="glass-card border-primary/10">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-primary" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map((transaction, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg ${transaction.type === "buy" ? "bg-success/20" : "bg-destructive/20"} flex items-center justify-center`}>
                    {transaction.type === "buy" ? (
                      <TrendingUp className="w-4 h-4 text-success" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-destructive" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold">
                      {transaction.type === "buy" ? "Bought" : "Sold"} {transaction.symbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {transaction.shares} shares @ ${transaction.price.toFixed(2)}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{transaction.time}</span>
              </div>
            ))}
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

      {/* Watchlist */}
      <Card className="glass-card border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" />
            Watchlist
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {watchlist.map((stock) => (
              <div
                key={stock.symbol}
                className="p-4 rounded-xl bg-secondary/30 border border-border/50 hover:bg-secondary/50 transition-all duration-300 hover:shadow-lg cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="font-mono font-bold">
                        {stock.symbol}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {stock.name}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-lg">
                    ${stock.price.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-1">
                    {stock.change >= 0 ? (
                      <TrendingUp className="w-3 h-3 text-success" />
                    ) : (
                      <TrendingDown className="w-3 h-3 text-destructive" />
                    )}
                    <span
                      className={`text-xs font-medium ${
                        stock.change >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {stock.change >= 0 ? "+" : ""}${Math.abs(stock.change).toFixed(2)} (
                      {stock.changePercent >= 0 ? "+" : ""}
                      {stock.changePercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
