const path    = require('path');
const fs      = require('fs').promises;

async function convertToBase64(pathImage) {
    const filename = path.basename(pathImage);
    const contents = await fs.readFile(pathImage, {encoding: 'base64'});
    const ext = filename.split('.').pop();

    return `data:image/${ext};base64,${contents}`;
}

function clearDirectory(tempDirectory) {
    fs.readdir(path.join(__dirname, tempDirectory), (err, fileList) => {
        if (err) throw err;

        for (const currentFile of fileList) {
            if(currentFile === '.gitkeep') continue;
            fs.unlink(path.join(__dirname, tempDirectory, currentFile), err => {
                if (err) throw err;
            });
        }
    });
}

module.exports = {
    convertToBase64,
    clearDirectory
};
