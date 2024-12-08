const { remote, contextBridge } = require('electron');
const WebSocket = require('ws');

// Инициализация WebSocket
const ws = new WebSocket('ws://localhost:8080');

// Интерфейс для рендера
contextBridge.exposeInMainWorld('api', {
  sendMessage: (type, data) => {
    ws.send(JSON.stringify({ type, data }));
  },
  onMessage: (callback) => {
    ws.onmessage = (event) => {
      callback(JSON.parse(event.data));
    };
  },
});

document.getElementById('logout').addEventListener('click', function(event) {
    event.preventDefault(); // Отключаем стандартное поведение ссылки

    let window = remote.getCurrentWindow(); // Получаем текущее окно
    window.close(); // Закрываем его
});
