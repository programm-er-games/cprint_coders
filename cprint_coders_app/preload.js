const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.invoke("connect_db");
ipcRenderer.invoke("db-start");

contextBridge.exposeInMainWorld('ws_api', {
    sendMessage: (type, data) => {
        ws.send(JSON.stringify({ type, data }));
    },
    onMessage: (callback) => {
        ws.onmessage = (event) => {
            callback(JSON.parse(event.data));
        };
    },
});

contextBridge.exposeInMainWorld('db_api', {
    login: async (username, password) => {
        return await ipcRenderer.invoke("check_login", username, password);
    },
});

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('app-quit')
});