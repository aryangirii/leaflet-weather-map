function fetchWeather(city, coords, flood) {
    const [lat, lon] = coords;

    fetch("https://v4obl7f7r0.execute-api.us-east-1.amazonaws.com/default/getWeatherData", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ lat, lon })
    })
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
                Weather: ${condition}, ${temp} °C<br>
                💧 Humidity: ${humidity}%<br>
                🌬 Wind: ${wind} m/s
            `)
            .openOn(map);
    })
    .catch(() => {
        L.popup()
            .setLatLng(coords)
            .setContent(`<b>${city}</b><br>Weather: Unable to fetch.`)
            .openOn(map);
    });
}
