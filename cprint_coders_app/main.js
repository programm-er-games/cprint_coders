const { app, BrowserWindow, ipcMain } = require('electron');
const WebSocket = require('ws');
const sqlite3 = require('sqlite-electron');
const path = require('path');

// Путь к базе данных
const dbPath = path.join(__dirname, 'app', 'database.db');
let distance;
let light;
let bright;
let mainWindow;

ipcMain.handle("console-out", (event, to_print, from = "preload.js") => {
    console.log("GET FROM " + from.toUpperCase() + ":", to_print);
});

ipcMain.handle("connect_db", async (event) => {
    console.log("DB connected!");
    return await sqlite3.setdbPath(dbPath);
});

ipcMain.handle("db_start", async (event) => {
    try {
        let query = "CREATE TABLE IF NOT EXISTS admins (" +
            "id INTEGER PRIMARY KEY AUTOINCREMENT, " +
            "username TEXT NOT NULL, " +
            "password TEXT NOT NULL" +
            ");";
        if (!(await sqlite3.executeQuery(query))) return "error in CREATE!";
        query = "CREATE TABLE IF NOT EXISTS settings (" +
            "brightness TEXT NOT NULL" +
            ");";
        if (!(await sqlite3.executeQuery(query))) return "error in CREATE!";
        query = "INSERT OR IGNORE INTO admins (username, password) VALUES (?, ?);";
        if (!(await sqlite3.executeQuery(query, ["admin", "qwe123"]))) return "error in INSERT!";
        console.log("DB struct restored!");
        return true;
    }
    catch (err) {
        console.log(err);
    }
});

ipcMain.handle("check_login", async (event, username, password) => {
    const query = "SELECT * FROM admins WHERE username == ? AND password == ?;";
    const result = await sqlite3.fetchAll(query, [username, password]);
    console.log("result: ");
    console.log(result);
    return result ? true : false;
});

ipcMain.handle("get_bright", (event) => {
    return bright;
});

ipcMain.handle("get_light", (event) => {
    return light;
});

ipcMain.handle("get_distance", (event) => {
    return distance;
});

// Создание главного окна

app.on('ready', () => {
    mainWindow = new BrowserWindow({
        fullscreen: true,
        icon: path.join(__dirname, 'image', 'favicon-96x96.png'),
        title: "LIGHT4U",
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false,
            enableRemoteModule: false,
        },
    });

    const { Menu } = require('electron');
    Menu.setApplicationMenu(null);
    mainWindow.loadFile(path.join(__dirname, 'page', 'index.html'));
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
        try {
            if (data.command === 'SENSOR_DATA') {
                console.log(`Received sensor data: Bright=${data.brightLevel}, Light=${data.lightLevel}, Distance=${data.distance}`);
                bright = data.brightLevel;
                light = data.lightLevel;
                distance = data.distance;
                ws.send(JSON.stringify({ status: 'success', message: 'Sensor data received' }));
            }
        } catch (err) {
            console.error('Invalid message received:', message);
            ws.send(JSON.stringify({ status: 'error', message: 'Invalid data format' }));
        }
        ipcMain.handle("set_bright", (event, value) => {
            ws.send(JSON.stringify({ command: 'SET_LED', value: value }));
        });
        ipcMain.handle("set_isManual", (event, value) => {
            ws.send(JSON.stringify({ command: 'IS_MANUAL', value: value === false ? 0 : 1 }));
        });
    });
});

ipcMain.on('app-quit', () => {
    app.quit();
});