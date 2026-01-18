-- ============================================
-- AGROFLOW: Sample Sensor Data (100 rows)
-- ============================================
-- Run this in Supabase SQL Editor to populate your dashboard
-- This simulates 100 hours of sensor readings

-- Clear existing data (optional - uncomment if you want to reset)
-- TRUNCATE TABLE sensordata RESTART IDENTITY;

INSERT INTO sensordata (temperature, humidity, moisture, motor_state, inserted_at) VALUES
-- Day 1 - Morning readings (good conditions)
(22.50, 65.20, 45.00, false, NOW() - INTERVAL '100 hours'),
(22.80, 64.80, 44.20, false, NOW() - INTERVAL '99 hours'),
(23.20, 63.50, 43.80, false, NOW() - INTERVAL '98 hours'),
(24.10, 62.00, 42.50, false, NOW() - INTERVAL '97 hours'),
(25.30, 60.40, 41.00, false, NOW() - INTERVAL '96 hours'),
(26.80, 58.20, 39.50, false, NOW() - INTERVAL '95 hours'),
(28.20, 55.80, 37.20, false, NOW() - INTERVAL '94 hours'),
(29.50, 53.40, 35.00, false, NOW() - INTERVAL '93 hours'),
(30.80, 51.20, 32.80, true, NOW() - INTERVAL '92 hours'),  -- Motor ON (low moisture)
(31.20, 50.00, 31.50, true, NOW() - INTERVAL '91 hours'),

-- Day 1 - Afternoon (hot, irrigation active)
(32.50, 48.50, 38.00, true, NOW() - INTERVAL '90 hours'),
(33.20, 47.20, 45.50, true, NOW() - INTERVAL '89 hours'),
(33.80, 46.00, 52.00, false, NOW() - INTERVAL '88 hours'),  -- Motor OFF (moisture restored)
(34.00, 45.20, 54.80, false, NOW() - INTERVAL '87 hours'),
(33.50, 46.50, 53.20, false, NOW() - INTERVAL '86 hours'),
(32.80, 48.00, 51.50, false, NOW() - INTERVAL '85 hours'),
(31.50, 50.50, 50.00, false, NOW() - INTERVAL '84 hours'),
(30.20, 53.00, 48.50, false, NOW() - INTERVAL '83 hours'),
(28.80, 56.20, 47.20, false, NOW() - INTERVAL '82 hours'),
(27.20, 59.00, 46.00, false, NOW() - INTERVAL '81 hours'),

-- Day 1 - Evening (cooling down)
(25.80, 62.50, 45.00, false, NOW() - INTERVAL '80 hours'),
(24.50, 65.80, 44.20, false, NOW() - INTERVAL '79 hours'),
(23.20, 68.50, 43.50, false, NOW() - INTERVAL '78 hours'),
(22.00, 71.20, 42.80, false, NOW() - INTERVAL '77 hours'),
(21.00, 73.50, 42.20, false, NOW() - INTERVAL '76 hours'),

-- Day 2 - Night readings (stable)
(20.50, 75.00, 41.80, false, NOW() - INTERVAL '75 hours'),
(20.20, 76.20, 41.50, false, NOW() - INTERVAL '74 hours'),
(19.80, 77.50, 41.00, false, NOW() - INTERVAL '73 hours'),
(19.50, 78.00, 40.80, false, NOW() - INTERVAL '72 hours'),
(19.20, 78.50, 40.50, false, NOW() - INTERVAL '71 hours'),
(19.00, 79.00, 40.20, false, NOW() - INTERVAL '70 hours'),
(18.80, 79.20, 40.00, false, NOW() - INTERVAL '69 hours'),
(18.50, 79.50, 39.80, false, NOW() - INTERVAL '68 hours'),
(18.20, 80.00, 39.50, false, NOW() - INTERVAL '67 hours'),
(18.50, 79.80, 39.20, false, NOW() - INTERVAL '66 hours'),

