// Initialize the map centered on India
var map = L.map('map').setView([22.9734, 78.6569], 5);

// Satellite view
L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains:['mt0','mt1','mt2','mt3'],
    attribution: '© Google Satellite'
}).addTo(map);

// City and flood icons
var cityIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png',
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -30]
});

var floodIcon = L.icon({
    iconUrl: 'https://cdn-icons-png.flaticon.com/512/981/981203.png',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
});

// Major cities with weather and flood alert capability
var cities = [
    { name: "Delhi", coords: [28.6139, 77.2090], flood: false },
    { name: "Mumbai", coords: [19.0760, 72.8777], flood: true },
    { name: "Kolkata", coords: [22.5726, 88.3639], flood: true },
    { name: "Chennai", coords: [13.0827, 80.2707], flood: false },
    { name: "Hyderabad", coords: [17.3850, 78.4867], flood: false },
    { name: "Bangalore", coords: [12.9716, 77.5946], flood: false },
    { name: "Patna", coords: [25.5941, 85.1376], flood: true },
    { name: "Guwahati", coords: [26.1445, 91.7362], flood: true },
    { name: "Ahmedabad", coords: [23.0225, 72.5714], flood: false }
];

cities.forEach(city => {
    L.marker(city.coords, { icon: city.flood ? floodIcon : cityIcon }).addTo(map)
      .bindPopup(`<b>${city.name}</b><br>Status: ${city.flood ? "⚠️ Flood-prone region" : "✔️ Normal"}`);
});

// Sample GeoJSON polygon for flood-affected zone (Mumbai coastline region)
var floodZone = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[[72.775, 18.93], [72.85, 18.93], [72.85, 19.05], [72.775, 19.05], [72.775, 18.93]]]
    },
    "properties": {
        "name": "Mumbai Coastal Flood Risk Zone"
    }
};

L.geoJSON(floodZone, {
    style: { color: "#ff0000", fillColor: "#ff6666", fillOpacity: 0.5, weight: 2 },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`<b>Flood Region</b><br>${feature.properties.name}`);
    }
}).addTo(map);

// Detect user location
map.locate({ setView: true, maxZoom: 8 });
map.on('locationfound', function(e) {
    L.marker(e.latlng).addTo(map)
        .bindPopup("📍 Your location").openPopup();
    L.circle(e.latlng, { radius: e.accuracy / 2, color: '#007bff', fillOpacity: 0.2 }).addTo(map);
});

// Weather integration placeholder
function getWeather(lat, lon) {
    const apiKey = "YOUR_API_KEY"; // Replace with your OpenWeatherMap key
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            alert("🌤 Weather: " + data.weather[0].description + "\n🌡 Temp: " + (data.main.temp - 273.15).toFixed(1) + "°C");
        })
        .catch(err => alert("Weather info unavailable."));
}

// Get weather on click
map.on('click', function(e) {
    getWeather(e.latlng.lat, e.latlng.lng);
});
