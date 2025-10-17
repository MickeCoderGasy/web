# Configuration Grok pour TradApp

## 🚀 Configuration Rapide

### 1. Créer le fichier .env

Créez un fichier `.env` à la racine du dossier `web/` avec le contenu suivant :

```env
# Configuration Grok API
VITE_GROK_API_KEY=your_grok_api_key_here

# Configuration Supabase (optionnel)
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 2. Obtenir une clé API Grok

1. Visitez [Console Grok (x.ai)](https://console.x.ai/)
2. Créez un compte ou connectez-vous
3. Générez une nouvelle clé API
4. Copiez la clé et remplacez `your_grok_api_key_here` dans le fichier `.env`

### 3. Redémarrer le serveur

```bash
# Arrêter le serveur (Ctrl+C)
# Puis redémarrer
npm run dev
```

## 🔧 Fonctionnalités Grok

### Contexte Intelligent
- **Historique des trades** : Injection automatique de vos trades passés
- **Données de marché** : Contexte en temps réel des prix
- **Actualités** : Intégration des news financières
- **Prompts personnalisés** : Ajoutez votre propre contexte

### Configuration Avancée

#### Types de Contexte Disponibles :
- `tradeHistory` : Historique des trades
- `marketData` : Données de marché actuelles
- `news` : Actualités financières
- `custom` : Prompt personnalisé
- `none` : Aucun contexte

#### Paramètres de Contexte :
- **Activation/Désactivation** : Contrôle total du contexte
- **Nombre max d'historiques** : Limite le nombre de trades inclus
- **Combinaisons** : Mélangez différents types de contexte

## 🛠️ Dépannage

### Erreur "Clé API manquante"
- Vérifiez que le fichier `.env` existe
- Vérifiez que `VITE_GROK_API_KEY` est défini
- Redémarrez le serveur après modification

### Erreur "WebSocket connection failed"
- Le serveur Vite a été configuré pour résoudre ce problème
- Si le problème persiste, redémarrez le serveur

### Grok ne répond pas
- Vérifiez votre clé API sur [console.x.ai](https://console.x.ai/)
- Vérifiez votre quota d'API
- Consultez les logs de la console pour plus de détails

## 📝 Notes Importantes

- **Sécurité** : Ne partagez jamais votre clé API publiquement
- **Quota** : Grok a des limites d'utilisation, surveillez votre consommation
- **Fallback** : Si Grok n'est pas configuré, l'application utilise le LLM standard
- **Performance** : Le streaming améliore l'expérience utilisateur

## 🎯 Utilisation

1. **Configurez Grok** avec votre clé API
2. **Ajustez les paramètres de contexte** selon vos besoins
3. **Sélectionnez Grok** dans l'interface de chat
4. **Profitez** des réponses contextuelles intelligentes !

---

*Pour plus d'aide, consultez la documentation Grok sur [x.ai](https://x.ai/)*
