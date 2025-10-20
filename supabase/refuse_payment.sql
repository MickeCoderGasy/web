-- Fonction pour refuser un paiement manuel
-- Cette fonction marque un paiement comme refusé

CREATE OR REPLACE FUNCTION refuse_manual_payment(
  p_payment_id VARCHAR(20),
  p_refused_by VARCHAR(255),
  p_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  payment_exists BOOLEAN;
  current_status VARCHAR(20);
BEGIN
  -- Vérifier si le paiement existe
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
  
  -- Marquer le paiement comme refusé
  UPDATE manual_payments 
  SET 
    status = 'refused',
    verified_at = NOW(),
    verified_by = p_refused_by,
    notes = COALESCE(p_reason, 'Paiement refusé par l''administrateur')
  WHERE manual_payments.payment_id = p_payment_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Mettre à jour la contrainte de statut pour inclure 'refused'
ALTER TABLE manual_payments DROP CONSTRAINT IF EXISTS manual_payments_status_check;
ALTER TABLE manual_payments ADD CONSTRAINT manual_payments_status_check 
  CHECK (status IN ('pending', 'verified', 'expired', 'cancelled', 'refused'));
