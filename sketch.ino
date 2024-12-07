#include <WiFi.h>
#include <WebServer.h>
#include <sqlite3.h>
#include <SPIFFS.h>
#include <html_strings.h>

// Настройки Wi-Fi
const char* ssid = "Redmi 10C";
const char* password = "qpwolwhsh";

// Настройки базы данных SQLite
#define DB_PATH "/spiffs/database.db"

// Пины для датчиков и лампочки
#define LIGHT_SENSOR_PIN 34
#define PROXIMITY_SENSOR_PIN 35
#define LED_PIN 25

// Веб-сервер на ESP32
WebServer server(80);

// Глобальные переменные
bool isAuthenticated = false;
sqlite3 *db;

// Настройка SPIFFS для работы с базой данных
void initSPIFFS() {
  if (!SPIFFS.begin(true)) {
    Serial.println("SPIFFS initialization failed!");
    while (true);
  }
  if (!SPIFFS.exists(DB_PATH)) {
    createDatabase();
  }
}

// Создание базы данных SQLite
void createDatabase() {
  if (sqlite3_open(DB_PATH, &db) == SQLITE_OK) {
    const char *sql = "CREATE TABLE IF NOT EXISTS users ("
                      "id INTEGER PRIMARY KEY AUTOINCREMENT, "
                      "username TEXT NOT NULL, "
                      "password TEXT NOT NULL);";
    char *errMsg;
    if (sqlite3_exec(db, sql, NULL, NULL, &errMsg) != SQLITE_OK) {
      Serial.printf("SQL error: %s\n", errMsg);
      sqlite3_free(errMsg);
    } else {
      Serial.println("Database and table created");

      // Добавляем тестового пользователя
      const char *insert_sql = "INSERT INTO users (username, password) VALUES ('admin', '1234');";
      sqlite3_exec(db, insert_sql, NULL, NULL, NULL);
    }
    sqlite3_close(db);
  } else {
    Serial.println("Failed to open database");
  }
}

// Авторизация пользователя
bool authenticateUser(String username, String password) {
  if (sqlite3_open(DB_PATH, &db) == SQLITE_OK) {
    String sql = "SELECT * FROM users WHERE username = '" + username + "' AND password = '" + password + "';";
    sqlite3_stmt *stmt;
    bool authenticated = false;

    if (sqlite3_prepare_v2(db, sql.c_str(), -1, &stmt, NULL) == SQLITE_OK) {
      if (sqlite3_step(stmt) == SQLITE_ROW) {
        authenticated = true;
      }
    }
    sqlite3_finalize(stmt);
    sqlite3_close(db);
    return authenticated;
  }
  return false;
}

// Главная страница
void handleMainPage() {
  server.send(200, "text/html", main_page);
}

// Страница авторизации
void handleLoginPage() {
  server.send(200, "text/html", login);
}

// Логин
void handleLogin() {
  if (server.hasArg("username") && server.hasArg("password")) {
    String username = server.arg("username");
    String password = server.arg("password");

    if (authenticateUser(username, password)) {
      isAuthenticated = true;
      server.sendHeader("Location", "/main");
      server.send(302);
    } else {
      isAuthenticated = false;
      server.send(403, "text/plain", "Invalid credentials");
    }
  } else {
    server.send(400, "text/plain", "Bad Request");
  }
}

// Установка яркости лампочки
void handleSetBrightness() {
  if (!isAuthenticated) {
    server.send(403, "text/plain", "Unauthorized");
    return;
  }
  if (server.hasArg("brightness")) {
    int brightness = server.arg("brightness").toInt();
    int pwmValue = map(brightness, 0, 100, 0, 255);
    analogWrite(LED_PIN, pwmValue);
    server.send(200, "text/plain", "Brightness updated");
  } else {
    server.send(400, "text/plain", "Bad Request");
  }
}

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWi-Fi connected");

  initSPIFFS();

  server.on("/", handleLoginPage);
  server.on("/login", handleLogin);
  server.on("/main", handleMainPage);
  server.on("/setBrightness", handleSetBrightness);

  pinMode(LED_PIN, OUTPUT);

  server.begin();
}

void loop() {
  server.handleClient();
}
