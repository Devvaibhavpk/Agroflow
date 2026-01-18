/*
 * Agroflow ESP32 Firmware
 * 
 * Connects to WiFi and sends sensor data to Supabase backend
 * 
 * Hardware Required:
 * - ESP32 Development Board
 * - DHT22 Temperature/Humidity Sensor (GPIO 4)
 * - Soil Moisture Sensor (GPIO 34 - Analog)
 * - Relay Module for Pump Control (GPIO 26)
 * 
 * Libraries Required (install via Arduino Library Manager):
 * - DHT sensor library by Adafruit
 * - ArduinoJson by Benoit Blanchon
 * - HTTPClient (built-in for ESP32)
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <DHT.h>

// ============================================
// CONFIGURATION - UPDATE THESE VALUES
// ============================================

// WiFi Credentials
const char* WIFI_SSID = "YOUR_WIFI_SSID";
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";

// Supabase Configuration
const char* SUPABASE_URL = "https://YOUR_PROJECT_ID.supabase.co";
const char* SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const char* SUPABASE_TABLE = "sensor_data";

// ============================================
// PIN DEFINITIONS
// ============================================

#define DHT_PIN 4           // DHT22 data pin
#define MOISTURE_PIN 34     // Soil moisture sensor (analog)
#define RELAY_PIN 26        // Relay for water pump
#define LED_PIN 2           // Built-in LED for status

#define DHT_TYPE DHT22      // DHT sensor type

// ============================================
// TIMING CONFIGURATION
// ============================================

const unsigned long SEND_INTERVAL = 30000;   // Send data every 30 seconds
const unsigned long WIFI_TIMEOUT = 20000;    // WiFi connection timeout

// ============================================
// GLOBAL VARIABLES
// ============================================

DHT dht(DHT_PIN, DHT_TYPE);
unsigned long lastSendTime = 0;
bool motorState = false;

// Moisture thresholds for auto-irrigation
const int MOISTURE_LOW = 30;   // Turn on pump below this
const int MOISTURE_HIGH = 70;  // Turn off pump above this

// ============================================
// SETUP
// ============================================

void setup() {
  Serial.begin(115200);
  Serial.println("\n\n=================================");
  Serial.println("   Agroflow ESP32 Firmware v1.0");
  Serial.println("=================================\n");

  // Initialize pins
  pinMode(LED_PIN, OUTPUT);
  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, LOW);  // Pump off initially
  
  // Initialize DHT sensor
  dht.begin();
  Serial.println("✓ DHT22 sensor initialized");

  // Connect to WiFi
  connectWiFi();
}

// ============================================
// MAIN LOOP
// ============================================

void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ WiFi disconnected. Reconnecting...");
    connectWiFi();
  }

  // Send data at intervals
  if (millis() - lastSendTime >= SEND_INTERVAL) {
    lastSendTime = millis();
    
    // Read sensors
    float temperature = dht.readTemperature();
    float humidity = dht.readHumidity();
    int moistureRaw = analogRead(MOISTURE_PIN);
    float moisture = map(moistureRaw, 4095, 0, 0, 100);  // Convert to percentage

    // Validate readings
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("✗ Failed to read from DHT sensor!");
      blinkLED(5, 100);  // Error blink
      return;
    }

    // Auto-irrigation logic
    if (moisture < MOISTURE_LOW && !motorState) {
      motorState = true;
      digitalWrite(RELAY_PIN, HIGH);
      Serial.println("🚿 Pump turned ON (low moisture)");
    } else if (moisture > MOISTURE_HIGH && motorState) {
      motorState = false;
      digitalWrite(RELAY_PIN, LOW);
      Serial.println("🚿 Pump turned OFF (adequate moisture)");
    }

    // Print readings
    Serial.println("\n📊 Sensor Readings:");
    Serial.printf("   🌡 Temperature: %.2f °C\n", temperature);
    Serial.printf("   💧 Humidity: %.2f %%\n", humidity);
    Serial.printf("   🌱 Soil Moisture: %.2f %%\n", moisture);
    Serial.printf("   🚿 Pump Status: %s\n", motorState ? "ON" : "OFF");

    // Send to Supabase
    if (sendToSupabase(temperature, humidity, moisture, motorState)) {
      Serial.println("✓ Data sent to Supabase successfully!");
      blinkLED(2, 200);  // Success blink
    } else {
      Serial.println("✗ Failed to send data to Supabase");
      blinkLED(5, 100);  // Error blink
    }
  }

  delay(100);  // Small delay to prevent watchdog issues
}

// ============================================
// WIFI CONNECTION
// ============================================

void connectWiFi() {
  Serial.printf("Connecting to WiFi: %s", WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  unsigned long startTime = millis();
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(LED_PIN, !digitalRead(LED_PIN));  // Blink while connecting

    if (millis() - startTime > WIFI_TIMEOUT) {
      Serial.println("\n✗ WiFi connection timeout! Restarting...");
      ESP.restart();
    }
  }

  digitalWrite(LED_PIN, HIGH);
  Serial.println("\n✓ WiFi connected!");
  Serial.printf("   IP Address: %s\n", WiFi.localIP().toString().c_str());
  Serial.printf("   Signal Strength: %d dBm\n\n", WiFi.RSSI());
}

// ============================================
// SUPABASE API
// ============================================

bool sendToSupabase(float temperature, float humidity, float moisture, bool motor) {
  if (WiFi.status() != WL_CONNECTED) {
    return false;
  }

  HTTPClient http;
  
  // Build URL
  String url = String(SUPABASE_URL) + "/rest/v1/" + SUPABASE_TABLE;
  
  http.begin(url);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("apikey", SUPABASE_ANON_KEY);
  http.addHeader("Authorization", "Bearer " + String(SUPABASE_ANON_KEY));
  http.addHeader("Prefer", "return=minimal");

  // Create JSON payload
  StaticJsonDocument<200> doc;
  doc["temperature"] = round(temperature * 100) / 100.0;
  doc["humidity"] = round(humidity * 100) / 100.0;
  doc["moisture"] = round(moisture * 100) / 100.0;
  doc["motor_state"] = motor;

  String jsonPayload;
  serializeJson(doc, jsonPayload);

  Serial.printf("📤 Sending: %s\n", jsonPayload.c_str());

  // Send POST request
  int httpCode = http.POST(jsonPayload);

  if (httpCode > 0) {
    Serial.printf("   HTTP Response: %d\n", httpCode);
    if (httpCode == HTTP_CODE_CREATED || httpCode == HTTP_CODE_OK || httpCode == 201) {
      http.end();
      return true;
    }
  } else {
    Serial.printf("   HTTP Error: %s\n", http.errorToString(httpCode).c_str());
  }

  http.end();
  return false;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

void blinkLED(int times, int delayMs) {
  for (int i = 0; i < times; i++) {
    digitalWrite(LED_PIN, HIGH);
    delay(delayMs);
    digitalWrite(LED_PIN, LOW);
    delay(delayMs);
  }
}

// ============================================
// MANUAL PUMP CONTROL (for future use)
// ============================================

void setPumpState(bool state) {
  motorState = state;
  digitalWrite(RELAY_PIN, state ? HIGH : LOW);
  Serial.printf("🚿 Pump manually set to: %s\n", state ? "ON" : "OFF");
}
