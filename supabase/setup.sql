-- ============================================
-- AGROFLOW: Supabase Database Setup Script
-- ============================================
-- Run this script in Supabase SQL Editor to set up all tables
-- Navigate to: Supabase Dashboard > SQL Editor > New Query

-- ============================================
-- 1. SENSOR DATA TABLE (IoT Data)
-- ============================================
-- This table stores real-time data from ESP32 sensors
CREATE TABLE IF NOT EXISTS sensordata (
    id BIGSERIAL PRIMARY KEY,
    temperature DECIMAL(5, 2) NOT NULL,
    humidity DECIMAL(5, 2) NOT NULL,
    moisture DECIMAL(5, 2) NOT NULL,
    motor_state BOOLEAN DEFAULT FALSE,
    inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster time-based queries
CREATE INDEX IF NOT EXISTS idx_sensordata_inserted_at ON sensordata(inserted_at DESC);

-- ============================================
-- 2. USER PROFILES TABLE
-- ============================================
-- Extended user profile information linked to auth.users
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    farm_name TEXT,
    farm_location TEXT,
    farm_size_acres DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can view and update their own profile
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Trigger to create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'avatar_url'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger only if it doesn't exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. FARM ZONES TABLE
-- ============================================
-- Manage different zones/areas of the farm
CREATE TABLE IF NOT EXISTS farm_zones (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    crop_type TEXT,
    area_acres DECIMAL(10, 2),
    irrigation_type TEXT CHECK (irrigation_type IN ('drip', 'sprinkler', 'flood', 'manual')),
    min_moisture_threshold DECIMAL(5, 2) DEFAULT 30.00,
    max_moisture_threshold DECIMAL(5, 2) DEFAULT 70.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE farm_zones ENABLE ROW LEVEL SECURITY;

-- Users can only access their own zones
CREATE POLICY "Users can view own zones" ON farm_zones
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own zones" ON farm_zones
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own zones" ON farm_zones
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own zones" ON farm_zones
    FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. ALERTS TABLE
-- ============================================
-- Smart alerts for notifications
CREATE TABLE IF NOT EXISTS alerts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('low_moisture', 'high_moisture', 'high_temp', 'low_temp', 'motor_on', 'motor_off', 'system', 'recommendation')),
    severity TEXT NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    sensor_value DECIMAL(10, 2),
    threshold_value DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_alerts_user_id ON alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_alerts_created_at ON alerts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alerts_is_read ON alerts(is_read);

-- Enable Row Level Security
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;

-- Users can only access their own alerts
CREATE POLICY "Users can view own alerts" ON alerts
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts" ON alerts
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own alerts" ON alerts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 5. WEATHER CACHE TABLE
-- ============================================
-- Cache weather data to reduce API calls
CREATE TABLE IF NOT EXISTS weather_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    location TEXT NOT NULL,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    current_temp DECIMAL(5, 2),
    current_humidity DECIMAL(5, 2),
    condition TEXT,
    condition_icon TEXT,
    forecast_data JSONB,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 hour')
);

-- Create index for location-based queries
CREATE INDEX IF NOT EXISTS idx_weather_cache_location ON weather_cache(location);

