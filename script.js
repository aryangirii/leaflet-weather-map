// 🌍 Leaflet Map with Weather, Flood & Layers
const map = L.map('map').setView([22.9734, 78.6569], 5);

// 🗺️ Base Layers
const satellite = L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0','mt1','mt2','mt3'],
    attribution: '© Google'
}).addTo(map);

const street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
});

// 👇 Layer Control
L.control.layers({
  "🌐 Satellite": satellite,
  "🗺️ Street Map": street
}).addTo(map);

// 📍 City + Flood Icons
const cityIcon = L.icon({
    iconUrl: 'icons/city.png',
    iconSize: [22, 22],
    iconAnchor: [11, 22],
    popupAnchor: [0, -25]
});
const floodIcon = L.icon({
    iconUrl: 'icons/flood.png',
    iconSize: [26, 26],
    iconAnchor: [13, 26],
    popupAnchor: [0, -28]
});
const userIcon = L.icon({
    iconUrl: 'icons/user.png',
    iconSize: [18, 18],
    iconAnchor: [9, 18],
    popupAnchor: [0, -20]
});

// 🏙️ City Data
const cityData = {
    "delhi": { coords: [28.6139, 77.2090], flood: false },
    "mumbai": { coords: [19.0760, 72.8777], flood: true },
    "chennai": { coords: [13.0827, 80.2707], flood: false },
    "hyderabad": { coords: [17.3850, 78.4867], flood: false },
    "bangalore": { coords: [12.9716, 77.5946], flood: false },
    "guwahati": { coords: [26.1445, 91.7362], flood: true },
    "ahmedabad": { coords: [23.0225, 72.5714], flood: false },
    "pune": { coords: [18.5204, 73.8567], flood: false }
};

// 📌 Mark Cities
for (let city in cityData) {
    const data = cityData[city];
    L.marker(data.coords, { icon: data.flood ? floodIcon : cityIcon })
      .addTo(map)
      .bindPopup(`<b>${city.charAt(0).toUpperCase() + city.slice(1)}</b><br>Flood Risk: ${data.flood ? "⚠️ High" : "✅ Safe"}<br>Click search for live weather.`);
}

// 🧠 Live Weather (OpenWeatherMap)
function fetchWeather(city, coords, flood) {
    const apiKey = "d830780e5a507f4a143252ba2bd375fb";
    const [lat, lon] = coords;
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const temp = data.main.temp;
            const condition = data.weather[0].description;
            const icon = data.weather[0].icon;
            const humidity = data.main.humidity;
            const wind = data.wind.speed;
            const iconUrl = `https://openweathermap.org/img/wn/${icon}@2x.png`;

            L.popup()
              .setLatLng(coords)
              .setContent(`
                <b>${city.charAt(0).toUpperCase() + city.slice(1)}</b><br>
                Flood Risk: ${flood ? "⚠️ High" : "✅ Safe"}<br>
                <img src="${iconUrl}" width="50"><br>
                ${condition}, ${temp}°C<br>
                💧 Humidity: ${humidity}%<br>
                🌬 Wind: ${wind} m/s
              `).openOn(map);
        })
        .catch(() => {
            alert("⚠️ Unable to fetch weather.");
        });
}

// 📍 User Location
map.locate({ setView: false, maxZoom: 8 });
map.on('locationfound', function(e) {
    L.marker(e.latlng, { icon: userIcon })
      .addTo(map)
      .bindPopup("📍 You are here").openPopup();

    L.circle(e.latlng, { radius: e.accuracy / 2, color: '#007bff', fillOpacity: 0.2 }).addTo(map);
});

// 🔍 Search UI
var searchBox = L.control({ position: 'topright' });
searchBox.onAdd = function () {
    var div = L.DomUtil.create('div', 'search-container');
    div.innerHTML = '<input type="text" id="citySearch" placeholder="Search city..." style="padding:4px;width:160px;border-radius:5px;border:1px solid #aaa;">';
    return div;
};
searchBox.addTo(map);

// 🔍 Search Logic
document.addEventListener('DOMContentLoaded', function () {
    var input = document.getElementById("citySearch");
    input.addEventListener("keyup", function (e) {
        if (e.key === "Enter") {
            var query = input.value.toLowerCase();
            if (cityData[query]) {
                const city = cityData[query];
                map.setView(city.coords, 10);
                fetchWeather(query, city.coords, city.flood);
            } else {
                alert("❌ City not found.");
            }
        }
    });
});

// 🛑 Flood Polygon
const floodZone = {
    "type": "Feature",
    "geometry": {
        "type": "Polygon",
        "coordinates": [[[72.775, 18.93], [72.85, 18.93], [72.85, 19.05], [72.775, 19.05], [72.775, 18.93]]]
    },
    "properties": { "name": "Mumbai Coastal Flood Risk Zone" }
};
L.geoJSON(floodZone, {
    style: {
        color: "#d00000",
        fillColor: "#ff4d4d",
        fillOpacity: 0.35,
        weight: 3,
        dashArray: '5, 10',
        opacity: 0.9
    },
    onEachFeature: function (feature, layer) {
        layer.bindPopup(`<b>Flood Region</b><br>${feature.properties.name}`);
        layer.bindTooltip(feature.properties.name, {
            permanent: true,
            direction: "center",
            className: 'flood-label'
        });
    }
}).addTo(map);
