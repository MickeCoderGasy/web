// Composant pour configurer les paramètres USSD
// Permet de modifier le numéro Mobile Money et le préfixe USSD

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Settings, 
  Smartphone, 
  Hash, 
  DollarSign,
  Save,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { USSD_CONFIG, generateUSSDCode } from '@/config/ussd';

export function USSDConfig() {
  const { toast } = useToast();
  const [config, setConfig] = useState({
    mobileMoneyNumber: USSD_CONFIG.MOBILE_MONEY_NUMBER,
    ussdPrefix: USSD_CONFIG.USSD_PREFIX,
    ussdSuffix: USSD_CONFIG.USSD_SUFFIX,
    exchangeRate: USSD_CONFIG.EXCHANGE_RATE,
    localCurrency: USSD_CONFIG.LOCAL_CURRENCY
  });
  const [saving, setSaving] = useState(false);
  const [testAmount, setTestAmount] = useState(14.99);
  const [testPaymentId, setTestPaymentId] = useState('12345678');

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Ici vous pourriez sauvegarder la configuration dans Supabase
      // ou dans un fichier de configuration
      
      // Pour l'instant, on simule la sauvegarde
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Configuration sauvegardée !',
        description: 'Les paramètres USSD ont été mis à jour.',
      });
    } catch (error: any) {
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const generateTestCode = () => {
    const testCode = generateUSSDCode(testPaymentId, testAmount);
    return testCode;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuration USSD Mobile Money
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Numéro Mobile Money */}
          <div className="space-y-2">
            <Label htmlFor="mobileMoneyNumber">Numéro Mobile Money</Label>
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              <Input
                id="mobileMoneyNumber"
                value={config.mobileMoneyNumber}
                onChange={(e) => setConfig(prev => ({ ...prev, mobileMoneyNumber: e.target.value }))}
                placeholder="0347586097"
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Numéro de téléphone Mobile Money de votre entreprise
            </p>
          </div>

          {/* Préfixe et suffixe USSD */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ussdPrefix">Préfixe USSD</Label>
              <div className="flex items-center gap-2">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <Input
                  id="ussdPrefix"
                  value={config.ussdPrefix}
                  onChange={(e) => setConfig(prev => ({ ...prev, ussdPrefix: e.target.value }))}
                  placeholder="#111*1*2*"
                  className="font-mono"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="ussdSuffix">Suffixe USSD</Label>
              <Input
                id="ussdSuffix"
                value={config.ussdSuffix}
                onChange={(e) => setConfig(prev => ({ ...prev, ussdSuffix: e.target.value }))}
                placeholder="#"
                className="font-mono"
              />
            </div>
          </div>

          {/* Taux de change */}
          <div className="space-y-2">
            <Label htmlFor="exchangeRate">Taux de change (1 USD = ? {config.localCurrency})</Label>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-muted-foreground" />
              <Input
                id="exchangeRate"
                type="number"
                value={config.exchangeRate}
                onChange={(e) => setConfig(prev => ({ ...prev, exchangeRate: parseFloat(e.target.value) || 0 }))}
                placeholder="4500"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Taux de conversion USD vers {config.localCurrency}
            </p>
          </div>

          <Separator />

          {/* Test de génération */}
          <div className="space-y-4">
            <h3 className="font-semibold">Test de génération</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="testAmount">Montant USD</Label>
                <Input
                  id="testAmount"
                  type="number"
                  step="0.01"
                  value={testAmount}
                  onChange={(e) => setTestAmount(parseFloat(e.target.value) || 0)}
                  placeholder="14.99"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="testPaymentId">ID de paiement</Label>
                <Input
                  id="testPaymentId"
                  value={testPaymentId}
                  onChange={(e) => setTestPaymentId(e.target.value)}
                  placeholder="12345678"
                  className="font-mono"
                />
              </div>
            </div>
            
            <div className="p-4 bg-secondary/30 rounded-lg">
              <Label className="text-sm font-medium">Code USSD généré :</Label>
              <div className="mt-2 p-3 bg-background border rounded-lg">
                <code className="text-lg font-mono font-bold text-primary">
                  {generateUSSDCode(testPaymentId, testAmount)}
                </code>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Montant en {config.localCurrency}: {Math.floor(testAmount * config.exchangeRate).toLocaleString()} {config.localCurrency}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
