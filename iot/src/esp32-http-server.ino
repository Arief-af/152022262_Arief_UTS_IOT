#include <DHT.h>
#include <WiFi.h>
#include <PubSubClient.h>
#include <ArduinoJson.h>

#define DHTPIN 8
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

#define LED_GREEN 5
#define LED_YELLOW 10
#define LED_RED 12
#define RELAY_PIN 7
#define BUZZER_PIN 9

const char* ssid = "Wokwi-GUEST";
const char* password = "";

const char* mqtt_server = "broker.hivemq.com";
const char* mqtt_topic = "uts/152022262";
const char* pump_topic = "uts/152022262/pomp";  
WiFiClient espClient;
PubSubClient client(espClient);

// Variable to track relay status
bool relayState = false;

void setup() {
    Serial.begin(115200);
    WiFi.begin(ssid, password);
    Serial.println("Connecting To WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    client.setServer(mqtt_server, 1883);
    client.setCallback(mqttCallback);  
    dht.begin();

    pinMode(LED_GREEN, OUTPUT);
    pinMode(LED_YELLOW, OUTPUT);
    pinMode(LED_RED, OUTPUT);
    pinMode(RELAY_PIN, OUTPUT);
    pinMode(BUZZER_PIN, OUTPUT);
}

void loop() {
    if (!client.connected()) {
        reconnect();
    }
    client.loop();
    
    // Read DHT sensor
    float humidity = dht.readHumidity();
    float temperature = dht.readTemperature();

    if (isnan(humidity) || isnan(temperature)) {
        Serial.println("Failed to read from DHT sensor!");
        return;
    }

    Serial.print("Suhu: ");
    Serial.print(temperature);
    Serial.print(" *C, Kelembapan: ");
    Serial.print(humidity);
    Serial.println(" %");

    // Publish data to the broker MQTT
    String payload = "{\"humidity\":" + String(humidity) + ", \"temperature\":" + String(temperature) + "}";
    client.publish(mqtt_topic, payload.c_str());

    if (relayState) {
        digitalWrite(RELAY_PIN, HIGH);
    } else {
        digitalWrite(RELAY_PIN, LOW);
    }

    if (temperature > 35) {
        digitalWrite(LED_RED, HIGH);
        digitalWrite(LED_YELLOW, LOW);
        digitalWrite(LED_GREEN, LOW);
        digitalWrite(BUZZER_PIN, HIGH);
    } 
    else if (temperature >= 30 && temperature <= 35) {
        digitalWrite(LED_RED, LOW);
        digitalWrite(LED_YELLOW, HIGH);
        digitalWrite(LED_GREEN, LOW);
        digitalWrite(BUZZER_PIN, LOW);
    } 
    else {
        digitalWrite(LED_RED, LOW);
        digitalWrite(LED_YELLOW, LOW);
        digitalWrite(LED_GREEN, HIGH);
        digitalWrite(BUZZER_PIN, LOW);
    }

    delay(5000);
}

void mqttCallback(char* topic, byte* payload, unsigned int length) {
    String message = "";
    for (unsigned int i = 0; i < length; i++) {
        message += (char)payload[i];
    }
    Serial.print("Received message: ");
    Serial.println(message);
    
    // Parse the JSON message
    DynamicJsonDocument doc(1024); 
    DeserializationError error = deserializeJson(doc, message);

    if (error) {
        Serial.print("JSON parsing failed: ");
        Serial.println(error.f_str());
        return;  
    }

    if (String(topic) == pump_topic) {
        bool popmpa = doc["popmpa"];  

        if (popmpa) {
            relayState = true;  
            Serial.println("Pompa aktifkan");
        } else {
            relayState = false;
            Serial.println("Pompa dimatikan");
        }
    }
}

void reconnect() {
    while (!client.connected()) {
        if (client.connect("Arief-152022262")) {
            Serial.println("Connected to MQTT broker");
            client.subscribe(pump_topic);
        } else {
            delay(5000);
        }
    }
}
