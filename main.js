const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const fs = require('node:fs');
const { stringify } = require('node:querystring');

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences:{
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.maximize()

  win.loadFile('index.html');
};
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// get images from directory
ipcMain.handle('getImg', (event, args) => {
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, 'img'), (err, files) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      console.log(`Files:\n${files}`);
      resolve(files);
    });
  });
});

// update json file
ipcMain.handle('goJson', (event, args) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, 'tasklist.json'), JSON.stringify(args), (err) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      resolve('success');
    });
  });
});
// get json file
ipcMain.handle('getJson', (event, args) => {
  return new Promise((resolve, reject) => {
    fs.readFile(path.join(__dirname, 'tasklist.json'), (err, data) => {
      if (err) {
        console.log(err);
        reject(err);
        return;
      }
      console.log(`Data:\n[${data}]`);
      if(data==''||data=="{}"){
        resolve(null);
        return;
      }
      resolve(JSON.parse(data));
    });
  });
});