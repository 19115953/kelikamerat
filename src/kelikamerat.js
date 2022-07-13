const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const haetiedot = require('./haetiedot');

const tiedosto = './src/camera-stations-reduced.json';

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
        // console.log(e.sourceTarget._popup._content);
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
            html += `<input type="hidden" id="place" value="${req.query.id}" />\n`
            html += `<h1>${idPaikka[req.query.id]}</h1>` + '\n';
            for (let camera of data.cameraPresets) {
                let boxClass="boxed";
                let aikaStr = suomiAika(new Date(camera.measuredTime));
                let timeDiff = (Date.now()-Date.parse(camera.measuredTime))/1000/60;
                if (timeDiff > 60) boxClass="boxed-yellow";
                if (timeDiff > 24*60) boxClass="boxed-red";
                if (timeDiff > 259200) continue;
                if (camera.presentationName) {
                    html += `<div class="${boxClass}"><hr><h2>${camera.presentationName}</h2>` + '\n';
                } else {
                    html += `<div class="${boxClass}"><hr>` + '\n';
                }
                html += `\t<img src="${camera.imageUrl}" alt="${camera.id}" id="${camera.id}">\n`;
                html += `\t<div id="menu">\n`;
                html += `\t\t<div id="dropdown">\n`;
                html += `\t\t\t<form>\n`;
                html += `\t\t\t\t<select class="box ${camera.id}" onchange="updateSlider(this)">\n`;
                html += `\t\t\t\t\t<option value="0">${aikaStr}</option>\n`;
                html += `\t\t\t\t</select>\n`;
                html += `\t\t\t</form>\n`;
                html += `\t\t</div>\n`;
                html += `\t\t<div id="slider">\n`;
                html += `\t\t\t<input class="slider ${camera.id}" type="range" min="0" max="0" oninput="updateDropDown(this)">\n`
                html += `\t\t</div>\n`;
                html += `\t</div>\n`;
                html += `</div>\n`;

//                html += `<div>${aikaStr}</div>` + '\n';
//                html += `</div>` + '\n';
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




