# ⚙️ Exemples de Configuration - Système de Paiement Mobile Money

## 🌍 Configurations par pays

### Madagascar (Ariary - MGA)
```typescript
// web/src/config/ussd.ts
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0347586097',
  USSD_PREFIX: '#111*1*2*',
  USSD_SUFFIX: '#',
  LOCAL_CURRENCY: 'MGA',
  EXCHANGE_RATE: 4420,  // 1 USD = 4420 MGA
  CURRENCY_FORMAT: {
    symbol: 'Ar',
    position: 'after',
    decimals: 0
  }
};
```

### Côte d'Ivoire (Franc CFA - XOF)
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0123456789',
  USSD_PREFIX: '#144*1*2*',
  USSD_SUFFIX: '#',
  LOCAL_CURRENCY: 'XOF',
  EXCHANGE_RATE: 600,  // 1 USD = 600 XOF
  CURRENCY_FORMAT: {
    symbol: 'FCFA',
    position: 'after',
    decimals: 0
  }
};
```

### Sénégal (Franc CFA - XOF)
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0123456789',
  USSD_PREFIX: '#144*1*2*',
  USSD_SUFFIX: '#',
  LOCAL_CURRENCY: 'XOF',
  EXCHANGE_RATE: 600,  // 1 USD = 600 XOF
  CURRENCY_FORMAT: {
    symbol: 'FCFA',
    position: 'after',
    decimals: 0
  }
};
```

### Burkina Faso (Franc CFA - XOF)
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0123456789',
  USSD_PREFIX: '#144*1*2*',
  USSD_SUFFIX: '#',
  LOCAL_CURRENCY: 'XOF',
  EXCHANGE_RATE: 600,  // 1 USD = 600 XOF
  CURRENCY_FORMAT: {
    symbol: 'FCFA',
    position: 'after',
    decimals: 0
  }
};
```

### Cameroun (Franc CFA - XAF)
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0123456789',
  USSD_PREFIX: '#144*1*2*',
  USSD_SUFFIX: '#',
  LOCAL_CURRENCY: 'XAF',
  EXCHANGE_RATE: 600,  // 1 USD = 600 XAF
  CURRENCY_FORMAT: {
    symbol: 'FCFA',
    position: 'after',
    decimals: 0
  }
};
```

## 🏢 Configurations par opérateur

### Orange Money
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0123456789',
  USSD_PREFIX: '#144*1*2*',  // Code Orange Money
  USSD_SUFFIX: '#',
  // ... reste de la config
};
```

### MTN Mobile Money
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0123456789',
  USSD_PREFIX: '#111*1*2*',  // Code MTN
  USSD_SUFFIX: '#',
  // ... reste de la config
};
```

### Airtel Money
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0123456789',
  USSD_PREFIX: '#111*1*2*',  // Code Airtel
  USSD_SUFFIX: '#',
  // ... reste de la config
};
```

### Moov Money
```typescript
export const USSD_CONFIG = {
  MOBILE_MONEY_NUMBER: '0123456789',
  USSD_PREFIX: '#144*1*2*',  // Code Moov
  USSD_SUFFIX: '#',
  // ... reste de la config
};
```

## 👥 Configurations d'équipe

### Équipe de développement
```typescript
// web/src/config/admin.ts
export const ADMIN_EMAILS = [
  'dev1@company.com',
  'dev2@company.com',
  'dev3@company.com',
  'tech-lead@company.com'
];
```

### Équipe de production
```typescript
export const ADMIN_EMAILS = [
  'admin@company.com',
  'manager@company.com',
  'support@company.com'
];
```

### Configuration multi-environnement
```typescript
// web/src/config/admin.ts
const isDevelopment = import.meta.env.DEV;

export const ADMIN_EMAILS = isDevelopment 
  ? [
      'dev@company.com',
      'test@company.com'
    ]
  : [
      'admin@company.com',
      'manager@company.com'
    ];
