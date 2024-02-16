import express from "express";
import fetch from "node-fetch";
import cron from "node-cron";
import fs from "fs";
import path from "path";

const app = express();
const PORT = process.env.PORT || 8080; // 8080 as a default value if process.env.PORT is not set
const TLE_URL =
  "https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=tle";
const TLE_FILE_PATH = path.join("./data", "localTLEData.txt");

const fetchAndSaveTLE = async () => {
  const response = await fetch(TLE_URL);
  const data = await response.text();
  const tleLines = data
    .trim()
    .split("\n")
    .map((line) => line.trim()); // Trim each line
  if (tleLines.length >= 3) {
    const tleData = {
      line1: tleLines[0],
      line2: tleLines[1],
      line3: tleLines[2],
      date: new Date().toISOString().slice(0, 10),
    };
    fs.writeFileSync(TLE_FILE_PATH, JSON.stringify(tleData), "utf8");
    console.log("TLE data updated and saved.");
    return tleData;
  }
  throw new Error("Invalid TLE data format");
};

// Scheduled task to fetch TLE data once a day at 2 AM
cron.schedule("0 2 * * *", fetchAndSaveTLE);

app.get("/api/tle", async (req, res) => {
  try {
    if (!fs.existsSync(TLE_FILE_PATH)) {
      const tleData = await fetchAndSaveTLE();
      res.json(tleData);
    } else {
      const tleData = JSON.parse(fs.readFileSync(TLE_FILE_PATH, "utf8"));
      const today = new Date().toISOString().slice(0, 10);
      if (tleData.date === today) {
        res.json(tleData);
        console.log("Already Fetched");
      } else {
        const updatedTleData = await fetchAndSaveTLE();
        res.json(updatedTleData);
      }
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

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
