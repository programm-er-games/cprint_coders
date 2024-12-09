const { contextBridge, ipcRenderer } = require('electron');

const empty_space = 20;
let people_counter = 0;

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
            return result === undefined ? -1 : result;
        });
    },
    get_people: () => {
        ipcRenderer.invoke("get_distance").then((result) => {
            if (result < empty_space) people_counter++;
            else if (result >= empty_space) people_counter--;
            if (people_counter < 0) people_counter = 0;
            return people_counter;
        });
    },
    get_light: () => {
        ipcRenderer.invoke("get_light").then((result) => {
            return result;
        });
    },
});

contextBridge.exposeInMainWorld('electronAPI', {
    quitApp: () => ipcRenderer.send('app-quit')
});