const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const haetiedot = require('./haetiedot');

const tiedosto = './src/camera-stations-reduced.json';

const json = fs.readFileSync(tiedosto);
const arr = JSON.parse(json.toString());

let roadNumbers = new Set();
let provinces = new Set();
let municipalities = new Set();

arr.features.forEach(feature => {
  roadNumbers.add(feature.properties.roadNumber);
});
arr.features.forEach(feature => {
  provinces.add(feature.properties.province);
});
arr.features.forEach(feature => {
  municipalities.add(feature.properties.municipality);
});

roadNumbers = Array.from(roadNumbers);
provinces = Array.from(provinces);
municipalities = Array.from(municipalities);

let htmlVali = "";
let idPaikka = {};
let markerBounds = {};
let mapCenter = {};

const initMap = (arr, lang) => {
  markerBounds = { minLat: 90, maxLat: -90, minLong: 180, maxLong: -180 };
  mapCenter = { lat: 0, long: 0, count: 0 };
  htmlVali = "";
  for (let feature of arr.features) {
    let long = feature.geometry.coordinates[0];
    let lat = feature.geometry.coordinates[1];
    let id = feature.properties.id;
    let name = feature.properties.names[lang];

    if (long < markerBounds.minLong) markerBounds.minLong = long;
    if (long > markerBounds.maxLong) markerBounds.maxLong = long;
    if (lat < markerBounds.minLat) markerBounds.minLat = lat;
    if (lat > markerBounds.maxLat) markerBounds.maxLat = lat;

    mapCenter.lat = (markerBounds.minLat + markerBounds.maxLat) / 2;
    mapCenter.long = (markerBounds.minLong + markerBounds.maxLong) / 2;
    mapCenter.count++;
    const onClick = (e) => {
      // console.log(e.sourceTarget._popup._content);
      const id = e.sourceTarget.options.alt;
      const w = window.open("/paikka?id=" + id);
    }
    const mouseOver = (e) => {
      e.target.openPopup();
    }
    const mouseOut = (e) => {
      e.target.closePopup();
    }
    htmlVali += `L.marker([${lat}, ${long}], { alt: "${id}"}).on('click', ${onClick}).on('mouseover', ${mouseOver}).addTo(map).bindPopup('${name}').on('mouseout', ${mouseOut})`+"\n";
    idPaikka[id] = name;
  }
}

app.use(express.static(path.join(__dirname, '../public')));

const createHtml = (margins = 0.0) => {
  const bounds = [
    [markerBounds.minLat * (1 - margins), markerBounds.minLong * (1 - margins)],
    [markerBounds.maxLat * (1 + margins), markerBounds.maxLong * (1 + margins)]
  ];
  let html = "";
  html = fs.readFileSync('./src/indexhtml_alku.txt').toString();
  if (mapCenter.count === 1) {
    html += `\nmap.setView([${mapCenter.lat}, ${mapCenter.long}], 11);\n`
  } else {
    html += `\nmap.fitBounds([[${bounds[0]}],[${bounds[1]}]]);\n`
    html += `\nmap.setView([${mapCenter.lat}, ${mapCenter.long}]);\n`
  }
  html += htmlVali;
  html += fs.readFileSync('./src/indexhtml_loppu.txt').toString();
  return html;
}

app.get('/', function (req, res) {
    initMap(arr, "fi"); 
    res.send(createHtml());
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
  console.log(req.query.id + " : " + new Date().toLocaleString('fi-FI', {timeZone: 'Europe/Helsinki'}));
    if (arr.features.some(feature => feature.properties.id === req.query.id)) {    
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
            }
            html += fs.readFileSync('./src/paikkahtml3.txt').toString();
            res.send(html);
        }
    });
  } else {
    res.redirect('/');
  }
});

const isNameInNames = (name, names) => {
  let namesArray = [];
  const fillArray = (lang) => {
    if (names.hasOwnProperty(lang)) {
      const numberIndex = names[lang].search(/\d(?=[^\d]*$)/);
      const sliced = names[lang].slice(numberIndex + 1).trim();
      const splitted = sliced.split(',');
      namesArray.push(...splitted);
    }
  }
  fillArray("fi");
  fillArray("sv");
  namesArray = namesArray.map(place => place.trim().toLowerCase());
  return namesArray.includes(name.toLowerCase());
}

app.get('/:first', function (req, res) {
  const params = req.params.first.split(',');
  let resultArr = [];
  for (param of params) {
    if (!isNaN(param)) {
      const roadNumber = parseInt(param);
      const filteredArr = arr.features.filter(feature =>
        (feature.properties.roadNumber === roadNumber
      ));
      resultArr.push(...filteredArr);
    } else {
      const filteredArr = arr.features.filter(feature => (
        feature.properties.province.toLowerCase() === param.toLowerCase() ||
        feature.properties.municipality.toLowerCase() === param.toLowerCase() ||
        isNameInNames(param, feature.properties.names)
      ));
      resultArr.push(...filteredArr);
    }
  }
  if (resultArr.length > 0) {
    resultArr = Array.from(new Set(resultArr.map(JSON.stringify))).map(JSON.parse);
    initMap({ features: resultArr }, "fi");
  } else {
    initMap(arr, "fi");
  }
  res.send(createHtml());
});

app.get('*', function (req, res) {
    res.send('<h1>Sivua ei löydy!</h1>');
});

const port = process.env.PORT || 3000;

const viesti = function () {
    console.log("Serveri kyntää portissa " + port);
}

app.listen(port, viesti);




