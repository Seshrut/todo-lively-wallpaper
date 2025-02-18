window.onload = ()=>{
    const body=document.querySelector('body');
    const images=[
        './img/1.jpg',
        './img/2.jpg',
        './img/3.png',
        './img/4.png',
        './img/5.jpg',
        './img/6.jpg',
        './img/7.png',
        './img/8.jpg',
        './img/9.jpg',
        './img/10.jpg',
        './img/11.png',
        './img/12.png'
    ]
    var last5=[]
    function changebgimg(){
        let index = Math.floor(Math.random()*images.length)
        if(last5.includes(index) || index==0){
            console.log(`re\n${index}\nRAN\n${last5}`);
            changebgimg()
            return;
        }
        body.style.backgroundImage=`url(${images[index]})`;
        last5.push(index);
        if(last5.length>5){
            last5.shift();
        }
        console.log(`RAN\n${last5}`);
        setTimeout(changebgimg, 30000);
    }
    changebgimg();
}