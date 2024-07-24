// const fetch = require('node-fetch');

const haetiedot = (id, callback) => {
    const url = 'https://tie.digitraffic.fi/api/weathercam/v1/stations/' + id;
    fetch(url)
        .then(res => res.json())
        .then(body => {
            callback(undefined, {
                cameraPresets: body.properties.presets
            });
        })
        .catch(err => {
            //console.log(err);
        });
}

module.exports = haetiedot;