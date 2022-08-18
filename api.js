const express = require('express');
const app = express();
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const { body } = require('express-validator');
const PORT = 7500;
const view = 'views'
/** ambeedata.com api config */
const ambeedata = axios.create({
    baseURL: 'https://api.ambeedata.com'
});
ambeedata.defaults.headers.common['x-api-key'] = "a196569522ed5069e8f5c29194a0c0b9ff323eef15742a5058eb212c007625a9";
/** SET CONFIG FOR SERVER */
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next();
})
/** API ROUTES */
app.post('/api/cities', async (req, res) => {
    let cities = req.body.cities
    let requests = []
    cities.forEach((city) => {
        requests.push(ambeedata.get(`/latest/by-city?city=${city}`))
    });
    let data = []
    try {
        data = await axios.all(requests)
    } catch (error) {
        res.sendStatus(400);
    }
    let cords = []
    data.forEach((req) => {
        if (req.data.message === 'success') {
            data = req.data.stations[0];
            cords.push({ cord: `lat=${data.lat}&lng=${data.lng}`, city: data.city, placeName: data.placeName, division: data.division })
        }
    })
    requests = [];
    data = [];
    cords.forEach((cord) => {
        requests.push(ambeedata.get(`/weather/latest/by-lat-lng?${cord.cord}`, {
            headers: cord
        }))
    });
    data = await axios.all(requests)
    let weather_data = [];
    data.forEach((req) => {
        headers = req.request._header;
        data = req.data;
        city = headers.slice(headers.indexOf('city:') + 5, headers.indexOf('placeName')).trim();
        place = headers.slice(headers.indexOf('placeName:') + 10, headers.indexOf('division')).trim();
        division = headers.slice(headers.indexOf('division:') + 9, headers.indexOf('User-Agent')).trim();
        if (data.message === 'success') {
            let c = parseInt((data.data.temperature - 32) * 5 / 9)
            weather_data.push({ temp: c, city: city, placeName: place, division: division })

        }
    })
    res.json({ weather: weather_data })
})
/** SET VIEWS */
app.set('view engine', 'ejs');
app.set('views', './views');
app.use(express.static(__dirname + '/assets'));
app.get('/', (req, res) => {
    res.render('index');
});
/** RUN SERVER ON DEFINED PORT */
app.listen(PORT, (e) => (console.log("🚀 ~ Server is running on port", PORT)))
