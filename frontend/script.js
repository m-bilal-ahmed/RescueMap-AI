const map = L.map('map').setView([28.5383, -81.3792], 6);  // Orlando, FL default
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

// Fetch reports
fetch("/reports")
  .then(res => res.json())
  .then(data => {
    data.forEach(report => {
      L.marker([report.lat, report.lon])
        .addTo(map)
        .bindPopup(`<b>${report.message}</b><br>${report.timestamp}`);
    });
  })
  .catch(error => console.error('Error:', error));

// Form submission
document.getElementById("report-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const message = document.getElementById("message").value;
  const lat = parseFloat(document.getElementById("lat").value);
  const lon = parseFloat(document.getElementById("lon").value);

  if (isNaN(lat) || isNaN(lon)) {
    alert("Please enter valid numeric coordinates.");
    return;
  }

  fetch("/submit", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ message, lat, lon })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Submitted:", data);
      // Add marker immediately
      L.marker([lat, lon])
        .addTo(map)
        .bindPopup(`<b>${message}</b><br>Just submitted`);
      // Clear form
      document.getElementById("report-form").reset();
    })
    .catch(error => console.error("Error submitting report:", error));
});