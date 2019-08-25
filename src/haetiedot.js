const request = require('request');

const haetiedot = (id, callback) => {
    const url = 'https://tie.digitraffic.fi/api/v1/data/camera-data/' + id;
    request({uri: url, json: true}, (error, response, body) => {
        if (error) {
            callback("Yhteys ei toimi", undefined);
        } else if (body.error) {
            callback("Tuntematon sijainti", undefined);
        } else {
            try {
                callback(undefined, {
                    cameraPresets: body.cameraStations[0].cameraPresets
                })
            } catch (error) {
                // callback("Paikkaa ei voitu määrittää");
            }
        }
    });
}

module.exports = haetiedot;