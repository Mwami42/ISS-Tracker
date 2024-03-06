import express from "express";
import fetch from "node-fetch";
import cron from "node-cron";
import cors from "cors";
import { Datastore } from "@google-cloud/datastore";

const app = express();
const PORT = process.env.PORT || 8080;
const TLE_URL =
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle";
const datastore = new Datastore();
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173", // Update for production
        "https://mwami42.github.io",
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);

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

app.get("/", (req, res) => {
  res.json({ message: "Welcome to the ISS Tracker API" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