```

## 🔧 Configurations avancées

### Taux de change dynamique
```typescript
// web/src/config/ussd.ts
export const USSD_CONFIG = {
  // ... autres configs
  EXCHANGE_RATE: getExchangeRate(), // Fonction qui récupère le taux en temps réel
};

async function getExchangeRate(): Promise<number> {
  try {
    const response = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await response.json();
    return Math.floor(data.rates.MGA); // Taux MGA
  } catch (error) {
    return 4420; // Taux par défaut
  }
}
```

### Configuration par plan
```typescript
// web/src/config/ussd.ts
export const PLAN_EXCHANGE_RATES = {
  starter: 4420,  // Taux pour le plan starter
  pro: 4500,      // Taux pour le plan pro
  enterprise: 4600 // Taux pour le plan enterprise
};

export function getExchangeRateForPlan(planCode: string): number {
  return PLAN_EXCHANGE_RATES[planCode] || USSD_CONFIG.EXCHANGE_RATE;
}
```

### Configuration multi-devise
```typescript
// web/src/config/ussd.ts
export const CURRENCY_CONFIGS = {
  MGA: {
    symbol: 'Ar',
    position: 'after',
    decimals: 0,
    exchangeRate: 4420
  },
  XOF: {
    symbol: 'FCFA',
    position: 'after',
    decimals: 0,
    exchangeRate: 600
  },
  XAF: {
    symbol: 'FCFA',
    position: 'after',
    decimals: 0,
    exchangeRate: 600
  }
};

export function getCurrencyConfig(currency: string) {
  return CURRENCY_CONFIGS[currency] || CURRENCY_CONFIGS.MGA;
}
```

## 📊 Exemples de codes USSD générés

### Plan Starter (14.99 USD)
- **Madagascar** : `#111*1*2*0347586097*12345678*66258#` (66,258 Ar)
- **Côte d'Ivoire** : `#144*1*2*0123456789*12345678*8994#` (8,994 FCFA)
- **Sénégal** : `#144*1*2*0123456789*12345678*8994#` (8,994 FCFA)

### Plan Pro (49 USD)
- **Madagascar** : `#111*1*2*0347586097*87654321*216580#` (216,580 Ar)
- **Côte d'Ivoire** : `#144*1*2*0123456789*87654321*29400#` (29,400 FCFA)
- **Sénégal** : `#144*1*2*0123456789*87654321*29400#` (29,400 FCFA)

## 🧪 Tests de configuration

### Script de test
```typescript
// web/src/utils/testConfig.ts
import { generateUSSDCode, convertToLocalCurrency } from '@/config/ussd';

export function testUSSDConfig() {
  const testCases = [
    { plan: 'starter', amount: 14.99 },
    { plan: 'pro', amount: 49.00 },
    { plan: 'enterprise', amount: 99.00 }
  ];

  testCases.forEach(({ plan, amount }) => {
    const localAmount = convertToLocalCurrency(amount);
    const ussdCode = generateUSSDCode('12345678', amount);
    
    console.log(`${plan}: ${amount} USD → ${localAmount} MGA`);
    console.log(`USSD: ${ussdCode}`);
    console.log('---');
  });
}
```

## 🔄 Migration de configuration

### Changer de pays
1. Modifiez `LOCAL_CURRENCY`
2. Ajustez `EXCHANGE_RATE`
3. Changez `CURRENCY_FORMAT`
4. Testez avec `/test-checkout`

### Changer d'opérateur
1. Modifiez `MOBILE_MONEY_NUMBER`
2. Ajustez `USSD_PREFIX` si nécessaire
3. Testez la génération de codes USSD

### Ajouter une nouvelle devise
1. Ajoutez la config dans `CURRENCY_CONFIGS`
2. Modifiez `getCurrencyConfig()`
3. Testez la conversion et l'affichage

## 📝 Notes importantes

- **Taux de change** : Vérifiez régulièrement et mettez à jour
- **Numéros USSD** : Vérifiez avec votre opérateur Mobile Money
- **Format des montants** : Respectez les conventions locales
- **Tests** : Testez toujours après modification de configuration
- **Sauvegarde** : Gardez une copie de vos configurations de production
