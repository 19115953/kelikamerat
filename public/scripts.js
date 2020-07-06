let history={};
window.addEventListener('load',() => {
    //console.log(document.getElementsByTagName('body'));
    //console.log(document.getElementsByTagName('img'));
    let maxWidth=0;
    const boxes=document.querySelectorAll('.boxed');
    const boxesYellow=document.querySelectorAll('.boxed-yellow');
    const boxesRed=document.querySelectorAll('.boxed-red');
    if (boxes.length == 0 && boxesYellow.length == 0 && boxesRed.length == 0) {
        document.getElementsByTagName('body')[0].style.visibility="visible";
        return
    }
    const boxWidth="width:"+document.getElementsByTagName('img')[0].clientWidth+"px";
    const boxMaxWidth="max-width:"+document.getElementsByTagName('img')[0].naturalWidth+"px";
    if (boxes.length > 0) {
        boxes.forEach(element => {
            elementWidth=element.getElementsByTagName('img')[0].clientWidth;
            if(elementWidth > maxWidth) maxWidth=elementWidth;
        });
        boxes.forEach(element => {
            element.setAttribute("style",boxWidth);
            element.setAttribute("style",boxMaxWidth);
        });
        document.getElementsByClassName('boxed')[0].setAttribute("style",boxWidth);
        document.getElementsByClassName('boxed')[0].setAttribute("style",boxMaxWidth);
    }
    if (boxesYellow.length > 0) {
        boxesYellow.forEach(element => {
            elementWidth=element.getElementsByTagName('img')[0].clientWidth;
            if(elementWidth > maxWidth) maxWidth=elementWidth;
        });
        boxesYellow.forEach(element => {
            element.setAttribute("style",boxWidth);
            element.setAttribute("style",boxMaxWidth);
        });
        document.getElementsByClassName('boxed-yellow')[0].setAttribute("style",boxWidth);
        document.getElementsByClassName('boxed-yellow')[0].setAttribute("style",boxMaxWidth);
    }
    if (boxesRed.length > 0) {
        boxesRed.forEach(element => {
            elementWidth=element.getElementsByTagName('img')[0].clientWidth;
            if(elementWidth > maxWidth) maxWidth=elementWidth;
        });
        boxesRed.forEach(element => {
            element.setAttribute("style",boxWidth);
            element.setAttribute("style",boxMaxWidth);
        });
        document.getElementsByClassName('boxed-red')[0].setAttribute("style",boxWidth);
        document.getElementsByClassName('boxed-red')[0].setAttribute("style",boxMaxWidth);
    }
//    console.log("maxWidth:",maxWidth);
//    console.log("boxWidth:",boxWidth);
//    console.log("boxMaxWidth:",boxMaxWidth);
//    console.log(document.getElementsByClassName('boxed'));
    document.getElementsByTagName('body')[0].style.visibility="visible";
    fetchCameraHistory(document.getElementById('place').value, history);
//    console.log(history)
});
function updateDropDown(element) {
    //console.log(element);
    const className=element.className.split(" ")[1];
    const elements=document.getElementsByClassName(className);
    //console.log("Elements:",elements);
    //console.log("Elements[0]:",elements[0]);
    //console.log(elements[0].options.length);
    elements[0].selectedIndex=element.value;
    const image=img=document.getElementById(className);
    image.src=history[className][element.value];
}
function updateSlider(element) {
    //console.log(element);
    const className=element.className.split(" ")[1];
    const elements=document.getElementsByClassName(className);
    //console.log("Elements:",elements);
    //console.log("Elements[1]:",elements[1]);
    //console.log(elements[1].options.length);
    elements[1].value=element.value;
    const image=img=document.getElementById(className);
    image.src=history[className][element.value];
}
function previous(cameraId) {
    const elements=document.getElementsByClassName(cameraId);
    let nextImageIndex=parseInt(elements[1].value)+1;
    if (nextImageIndex==history[cameraId].length) nextImageIndex=0;
    const image=img=document.getElementById(cameraId);
    image.src=history[cameraId][nextImageIndex];
    elements[1].value=nextImageIndex; 
    elements[0].selectedIndex=nextImageIndex;
}
function next(cameraId) {
    const elements=document.getElementsByClassName(cameraId);
    let nextImageIndex=parseInt(elements[1].value)-1;
    if (nextImageIndex<0) nextImageIndex=history[cameraId].length-1;
    const image=img=document.getElementById(cameraId);
    image.src=history[cameraId][nextImageIndex];
    elements[1].value=nextImageIndex; 
    elements[0].selectedIndex=nextImageIndex;
}

/*window.addEventListener('resize', () => {
    const boxWidth="width:"+document.getElementsByTagName('img')[0].clientWidth+"px";
    console.log("boxWidth:",boxWidth);
});*/

const resolution = window.screen.width*window.devicePixelRatio+" x "+window.screen.height*window.devicePixelRatio;
const resolution2 = window.screen.width+" x "+window.screen.height;

window.onload = function() {
    document.addEventListener('swiped-left', function(e) {
        //console.log(e.type);
        //console.log(e.target);
        //console.log(e.originalTarget);
        //e.target.innerHTML = e.type;
        //alert(resolution);
        //console.log(document.getElementById('place').value);
        next(e.target.id);
        //fetchCameraHistory(document.getElementById('place').value);
    });

    document.addEventListener('swiped-right', function(e) {
        //console.log(e.type);
        //console.log(e.target);
        //console.log(e.target.id);
        previous(e.target.id);
        //e.target.innerHTML = e.type;
        //alert(resolution2);
        //alert(e.className);
    });
};