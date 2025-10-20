# 🔐 Sécurité du Panel d'Administration

## Vue d'ensemble
Le panel d'administration (`/admin-payments`) est sécurisé par une vérification d'email côté client et serveur.

## Configuration

### 1. Emails autorisés
Modifiez le fichier `web/src/config/admin.ts` pour ajouter vos emails d'administrateur :

```typescript
export const ADMIN_EMAILS = [
  'admin@qubextai.tech',
  'votre-email@admin.com' // Remplacez par votre email
];
```

### 2. Fonctionnalités de sécurité

#### ✅ Vérification d'email
- Seuls les emails listés dans `ADMIN_EMAILS` peuvent accéder au panel
- Vérification côté client ET serveur (via Supabase RLS)

#### ✅ Interface sécurisée
- Page d'erreur pour les utilisateurs non autorisés
- Loader pendant la vérification des permissions
- Indicateur visuel "Mode Administration"

#### ✅ Navigation masquée
- Lien "Administration" visible uniquement pour les admins
- Apparaît dans le dropdown utilisateur
- Icône Shield pour identification

#### ✅ Logging des accès
- Tous les accès sont loggés dans la console
- Informations : email, timestamp, user agent, URL
- Prêt pour intégration avec service de logging externe

## Utilisation

### Accès au panel
1. Connectez-vous avec un email autorisé
2. Cliquez sur votre avatar → "Administration"
3. Ou accédez directement à `/admin-payments`

### Gestion des paiements
- **Vérifier** : Valide un paiement et active le plan
- **Refuser** : Refuse un paiement avec raison optionnelle
- **Filtrer** : Par statut (En attente, Vérifiés, Refusés, etc.)

## Sécurité supplémentaire recommandée

### 1. Vérification côté serveur
Ajoutez une vérification dans vos fonctions Supabase :

```sql
-- Exemple de fonction sécurisée
CREATE OR REPLACE FUNCTION secure_admin_function()
RETURNS BOOLEAN AS $$
DECLARE
  user_email TEXT;
BEGIN
  -- Récupérer l'email de l'utilisateur connecté
  user_email := auth.jwt() ->> 'email';
  
  -- Vérifier si c'est un admin
  IF user_email NOT IN ('admin@qubextai.tech', 'votre-email@admin.com') THEN
    RAISE EXCEPTION 'Accès refusé';
  END IF;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
```

### 2. Rate limiting
Implémentez un rate limiting pour éviter les attaques par force brute.

### 3. Logs externes
Intégrez avec un service de logging comme Sentry ou LogRocket.

### 4. Authentification 2FA
Ajoutez une authentification à deux facteurs pour les administrateurs.

## Maintenance

### Ajouter un admin
1. Modifiez `web/src/config/admin.ts`
2. Ajoutez l'email dans la liste `ADMIN_EMAILS`
3. Redéployez l'application

### Retirer un admin
1. Supprimez l'email de `ADMIN_EMAILS`
2. L'utilisateur perdra immédiatement l'accès

### Vérifier les logs
Consultez la console du navigateur pour voir les tentatives d'accès :
```
🔐 Admin Access: {
  email: "admin@qubextai.tech",
  action: "admin_panel_access",
  timestamp: "2024-01-20T10:30:00.000Z",
  userAgent: "Mozilla/5.0...",
  url: "https://yourapp.com/admin-payments"
}
```

## ⚠️ Important

- **Ne partagez jamais** l'URL `/admin-payments` publiquement
- **Vérifiez régulièrement** les logs d'accès
- **Mettez à jour** la liste des emails autorisés selon vos besoins
- **Testez** la sécurité en essayant d'accéder avec un email non autorisé
