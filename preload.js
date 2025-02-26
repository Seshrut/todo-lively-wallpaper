const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('img',{
    get:async(args)=>{
        return ipcRenderer.invoke('getimg',args).then((result)=>{return result})
    }
});