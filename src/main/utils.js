const { URL } = require('url');
const path    = require('path');
const fs      = require('fs').promises;

let resolveHtmlPath;

if (process.env.NODE_ENV === 'development') {
    const port = process.env.PORT || 3000;
    resolveHtmlPath = (htmlFileName) => {
        const url = new URL(`http://localhost:${port}`);
        url.pathname = htmlFileName;
        return url.href;
    };
} else {
    resolveHtmlPath = (htmlFileName) => {
        return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
    };
}

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
            fs.unlink(path.join(__dirname, tempDirectory, currentFile), err => {
                if (err) throw err;
            });
        }
    });
}

module.exports = {
    resolveHtmlPath,
    convertToBase64,
    clearDirectory
};
