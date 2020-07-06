const fs = require('fs');

const inFile = 'camera-stations.json';
const outFile = 'camera-stations-reduced.json';

const json = fs.readFileSync(inFile);
const arr = JSON.parse(json.toString());

function createFeature(long, lat, id, fiName) {
    let feature = {
        'properties': {
            'id': id,
            'names': {
                'fi': fiName
            }
        },
        'geometry': {
            'coordinates': [long, lat]
        }
    };
    return feature;
}
let newFeatures = [];

for (let feature of arr.features) {
    let long = feature.geometry.coordinates[0];
    let lat = feature.geometry.coordinates[1];
    let id = feature.properties.id;
    let fiName = feature.properties.names.fi;
    let newFeature = createFeature(long, lat, id, fiName);
    newFeatures.push(newFeature);
}

let newArr = {};
newArr.features=newFeatures;

fs.writeFileSync(outFile, JSON.stringify(newArr));
