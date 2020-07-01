const fetch = require('node-fetch');

const haetiedot = (id, callback) => {
    const url = 'https://tie.digitraffic.fi/api/v1/data/camera-data/' + id;
    fetch(url)
        .then(res => res.json())
        .then(body => {
            callback(undefined, {
                cameraPresets: body.cameraStations[0].cameraPresets
            });
        })
        .catch(err => {
            //console.log(err);
        });
}

module.exports = haetiedot;