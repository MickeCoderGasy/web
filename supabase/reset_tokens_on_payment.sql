-- Fonction pour réinitialiser les tokens lors de l'activation d'un plan
-- Cette fonction sera appelée après la vérification d'un paiement

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
  -- Mettre à jour ou insérer un nouvel enregistrement pour le mois actuel
  INSERT INTO token_usage (
    user_email,
    date,
    input_tokens,
    output_tokens,
    total_tokens,
    created_at,
    updated_at
  ) VALUES (
    p_user_email,
    current_date_str,
    0,
    0,
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_email, date) 
  DO UPDATE SET
    input_tokens = 0,
    output_tokens = 0,
    total_tokens = 0,
    updated_at = NOW();
  
  -- Optionnel : Archiver l'ancien usage si nécessaire
  -- Vous pouvez ajouter une table d'archive ici si vous voulez garder l'historique
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction améliorée de vérification de paiement qui réinitialise aussi les tokens
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
  SELECT user_email, plan_code, status 
  INTO payment_record
  FROM manual_payments 
  WHERE payment_id = p_payment_id;
  
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
    SELECT 1 FROM manual_payments 
    WHERE payment_id = p_payment_id 
    AND expires_at < NOW()
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
  WHERE payment_id = p_payment_id;
  
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
