-- Version simplifiée de la vérification de paiement
-- Cette fonction ne fait que marquer le paiement comme vérifié
-- L'activation du plan se fera côté frontend

CREATE OR REPLACE FUNCTION simple_verify_payment(
  p_payment_id VARCHAR(20),
  p_verified_by VARCHAR(255)
)
RETURNS BOOLEAN AS $$
DECLARE
  payment_exists BOOLEAN;
  current_status VARCHAR(20);
BEGIN
  -- Vérifier si le paiement existe et récupérer son statut
  SELECT EXISTS(
    SELECT 1 FROM manual_payments mp
    WHERE mp.payment_id = p_payment_id
  ) INTO payment_exists;
  
  IF NOT payment_exists THEN
    RAISE EXCEPTION 'Paiement non trouvé avec l''ID: %', p_payment_id;
  END IF;
  
  -- Récupérer le statut actuel
  SELECT mp.status INTO current_status
  FROM manual_payments mp
  WHERE mp.payment_id = p_payment_id;
  
  -- Vérifier si le paiement est en attente
  IF current_status != 'pending' THEN
    RAISE EXCEPTION 'Le paiement % est déjà traité (statut: %)', p_payment_id, current_status;
  END IF;
  
  -- Vérifier si le paiement n'a pas expiré
  IF EXISTS(
    SELECT 1 FROM manual_payments mp
    WHERE mp.payment_id = p_payment_id 
    AND mp.expires_at < NOW()
  ) THEN
    RAISE EXCEPTION 'Le paiement % a expiré', p_payment_id;
  END IF;
  
  -- Mettre à jour le statut
  UPDATE manual_payments 
  SET 
    status = 'verified',
    verified_at = NOW(),
    verified_by = p_verified_by
  WHERE manual_payments.payment_id = p_payment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour récupérer les informations d'un paiement vérifié
CREATE OR REPLACE FUNCTION get_verified_payment_info(
  p_payment_id VARCHAR(20)
)
RETURNS TABLE(
  user_email VARCHAR(255),
  plan_code VARCHAR(50),
  plan_name VARCHAR(100),
  amount DECIMAL(10,2)
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    mp.user_email,
    mp.plan_code,
    mp.plan_name,
    mp.amount
  FROM manual_payments mp
  WHERE mp.payment_id = p_payment_id
  AND mp.status = 'verified';
END;
$$ LANGUAGE plpgsql;
