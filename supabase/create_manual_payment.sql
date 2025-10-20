-- Fonction pour créer un paiement manuel avec code USSD personnalisable
-- Cette fonction génère le code USSD avec le montant en devise locale

-- Fonction pour générer un ID de paiement aléatoire
CREATE OR REPLACE FUNCTION generate_payment_id()
RETURNS VARCHAR(20) AS $$
BEGIN
  RETURN LPAD(FLOOR(RANDOM() * 100000000)::TEXT, 8, '0');
END;
$$ LANGUAGE plpgsql;

-- Fonction pour créer un paiement manuel
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
BEGIN
  -- Générer un ID de paiement unique
  new_payment_id := generate_payment_id();
  
  -- Vérifier que l'ID est unique
  WHILE EXISTS(SELECT 1 FROM manual_payments mp WHERE mp.payment_id = new_payment_id) LOOP
    new_payment_id := generate_payment_id();
  END LOOP;
  
  -- Calculer le montant en devise locale
  -- Ici vous pouvez ajouter votre logique de conversion
  -- Pour l'instant, on multiplie par 100 pour avoir des centimes
  local_amount := FLOOR(p_amount * 100)::INTEGER;
  
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

-- Fonction pour mettre à jour la configuration USSD
CREATE OR REPLACE FUNCTION update_ussd_config(
  p_mobile_money_number VARCHAR(20),
  p_ussd_prefix VARCHAR(10)
)
RETURNS BOOLEAN AS $$
BEGIN
  -- Cette fonction peut être utilisée pour mettre à jour la configuration
  -- Pour l'instant, on peut stocker dans une table de configuration
  -- ou utiliser des variables d'environnement
  
  -- Exemple de mise à jour dans une table de config (à créer si nécessaire)
  -- INSERT INTO ussd_config (key, value) VALUES ('mobile_money_number', p_mobile_money_number)
  -- ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql;
