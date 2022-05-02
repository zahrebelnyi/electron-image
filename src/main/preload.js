const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
    ipcRenderer: {
        sendMessage(channel, args) {
            ipcRenderer.send(channel, args);
        },
        on(channel, func) {
            const subscription = (_event, ...args) =>
                func(...args);
            ipcRenderer.on(channel, subscription);

            return () => ipcRenderer.removeListener(channel, subscription);
        },
        once(channel, func) {
            ipcRenderer.once(channel, (_event, ...args) => func(...args));
        }
    },
});

contextBridge.exposeInMainWorld('image', {
    upload: () => ipcRenderer.invoke('showDialog'),
    rotate: (angle, path, size) => ipcRenderer.invoke('rotate', angle, path, size),
});
