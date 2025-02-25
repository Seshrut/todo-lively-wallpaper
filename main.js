var tasklist = {'tasks':{'task1':''},'comptasks':{'task2':''}};
var tasknums = new Set([1,2]);
var lastsync;
document.addEventListener('DOMContentLoaded',()=>{
    const addtaskbtn = document.getElementById('addtask');
    addtaskbtn.onclick = addnewtask;
});
function addnewtask(){
    //find a number not used in todolist yet;
    var tasknum=1;
    while(tasknums.has(tasknum)){
        tasknum++;
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
        task.remove();
        tasknums.delete(tasknum);
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
    };
};

function change(that){
    tasklist[that.parentElement.parentElement.id][that.parentElement.id] = that.value;
    console.log(tasklist);
}