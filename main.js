var tasknums;
var tasklist = {'tasks':{'task1':''},'comptasks':{'task2':''}};
var lastsync;
document.addEventListener('DOMContentLoaded',()=>{
    const addtaskbtn = document.getElementById('addtask');
    addtaskbtn.onclick = addnewtask;
    // get local storage if available
    unparsedtasklist = localStorage.getItem('tasklist');
    unparsedtasknums = localStorage.getItem('tasknums');
    if(unparsedtasknums!=null){
        tasknums = new Set(JSON.parse(unparsedtasknums));
    }
    else{
        tasknums = new Set([1,2]);
    }
    console.log(tasknums);
    if(unparsedtasklist!=null){
        tasklist = JSON.parse(unparsedtasklist);
        // add all tasks to the page
        console.log(tasklist);
        for(var task in tasklist['tasks']){
            addnewtask(parseInt(task.slice(4)));
            document.getElementById(task.slice(0,5)+'inp').value = tasklist['tasks'][task];
        };
        for(var task in tasklist['comptasks']){
            addnewtask(parseInt(task.slice(4)));
            document.getElementById(task.slice(0,5)+'inp').value = tasklist['comptasks'][task];
            markasdone(document.getElementById(task+'btn'));
        };
    }
    else{
        addnewtask(1);
        addnewtask(2);
        markasdone(document.getElementById('task2btn'));
    }
});
function addnewtask(taskn){
    var tasknum=1;
    while(tasknums.has(tasknum)){
        tasknum++;
    }
    if(typeof(taskn)==typeof(1)){
        tasknum = taskn;
    }
    var task = document.createElement('div');
    task.classList.add('task');
    task.id = `task${tasknum}`;
    tasknums.add(tasknum);
    // add txtarea
    var txtarea = document.createElement('textarea');
    txtarea.id = `task${tasknum}inp`;
    txtarea.classList.add('taskinp');
    txtarea.spellcheck = 'false';
    txtarea.placeholder = 'Enter Task';
    txtarea.addEventListener('change', ()=>change(txtarea));
    task.appendChild(txtarea);
    // add checkbox
    var chkbox = document.createElement('button');
    chkbox.id = `task${tasknum}btn`;
    chkbox.classList.add('button');
    chkbox.classList.add('chkbx');
    chkbox.innerHTML = '▢';
    chkbox.addEventListener('click',()=>markasdone(chkbox));
    task.appendChild(chkbox);
    // add delete btn
    var delbtn = document.createElement('button');
    delbtn.id = `task${tasknum}del`;
    delbtn.classList.add('button');
    delbtn.classList.add('del');
    delbtn.innerHTML = '🗑️';
    delbtn.addEventListener('click',()=>{
        // remove from tasknums
        tasknums.delete(parseInt(task.id.slice(4)));
        // save on browser
        localStorage.setItem('tasknums', JSON.stringify(Array.from(tasknums)));
        // remove from tasklist
        delete tasklist[task.parentElement.id][task.id];
        // save on browser
        localStorage.setItem('tasklist', JSON.stringify(tasklist));
        task.remove();
    });
    task.appendChild(delbtn);
    // add task
    document.getElementById('tasks').appendChild(task);
};

function markasdone(that){
    // move the parent div to comptasks
    var task = that.parentElement;
    if(task.parentElement.id == 'tasks'){
        // change the checkbox to a checkmark
        that.innerHTML = '✔';
        // add proper class
        document.getElementById(task.id+'inp').classList.add('done');
        // move incomplete task to complete task
        document.getElementById('comptasks').prepend(task);
        // add to tasklist
        tasklist['comptasks'][task.id] = document.getElementById(task.id+'inp').value;
        // delete from tasklist
        delete tasklist['tasks'][task.id];
        // save on browser
        localStorage.setItem('tasklist', JSON.stringify(tasklist));
    }
    else{
        // move completed task back to tasks
        document.getElementById('tasks').appendChild(task);
        // change the checkbox to a circle
        that.innerHTML = '▢';
        // remove the done class
        document.getElementById(task.id+'inp').classList.remove('done');
        // move completed task back to tasks
        document.getElementById('tasks').prepend(task);
        // add to tasklist
        tasklist['tasks'][task.id] = document.getElementById(task.id+'inp').value;
        // delete from tasklist
        delete tasklist['comptasks'][task.id];
        // save on browser
        localStorage.setItem('tasklist', JSON.stringify(tasklist));
    };
};

function change(that){
    tasklist[that.parentElement.parentElement.id][String(that.parentElement.id)] = that.value;
    console.log(tasklist);
    // save on browser
    localStorage.setItem('tasklist', JSON.stringify(tasklist));
};