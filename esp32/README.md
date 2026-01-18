# Agroflow ESP32 Firmware

This folder contains the ESP32 firmware for the Agroflow IoT smart irrigation system.

## Hardware Requirements

| Component | Quantity | Description |
|-----------|----------|-------------|
| ESP32 DevKit | 1 | Main microcontroller |
| DHT22 | 1 | Temperature & Humidity sensor |
| Soil Moisture Sensor | 1 | Capacitive preferred |
| 5V Relay Module | 1 | For water pump control |
| Water Pump (optional) | 1 | 5V or 12V DC pump |
| Jumper Wires | - | For connections |

## Wiring Diagram

```
ESP32 Pin   →   Component
─────────────────────────────────
GPIO 4      →   DHT22 Data Pin
GPIO 34     →   Soil Moisture Sensor (Analog OUT)
GPIO 26     →   Relay IN (Pump Control)
3.3V        →   DHT22 VCC, Moisture Sensor VCC
GND         →   DHT22 GND, Moisture Sensor GND, Relay GND
VIN (5V)    →   Relay VCC
```

## Software Setup

### 1. Install Arduino IDE
Download from: https://www.arduino.cc/en/software

### 2. Add ESP32 Board Support
1. Open Arduino IDE → File → Preferences
2. Add this URL to "Additional Boards Manager URLs":
   ```
   https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
   ```
3. Go to Tools → Board → Boards Manager
4. Search "esp32" and install "ESP32 by Espressif Systems"

### 3. Install Required Libraries
Go to Sketch → Include Library → Manage Libraries and install:
- **DHT sensor library** by Adafruit
- **ArduinoJson** by Benoit Blanchon

### 4. Configure the Firmware
Open `agroflow_firmware.ino` and update these values:

```cpp
// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Supabase Configuration (from your Supabase project settings)
const char* SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const char* SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

### 5. Upload to ESP32
1. Connect ESP32 via USB
2. Select board: Tools → Board → ESP32 Dev Module
3. Select port: Tools → Port → (your COM port)
4. Click Upload (→)

## Features

✅ **WiFi Auto-Reconnect** - Automatically reconnects if connection drops

✅ **Real-time Sensor Reading** - Temperature, humidity, and soil moisture

✅ **Auto-Irrigation** - Turns pump on/off based on moisture thresholds

✅ **Supabase Integration** - Sends data via REST API

✅ **LED Status Indicators** - Visual feedback for connection and data status

## Configuration Options

```cpp
// Timing
const unsigned long SEND_INTERVAL = 30000;   // Send every 30 seconds

// Moisture Thresholds (adjust for your soil type)
const int MOISTURE_LOW = 30;   // Turn ON pump below this %
const int MOISTURE_HIGH = 70;  // Turn OFF pump above this %
```

## Serial Monitor Output

Open Serial Monitor at 115200 baud to see:

```
=================================
   Agroflow ESP32 Firmware v1.0
=================================

✓ DHT22 sensor initialized
Connecting to WiFi: MyWiFi....
✓ WiFi connected!
   IP Address: 192.168.1.100
   Signal Strength: -45 dBm

📊 Sensor Readings:
   🌡 Temperature: 28.50 °C
   💧 Humidity: 65.00 %
   🌱 Soil Moisture: 42.00 %
   🚿 Pump Status: OFF

📤 Sending: {"temperature":28.50,"humidity":65.00,"moisture":42.00,"motor_state":false}
   HTTP Response: 201
✓ Data sent to Supabase successfully!
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| WiFi not connecting | Check SSID/password, ensure 2.4GHz network |
| DHT read fails | Check wiring, add 10k pull-up resistor |
| Supabase errors | Verify URL and API key, check table exists |
| Moisture always 0 or 100 | Calibrate sensor, check analog pin |

## Database Schema

Make sure this table exists in your Supabase project:

```sql
CREATE TABLE sensor_data (
  id SERIAL PRIMARY KEY,
  temperature DECIMAL(5,2),
  humidity DECIMAL(5,2),
  moisture DECIMAL(5,2),
  motor_state BOOLEAN DEFAULT false,
  inserted_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable public insert
ALTER TABLE sensor_data ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON sensor_data FOR INSERT WITH CHECK (true);
```

## License

MIT License - Part of the Agroflow project

GitHub: https://github.com/Devvaibhavpk/Agroflow
