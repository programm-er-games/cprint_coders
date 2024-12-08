const { app, BrowserWindow, ipcMain } = require('electron');
const WebSocket = require('ws');
const sqlite3 = require('sqlite-electron');
const path = require('path');

// Путь к базе данных
const DB_PATH = path.join(__dirname, 'app', 'database.db');

ipcMain.handle("connect_db", async (event) => {
    console.log("DB connected!");
    return await sqlite3.setdbPath(DB_PATH);
});

ipcMain.handle("db-start", async (event) => {
    let query = "CREATE TABLE IF NOT EXIST admins (" +
        "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
        "username TEXT NOT NULL" +
        "password TEXT NOT NULL" +
        ");";
    if (!(await sqlite3.executeQuery(query))) return "error in CREATE!";
    query = "INSERT OR IGNORE admins (username, password) VALUES (?, ?);";
    if (!(await sqlite3.executeQuery(query, ["admin", "qwe123"]))) return "error in INSERT!";
    console.log("DB struct restored!");
    return true;
});

ipcMain.handle("check_login", async (event, username, password) => {
    const query = "SELECT * FROM admins WHERE username == ? AND password == ?;";
    const result = await sqlite3.executeQuery(query, [username, password]);
    console.log("result: ");
    console.log(result);
    return result === true ? true : false;
});

// Создание главного окна
let mainWindow;
app.on('ready', () => {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false
        },
    });

    mainWindow.loadFile('index.html'); // Фронтенд
});

// Закрытие приложения
app.on('window-all-closed', () => {
    app.quit();
});

// WebSocket сервер
const wss = new WebSocket.Server({ port: 8080 });
console.log('WebSocket server started on ws://localhost:8080');

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', (message) => {
        const { type, data } = JSON.parse(message);
    });
});
