#!/usr/bin/env node

const stationsURL = "https://tie.digitraffic.fi/api/weathercam/v1/stations";
const stationsJSONFile = "stations.json";
const stationsDetailedDataDirectory = "stations-detailed-data";
const resultsJSONFile = "stations-data.json";

const fileModificationTime = (file) => {
  const { statSync, stat } = require('fs');
  try {
    const stats = statSync(file);
    return  stats.mtimeMs;
  } catch (err) {
    return false;
  }
}

const shouldFileUpdate = (time, maxAgeInMinutes = 60) => {
  return typeof(time) === "number" ? Date.now() - time > 1000 * 60 * maxAgeInMinutes : true;
}

const getStationsData = async () => {
  try {
    if (shouldFileUpdate(fileModificationTime(stationsJSONFile), 60)) {
      console.log(`Fetching new file from "${stationsURL}"`);
      const response = await fetch(stationsURL);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(`Writing file "${stationsJSONFile}"...`)
      require('fs').writeFileSync(stationsJSONFile, JSON.stringify(json));
      return(json);
    } else {
      console.log(`Reading file "${stationsJSONFile}"...`)
      return JSON.parse(require('fs').readFileSync(stationsJSONFile));
    }
  } catch (error) {
    console.error(error.message);
  }
}

const getOneStationData = async (id) => {
  try {
    if (shouldFileUpdate(fileModificationTime(`${stationsDetailedDataDirectory}/${id}.json`), 60*24*7)) {
      console.log(`Fetching new file from "${stationsURL}/${id}"`);
      const response = await fetch(`${stationsURL}/${id}`);
      if (!response.ok) {
        throw new Error(`Response status: ${response.status}`);
      }
      const json = await response.json();
      console.log(`Writing file "${stationsDetailedDataDirectory}/${id}.json"...`)
      require('fs').writeFileSync(`${stationsDetailedDataDirectory}/${id}.json`, JSON.stringify(json));
      console.log(`Waiting few seconds before next fetch...`);
      await new Promise(resolve => setTimeout(resolve, 5000));
      return(json);
    } else {
      console.log(`Reading file "${stationsDetailedDataDirectory}/${id}.json"`)
      return JSON.parse(require('fs').readFileSync(`${stationsDetailedDataDirectory}/${id}.json`));
    }
  } catch (error) {
    console.error(error.message);
  }
}

const main = async () => {
//  let loop = 0, loopmax = 2;
  try {
    const stations = await getStationsData()
  //  console.log(JSON.stringify(stations));
    const results = {"features": []};
    for (let station of stations.features) {
//      loop++;
      const properties = {"id": station.id, "names": {}}
//      const coordinates = [station.geometry.coordinates[0], station.geometry.coordinates[1]];
      const coordinates = station.geometry.coordinates;
      const geometry = {coordinates};
      results.features.push({properties, geometry});
//      if (loop > loopmax) break;
    }
//    console.log(JSON.stringify(results, null, 4));
    console.log(`Found ${results.features.length} stations.`);
    for (let feature of results.features) {
      const station = await getOneStationData(feature.properties.id)
      feature.properties.names = station.properties.names;
      feature.properties.nearestWeatherStationId = station.properties.nearestWeatherStationId;
      feature.properties.roadNumber = station.properties.roadAddress.roadNumber;
      feature.properties.province = station.properties.province;
      feature.properties.municipality = station.properties.municipality;
    }
    //console.log(JSON.stringify(results, null, 4));
    require('fs').writeFileSync(`${resultsJSONFile}`, JSON.stringify(results));
  } catch (error) {
    console.error(error.message);
  }    
}

main()
