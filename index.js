var images
var last5=[]

window.onload = async ()=>{
    var setting = document.getElementById("setting");
    var closeico = document.getElementById("close");
    var gearico = document.getElementById("gear");
    var settingmenu = document.getElementById("settingmenu");
    var menuvis=true;
    setting.addEventListener('click',()=>{
        if(menuvis){
            closeico.style.display='block';
            gearico.style.display='none';
            settingmenu.style.display='flex';
            menuvis=false;
        }
        else{
            closeico.style.display='none';
            gearico.style.display='block';
            settingmenu.style.display='none';
            menuvis=true;
        }
    });
    // try to load images in a folder
    images = await window.onstart.getImg();
    const body=document.querySelector('body');
    changebgimg(body);
}
function changebgimg(body){
    let index = Math.floor(Math.random()*images.length)
    if(last5.includes(index) || index==0){
        changebgimg(body)
        return;
    }
    body.style.backgroundImage=`url(img/${images[index]})`;
    last5.push(index);
    if(last5.length>5){
        last5.shift();
    }
    setTimeout(()=>{changebgimg(body)}, 30000);
}