-- Day 2 - Morning (warming up)
(19.20, 78.50, 38.80, false, NOW() - INTERVAL '65 hours'),
(20.50, 76.00, 38.20, false, NOW() - INTERVAL '64 hours'),
(22.00, 73.20, 37.50, false, NOW() - INTERVAL '63 hours'),
(23.80, 70.00, 36.80, false, NOW() - INTERVAL '62 hours'),
(25.50, 66.50, 35.50, false, NOW() - INTERVAL '61 hours'),
(27.20, 63.00, 34.00, false, NOW() - INTERVAL '60 hours'),
(28.80, 59.80, 32.50, true, NOW() - INTERVAL '59 hours'),  -- Motor ON
(30.20, 56.50, 38.00, true, NOW() - INTERVAL '58 hours'),
(31.50, 54.00, 44.50, true, NOW() - INTERVAL '57 hours'),
(32.00, 52.50, 50.00, false, NOW() - INTERVAL '56 hours'),  -- Motor OFF

-- Day 2 - Afternoon
(32.80, 50.20, 48.50, false, NOW() - INTERVAL '55 hours'),
(33.50, 48.00, 47.00, false, NOW() - INTERVAL '54 hours'),
(34.20, 46.50, 45.50, false, NOW() - INTERVAL '53 hours'),
(34.80, 45.00, 44.00, false, NOW() - INTERVAL '52 hours'),
(35.00, 44.20, 42.50, false, NOW() - INTERVAL '51 hours'),
(34.50, 45.50, 41.00, false, NOW() - INTERVAL '50 hours'),
(33.80, 47.00, 39.80, false, NOW() - INTERVAL '49 hours'),
(32.50, 49.50, 38.50, false, NOW() - INTERVAL '48 hours'),
(31.00, 52.00, 37.20, false, NOW() - INTERVAL '47 hours'),
(29.50, 55.00, 36.00, false, NOW() - INTERVAL '46 hours'),

-- Day 2 - Evening
(28.00, 58.50, 35.00, false, NOW() - INTERVAL '45 hours'),
(26.50, 62.00, 34.00, false, NOW() - INTERVAL '44 hours'),
(25.00, 65.50, 33.20, false, NOW() - INTERVAL '43 hours'),
(23.80, 68.80, 32.50, true, NOW() - INTERVAL '42 hours'),  -- Motor ON
(22.50, 72.00, 40.00, true, NOW() - INTERVAL '41 hours'),
(21.50, 74.50, 48.00, false, NOW() - INTERVAL '40 hours'),  -- Motor OFF

-- Day 3 - Night
(20.80, 76.20, 47.00, false, NOW() - INTERVAL '39 hours'),
(20.20, 77.80, 46.20, false, NOW() - INTERVAL '38 hours'),
(19.50, 79.00, 45.50, false, NOW() - INTERVAL '37 hours'),
(19.00, 80.20, 44.80, false, NOW() - INTERVAL '36 hours'),
(18.50, 81.00, 44.20, false, NOW() - INTERVAL '35 hours'),
(18.20, 81.50, 43.50, false, NOW() - INTERVAL '34 hours'),
(18.00, 82.00, 43.00, false, NOW() - INTERVAL '33 hours'),
(17.80, 82.20, 42.50, false, NOW() - INTERVAL '32 hours'),
(17.50, 82.50, 42.00, false, NOW() - INTERVAL '31 hours'),
(17.80, 82.00, 41.50, false, NOW() - INTERVAL '30 hours'),

-- Day 3 - Morning
(18.50, 80.50, 41.00, false, NOW() - INTERVAL '29 hours'),
(19.80, 78.00, 40.50, false, NOW() - INTERVAL '28 hours'),
(21.50, 75.00, 40.00, false, NOW() - INTERVAL '27 hours'),
(23.20, 72.00, 39.50, false, NOW() - INTERVAL '26 hours'),
(25.00, 68.50, 38.80, false, NOW() - INTERVAL '25 hours'),
(26.80, 65.00, 38.00, false, NOW() - INTERVAL '24 hours'),
(28.50, 61.50, 37.20, false, NOW() - INTERVAL '23 hours'),
(30.00, 58.00, 36.00, false, NOW() - INTERVAL '22 hours'),
(31.20, 55.00, 34.50, false, NOW() - INTERVAL '21 hours'),
(32.50, 52.50, 32.80, true, NOW() - INTERVAL '20 hours'),  -- Motor ON

