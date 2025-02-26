var images
var last5=[]
window.onload = async ()=>{
    // try to load images in a folder
    images = await window.img.get();
    console.log(`from index: ${images}`);
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