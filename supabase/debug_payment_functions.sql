-- Script de debug pour diagnostiquer les problèmes de paiement
-- À exécuter dans l'éditeur SQL de Supabase

-- 1. Vérifier si la fonction fn_change_user_plan existe
SELECT 
  routine_name, 
  routine_type, 
  routine_definition
FROM information_schema.routines 
WHERE routine_name = 'fn_change_user_plan';

-- 2. Vérifier la structure de la table manual_payments
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'manual_payments'
ORDER BY ordinal_position;

-- 3. Vérifier les données dans manual_payments
SELECT * FROM manual_payments ORDER BY created_at DESC LIMIT 5;

-- 4. Tester la fonction fn_change_user_plan directement
-- Remplacez 'test@example.com' par un email de test
SELECT fn_change_user_plan('starter');

-- 5. Vérifier les abonnements utilisateur
SELECT * FROM user_subscriptions ORDER BY created_at DESC LIMIT 5;

-- 6. Créer une version simplifiée de la fonction de vérification
CREATE OR REPLACE FUNCTION test_verify_payment(
  p_payment_id VARCHAR(20)
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT
) AS $$
DECLARE
  payment_record RECORD;
  user_email_var VARCHAR(255);
  plan_code_var VARCHAR(50);
BEGIN
  -- Récupérer les informations du paiement
  SELECT user_email, plan_code, status 
  INTO payment_record
  FROM manual_payments 
  WHERE payment_id = p_payment_id;
  
  -- Vérifier si le paiement existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Paiement non trouvé'::TEXT;
    RETURN;
  END IF;
  
  -- Vérifier le statut
  IF payment_record.status != 'pending' THEN
    RETURN QUERY SELECT FALSE, 'Paiement déjà traité'::TEXT;
    RETURN;
  END IF;
  
  -- Mettre à jour le statut
  UPDATE manual_payments 
  SET 
    status = 'verified',
    verified_at = NOW(),
    verified_by = 'test-admin'
  WHERE payment_id = p_payment_id;
  
  -- Retourner succès
  RETURN QUERY SELECT TRUE, 'Paiement vérifié avec succès'::TEXT;
END;
$$ LANGUAGE plpgsql;

-- 7. Tester la fonction simplifiée
-- Remplacez '12345678' par un ID de paiement existant
SELECT * FROM test_verify_payment('12345678');
