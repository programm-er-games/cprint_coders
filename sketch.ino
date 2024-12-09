#include <WiFi.h>
#include <WebSocketsClient.h>
#include <NewPing.h>

// Настройки Wi-Fi
const char* ssid = "your-SSID";
const char* password = "your-PASSWORD";

// Настройки WebSocket
const char* ws_host = "192.168.1.100"; // Замените на IP вашего сервера (Electron.js)
const int ws_port = 8080;
WebSocketsClient webSocket;

bool isManual = true;

// Настройки датчиков и лампы
#define PHOTORESISTOR_PIN 34
#define TRIG_PIN 27
#define ECHO_PIN 26
#define MAX_DISTANCE 200
#define LED_PIN 25

// Инициализация ультразвукового датчика
NewPing sonar(TRIG_PIN, ECHO_PIN, MAX_DISTANCE);

// Функция для подключения к Wi-Fi
void connectToWiFi() {
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi connected");
  Serial.println("IP address: " + WiFi.localIP().toString());
}

// Обработка сообщений WebSocket
void handleWebSocketMessage(WStype_t type, uint8_t *payload, size_t length) {
  if (type == WStype_TEXT) {
    String message = String((char*)payload);
    Serial.println("Message received: " + message);

    // Обработка команд
    if (message.startsWith("SET_LED")) {
      int brightness = message.substring(8).toInt();
      if (isManual) analogWrite(LED_PIN, map(brightness, 0, 100, 0, 255));
      Serial.println("LED brightness set to " + String(brightness) + "%");
    }
    else if (message.startsWith("IS_MANUAL")) {
      isManual = message.substring(8).toInt() == 1 ? true : false;
    }
  }
}

// Отправка данных о датчиках через WebSocket
void sendSensorData() {
  int lightLevel = analogRead(PHOTORESISTOR_PIN);
  int distance = sonar.ping_cm();
  if (!isManual) analogWrite(LED_PIN, 255 - lightLevel);

  String sensorData = "{\"lightLevel\": " + String(lightLevel) + 
                      ", \"distance\": " + String(distance) + "}";
  webSocket.sendTXT(sensorData);
  Serial.println("Sent data: " + sensorData);
}

void setup() {
  Serial.begin(115200);
  pinMode(LED_PIN, OUTPUT);

  connectToWiFi();

  // Настройка WebSocket
  webSocket.begin(ws_host, ws_port, "/");
  webSocket.onEvent(handleWebSocketMessage);
  webSocket.setReconnectInterval(5000); // Попытка переподключения каждые 5 секунд

  Serial.println("WebSocket initialized");
}

void loop() {
  webSocket.loop(); // Обработка WebSocket событий

  static unsigned long lastSendTime = 0;
  if (millis() - lastSendTime > 2000) { // Отправка данных каждые 2 секунды
    sendSensorData();
    lastSendTime = millis();
  }
}
