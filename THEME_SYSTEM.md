# 🌓 Système de Thème - Mode Sombre/Clair

## 📋 Vue d'ensemble

Le système de thème permet aux utilisateurs de basculer entre les modes clair, sombre et système (qui suit les préférences du système d'exploitation).

## 🏗️ Architecture

### 1. **ThemeContext** (`contexts/ThemeContext.tsx`)
- Gère l'état global du thème
- Persiste le choix dans `localStorage`
- Écoute les changements de préférences système
- Fournit `useTheme()` hook

### 2. **ThemeToggle** (`components/ThemeToggle.tsx`)
- Composant dropdown pour changer de thème
- Icônes dynamiques (Sun/Moon/Monitor)
- Options : Clair, Sombre, Système

### 3. **Variables CSS** (`index.css`)
- Variables HSL pour mode clair et sombre
- Support complet des couleurs du design system
- Transitions fluides entre les modes

## 🎨 Utilisation

### Dans un composant :
```tsx
import { useTheme } from '@/contexts/ThemeContext';

function MyComponent() {
  const { theme, setTheme, actualTheme } = useTheme();
  
  return (
    <div className="bg-background text-foreground">
      <p>Thème actuel : {actualTheme}</p>
      <button onClick={() => setTheme('dark')}>
        Mode sombre
      </button>
    </div>
  );
}
```

### Classes Tailwind :
```tsx
// Mode clair par défaut
<div className="bg-white text-black">

// Mode sombre
<div className="bg-white dark:bg-gray-900 text-black dark:text-white">

// Utilisation des variables CSS (recommandé)
<div className="bg-background text-foreground">
```

## 🔧 Configuration

### Variables CSS disponibles :
- `--background` / `--foreground`
- `--card` / `--card-foreground`
- `--primary` / `--primary-foreground`
- `--secondary` / `--secondary-foreground`
- `--muted` / `--muted-foreground`
- `--border` / `--input`
- `--success` / `--destructive`

### Tailwind Config :
```ts
// tailwind.config.ts
export default {
  darkMode: ["class"], // Utilise les classes CSS
  // ...
}
```

## 🚀 Fonctionnalités

### ✅ **Modes Supportés :**
- **Clair** : Interface claire avec fond blanc
- **Sombre** : Interface sombre avec fond noir
- **Système** : Suit les préférences OS

### ✅ **Persistance :**
- Sauvegarde automatique dans `localStorage`
- Restauration au rechargement de page
- Synchronisation avec les préférences système

### ✅ **Transitions :**
- Changements fluides entre les modes
- Animations CSS pour les transitions
- Pas de flash lors du changement

## 🎯 Intégration

### 1. **App.tsx** - Wrapper principal
```tsx
<ThemeProvider>
  <App />
</ThemeProvider>
```

### 2. **Navigation.tsx** - Toggle dans la barre
```tsx
<ThemeToggle />
```

### 3. **Composants** - Utilisation des variables
```tsx
<div className="bg-background text-foreground border-border">
  Contenu adaptatif
</div>
```

## 🧪 Test

### Vérifications à faire :
1. ✅ Toggle fonctionne dans la navigation
2. ✅ Persistance après rechargement
3. ✅ Mode système suit les préférences OS
4. ✅ Tous les composants s'adaptent
5. ✅ Transitions fluides

### Commandes de test :
```bash
# Démarrer l'app
npm run dev

# Tester les modes
# 1. Cliquer sur le toggle dans la navigation
# 2. Vérifier les changements visuels
# 3. Recharger la page pour tester la persistance
```

## 📝 Notes

- Le système utilise les classes CSS `light`/`dark` sur `document.documentElement`
- Les variables CSS sont définies dans `:root` (clair) et `.dark` (sombre)
- Tailwind détecte automatiquement les classes pour appliquer les styles
- Le mode système écoute `prefers-color-scheme` via `matchMedia`

## 🔮 Améliorations Futures

- [ ] Thèmes personnalisés (couleurs)
- [ ] Animations de transition personnalisées
- [ ] Thème basé sur l'heure (auto dark/light)
- [ ] Thèmes saisonniers
- [ ] Mode haute contraste
