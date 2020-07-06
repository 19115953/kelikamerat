async function fetchCameraHistory(id, history) {
    const url = 'https://tie.digitraffic.fi/api/v2/data/camera-history/history?id=' + id;
    try {
        const data = await (await fetch(url)).json();
        //console.log("cameraHistory:",data[0].cameraHistory);
        for (let camera of data[0].cameraHistory) {
            //console.log(camera);
            let elements = document.getElementsByClassName(camera.presetId);
            //console.log(elements);
            //console.log(camera.presetHistory.length);
            //console.log(optionsElement[0].innerHTML);
            let urlArray=[];
            urlArray[0] = camera.presetHistory[0].imageUrl
            for (let index=1; index < camera.presetHistory.length; index++) {
                let dateTime = camera.presetHistory[index].lastModified;
                elements[0].options[index] = new Option(suomiAika(new Date(dateTime)), index);
                urlArray[index] = camera.presetHistory[index].imageUrl;
            }
            history[camera.presetId] = urlArray;
            //console.log(optionsElement[0].options);
            elements[1].max = camera.presetHistory.length - 1;
            //console.log(optionsElement);
            //console.log(rangeElement);
            elements[1].style.visibility="visible";
        }
    } catch (error) {
        console.log("Virhe");

        console.log(error);
    }
}
