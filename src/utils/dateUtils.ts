// Utilitaires pour la gestion des dates en UTC

/**
 * Convertit une date en format UTC ISO string pour Grok
 * @param date - Date à convertir
 * @returns Date au format ISO UTC
 */
export function toUTCString(date: string | Date): string {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toISOString();
  } catch (error) {
    console.warn('⚠️ Erreur lors de la conversion de date:', error);
    return 'Invalid Date';
  }
}

/**
 * Formate une date pour l'affichage dans le contexte Grok
 * @param date - Date à formater
 * @returns Date formatée avec indication UTC
 */
export function formatForGrok(date: string | Date): string {
  const utcString = toUTCString(date);
  return `${utcString} UTC`;
}

/**
 * Formate une date pour l'affichage utilisateur (avec indication UTC)
 * @param date - Date à formater
 * @returns Date formatée pour l'interface utilisateur
 */
export function formatForUI(date: string | Date): string {
  const utcString = toUTCString(date);
  return `${utcString} UTC`;
}

/**
 * Vérifie si une date est valide
 * @param date - Date à vérifier
 * @returns True si la date est valide
 */
export function isValidDate(date: string | Date): boolean {
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return !isNaN(dateObj.getTime());
  } catch {
    return false;
  }
}
