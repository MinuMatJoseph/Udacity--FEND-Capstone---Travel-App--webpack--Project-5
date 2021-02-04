let inputTxt = "";

function handleSubmit(event) {
      event.preventDefault()
      const inputValue = document.getElementById('place') 
      inputTxt = inputValue.value;
      const selectValue = document.getElementById('country');
      const travelDate = document.getElementById('travel-date');

      // check valid data into the form field
      const getSelectValue = selectValue.options[selectValue.selectedIndex].value;
      const dt = daysDiff(travelDate.value)
         
      if((inputValue.value === ' ') ||(getSelectValue === ' ') || (inputValue.value == '') || (getSelectValue == '')){
        alert('Enter valid place and select valid country')
          return;
        }
      if(dt >= 15) { 
        alert(`You check your after ${(dt-16)+2} days`)
        return;
        
      }
      if(dt < -1){
        alert("Enter valid date please")
        return;
      }
      console.log("::: Form Submitted :::")
      postCountryDateInfo('http://localhost:8081/countryDateInfo', {place:inputValue.value, country:getSelectValue, travelDt:travelDate.value})
        .then(function(res){
          const entries = Object.entries(res);
          console.log("entries==>", entries.length);
          if(res.geoRootcntryData == "error"){
            alert("Place not found , Enter valid place & country");
          }
        
         getTravelDetails()
        })
      
}


//fetch api
const postCountryDateInfo = async (url="", data={}) => {
  const response = await fetch(url, {
    method: 'POST', 
    mode: 'cors',
    credentials: 'same-origin',
    headers: {
        'Content-Type': 'application/json'
    },
   // Body data type must match "Content-Type" header        
    body: JSON.stringify(data),
})
try{
  const newTravelDetail = await response.json();
  return newTravelDetail;
}catch(error) {
  console.log("error formHandler", error);
}
}


//get api data

const getTravelDetails = async () => {
  try{
    const res = await fetch('http://localhost:8081/getTravelData')
    const travelDetails = await res.json()
    const travelLen = travelDetails.length -1
    console.log("travelDetails", travelDetails.length," + ", travelLen," + ", travelDetails );
   const ctryFlg = (travelDetails[travelLen].geoRootcntryData.countryCode).toLowerCase()
   console.log("ctryFlg", ctryFlg)
    if(travelDetails.length > 0){
     document.getElementById('cityname').innerHTML = "City Name:  "+ inputTxt;
      document.getElementById('countryCode').innerHTML = "Country:  "+travelDetails[travelLen].geoRootcntryData.countryCode +"<img class='img-flag' src=http://www.geonames.org/flags/x/"+ctryFlg+".gif alt='country flag'>";
      document.getElementById('travelDate').innerHTML = "Travel Date:  " +travelDetails[travelLen].weatherbitData.travelDate;
      document.getElementById('tempMax').innerHTML = "Max temp:   " +Math.round((travelDetails[travelLen].weatherbitData.high_temp* 9.0)/5.0+32) + "\u00B0 F";
      document.getElementById('tempMin').innerHTML = "Min temp:  " +Math.round((travelDetails[travelLen].weatherbitData.low_temp* 9.0)/5.0+32) + "\u00B0 F";
      document.getElementById('snow').innerHTML = "Snow:  " +Math.round(travelDetails[travelLen].weatherbitData.snow);
      document.getElementById('uv').innerHTML = "UV:  " +Math.round(travelDetails[travelLen].weatherbitData.uv);
      document.getElementById('img').innerHTML = "<img src="+travelDetails[travelLen].pixbayData.webformatURL+">"
     
    
    }
    
  }catch(error) {
    console.log("error formHandler", error);
    }
}


const daysDiff = (trvlDt) => {

  const d1 = new Date(trvlDt);   
  const d2 = new Date(); 
  const diff = d1.getTime() - d2.getTime();   
  const daydiff = (diff /(1000 * 60 * 60 * 24)).toFixed(0); 
  return daydiff;
}


export { handleSubmit }

