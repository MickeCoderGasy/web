-- Fonction corrigée pour réinitialiser les tokens lors de l'activation d'un plan
-- Adaptée à la structure réelle de la table token_usage

CREATE OR REPLACE FUNCTION reset_user_tokens_on_plan_change(
  p_user_email VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
  current_date_str VARCHAR(10);
BEGIN
  -- Obtenir la date actuelle au format YYYY-MM-DD
  current_date_str := TO_CHAR(NOW(), 'YYYY-MM-DD');
  
  -- Réinitialiser les tokens pour le nouveau cycle
  -- Mettre à jour ou insérer un nouvel enregistrement pour l'utilisateur
  INSERT INTO token_usage (
    "user",
    input,
    output,
    created_at
  ) VALUES (
    p_user_email,
    '0',
    '0',
    NOW()
  )
  ON CONFLICT ("user") 
  DO UPDATE SET
    input = '0',
    output = '0',
    created_at = NOW();
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction complète de vérification de paiement qui réinitialise aussi les tokens
CREATE OR REPLACE FUNCTION complete_payment_verification(
  p_payment_id VARCHAR(20),
  p_verified_by VARCHAR(255)
)
RETURNS TABLE(
  success BOOLEAN,
  message TEXT,
  user_email VARCHAR(255),
  plan_code VARCHAR(50)
) AS $$
DECLARE
  payment_record RECORD;
  current_status VARCHAR(20);
  user_email_var VARCHAR(255);
  plan_code_var VARCHAR(50);
BEGIN
  -- Récupérer les informations du paiement
  SELECT mp.user_email, mp.plan_code, mp.status 
  INTO payment_record
  FROM manual_payments mp
  WHERE mp.payment_id = p_payment_id;
  
  -- Vérifier si le paiement existe
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE, 'Paiement non trouvé'::TEXT, NULL::VARCHAR(255), NULL::VARCHAR(50);
    RETURN;
  END IF;
  
  -- Vérifier le statut
  IF payment_record.status != 'pending' THEN
    RETURN QUERY SELECT FALSE, 'Paiement déjà traité'::TEXT, NULL::VARCHAR(255), NULL::VARCHAR(50);
    RETURN;
  END IF;
  
  -- Vérifier si le paiement n'a pas expiré
  IF EXISTS(
    SELECT 1 FROM manual_payments mp
    WHERE mp.payment_id = p_payment_id 
    AND mp.expires_at < NOW()
  ) THEN
    RETURN QUERY SELECT FALSE, 'Paiement expiré'::TEXT, NULL::VARCHAR(255), NULL::VARCHAR(50);
    RETURN;
  END IF;
  
  -- Marquer le paiement comme vérifié
  UPDATE manual_payments 
  SET 
    status = 'verified',
    verified_at = NOW(),
    verified_by = p_verified_by
  WHERE manual_payments.payment_id = p_payment_id;
  
  -- Activer le plan de l'utilisateur
  PERFORM fn_change_user_plan(payment_record.plan_code);
  
  -- Réinitialiser les tokens pour le nouveau cycle
  PERFORM reset_user_tokens_on_plan_change(payment_record.user_email);
  
  -- Retourner les informations de succès
  RETURN QUERY SELECT 
    TRUE, 
    'Paiement vérifié, plan activé et tokens réinitialisés'::TEXT,
    payment_record.user_email,
    payment_record.plan_code;
END;
$$ LANGUAGE plpgsql;
