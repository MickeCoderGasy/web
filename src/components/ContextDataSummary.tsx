import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Database, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import { AnalysisHistoryItem } from '@/services/analysisHistoryService';

interface ContextDataSummaryProps {
  analysis: AnalysisHistoryItem;
}

export function ContextDataSummary({ analysis }: ContextDataSummaryProps) {
  const getDataSize = () => {
    if (!analysis.result) return 0;
    return JSON.stringify(analysis.result).length;
  };

  const getDataFields = () => {
    if (!analysis.result) return [];
    
    const fields = [];
    if (analysis.result.signal_metadata) fields.push('Signal Metadata');
    if (analysis.result.market_validation) fields.push('Market Validation');
    if (analysis.result.fundamental_context) fields.push('Fundamental Context');
    if (analysis.result.analysis_data) fields.push('Analysis Data');
    if (analysis.result.technical_indicators) fields.push('Technical Indicators');
    
    return fields;
  };

  const dataSize = getDataSize();
  const dataFields = getDataFields();

  return (
    <Card className="glass-card border-blue-500/20 bg-blue-500/5">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Database className="w-4 h-4 text-blue-500" />
          Données Envoyées à Grok
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Taille des données */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Taille des données:</span>
          <Badge variant="outline" className="text-xs">
            {dataSize > 1000 ? `${(dataSize / 1000).toFixed(1)}KB` : `${dataSize}B`}
          </Badge>
        </div>

        {/* Champs disponibles */}
        <div className="space-y-2">
          <span className="text-sm text-muted-foreground">Données incluses:</span>
          <div className="flex flex-wrap gap-1">
            {dataFields.map((field, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {field}
              </Badge>
            ))}
            {dataFields.length === 0 && (
              <Badge variant="outline" className="text-xs">
                Aucune donnée structurée
              </Badge>
            )}
          </div>
        </div>

        {/* Informations sur le signal */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Signal détecté:</span>
            <Badge 
              variant={analysis.signal === 'BUY' ? 'default' : analysis.signal === 'SELL' ? 'destructive' : 'secondary'}
              className="text-xs"
            >
              {analysis.signal || 'N/A'}
            </Badge>
          </div>
          
          {analysis.confidence > 0 && (
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Confiance:</span>
              <span className="text-sm font-mono">{analysis.confidence}%</span>
            </div>
          )}
        </div>

        {/* Note sur les données brutes */}
        <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-500" />
            <span className="text-xs text-blue-700">
              <strong>Données complètes:</strong> Toutes les données brutes du signal log sont envoyées à Grok sans filtrage.
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
