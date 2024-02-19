import express from "express";
import fetch from "node-fetch";
import cron from "node-cron";
import cors from "cors";
import { Datastore } from "@google-cloud/datastore";
import * as satellite from "satellite.js";

const app = express();
const PORT = process.env.PORT || 8080;
const TLE_URL =
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle";
const datastore = new Datastore();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

app.use(cors({ origin: "http://localhost:5173" })); // Update for production

const TLE_KIND = "TLEData";

const fetchAndSaveTLE = async () => {
  const response = await fetch(TLE_URL);
  const data = await response.text();
  const tleLines = data
    .trim()
    .split("\n")
    .map((line) => line.trim());

  if (tleLines.length >= 3) {
    const tleData = {
      line1: tleLines[1],
      line2: tleLines[2],
      date: new Date().toISOString().slice(0, 10),
    };

    const entity = {
      key: datastore.key([TLE_KIND, "latest"]),
      data: tleData,
    };

    await datastore.save(entity);
    console.log("TLE data updated and saved to Datastore.");
    return tleData;
  } else {
    throw new Error("Invalid TLE data format");
  }
};

cron.schedule("0 2 * * *", fetchAndSaveTLE);

app.get("/api/tle", async (req, res) => {
  try {
    const key = datastore.key([TLE_KIND, "latest"]);
    const [entity] = await datastore.get(key);

    if (entity && entity.date === new Date().toISOString().slice(0, 10)) {
      res.json(entity);
      console.log("TLE data fetched from Datastore.");
    } else {
      const updatedTleData = await fetchAndSaveTLE();
      res.json(updatedTleData);
    }
  } catch (err) {
    res
      .status(500)
      .json({ message: "Error handling TLE data", error: err.message });
  }
});

app.get("/api/location", async (req, res) => {
  const key = datastore.key([TLE_KIND, "latest"]);
  const [entity] = await datastore.get(key);

  if (!entity) {
    return res.status(404).json({ message: "TLE data not found" });
  }

  const { line1, line2 } = entity;
  const satrec = satellite.twoline2satrec(line1, line2);
  const positionAndVelocity = satellite.propagate(satrec, new Date());
  const positionEci = positionAndVelocity.position;
  const gmst = satellite.gstime(new Date());
  const positionGd = satellite.eciToGeodetic(positionEci, gmst);

  const latitude = satellite.degreesLat(positionGd.latitude);
  const longitude = satellite.degreesLong(positionGd.longitude);

  const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_MAPS_API_KEY}`;

  try {
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status === "OK" && geocodeData.results[0]) {
      const locationName = geocodeData.results[0].formatted_address;
      res.json({ geocodeData });
    } else {
      res.status(404).json({ message: "Location not found" });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching location", error: error.message });
  }
});

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the ISS Tracker API" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
