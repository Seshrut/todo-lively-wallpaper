const { app, BrowserWindow, ipcMain } = require('electron/main');
const path = require('node:path');
const fs = require('node:fs');
const Store = require('electron-store');
if(require('electron-squirrel-startup'))app.quit()
const store = new Store();
var URI = "http://localhost:8080";
var unsynced;// [{body:___,type:___}]
var win;
var login;
const createWindow = () => {
   win = new BrowserWindow({
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
const createloginwindow = () => {
  return new Promise((resolve, reject) => {
    login = new BrowserWindow({
      width: 800,
      height: 600,
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    });

    login.loadFile('./login/login.html');

    // Listen for token from login window
    ipcMain.once('login-success', (event, token) => {
      store.set('token', token); // store if needed
      login.close();
      resolve(token);
    });

    // Optional: listen for login failure
    ipcMain.once('login-failed', () => {
      // login.close();
      reject("Login failed");
    });
  });
};
app.on('window-all-closed', () => {
  store.delete('token'); // this can be removed later when making exe
//   store.delete('unsynced'); // this WAS just for testing login
  if (process.platform !== 'darwin') app.quit();
});
function checkConnectivity(){
    return new Promise((resolve, reject) => {
        fetch(`${URI}/ping`,{
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(response => response.json())
        .then((data) => {
            if(data.message == "pong"){
                console.log("Connected to server");
                resolve(true);
            }
            else{
                console.log("Not connected to server");
                resolve(false);
            }
        })
        .catch(error => console.error(error))
    })
}

async function syncProcedure() {
    if(await checkConnectivity()){
        if(store.get('token')){
            fetch(`${URI}/whoami`,{
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${store.get('token')}`
                }
            })
            .then(response =>{return response.json()})
            .then(async(data) => {
                if(data.message == "invalid token"){
                    try{
                        let token = await createloginwindow();
                        store.set('token',token);
                    }
                    catch(error){
                        console.error(error);
                    }
                }
                else{
                    console.log("Token verified");
                }
            })
            .catch(error => console.error(error))
        }
        else{
            try{
                let token = await createloginwindow();
                store.set('token',token);
            }
            catch(error){
                console.error(error);
            }
        }
        // sync changes
        unsynced = store.get('unsynced');
        if(unsynced){
            var counter = 0;
            for(taskupd in unsynced){
                var success=false;
                if(unsynced[taskupd].type == "POST"){
                    success = POSTjson(JSON.stringify(unsynced[taskupd].body));
                }
                else if(unsynced[taskupd].type == "PATCH"){
                    success = PATCHjson(JSON.stringify(unsynced[taskupd].body));
                }
                else if(unsynced[taskupd].type == "DELETE"){
                    success = DELETEjson(JSON.stringify(unsynced[taskupd].body));
                }
                if(!success){break}
                counter++;
                store.delete('unsynced');
            }
            //remove starting 'counter' elements from the list
            for(var i = 0; i<counter;i++){
                unsynced.shift();
            }
            //store the new unsynced list
            store.set('unsynced',unsynced);
          }
          var newdata = await GETjson();
          win.webContents.send('login-success',newdata);
    }
    return;
}

app.whenReady().then(async() => {
    createWindow();
    await syncProcedure();
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

ipcMain.on('setURL',(event,uri)=>{
    if(uri&&uri!=URI){
        URI = uri;
        store.delete('token');
        store.delete('unsynced');
        try{
        login.close();
        }
        catch{
            //no login was open
        }
        syncProcedure();
    }
})

ipcMain.handle('getURL',(event,args)=>{
    return URI;
})

ipcMain.on('logout',(event, args)=>{
    store.delete('token');
    store.delete('unsynced');
    createloginwindow();
})

//GET task
function GETjson(){
    return new Promise((resolve, reject) => {
        fetch(`${URI}/task`,{
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.get('token')}`
            }
        })
        .then(response => response.json())
        .then((data) => {
            data = JSON.stringify(data);
            resolve(data);
        })
        .catch(error => {console.error(error);resolve(false)})
    })
}
ipcMain.handle('GETjson', async (event, args) => {
  return await GETjson();
})
// POST new task
function POSTjson(args){
    return new Promise((resolve, reject) => {
        fetch(`${URI}/task`,{
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.get('token')}`
            },
            body: JSON.stringify(JSON.parse(args))
        })
        .then(response => response.json())
        .then((data) => {
            console.log(data);
            resolve(true);
        })
        .catch(error => {console.error(error);resolve(false)})
    })
}
ipcMain.handle('POSTjson',async (event, args)=>{
    if(POSTjson(args))return true;
    else{
        if(store.get('unsynced')){
            store.set('unsynced', [...store.get('unsynced'), {body:JSON.parse(args),type:"POST"}]);
        }
        else{
            store.set('unsynced', [{body:JSON.parse(args),type:"POST"}]);
        }
        return false;
    }
})
// PATCH task
function PATCHjson(args){
    return new Promise((resolve, reject) => {
        fetch(`${URI}/task`,{
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.get('token')}`
            },
            body: JSON.stringify(JSON.parse(args))
        })
        .then(response => response.json())
        .then((data) => {
            console.log(data);
            resolve(true);
        })
        .catch(error => {console.error(error);resolve(false)})
    })
}
ipcMain.handle('PATCHjson',(event, args)=>{
    if(PATCHjson(args))return true;
    else{
        if(store.get('unsynced')){
            store.set('unsynced', [...store.get('unsynced'), {body:JSON.parse(args), type:"PATCH"}]);
        }
        else{
            store.set('unsynced', [{body:JSON.parse(args), type:"PATCH"}]);
        }
        return false;
    }
})
// DELETE task
function DELETEjson(args){
    return new Promise((resolve, reject) => {
        fetch(`${URI}/task`,{
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${store.get('token')}`
            },
            body: JSON.stringify(JSON.parse(args))
        })
        .then(response => response.json())
        .then((data) => {
            console.log(data);
            resolve(true);
        })
        .catch(error => {console.error(error);resolve(false)})
    })
}
ipcMain.handle("DELETEjson",(event, args)=>{
    if(DELETEjson(args))return true;
    else{
        if(store.get('unsynced')){
            store.set('unsynced', [...store.get('unsynced'), {body:JSON.parse(args), type:"DELETE"}]);
        }
        else{
            store.set('unsynced', [{body:JSON.parse(args), type:"DELETE"}]);
        }
        return false;
    }
})