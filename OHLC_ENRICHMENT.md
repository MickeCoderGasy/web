# Système d'Enrichissement OHLC

## 🎯 Objectif

Enrichir automatiquement le contexte de Grok avec les données OHLC les plus récentes lors de la sélection d'une analyse.

## 🔄 Workflow

1. **Sélection d'analyse** → L'utilisateur sélectionne une analyse dans les paramètres
2. **Déclenchement automatique** → Le système appelle le webhook OHLC
3. **Enrichissement du contexte** → Les données OHLC sont ajoutées au contexte
4. **Envoi à Grok** → Le contexte enrichi est envoyé avec le prompt utilisateur

## 🌐 Webhook OHLC

### Endpoint
```
POST https://n8n.qubextai.tech/webhook-test/ohlc
```

### Input
```json
{
  "access_token": "supabase_session_token",
  "pair": "string",
  "date_time": "string"
}
```

### Output
Le webhook retourne directement un tableau de données OHLC :

```json
[
  {
    "pair": "EUR/USD",
    "timestamp": "2024-01-15T10:30:00Z",
    "open": 1.0850,
    "high": 1.0875,
    "low": 1.0840,
    "close": 1.0865,
    "volume": 1250000,
    "timeframe": "H1"
  },
  // ... autres données OHLC
]
```

Le service prend automatiquement la première donnée (la plus récente) du tableau.

## 📁 Structure des Fichiers

```
web/src/
├── services/
│   ├── ohlcService.ts           # Service webhook OHLC
│   └── grokService.ts           # Intégration dans Grok
├── components/
│   ├── OHLCStatusIndicator.tsx   # Indicateur de statut
│   └── OHLCDataDisplay.tsx     # Affichage des données
├── hooks/
│   └── useOHLCEnrichment.ts    # Hook de gestion d'état
└── config/
    └── grok-prompt.js          # Prompt enrichi
```

## 🔧 Services

### OHLCService

```typescript
// Récupération des données OHLC
await ohlcService.fetchOHLCData({
  access_token: "supabase_session_token",
  pair: "EUR/USD", 
  date_time: "2024-01-15T10:30:00Z"
});

// Formatage pour le contexte
const context = await ohlcService.getOHLCContext(
  accessToken, pair, analysisDateTime
);
```

### GrokService (Intégration)

```typescript
// Enrichissement automatique dans buildContext()
const ohlcContext = await ohlcService.getOHLCContext(
  accessToken, pair, analysisDateTime
);
context += ohlcContext;
```

## 🎨 Composants UI

### OHLCStatusIndicator
- **Loading** : Indique le chargement des données
- **Connected** : Données OHLC récupérées avec succès
- **Error** : Erreur lors de la récupération
- **Disabled** : Aucune analyse sélectionnée

### OHLCDataDisplay
- Affichage des données OHLC dans le chat
- Calcul du changement de prix
- Indicateurs visuels (couleurs, icônes)

## 🔄 Hook useOHLCEnrichment

```typescript
const { isLoading, isEnriched, error, ohlcData } = useOHLCEnrichment(settings);
```

**États :**
- `isLoading` : Enrichissement en cours
- `isEnriched` : Données OHLC disponibles
- `error` : Message d'erreur
- `ohlcData` : Données OHLC récupérées

## 🚀 Déclenchement Automatique

### 1. Sélection d'Analyse
```typescript
// Dans ContextSettings.tsx
const handleAnalysisSelection = (analysisId: string) => {
  onSettingsChange({
    ...settings,
    selectedAnalysisId: analysisId
  });
  // → Déclenche automatiquement l'enrichissement OHLC
};
```

### 2. Enrichissement du Contexte
```typescript
// Dans grokService.ts
private async buildContext() {
  // ... analyse sélectionnée ...
  
  // 🚀 ENRICHISSEMENT AUTOMATIQUE AVEC DONNÉES OHLC
  const ohlcContext = await ohlcService.getOHLCContext(
    accessToken, pair, analysisDateTime
  );
  context += ohlcContext;
}
```

### 3. Envoi à Grok
```typescript
// Le contexte enrichi est automatiquement inclus
const messages: GrokMessage[] = [
  { role: 'system', content: this.config.systemPrompt },
  { role: 'user', content: fullUserMessage } // ← Contient les données OHLC
];
```

## 📊 Format du Contexte Enrichi

```
=== ANALYSE EUR/USD (15/01/2024 10:30) ===
Statut: completed
Signal: BUY
Confiance: 85%
Score de Confluence: 78/100
Résumé: Signal d'achat fort sur EUR/USD

=== DONNÉES COMPLÈTES DE L'ANALYSE ===
Signal ID: sig_123456
Status: completed
Pair: EUR/USD
Generated at: 2024-01-15T10:30:00Z

=== DONNÉES OHLC RÉCENTES ===
Paire: EUR/USD
Timestamp: 15/01/2024 10:30:00
Open: 1.0850
High: 1.0875
Low: 1.0840
Close: 1.0865
Volume: 1250000
Timeframe: H1
===============================
```

## 🛠️ Configuration

### Variables d'Environnement
```env
VITE_GROK_API_KEY=your_grok_api_key_here
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Token d'Accès
Le système utilise le token de session Supabase (`session.access_token`) comme `access_token` pour le webhook.

### Authentification Supabase
```typescript
// Récupération du token de session
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session?.access_token;

if (!accessToken) {
  throw new Error('Aucune session d\'authentification Supabase active');
}
```

## 🔍 Monitoring

### Logs de Debug
```javascript
console.log('🔄 Enrichissement du contexte avec les données OHLC...');
console.log('✅ Contexte enrichi avec les données OHLC');
console.warn('⚠️ Impossible d\'enrichir avec les données OHLC:', error);
```

### Indicateurs Visuels
- **Badge de statut** : Loading/Connected/Error
- **Timestamp** : Dernière mise à jour
- **Icônes** : Wifi, Clock, AlertCircle

## 🚨 Gestion d'Erreurs

### Erreurs Possibles
1. **Webhook inaccessible** : Timeout ou erreur réseau
2. **Données indisponibles** : Aucune donnée OHLC pour la paire
3. **Token invalide** : Access token expiré ou incorrect
4. **Format invalide** : Réponse du webhook malformée

### Fallback
```typescript
catch (ohlcError) {
  console.warn('⚠️ Impossible d\'enrichir avec les données OHLC:', ohlcError);
  context += `\n\n=== DONNÉES OHLC ===\nEnrichissement OHLC non disponible\n====================`;
}
```

## 🎯 Avantages

1. **Contexte Riche** : Grok a accès aux données OHLC les plus récentes
2. **Automatique** : Pas d'intervention manuelle requise
3. **Temps Réel** : Données actualisées à chaque sélection
4. **Robuste** : Gestion d'erreurs et fallback
5. **Transparent** : Indicateurs visuels du statut

---

*Le système d'enrichissement OHLC améliore significativement la qualité des réponses de Grok en lui fournissant des données de marché actualisées.*
