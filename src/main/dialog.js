const { dialog }                          = require("electron");
const fs                                  = require("fs");
const path                                = require("path");
const { convertToBase64, clearDirectory } = require("./utils");

class Dialog {
    ipcMain;
    mWindow;

    constructor(ipcMain, mWindow) {
        this.ipcMain = ipcMain;
        this.mWindow = mWindow;
    }

    addListenerShowDialog() {
        this.ipcMain.handle("showDialog", async (e, arg) => {
            try {
                const file = await dialog.showOpenDialog({
                    title: 'Select the Image to be uploaded',
                    buttonLabel: 'Upload',
                    filters: [
                        {
                            name: 'Image Files',
                            extensions: [ 'jpeg', 'png', 'jpg' ]
                        },
                    ],
                });

                if(!file.canceled) {
                    const currentFile = file.filePaths[0].toString();
                    const tempDirectory = '../temp/';
                    const filename = path.basename(currentFile);
                    const fullPath = path.resolve(path.join(__dirname, tempDirectory, filename));
                    clearDirectory(tempDirectory);

                    const readStream = fs.createReadStream(currentFile);
                    const writeStream = fs.createWriteStream(fullPath);
                    readStream.pipe(writeStream);

                    return new Promise((resolve, reject) => {
                        writeStream.on('finish', async () => {
                            const resp = await convertToBase64(fullPath);
                            this.mWindow.webContents.send('pathImage', resp, fullPath);
                            resolve();
                        });
                        writeStream.on('error', (data) => {
                            reject(data);
                        });
                    });
                }
            } catch (e) {
                console.log('ERR macOS', e);
            }
        });
    }
}

module.exports = Dialog;
