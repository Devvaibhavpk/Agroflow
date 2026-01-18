-- ============================================
-- AGROFLOW: Blockchain Traceability Tables
-- ============================================
-- Run this in Supabase SQL Editor to add blockchain features

-- ============================================
-- 1. HARVEST BATCHES TABLE (Crop Lifecycle + NFT)
-- ============================================
-- Stores complete lifecycle of each harvest batch as an NFT
CREATE TABLE IF NOT EXISTS harvest_batches (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Crop Information
    crop_name TEXT NOT NULL,
    crop_variety TEXT,
    
    -- Lifecycle Dates
    planting_date DATE NOT NULL,
    harvest_date DATE,
    
    -- Quantity & Location
    quantity_kg DECIMAL(10, 2),
    zone_name TEXT,
    farm_location TEXT,
    
    -- Growing Conditions Summary (aggregated from sensor data)
    avg_temperature DECIMAL(5, 2),
    min_temperature DECIMAL(5, 2),
    max_temperature DECIMAL(5, 2),
    avg_humidity DECIMAL(5, 2),
    avg_moisture DECIMAL(5, 2),
    total_irrigation_hours DECIMAL(10, 2),
    
    -- Certification & Quality
    is_organic BOOLEAN DEFAULT FALSE,
    is_pesticide_free BOOLEAN DEFAULT FALSE,
    quality_grade TEXT CHECK (quality_grade IN ('A', 'B', 'C', 'Premium')),
    certifications TEXT[],
    
    -- Blockchain Verification
    data_hash TEXT,                    -- SHA-256 hash of all batch data
    blockchain_tx_hash TEXT,           -- Transaction hash on Polygon
    blockchain_block_number BIGINT,    -- Block number for verification
    blockchain_verified_at TIMESTAMPTZ,
    blockchain_network TEXT DEFAULT 'polygon-amoy',
    
    -- NFT Information
    nft_token_id INTEGER,              -- ERC-721 Token ID
    nft_contract_address TEXT,         -- Smart contract address
    nft_metadata_uri TEXT,             -- IPFS or HTTP metadata URI
    nft_opensea_url TEXT,              -- OpenSea listing URL
    nft_minted_at TIMESTAMPTZ,         -- When NFT was minted
    
    -- QR Code
    qr_code_id TEXT UNIQUE,            -- Unique ID for QR code URL
    
    -- Status
    status TEXT DEFAULT 'growing' CHECK (status IN ('growing', 'harvested', 'verified', 'minted', 'sold')),
    notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_harvest_batches_user_id ON harvest_batches(user_id);
CREATE INDEX IF NOT EXISTS idx_harvest_batches_qr_code_id ON harvest_batches(qr_code_id);
CREATE INDEX IF NOT EXISTS idx_harvest_batches_status ON harvest_batches(status);

-- Enable Row Level Security
ALTER TABLE harvest_batches ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own batches" ON harvest_batches
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own batches" ON harvest_batches
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own batches" ON harvest_batches
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own batches" ON harvest_batches
    FOR DELETE USING (auth.uid() = user_id);

-- Public read access for QR code verification (anyone can verify)
CREATE POLICY "Public can verify batches by qr_code_id" ON harvest_batches
    FOR SELECT USING (qr_code_id IS NOT NULL);

-- ============================================
-- 2. BLOCKCHAIN VERIFICATION LOGS
-- ============================================
-- Audit trail of all blockchain verifications
CREATE TABLE IF NOT EXISTS blockchain_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    batch_id UUID REFERENCES harvest_batches(id) ON DELETE CASCADE,
    
    -- Hash & Verification
    data_hash TEXT NOT NULL,
    tx_hash TEXT,
    block_number BIGINT,
    network TEXT DEFAULT 'polygon-amoy',
    
    -- Gas & Cost (for tracking)
    gas_used BIGINT,
    gas_price_gwei DECIMAL(20, 9),
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed')),
    error_message TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    confirmed_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_blockchain_logs_batch_id ON blockchain_logs(batch_id);
CREATE INDEX IF NOT EXISTS idx_blockchain_logs_tx_hash ON blockchain_logs(tx_hash);

-- ============================================
-- 3. DAILY DATA HASHES (Sensor Data Integrity)
-- ============================================
-- Daily hashes of sensor data for integrity verification
CREATE TABLE IF NOT EXISTS sensor_data_hashes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Date range for this hash
    date DATE NOT NULL UNIQUE,
    
    -- Aggregated data that was hashed
    record_count INTEGER,
    avg_temperature DECIMAL(5, 2),
    avg_humidity DECIMAL(5, 2),
    avg_moisture DECIMAL(5, 2),
    
    -- Hash & Blockchain
    data_hash TEXT NOT NULL,
    tx_hash TEXT,
    block_number BIGINT,
    verified_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sensor_data_hashes_date ON sensor_data_hashes(date);

-- ============================================
-- 4. FUNCTION: Generate QR Code ID
-- ============================================
CREATE OR REPLACE FUNCTION generate_qr_code_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    -- Generate 8 character unique ID (e.g., "AF-X7K9M2")
    result := 'AF-';
    FOR i IN 1..6 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. TRIGGER: Auto-generate QR Code ID
-- ============================================
CREATE OR REPLACE FUNCTION set_qr_code_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.qr_code_id IS NULL THEN
        NEW.qr_code_id := generate_qr_code_id();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS auto_qr_code_id ON harvest_batches;
CREATE TRIGGER auto_qr_code_id
    BEFORE INSERT ON harvest_batches
    FOR EACH ROW EXECUTE FUNCTION set_qr_code_id();

-- ============================================
-- SAMPLE DATA (Optional - for testing)
-- ============================================
-- Uncomment to add sample harvest batches

/*
INSERT INTO harvest_batches (
    user_id, crop_name, crop_variety, planting_date, harvest_date,
    quantity_kg, zone_name, farm_location,
    avg_temperature, avg_humidity, avg_moisture,
    is_organic, quality_grade, status, notes
) 
SELECT 
    id as user_id,
    'Tomatoes',
    'Roma',
    '2024-10-15',
    '2024-12-20',
    250.00,
    'Zone A',
    'Bangalore, Karnataka',
    27.5,
    62.0,
    45.0,
    true,
    'Premium',
    'harvested',
    'First batch of organic Roma tomatoes'
FROM profiles LIMIT 1;
*/

-- ============================================
-- Enable Realtime for harvest_batches
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE harvest_batches;
