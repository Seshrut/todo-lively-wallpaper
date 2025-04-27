const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const fs = require('node:fs');
const Store = require('electron-store');
if(require('electron-squirrel-startup'))app.quit()
var location = path.join(process.env.APPDATA,'lively-todo');
const store = new Store();

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences:{
      preload: path.join(__dirname, 'preload.js')
    }
  });
  win.maximize()

  win.loadFile('index.html');
};
const createloginwindow=()=>{
  // open login page
  const login = new BrowserWindow({
    width: 800,
    height: 600,
    autoHideMenuBar: true,
    webPreferences:{
      preload: path.join(__dirname, 'preload.js')
    }
  });
  login.loadFile('./login/login.html');
}
app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
  if(!fs.existsSync(location)){
    fs.mkdirSync(location);
  }
  // login if no token or token expired
  if(!store.get('token')){
    createloginwindow();
  }
  else{
    // check if token is valid
    fetch("http://localhost:8080/whoami",{
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${store.get('token')}`
      }
    })
    .then(response => {return response.json()})
    .then(data => {
      if(data.message == "invalid token"){
        createloginwindow();
      }
    })
    .catch(error => {console.error(error);});
  }
});

app.on('window-all-closed', () => {
  store.delete('token'); // this can be removed later when proper token verification is added
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

// get token
ipcMain.handle('getToken', (event, args) => {
  store.set('token', args);
  console.log(store.get('token'));
});

// update json file
ipcMain.handle('goJson', (event, args) => {
  fetch("http://localhost:8080/task",{
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(JSON.parse(args))
  })
  .then(response =>{return response.json()})
  .then(data => {console.log(data);})
  .catch(error => {console.error(error);});
  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(location , 'tasklist.json'), JSON.stringify(args), (err) => {
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
  console.log(location)
  return new Promise((resolve, reject) => {
    fetch("http://localhost:8080/task",{
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      }
    })
    .then(response => {return response.json()})
    .then(data => {console.log(data);resolve(data)})
    .catch(error => {console.error(error);});
    if(!fs.existsSync(path.join(location, 'tasklist.json'))){
      fs.writeFile(path.join(location, 'tasklist.json'), '', (err) => {
        if (err) {
          console.log(err);
          reject(err);
          return;
        };
        resolve(null);
        return;
      });
    }
    fs.readFile(path.join(location, 'tasklist.json'), (err, data) => {
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