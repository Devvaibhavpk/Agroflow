-- ============================================
-- FIX: Enable Public Access for Demo (Hackathon Mode)
-- ============================================

-- 1. Make user_id nullable so we can create batches without login
ALTER TABLE harvest_batches ALTER COLUMN user_id DROP NOT NULL;

-- 2. Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can view own batches" ON harvest_batches;
DROP POLICY IF EXISTS "Users can insert own batches" ON harvest_batches;
DROP POLICY IF EXISTS "Users can update own batches" ON harvest_batches;
DROP POLICY IF EXISTS "Users can delete own batches" ON harvest_batches;

-- 3. Create permissive policies for public/anon access
CREATE POLICY "Public full access" ON harvest_batches
    FOR ALL USING (true) 
    WITH CHECK (true);

-- 4. Do the same for blockchain_logs if needed
ALTER TABLE blockchain_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view logs" ON blockchain_logs
    FOR SELECT USING (true);
    
CREATE POLICY "Public insert logs" ON blockchain_logs
    FOR INSERT WITH CHECK (true);

-- 5. Sensor data hashes public access
ALTER TABLE sensor_data_hashes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view hashes" ON sensor_data_hashes
    FOR SELECT USING (true);
