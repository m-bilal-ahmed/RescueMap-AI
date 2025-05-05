const map = L.map('map').setView([28.5383, -81.3792], 6);  // Orlando, FL default
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Fetch and display reports on page load
fetch("/reports")
  .then(res => {
    if (!res.ok) {
      throw new Error(`HTTP error! Status: ${res.status}`);
    }
    return res.json();
  })
  .then(data => {
    data.forEach(report => {
      L.marker([report.lat, report.lon])
        .addTo(map)
        .bindPopup(`<b>${report.message}</b><br>${report.timestamp}`);
    });
  })
  .catch(error => console.error('Error fetching reports:', error));

// Form submission
document.getElementById("report-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  // Collect form data
  const payload = {
    message: document.getElementById("message").value,
    lat: parseFloat(document.getElementById("lat").value),
    lon: parseFloat(document.getElementById("lon").value),
  };

  // Validate coordinates
  if (isNaN(payload.lat) || isNaN(payload.lon)) {
    alert("Please enter valid numeric coordinates.");
    return;
  }

  try {
    const response = await fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Submitted:", data);

    // Add marker to map
    L.marker([payload.lat, payload.lon])
      .addTo(map)
      .bindPopup(`<b>${payload.message}</b><br>Just submitted`)
      .openPopup(); // Open popup immediately

    // Optionally pan map to new marker
    map.panTo([payload.lat, payload.lon]);

    // Clear form
    document.getElementById("report-form").reset();
  } catch (error) {
    console.error("Error submitting report:", error);
    alert("Failed to submit report. Please try again.");
  }
});