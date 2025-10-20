-- Système complet de paiement manuel Mobile Money
-- Toutes les fonctions SQL nécessaires avec corrections d'ambiguïté

-- 1. Fonction pour générer un ID de paiement aléatoire
CREATE OR REPLACE FUNCTION generate_payment_id()
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- 2. Fonction pour créer un paiement manuel
CREATE OR REPLACE FUNCTION create_manual_payment(
  p_user_email VARCHAR(255),
  p_plan_code VARCHAR(50),
  p_plan_name VARCHAR(100),
  p_amount DECIMAL(10,2),
  p_currency VARCHAR(3) DEFAULT 'USD'
)
RETURNS TABLE(
  payment_id VARCHAR(20),
  mobile_money_code TEXT,
  expires_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  new_payment_id VARCHAR(20);
  ussd_code TEXT;
  expiry_time TIMESTAMP WITH TIME ZONE;
  local_amount INTEGER;
  mobile_money_number VARCHAR(20) := '0347586097'; -- Numéro Mobile Money (modifiable)
  ussd_prefix VARCHAR(10) := '#111*1*2*'; -- Préfixe USSD (modifiable)
  ussd_suffix VARCHAR(5) := '#';
  exchange_rate INTEGER := 4420; -- Taux de change USD vers MGA
BEGIN
  -- Générer un ID de paiement unique
  new_payment_id := generate_payment_id();
  
  -- Vérifier que l'ID est unique
  WHILE EXISTS(SELECT 1 FROM manual_payments mp WHERE mp.payment_id = new_payment_id) LOOP
    new_payment_id := generate_payment_id();
  END LOOP;
  
  -- Calculer le montant en devise locale
  local_amount := FLOOR(p_amount * exchange_rate)::INTEGER;
  
  -- Générer le code USSD
  ussd_code := ussd_prefix || mobile_money_number || '*' || new_payment_id || '*' || local_amount::TEXT || ussd_suffix;
  
  -- Calculer l'expiration (24 heures)
  expiry_time := NOW() + INTERVAL '24 hours';
  
  -- Insérer le paiement dans la table
  INSERT INTO manual_payments (
    payment_id,
    user_email,
    plan_code,
    plan_name,
    amount,
    currency,
    status,
    mobile_money_code,
    created_at,
    expires_at
  ) VALUES (
    new_payment_id,
    p_user_email,
    p_plan_code,
    p_plan_name,
    p_amount,
    p_currency,
    'pending',
    ussd_code,
    NOW(),
    expiry_time
  );
  
  -- Retourner les informations
  RETURN QUERY SELECT 
    new_payment_id,
    ussd_code,
    expiry_time;
END;
$$ LANGUAGE plpgsql;

-- 3. Fonction pour vérifier un paiement (simplifiée)
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

-- 4. Fonction pour refuser un paiement
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

-- 5. Fonction pour récupérer les informations d'un paiement vérifié
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

-- 6. Fonction pour réinitialiser les tokens lors de l'activation d'un plan
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

-- 7. Fonction complète de vérification de paiement avec activation du plan
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

-- 8. Mettre à jour la contrainte de statut pour inclure 'refused'
ALTER TABLE manual_payments DROP CONSTRAINT IF EXISTS manual_payments_status_check;
ALTER TABLE manual_payments ADD CONSTRAINT manual_payments_status_check 
  CHECK (status IN ('pending', 'verified', 'expired', 'cancelled', 'refused'));