-- Day 3 - Afternoon
(33.00, 51.00, 42.00, true, NOW() - INTERVAL '19 hours'),
(33.50, 49.50, 50.50, false, NOW() - INTERVAL '18 hours'),  -- Motor OFF
(34.00, 48.00, 49.00, false, NOW() - INTERVAL '17 hours'),
(34.20, 47.00, 47.50, false, NOW() - INTERVAL '16 hours'),
(34.50, 46.00, 46.00, false, NOW() - INTERVAL '15 hours'),
(34.00, 47.50, 44.80, false, NOW() - INTERVAL '14 hours'),
(33.20, 49.00, 43.50, false, NOW() - INTERVAL '13 hours'),
(32.00, 51.50, 42.20, false, NOW() - INTERVAL '12 hours'),
(30.50, 54.00, 41.00, false, NOW() - INTERVAL '11 hours'),
(29.00, 57.00, 40.00, false, NOW() - INTERVAL '10 hours'),

-- Recent hours (Today)
(27.50, 60.50, 39.00, false, NOW() - INTERVAL '9 hours'),
(26.00, 64.00, 38.20, false, NOW() - INTERVAL '8 hours'),
(24.50, 67.50, 37.50, false, NOW() - INTERVAL '7 hours'),
(23.20, 70.50, 36.80, false, NOW() - INTERVAL '6 hours'),
(22.00, 73.00, 36.00, false, NOW() - INTERVAL '5 hours'),
(21.00, 75.50, 35.50, false, NOW() - INTERVAL '4 hours'),
(20.20, 77.50, 35.00, false, NOW() - INTERVAL '3 hours'),
(19.50, 79.00, 34.50, false, NOW() - INTERVAL '2 hours'),
(19.00, 80.00, 34.00, true, NOW() - INTERVAL '1 hour'),   -- Motor ON (recent low moisture)
(26.50, 68.50, 42.00, false, NOW());                       -- Current reading

-- ============================================
-- SAMPLE ALERTS (Optional)
-- ============================================
-- Uncomment below to add sample alerts
-- Note: These require a valid user_id from your profiles table

/*
INSERT INTO alerts (user_id, type, severity, title, message, sensor_value, threshold_value, is_read, created_at)
SELECT 
    id as user_id,
    'low_moisture',
    'warning',
    'Low Soil Moisture Alert',
    'Soil moisture dropped to 31.5%. Irrigation has been triggered automatically.',
    31.50,
    30.00,
    false,
    NOW() - INTERVAL '91 hours'
FROM profiles LIMIT 1;

INSERT INTO alerts (user_id, type, severity, title, message, sensor_value, threshold_value, is_read, created_at)
SELECT 
    id as user_id,
    'high_temp',
    'warning',
    'High Temperature Warning',
    'Temperature reached 35°C. Consider additional shade or irrigation for heat-sensitive crops.',
    35.00,
    35.00,
    true,
    NOW() - INTERVAL '51 hours'
FROM profiles LIMIT 1;

INSERT INTO alerts (user_id, type, severity, title, message, is_read, created_at)
SELECT 
    id as user_id,
    'recommendation',
    'info',
    'Optimal Planting Conditions',
    'Current conditions are ideal for planting tomatoes, peppers, and spinach. Soil moisture and temperature are within optimal ranges.',
    false,
    NOW() - INTERVAL '24 hours'
FROM profiles LIMIT 1;
*/

-- ============================================
-- Verify the data was inserted
-- ============================================
SELECT 
    COUNT(*) as total_records,
    MIN(inserted_at) as earliest_reading,
    MAX(inserted_at) as latest_reading,
    AVG(temperature)::DECIMAL(5,2) as avg_temp,
    AVG(humidity)::DECIMAL(5,2) as avg_humidity,
    AVG(moisture)::DECIMAL(5,2) as avg_moisture
FROM sensordata;
