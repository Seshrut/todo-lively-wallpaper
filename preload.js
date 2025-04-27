const {contextBridge, ipcRenderer} = require('electron');
contextBridge.exposeInMainWorld('onstart',{
    getImg:async(args)=>{
        return ipcRenderer.invoke('getImg',args).then((result)=>{return result})
    }
});
contextBridge.exposeInMainWorld('updates',{
    goJson:async(args)=>{
        return ipcRenderer.invoke('goJson', args).then((result)=>{return result});
    },
    getJson:async(args)=>{
        return ipcRenderer.invoke('getJson', args).then((result)=>{return result});
    },
    getToken:async(args)=>{
        return ipcRenderer.invoke('getToken', args).then((result)=>{return result});
    }
});