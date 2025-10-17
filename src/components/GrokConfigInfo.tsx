import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Zap, Settings, ExternalLink, Copy, Check } from 'lucide-react';
import { env, checkConfig } from '@/config/env';

export function GrokConfigInfo() {
  const [copied, setCopied] = useState(false);
  const isConfigured = checkConfig();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const envContent = `# Configuration Grok API
VITE_GROK_API_KEY=your_grok_api_key_here

# Configuration Supabase (optionnel)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key`;

  return (
    <Card className="glass-card border-primary/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-primary" />
          Configuration Grok
          <Badge variant={isConfigured ? "default" : "destructive"}>
            {isConfigured ? "Configuré" : "Non configuré"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConfigured ? (
          <Alert>
            <Settings className="h-4 w-4" />
            <AlertDescription>
              Pour utiliser Grok, vous devez configurer votre clé API.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert className="border-green-500/20 bg-green-500/5">
            <Zap className="h-4 w-4 text-green-500" />
            <AlertDescription className="text-green-700">
              Configuration Grok détectée ! Vous pouvez utiliser toutes les fonctionnalités.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          <h4 className="font-medium">Étapes de configuration :</h4>
          
          <div className="space-y-2 text-sm">
            <p>1. Créez un fichier <code className="bg-secondary px-1 rounded">.env</code> à la racine du projet</p>
            <p>2. Ajoutez votre clé API Grok :</p>
          </div>

          <div className="relative">
            <pre className="bg-secondary/50 p-3 rounded-lg text-xs overflow-x-auto">
              <code>{envContent}</code>
            </pre>
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2"
              onClick={() => copyToClipboard(envContent)}
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="space-y-2 text-sm">
            <p>3. Redémarrez le serveur de développement</p>
            <p>4. Obtenez votre clé API sur :</p>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => window.open('https://console.x.ai/', '_blank')}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Console Grok (x.ai)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground space-y-1">
          <p><strong>Note :</strong> Sans configuration, seuls les modèles standard seront disponibles.</p>
          <p><strong>Sécurité :</strong> Ne partagez jamais votre clé API publiquement.</p>
        </div>
      </CardContent>
    </Card>
  );
}
