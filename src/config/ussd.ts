// Configuration du code USSD Mobile Money
// Personnalisez ces valeurs selon votre opérateur Mobile Money

export const USSD_CONFIG = {
  // Numéro Mobile Money de votre entreprise
  MOBILE_MONEY_NUMBER: '0347586097',
  
  // Préfixe USSD (commence généralement par #111*1*2*)
  USSD_PREFIX: '#111*1*2*',
  
  // Suffixe USSD (généralement #)
  USSD_SUFFIX: '#',
  
  // Devise locale (pour l'affichage)
  LOCAL_CURRENCY: 'MGA', // Ariary malgache
  
  // Taux de conversion USD vers devise locale
  // 1 USD = 4500 MGA (exemple, à ajuster selon le taux actuel)
  EXCHANGE_RATE: 4420,
  
  // Format d'affichage du montant
  CURRENCY_FORMAT: {
    symbol: 'Ar',
    position: 'after' as 'before' | 'after',
    decimals: 0
  }
};

// Fonction pour convertir USD vers devise locale
export function convertToLocalCurrency(usdAmount: number): number {
  return Math.floor(usdAmount * USSD_CONFIG.EXCHANGE_RATE);
}

// Fonction pour formater le montant en devise locale
export function formatLocalCurrency(amount: number): string {
  const { symbol, position, decimals } = USSD_CONFIG.CURRENCY_FORMAT;
  const formattedAmount = amount.toLocaleString('fr-FR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
  
  return position === 'before' 
    ? `${symbol} ${formattedAmount}` 
    : `${formattedAmount} ${symbol}`;
}

// Fonction pour générer le code USSD (côté frontend pour prévisualisation)
export function generateUSSDCode(paymentId: string, usdAmount: number): string {
  const localAmount = convertToLocalCurrency(usdAmount);
  return `${USSD_CONFIG.USSD_PREFIX}${USSD_CONFIG.MOBILE_MONEY_NUMBER}*${paymentId}*${localAmount}${USSD_CONFIG.USSD_SUFFIX}`;
}
