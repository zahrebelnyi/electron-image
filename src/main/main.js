const { app, BrowserWindow, ipcMain, shell } = require('electron');
const { autoUpdater }                        = require('electron-updater');
const im                                     = require('imagemagick');
const log                                    = require('electron-log');
const path                                   = require('path');
const fs                                     = require('fs');
const { exec }                               = require('child_process');

const MenuBuilder                            = require('./menu');
const Dialog                                 = require('./dialog');
const { convertToBase64 }                    = require("./utils");

class AppUpdater {
    constructor() {
        log.transports.file.level = 'info';
        autoUpdater.logger = log;
        autoUpdater.checkForUpdatesAndNotify();
    }
}
const isDev = require('electron-is-dev');

let mainWindow = null;

const createWindow = () => {
    const RESOURCES_PATH = app.isPackaged
        ? path.join(process.resourcesPath, 'public')
        : path.join(__dirname, '../../public');

    const getAssetPath = (...paths) => {
        return path.join(RESOURCES_PATH, ...paths);
    };

    mainWindow = new BrowserWindow({
        show: false,
        width: 1024,
        height: 728,
        icon: getAssetPath('icon.png'),
        webPreferences: {
            nodeIntegration: true,
            preload:  path.join(__dirname, 'preload.js'),
        },
    });

    mainWindow.loadURL(isDev
        ? 'http://localhost:3000'
        : `file://${path.join(__dirname, '../build/index.html')}`);

    mainWindow.on('ready-to-show', () => {
        if (!mainWindow) {
            throw new Error('"mainWindow" is not defined');
        }
        if (process.env.START_MINIMIZED) {
            mainWindow.minimize();
        } else {
            mainWindow.show();
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    const menuBuilder = new MenuBuilder(mainWindow);
    menuBuilder.buildMenu();

    const instanceDialog = new Dialog(ipcMain, mainWindow);
    instanceDialog.addListenerShowDialog();

    mainWindow.webContents.setWindowOpenHandler((edata) => {
        shell.openExternal(edata.url);
        return { action: 'deny' };
    });

    new AppUpdater();
};

ipcMain.handle('rotate', (event, angle, path) => {
    if(!fs.existsSync(path)) {
        mainWindow.webContents.send('pathImage', '', 'File doesn\'t exist');
        return;
    }
    exec(`convert ${path} -distort SRT "%[fx:aa=${angle}*pi/180;(w*abs(sin(aa))+h*abs(cos(aa)))/min(w,h)], ${angle}" ${path}`, async (error, stdout, stderr) => {
        if (error) {
            console.error(`error: ${error.message}`);
            return;
        }

        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return;
        }

        const resp = await convertToBase64(path);

        mainWindow.webContents.send('pathImage',  resp, path);
    });
});


app.whenReady()
    .then(() => {
        createWindow();
        app.on('activate', () => {
            if (mainWindow === null) createWindow();
        });
    })
    .catch(console.log);

app.on('window-all-closed', () => {
    if(process.platform !== 'darwin') app.quit();
});
