const { contextBridge, ipcRenderer } = require('electron');

ipcRenderer.invoke("console-out", ipcRenderer.invoke("connect_db"));
ipcRenderer.invoke("console-out", ipcRenderer.invoke("db_start"));

contextBridge.exposeInMainWorld('api', {
    login: async (username, password) => {
        return await ipcRenderer.invoke("check_login", username, password);
    },
    set_bright: (value) => {
        ipcRenderer.invoke("set_bright", value);
    },
    set_mode: (value) => {
        ipcRenderer.invoke("set_isManual", value);
    },
    get_bright: () => {
        ipcRenderer.invoke("get_bright").then((result) => {
            return result;
        });
    },
    get_people: () => {
        // ...
    },
    get_light: () => {
        ipcRenderer.invoke("get_bright").then((result) => {
            return result;
        });
    },
});

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('app-quit')
});