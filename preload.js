const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('onstart',{
    getImg:async(args)=>{
        return ipcRenderer.invoke('getImg',args).then((result)=>{return result})
    },
    getURL:async ()=>ipcRenderer.invoke('getURL').then((result)=>{return result}),
    setURL:async(args)=>ipcRenderer.send('setURL', args),
    logout:async()=>ipcRenderer.send('logout')
});
contextBridge.exposeInMainWorld('updates',{
    GETjson:async(args)=>{
        return ipcRenderer.invoke('GETjson',args).then((result)=>{return result});
    },
    POSTjson:async(args)=>{
        return ipcRenderer.invoke('POSTjson',args).then((result)=>{return result});
    },
    PATCHjson:async(args)=>{
        return ipcRenderer.invoke('PATCHjson',args).then((result)=>{return result});
    },
    DELETEjson:async(args)=>{
        return ipcRenderer.invoke('DELETEjson',args).then((result)=>{return result});
    }
});

contextBridge.exposeInMainWorld('Login', {
  sendLoginSuccess: (args) => ipcRenderer.send('login-success', args),
  sendLoginFailed: (args) => ipcRenderer.send('login-failed',args),
  onLoginSuccess: (callback) => ipcRenderer.on('login-success', callback)
});
