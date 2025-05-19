
var tasklist = {'tasks':{},'comptasks':{}};


function genTaskID(){
    return `task${Date.now()}`;
}

document.addEventListener('DOMContentLoaded',async()=>{
    const addtaskbtn = document.getElementById('addtask');
    addtaskbtn.onclick = addnewtask;
});

window.Login.onLoginSuccess((event,data)=>{
    tasklist = JSON.parse(data);
    for(var donetasks in tasklist.tasks){
        addnewtask(null,id=donetasks, data=tasklist['tasks'][donetasks],done=false);
    }
    for(var donetasks in tasklist.comptasks){
        addnewtask(null,id=donetasks, data=tasklist['comptasks'][donetasks],done=true);
    }
})

function addnewtask(empty,id,data,done){
    /*
    empty is req as when this function is run by the "addtask" btn it passes a pointer object
    */
    var task = document.createElement('div');
    task.classList.add('task');
    var taskID;
    if(!id){
        taskID = genTaskID();
        task.id = taskID;
    }
    else{
        task.id = id;
        taskID = id;
    }
    // add txtarea
    var txtarea = document.createElement('textarea');
    txtarea.id = `${taskID}inp`;
    txtarea.classList.add('taskinp');
    txtarea.spellcheck = 'false';
    txtarea.placeholder = 'Enter Task';
    txtarea.addEventListener('change', ()=>change(txtarea));
    task.appendChild(txtarea);
    if(data)
    {
        txtarea.value = data;
    }
    // add checkbox
    var chkbox = document.createElement('button');
    chkbox.id = `${taskID}btn`;
    chkbox.classList.add('button');
    chkbox.classList.add('chkbx');
    chkbox.innerHTML = '▢';
    chkbox.addEventListener('click',()=>markasdone(chkbox,false));
    task.appendChild(chkbox);
    // add delete btn
    var delbtn = document.createElement('button');
    delbtn.id = `${taskID}del`;
    delbtn.classList.add('button');
    delbtn.classList.add('del');
    delbtn.innerHTML = '🗑️';
    delbtn.addEventListener('click',()=>{
        // remove from tasklist
        delete tasklist[task.parentElement.id][task.id];
        // send delete request
        window.updates.DELETEjson(JSON.stringify({[task.parentElement.id]:[task.id]}));
        // // save to json
        // window.updates.goJson(JSON.stringify(tasklist));
        task.remove();
    });
    task.appendChild(delbtn);
    // add task
    document.getElementById('tasks').appendChild(task);
    if(done){
        markasdone(chkbox,true);
    }
}

function markasdone(that,internal){
    // move the parent div to comptasks
    var task = that.parentElement;
    var newID;
    var ID;
    if(!internal){
        newID = genTaskID();
        ID = task.id;
    }
    else{
        ID = task.id;
        newID = task.id;
    }
    if(task.parentElement.id == 'tasks'){
        // change the checkbox to a checkmark
        that.innerHTML = '✔';
        // add proper class
        document.getElementById(ID+'inp').id = newID+'inp'
        document.getElementById(newID+'inp').classList.add('done');
        // move incomplete task to complete task
        document.getElementById('comptasks').prepend(task);
        // add to tasklist
        tasklist['comptasks'][newID] = document.getElementById(newID+'inp').value;
        // delete from tasklist
        delete tasklist['tasks'][ID];
        // delete req for tasks and post req for comptasks
        if(!internal){
            window.updates.DELETEjson(JSON.stringify({"tasks":[ID]}));
            window.updates.POSTjson(JSON.stringify({"comptasks":{[newID] : document.getElementById(newID+'inp').value}}));
        }
            // // save to json
        // window.updates.goJson(JSON.stringify(tasklist));
    }
    else{
        // move completed task back to tasks
        document.getElementById('tasks').appendChild(task);
        // change the checkbox to a circle
        that.innerHTML = '▢';
        // remove the done class
        document.getElementById(ID+'inp').classList.remove('done');
        document.getElementById(ID+'inp').id = newID+'inp';
        // move completed task back to tasks
        document.getElementById('tasks').prepend(task);
        // add to tasklist
        tasklist['tasks'][newID] = document.getElementById(newID+'inp').value;
        // delete from tasklist
        delete tasklist['comptasks'][ID];
        // delete req for done and post req for undone
        window.updates.DELETEjson(JSON.stringify({"comptasks":[ID]}));
        window.updates.POSTjson(JSON.stringify({"tasks":{[newID] : document.getElementById(newID+'inp').value}}));
        // // save to json
        // window.updates.goJson(JSON.stringify(tasklist));
    };
};

function change(that){
    var ID = that.parentElement.id;
    tasklist[that.parentElement.parentElement.id][String(ID)] = that.value;
    if(that.parentElement.parentElement.id == "tasks"){
        window.updates.PATCHjson(JSON.stringify({"tasks":{[ID]:that.value}}));
    }
    else{
        window.updates.PATCHjson(JSON.stringify({"comptasks":{[ID]:that.value}}));
    }
};