-- ============================================
-- 6. IRRIGATION LOGS TABLE
-- ============================================
-- Track irrigation history
CREATE TABLE IF NOT EXISTS irrigation_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    zone_id UUID REFERENCES farm_zones(id) ON DELETE SET NULL,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_minutes INTEGER,
    water_used_liters DECIMAL(10, 2),
    trigger_type TEXT CHECK (trigger_type IN ('auto', 'manual', 'scheduled')),
    moisture_before DECIMAL(5, 2),
    moisture_after DECIMAL(5, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE irrigation_logs ENABLE ROW LEVEL SECURITY;

-- Users can only access their own logs
CREATE POLICY "Users can view own irrigation logs" ON irrigation_logs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own irrigation logs" ON irrigation_logs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 7. CROP DATABASE TABLE
-- ============================================
-- Pre-populated crop information for recommendations
CREATE TABLE IF NOT EXISTS crops (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    category TEXT CHECK (category IN ('vegetable', 'fruit', 'grain', 'legume', 'herb', 'other')),
    optimal_temp_min DECIMAL(5, 2),
    optimal_temp_max DECIMAL(5, 2),
    optimal_moisture_min DECIMAL(5, 2),
    optimal_moisture_max DECIMAL(5, 2),
    water_requirement TEXT CHECK (water_requirement IN ('low', 'medium', 'high')),
    growing_season TEXT,
    days_to_harvest INTEGER,
    description TEXT,
    tips TEXT[],
    image_url TEXT
);

-- Insert common crops data
INSERT INTO crops (name, category, optimal_temp_min, optimal_temp_max, optimal_moisture_min, optimal_moisture_max, water_requirement, growing_season, days_to_harvest, description, tips) VALUES
('Tomato', 'vegetable', 18.00, 29.00, 40.00, 60.00, 'medium', 'Spring-Summer', 70, 'Popular vegetable crop requiring consistent moisture', ARRAY['Stake plants for support', 'Remove suckers for larger fruit', 'Mulch to retain moisture']),
('Rice', 'grain', 20.00, 35.00, 70.00, 90.00, 'high', 'Monsoon', 120, 'Staple grain crop requiring flooded fields', ARRAY['Maintain standing water', 'Use paddy fields', 'Transplant seedlings at 3 weeks']),
('Wheat', 'grain', 12.00, 25.00, 40.00, 60.00, 'medium', 'Winter', 130, 'Major grain crop for cooler climates', ARRAY['Plant in well-drained soil', 'Avoid waterlogging', 'Apply nitrogen fertilizer']),
('Cotton', 'other', 21.00, 35.00, 50.00, 65.00, 'medium', 'Summer', 150, 'Cash crop requiring warm weather', ARRAY['Requires frost-free period', 'Deep water irrigation', 'Monitor for bollworms']),
('Sugarcane', 'other', 25.00, 35.00, 60.00, 80.00, 'high', 'Monsoon', 365, 'Perennial crop with high water needs', ARRAY['Requires 12-18 months to mature', 'Heavy feeding crop', 'Requires intercultivation']),
('Potato', 'vegetable', 15.00, 20.00, 60.00, 80.00, 'medium', 'Winter', 90, 'Root vegetable preferring cooler weather', ARRAY['Hill soil around plants', 'Avoid frost damage', 'Harvest after flowering']),
('Onion', 'vegetable', 13.00, 24.00, 50.00, 70.00, 'low', 'Winter', 150, 'Bulb crop with moderate water needs', ARRAY['Stop watering before harvest', 'Cure bulbs in sun', 'Store in dry location']),
('Chili', 'vegetable', 20.00, 30.00, 40.00, 60.00, 'medium', 'Summer', 90, 'Spice crop needing warm temperatures', ARRAY['Stake tall varieties', 'Pick ripe peppers regularly', 'Mulch to retain moisture']),
('Maize', 'grain', 18.00, 27.00, 50.00, 75.00, 'medium', 'Summer', 90, 'Versatile grain crop with wide adaptability', ARRAY['Plant in blocks for pollination', 'Requires nitrogen-rich soil', 'Harvest when silks brown']),
('Soybean', 'legume', 20.00, 30.00, 45.00, 65.00, 'medium', 'Summer', 100, 'Protein-rich legume crop', ARRAY['Inoculate seeds with rhizobium', 'Avoid excess nitrogen', 'Harvest when leaves yellow'])
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 8. ANALYTICS SUMMARIES TABLE
-- ============================================
-- Pre-computed daily analytics for faster dashboard loading
CREATE TABLE IF NOT EXISTS daily_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    date DATE NOT NULL,
    avg_temperature DECIMAL(5, 2),
    min_temperature DECIMAL(5, 2),
    max_temperature DECIMAL(5, 2),
    avg_humidity DECIMAL(5, 2),
    avg_moisture DECIMAL(5, 2),
    irrigation_count INTEGER DEFAULT 0,
    total_irrigation_minutes INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date)
);

-- ============================================
-- 9. ENABLE REALTIME FOR SENSOR DATA
-- ============================================
-- This enables real-time subscriptions for sensor data
ALTER PUBLICATION supabase_realtime ADD TABLE sensordata;
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;

-- ============================================
-- 10. HELPER FUNCTIONS
-- ============================================

-- Function to get latest sensor reading
CREATE OR REPLACE FUNCTION get_latest_sensor_data()
RETURNS TABLE (
    temperature DECIMAL,
    humidity DECIMAL,
    moisture DECIMAL,
    motor_state BOOLEAN,
    inserted_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT s.temperature, s.humidity, s.moisture, s.motor_state, s.inserted_at
    FROM sensordata s
    ORDER BY s.inserted_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to generate alert based on sensor reading
CREATE OR REPLACE FUNCTION check_sensor_alerts()
RETURNS TRIGGER AS $$
DECLARE
    zone RECORD;
BEGIN
    -- Check for low moisture alert
    IF NEW.moisture < 30 THEN
        INSERT INTO alerts (user_id, type, severity, title, message, sensor_value, threshold_value)
        SELECT id, 'low_moisture', 'warning', 
               'Low Soil Moisture Alert',
               'Soil moisture dropped to ' || NEW.moisture || '%. Consider irrigation.',
               NEW.moisture, 30.00
        FROM profiles LIMIT 1;  -- In production, associate with specific user
    END IF;
    
    -- Check for high temperature alert
    IF NEW.temperature > 40 THEN
        INSERT INTO alerts (user_id, type, severity, title, message, sensor_value, threshold_value)
        SELECT id, 'high_temp', 'critical',
               'High Temperature Warning',
               'Temperature reached ' || NEW.temperature || '°C. Crops may be stressed.',
               NEW.temperature, 40.00
        FROM profiles LIMIT 1;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic alerts
DROP TRIGGER IF EXISTS sensor_alert_trigger ON sensordata;
CREATE TRIGGER sensor_alert_trigger
    AFTER INSERT ON sensordata
    FOR EACH ROW EXECUTE FUNCTION check_sensor_alerts();

-- ============================================
-- SETUP COMPLETE!
-- ============================================
-- Your database is now ready. Next steps:
-- 1. Enable Email Auth in Authentication > Providers
-- 2. Enable Google OAuth in Authentication > Providers
-- 3. Set your site URL in Authentication > URL Configuration
-- 4. Copy your URL and Anon Key to .env.local
