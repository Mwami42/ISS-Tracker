import React, { useState, useEffect } from "react";

const ISSTracker = () => {
  const [issLocation, setIssLocation] = useState({
    latitude: "Loading...",
    longitude: "Loading...",
  });

  useEffect(() => {
    const fetchISSLocation = () => {
      fetch("http://api.open-notify.org/iss-now.json")
        .then((response) => response.json())
        .then((data) => {
          const { latitude, longitude } = data.iss_position;
          setIssLocation({ latitude, longitude });
        })
        .catch((error) => console.error("Error fetching ISS location:", error));
    };

    fetchISSLocation();
    const interval = setInterval(fetchISSLocation, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div>
      <h1>ISS Current Location</h1>
      <p>Latitude: {issLocation.latitude}</p>
      <p>Longitude: {issLocation.longitude}</p>
    </div>
  );
};

export default ISSTracker;
