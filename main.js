const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const fs = require('node:fs');

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

// ipcMain.handle('getimg',(event,args)=>{
//   var filelist;
//   fs.readdir(path.join(__dirname, 'img'),(err,files)=>{
//     if(err){
//       console.log(err);
//       return;
//     }
//     console.log(`Files:\n${files}`);
//     return;
//   });
//   console.log(`filelist:\n${filelist}`);
//   return filelist
// })
ipcMain.handle('getimg', (event, args) => {
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
