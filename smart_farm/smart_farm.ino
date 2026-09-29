#include <WiFi.h>
#include <HTTPClient.h>
#include <DHT.h>

// WIFI
const char* ssid = "!!!";
const char* password = "12345678";

// BACKEND
const char* serverName =
"http://10.89.70.62:5000/api/data";

// PINS
#define DHTPIN 4
#define DHTTYPE DHT11

#define SOIL_PIN 34
#define TDS_PIN 35
#define RELAY_PIN 26

DHT dht(DHTPIN, DHTTYPE);

// VARIABLES
float temperature = 0;
float humidity = 0;

int soilRaw = 0;
int soilPercent = 0;

int tdsRaw = 0;
float voltage = 0;
float tdsValue = 0;

float phValue = 7.0;

bool motorState = false;

// Calibration
int dryValue = 3500;
int wetValue = 1200;

// SETUP
void setup() {

  Serial.begin(115200);

  dht.begin();

  delay(3000);

  pinMode(RELAY_PIN, OUTPUT);
  digitalWrite(RELAY_PIN, HIGH);

  WiFi.begin(ssid, password);

Serial.print("Connecting WiFi");

while (WiFi.status() != WL_CONNECTED) {
  delay(1000);
  Serial.print(".");
}

Serial.println("\nWiFi Connected!");
Serial.print("ESP32 IP: ");
Serial.println(WiFi.localIP());
}

// LOOP
void loop() {

  if (WiFi.status() != WL_CONNECTED) {
    WiFi.begin(ssid, password);
    delay(5000);
    return;
  }

  // ===== DHT =====
  float t = dht.readTemperature();
  float h = dht.readHumidity();

  if (!isnan(t) && !isnan(h)) {
    temperature = t;
    humidity = h;
  } else {
    Serial.println("DHT ERROR");
    temperature = 0;
    humidity = 0;
  }

  // ===== SOIL =====
  soilRaw = analogRead(SOIL_PIN);

  soilPercent = map(soilRaw, wetValue, dryValue, 100, 0);
  soilPercent = constrain(soilPercent, 0, 100);

  // ===== TDS =====
  tdsRaw = analogRead(TDS_PIN);

  voltage = tdsRaw * (3.3 / 4095.0);

  tdsValue =
    (133.42 * voltage * voltage * voltage
    - 255.86 * voltage * voltage
    + 857.39 * voltage) * 0.5;

  float ec = tdsValue / 500.0;

  // ===== pH =====
  phValue = 7.0 + (tdsValue / 1000.0);

  // ===== NPK =====
  float n = tdsValue * 0.5;
  float p = tdsValue * 0.2;
  float k = tdsValue * 0.3;

  // ===== MOTOR =====
  if (soilPercent < 30) {
    digitalWrite(RELAY_PIN, LOW);
    motorState = true;
  } else {
    digitalWrite(RELAY_PIN, HIGH);
    motorState = false;
  }

  // ===== SEND DATA =====
  HTTPClient http;

  http.begin(serverName);
  http.addHeader("Content-Type", "application/json");

  String jsonData = "{";

  jsonData += "\"temperature\":" + String(temperature) + ",";
  jsonData += "\"humidity\":" + String(humidity) + ",";
  jsonData += "\"soilPercent\":" + String(soilPercent) + ",";
  jsonData += "\"tds\":" + String(tdsValue) + ",";
  jsonData += "\"ph\":" + String(phValue) + ",";
  jsonData += "\"n\":" + String(n) + ",";
  jsonData += "\"p\":" + String(p) + ",";
  jsonData += "\"k\":" + String(k) + ",";
  jsonData += "\"motor\":" + String(motorState ? 1 : 0);

  jsonData += "}";

  // 🔥 POST + DEBUG ADDED HERE
  int httpResponseCode = http.POST(jsonData);

  Serial.println("📤 Sending JSON:");
  Serial.println(jsonData);

  Serial.print("HTTP Code: ");
  Serial.println(httpResponseCode);

  String response = http.getString();
  Serial.print("Response: ");
  Serial.println(response);

  http.end();

  delay(5000);
}