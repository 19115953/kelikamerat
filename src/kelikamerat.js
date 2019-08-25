const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const haetiedot = require('./haetiedot');

const tiedosto = './src/camera-stations.json';

const json = fs.readFileSync(tiedosto);
const arr = JSON.parse(json.toString());

let htmlVali = "";
let idPaikka = {};

for (let feature of arr.features) {
    let long = feature.geometry.coordinates[0];
    let lat = feature.geometry.coordinates[1];
    let id = feature.properties.id;
    let fiName = feature.properties.names.fi;

    function onClick(e) {
        console.log(e.sourceTarget._popup._content);
        const id = e.sourceTarget.options.alt;
        const w = window.open("/paikka?id=" + id);
    }
    function mouseOver(e) {
        this.openPopup();
    }

    htmlVali += `L.marker([${lat}, ${long}], { alt: "${id}"}).on('click', ${onClick}).on('mouseover', ${mouseOver}).addTo(map).bindPopup('${fiName}')`+"\n";
    idPaikka[id] = fiName;
}

app.use(express.static(path.join(__dirname, '../public')));

app.get('/', function (req, res) {
    let html = "";
    html = fs.readFileSync('./src/indexhtml_alku.txt').toString();
    html += htmlVali;
    html += fs.readFileSync('./src/indexhtml_loppu.txt').toString();
    
    res.send(html);
});

function suomiAika(aika) {
    let aikaStr = aika.getDate() + '.' + (aika.getMonth() + 1) + '.' + aika.getFullYear() + ' ';
    aikaStr += aika.getHours() + '.';
    if (aika.getMinutes() < 10) {
        aikaStr += '0' + aika.getMinutes();
    } else {
        aikaStr += aika.getMinutes();
    }
    aikaStr += '.';
    if (aika.getSeconds() < 10) {
        aikaStr += '0' + aika.getSeconds();
    } else {
        aikaStr += aika.getSeconds();
    }
    return aikaStr;
}


app.get('/paikka', function (req, res) {
    haetiedot(req.query.id, (error, data) =>  {
        if(error) {
            return res.send({error});
        } else {
            let html = "";
            html = fs.readFileSync('./src/paikkahtml1.txt').toString();
            html += idPaikka[req.query.id];
            html += fs.readFileSync('./src/paikkahtml2.txt').toString();
            html += `<h1>${idPaikka[req.query.id]}</h1>` + '\n';
            for (let camera of data.cameraPresets) {
                if (camera.presentationName) {
                    html += `<hr><div><h2>${camera.presentationName}</h2>` + '\n';
                } else {
                    html += `<hr>` + '\n';
                }
                    html += `<div><img src="${camera.imageUrl}" alt="${camera.id}"></div>` + '\n';
                let aikaStr = suomiAika(new Date(camera.measuredTime));
                html += `<div>${aikaStr}</div>` + '\n';
                html += `</div>` + '\n';
            }
            html += fs.readFileSync('./src/paikkahtml3.txt').toString();
            res.send(html);
        }
    });
});

app.get('*', function (req, res) {
    res.send('<h1>Sivua ei löydy!</h1>');
});

const port = process.env.PORT || 3000;

const viesti = function () {
    console.log("Serveri kyntää portissa " + port);
}

app.listen(port, viesti);




