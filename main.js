var tasklist = {'todo':{'todo1':''},'done':{'todo2':'this task is done'}};
var tasknums = new Set([1,2]);
var lastsync;
document.addEventListener('DOMContentLoaded',()=>{
    const addtaskbtn = document.getElementById('addtask');
    addtaskbtn.onclick = addnewtask;
});
function addnewtask(){
    //find a number not used in todolist yet;
    console.log('ran function')
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
    task.appendChild(txtarea);
    // add checkbox
    var chkbox = document.createElement('button');
    chkbox.id = `task${tasknum}btn`;
    chkbox.classList.add('button');
    chkbox.classList.add('chkbx');
    chkbox.innerHTML = '▢';
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

function markasdone(){

};