import { useState, useRef, useEffect } from "react";
import llmService, { StockAnalysisResponse } from "@/services/llmService";
import { Send, Bot, User, Sparkles, TrendingUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
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
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

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
    setInput("");
    setIsLoading(true);

    try {
      // Check if input looks like a stock symbol (short, uppercase-like)
      const isStockSymbol = /^[A-Za-z]{1,5}(\/[A-Za-z]{3})?$/.test(userInput);
      
      if (isStockSymbol) {
        // Analyze stock
        const analysis = await llmService.analyzeStock(userInput);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: `Voici mon analyse pour **${analysis.symbol}**:`,
          analysis: analysis,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        // General chat
        const response = await llmService.chat(userInput);
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response,
        };
        setMessages((prev) => [...prev, assistantMessage]);
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
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="glass-card border-primary/10 flex flex-col h-[calc(100vh-12rem)] max-h-[800px]">
      <div className="p-4 border-b border-border/50 bg-secondary/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="font-semibold text-lg">AI Trading Assistant</h2>
            <p className="text-xs text-muted-foreground">Powered by advanced AI</p>
          </div>
        </div>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 animate-slide-up ${
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
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                
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
              <div className="bg-secondary/50 border border-border/50 rounded-2xl px-4 py-3">
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
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border/50 bg-secondary/10">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about stocks, market trends, or get trading advice..."
            className="flex-1 bg-secondary/50 border-border/50 focus-visible:ring-primary"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
            size="icon"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
