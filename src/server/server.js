const path = require('path')
const express = require('express')
const bodyParser = require("body-parser");
const mockAPIResponse = require('./mockAPI.js')
const dotenv = require("dotenv");
dotenv.config();
const cors = require('cors')
const fetch = require("node-fetch");

const app = express()

//bodyParser as a middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

//cors for cross origin allowance
app.use(cors());

//initialize the main project folder
app.use(express.static('dist'))

console.log(__dirname)

app.get('/', function (req, res) {
    res.sendFile('dist/index.html')
})

const port = process.env.PORT;
// designates what port the app will listen to for incoming requests
app.listen(port, localHost)
function localHost() {
    console.log("Example app listening on port "+ port+"!")
}
app.get('/test', function (req, res) {
    res.send(mockAPIResponse)
})


let travelData=[];
app.post('/countryDateInfo', getCountryDateInfo)



async function getCountryDateInfo(req, res) {
    try{
    const place = req.body.place;
    const country = req.body.country;
    const travelDt = req.body.travelDt;


    //fetching data through geonames api 
    const geoRoot ='http://api.geonames.org/postalCodeSearchJSON?'
    const geoPlaceCntry =`placename=${place}&country=${country}&maxRows=10&username=${process.env.GEONAMES_USERNAME}`
    const geoUrl = geoRoot + geoPlaceCntry
    const geoRootcntryData = await getDataFromGeo(geoUrl);


    //weatherbit api
    const weatherbitRoot ='https://api.weatherbit.io/v2.0/forecast/daily?'
    const weatherbitPlace = `postal_code=${geoRootcntryData.postalCode}&country=${geoRootcntryData.countryCode}&key=${process.env.WEATHERBIT_API_KEY}`
    const weatherbitUrl = weatherbitRoot + weatherbitPlace;
    const weatherbitData = await getDataFromWeatherbit(weatherbitUrl, travelDt)
    

    //pixabayRoot API
    const pixabayRoot = 'https://pixabay.com/api/?'
    const pixbayInput = `key=${process.env.PIXABAY_KEY}&q=${place}+${geoRootcntryData.countryCode}`
    const pixbayUrl = pixabayRoot + pixbayInput
    const pixbayData = await getDataFromPixbayInput(pixbayUrl)
  

    const travelDetails = {
        geoRootcntryData,
        weatherbitData,
        pixbayData


    }
    // console.log("travelDetails",travelDetails);
    travelData.push(travelDetails);
    res.send(travelDetails)
    console.log("travelData",travelData);
    }catch(error) {
        console.log("error", error);
    } 
}


const getDataFromGeo = async (geoUrl) => {
    const response = await fetch(geoUrl);
    try{
        const  geoDatas = await response.json();
        // if(geoDatas.postalCodes[0].countryCode === 'undefined'){
        //     throw 'Please provide a correct city!'
        // }
        const geoData= {   
            postalCode: geoDatas.postalCodes[0].postalCode,
            placeName: geoDatas.postalCodes[0].placeName,
            countryCode: geoDatas.postalCodes[0].countryCode
        }

        // console.log("geoDatas",geoDatas);
        // console.log("geoData",geoData);
        return geoData;
                
    } catch(error) {
        console.log("Country not found , wrong Place & Country", error);
        return "error"
    }   
    
}
const getDataFromWeatherbit = async (weatherbitUrl, travelDt)=>{
    const resp = await fetch(weatherbitUrl);
    try{
        const weatherDatas = await resp.json();
        
        const travelDateDatas = weatherDatas.data.filter(travelDateEachData=>{
            return travelDateEachData.valid_date == travelDt
        })
        // console.log("travelDateDatas==>",travelDateDatas);
        const weatherData ={ 
            travelDate:travelDateDatas[0].valid_date,
            low_temp: travelDateDatas[0].low_temp,
            high_temp: travelDateDatas[0].high_temp,
            snow: travelDateDatas[0].snow,
            uv: travelDateDatas[0].uv,
            // timezone: travelDateDatas[0].timezone

        }
        
        return weatherData;
    }catch(error) {
        console.log("error", error);
    }   
}
const getDataFromPixbayInput = async (pixbayUrl)=>{
    const res = await fetch(pixbayUrl);
    try{
        const pixbayDatas = await res.json();
        const pixbayData ={
            webformatURL: pixbayDatas.hits[0].webformatURL

        }
        return pixbayData
    
    }catch(error) {
        console.log("error", error);
    } 
}
app.get('/getTravelData', (req, res) => {
    res.send(travelData);
})

module.exports.app = app;
