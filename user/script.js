//------------------------------------------------------------------------------
// js code for screen03 to 10
//------------------------------------------------------------------------------

// called when user click "next" on screen03 and screen04. 
// Store some input value in sessionStorage for leter submition.
function nextScreen(nextScreen) {
  let a = document.getElementById("title").value;
  let b = document.getElementById("category").value;
  let c = document.getElementById("description").innerText;

  sessionStorage.setItem("title", a);
  sessionStorage.setItem("category", b);
  sessionStorage.setItem("description", c);
  sessionStorage.setItem("photoURL", image);
  window.location = "./"+nextScreen+".html";
}

//--------------------------------------------------------------------------------------------
// code for submition, following 3 function work together.
//--------------------------------------------------------------------------------------------
// called when user click "submit" on screen04 and 06.
// collect all user's input data and send a http post request to server.
function submit(nextScreen) {
  let lostfound = document.getElementById("submit").value;
  let title = sessionStorage.getItem("title");
  let category = sessionStorage.getItem("category");
  let description = sessionStorage.getItem("description");
  let photoURL = sessionStorage.getItem("photoURL");
  let date = document.getElementById("date").value;
  let time = document.getElementById("time").value;
  let llocation = document.getElementById("location-input").value;

// pass data values to next fuction to convert to JSON object
  postData(
    lostfound,
    title,
    category,
    description,
    photoURL,
    date,
    time,
    llocation,
    nextScreen
  );
}

// function to handle and convert user's input values to JSON object. prepare for submit data to server.
function postData(
  lostfound,
  title,
  category,
  description,
  photoURL,
  date,
  time,
  llocation,
  nextScreen
) {
  //wrap the value in json object.
  let rawData = {
    lostfound: lostfound,
    title: title,
    category: category,
    description: description,
    photoURL: photoURL,
    date: date,
    time: time,
    location: llocation
  };
  //stringify json object and store the string in JStr
  let jsonData = JSON.stringify(rawData);
  postItemToServer(jsonData, rawData, nextScreen); // call post request
}

// actual function to send POST request, put all data into server's database, and wait for response message.
function postItemToServer(jsonData, rawData, nextScreen) {
  //instantiate a XMLHttpRequest instance
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/postData", true);
  //set 'content-type' in the header, telling the server we're sending a json
  xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");

  xhr.addEventListener("load", function() {
    let responseStr = xhr.responseText; // after send all data to server, get the the queryID back from server.
    alert(responseStr); //  pop-up message from server, show if submition is successful or not.
    
    //when submit successfully, use these user's data to display the item user just submitted.
    let found=rawData.lostfound;
    let title=rawData.title;
    let datef=rawData.date;
    let datet=rawData.date;
    let timef=rawData.time;
    let timet=rawData.time;
    let category=rawData.category;
    let llocation=rawData.location;
    // variables for screen09 or 10, showing what keyword the user search.
    // in this case, just the information user submitted.
    sessionStorage.setItem("location", llocation);
    sessionStorage.setItem("category", category);
    sessionStorage.setItem("datef", datef);
    sessionStorage.setItem("datet", datet);
    sessionStorage.setItem("whereFrom", "submit");
    // when submit successfully, redirect to display screen, display the item user just submitted.
    searchData(found,title, datef, timef, datet, timet, category, llocation, nextScreen);    
  });

  let JStr = jsonData;
  //send out the string
  xhr.send(JStr);
}
//-----------------------------------------------------------------------------------------------------------------------
// end of submition process
//-----------------------------------------------------------------------------------------------------------------------


// when first time open screen02, automatically send request to check if there is database or not.
function checkDB() {
  let url = "/checkDB";
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url);
  // Next, add an event listener for when the HTTP response is loaded
  xhr.addEventListener("load", function() {
    let responseStr = xhr.responseText; // get response whether "postcards.db" exist or not
  });
  // Actually send request to server
  xhr.send();
}

//------------------------------------------------------------------------------
// upload photo part, same as assignment3, upload picture to Glitch, and then Glitch upload to ecs162.org
//------------------------------------------------------------------------------

var image;
// Add event listener to the file input element
document.getElementById("file-upload").addEventListener("change", uploadFile);

// this function upload image to server.
// I just copy/paste the example code from assignment prompt, then added something. ^_^
function uploadFile() {
  // get the file chosen by the file dialog control
  const selectedFile = document.getElementById("file-upload").files[0];
  // store it in a FormData object
  const formData = new FormData();
  // name of field, the file itself, and its name
  formData.append("newImage", selectedFile, selectedFile.name);

  // build a browser-style HTTP request data structure
  const xhr = new XMLHttpRequest();
  // it will be a POST request, the URL will this page's URL+"/upload"
  xhr.open("POST", "/upload", true);

  // callback function executed when the HTTP response comes back
  xhr.onloadend = function(e) {
    // Get the server's response body
    console.log(xhr.responseText);

    if (xhr.status == 200) {
      sendGetRequest();
    } else {
      alert("Failed to upload image");
    }
  };
  // actually send the request
  xhr.send(formData);
}

// codes from class example, after upload image to Glitch, request Glitch upload image to ECS162, and get the image's location back.
function sendGetRequest() {
  let xhr = new XMLHttpRequest();
  // it's a GET request, it goes to URL /seneUploadToAPI
  xhr.open("GET", "/sendUploadToAPI");

  // Add an event listener for when the HTTP response is loaded
  xhr.addEventListener("load", function() {
    let newImage = document.getElementById("serverImage");
    newImage.src = "http://ecs162.org:3000/images/" + xhr.responseText;

    image = "http://ecs162.org:3000/images/" + xhr.responseText; // put image address into json object, for later "share Postcard"

    document.getElementById("serverImage").style.display = "block";
  });
  // Actually send request to server
  xhr.send();
}
//------------------------------------------------------------------------------------------------------------------------------------------
// end of upload photo part
//-------------------------------------------------------------------------------------------------------------------------------------------


//------------------------------------------------------------------------------------------------------------------------------------------
// search existing items part
//------------------------------------------------------------------------------------------------------------------------------------------

// when user click "search" on screen05 or 08, collect all user's input keywords.
function search(nextScreen) {
  let title = document.getElementById("title").innerText;
  let found = document.getElementById("search").value;
  let datef = document.getElementById("datef").value;
  let timef = document.getElementById("timef").value;
  let datet = document.getElementById("datet").value;
  let timet = document.getElementById("timet").value;
  let category = document.getElementById("category").value;
  let llocation = document.getElementById("location-input").value;
  
  // variables for screen09 or 10, under "showing result for", those are the keywords user search.
  sessionStorage.setItem("location", llocation);
  sessionStorage.setItem("category", category);
  sessionStorage.setItem("datef", datef);
  sessionStorage.setItem("datet", datet);
  sessionStorage.setItem("whereFrom", "search");

  searchData(found, title, datef, timef, datet, timet, category, llocation, nextScreen);
}

// put values into one JSON object, prepare for sending http request to ask database. 
function searchData(found, title, datef, timef, datet, timet, category, llocation, nextScreen) {
  let a = {
    lostfound: found,
    title:title,
    category: category,
    datef: datef,
    timef: timef,
    datet: datet,
    timet: timet,
    location: llocation
  };
  //stringify json object and store the string in JStr
  let jsonData = JSON.stringify(a);

  searchItemInDB(jsonData, nextScreen);
}

// actual function to send http request. Ask database to find matched items, and send them back.
function searchItemInDB(jsonData, nextScreen) {
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/SearchItemInDB", true);
  xhr.setRequestHeader("Content-type", "application/json;charset=UTF-8");
  xhr.addEventListener("load", function() {
    let responseStr = xhr.responseText;  // after send all data to server, get all matched data back from server.
    sessionStorage.setItem("SearchResult", responseStr);  // store response data (matched items) for next page to display.
    window.location="./"+nextScreen+".html";  // redirect to screen09 or 10.
  });

  let JStr = jsonData;
  //send out the string
  xhr.send(JStr);
}
//------------------------------------------------------------------------------
// end of searching items part
//------------------------------------------------------------------------------


//---------------------------------------------------------------------------------------------------------------
// handle result data display when user first see screen09,10.
//---------------------------------------------------------------------------------------------------------------
var numOfItems;
var currentPage;
var currentItem;
var resultData;
var totalPages;
var searchCategory
var searchLocation
var searchDatef, searchDatet;  // varible for display items' information.

// main function to handle data in display pages (screen09 and 10). 
function DisplayResult(){
  
  searchCategory = sessionStorage.getItem("category");  // get user search keywords from previous page.
  searchLocation = sessionStorage.getItem("location");
  searchDatef = sessionStorage.getItem("datef");
  searchDatet = sessionStorage.getItem("datet");
  
  // manipulate user's input keywords. convert numeric date to short date format (ie. 2020-06-07 to Jun 7th).
  let datef, datet;  // datef is date from. datet is date to.
  
  if (searchDatef != ""){
  let tempdatef = new Date (searchDatef+"T12:00:00.000Z"); //pending 
  let monthf = new Intl.DateTimeFormat('en', { month: 'short' }).format(tempdatef); 
  let dayf = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(tempdatef); 
   datef = monthf + " " + convertDay(dayf);
  }else{datef = "";}
  
  if (searchDatet !=""){
    let tempdatet = new Date (searchDatet+"T12:00:00.000Z");
    let montht = new Intl.DateTimeFormat('en', { month: 'short' }).format(tempdatet);
    let dayt = new Intl.DateTimeFormat('en', { day: 'numeric' }).format(tempdatet);
   datet = montht +" "+convertDay(dayt);
  }else{datet = "";}
  
  let searchDate = datef + " - " + datet;
 
  document.getElementById("searchCategory").innerHTML = searchCategory+",";
  document.getElementById("searchLocation").innerHTML = searchLocation;
  document.getElementById("searchDate").innerHTML = searchDate+",";
  
  /////////////////////////////////////////////// extract server response result, set up number of items and pages
  let x = sessionStorage.getItem("SearchResult");
  
  if (x == "No Item found!"){  // if no matched items found, display "no result found"
    document.getElementById("noResult").style.display="block";
  }else{
  resultData = JSON.parse(x);  // convert server response to JSON object. 
  numOfItems = resultData.length;
  currentPage = 0;
  currentItem = 0;
  if ((numOfItems%5) == 0){   // set up how many pages need to display
    totalPages = numOfItems/5;
  }else{
    totalPages = ~~(numOfItems/5) + 1;
  }
  document.getElementById("totalPages").innerHTML = "&nbspof "+totalPages;  // actually show pages number
  document.getElementById("currentPage").innerHTML = currentPage + 1;
  
//////////////////////////////////// fill all values into each display collapseble box, each page display 5 items.
  if (numOfItems >=5){
    let i;
    for (i=0; i<5; i++){
      document.getElementById("item"+i).style.display="block";
      if (resultData[currentItem+i]["photoURL"] != "undefined"){
          document.getElementById("photo"+i).style.display="block";
          document.getElementById("photo"+i).src=resultData[currentItem+i]["photoURL"];
        }else{
          document.getElementById("photo"+i).style.display="none";
        }
      document.getElementById("title"+i).innerHTML=resultData[currentItem+i]["title"];
      document.getElementById("category"+i).innerHTML=resultData[currentItem+i]["category"];
      document.getElementById("location"+i).innerHTML=resultData[currentItem+i]["location"];
      document.getElementById("date"+i).innerHTML=resultData[currentItem+i]["date"];
      document.getElementById("time"+i).innerHTML=",&nbsp" + resultData[currentItem+i]["time"];
      document.getElementById("description"+i).innerHTML=resultData[currentItem+i]["description"];    
    }
  }else{
    let i;
    for (i=0; i<numOfItems; i++){
      document.getElementById("item"+i).style.display="block";
      if (resultData[currentItem+i]["photoURL"] != "undefined"){
          document.getElementById("photo"+i).style.display="block";
          document.getElementById("photo"+i).src=resultData[currentItem+i]["photoURL"];
        }else{
          document.getElementById("photo"+i).style.display="none";
        }
      document.getElementById("title"+i).innerHTML=resultData[currentItem+i]["title"];
      document.getElementById("category"+i).innerHTML=resultData[currentItem+i]["category"];
      document.getElementById("location"+i).innerHTML=resultData[currentItem+i]["location"];
      document.getElementById("date"+i).innerHTML=resultData[currentItem+i]["date"];
      document.getElementById("time"+i).innerHTML=",&nbsp"+resultData[currentItem+i]["time"];
      document.getElementById("description"+i).innerHTML=resultData[currentItem+i]["description"];  
    }
  }
  }
}
//------------------------------------------------------------------------------------------------------------
// end of first time load (display) screen09, 10.
//------------------------------------------------------------------------------------------------------------


//-------------------------------------------------------------------------------------------------
// screen09, 10 "Previous" and "Next" button part
//-------------------------------------------------------------------------------------------------
///////////////////////////////////////////////////////////////////////////////////////////////////
// control the behavior of "Prev" button on screen09, 10. if already in first page, do nothing. 
function previous(apNum){
  if (currentPage-1 >= 0){
  currentPage = currentPage - 1;
  currentItem = currentPage * 5;
  document.getElementById("currentPage").innerHTML = currentPage + 1;
    
  let close = document.getElementsByClassName("accordion"+apNum);
  let cpanel= document.getElementsByClassName("panel"+apNum);
  let j;
  for (j=0; j<close.length; j++){  // loop to collapse drag down items
    close[j].className="accordion"+apNum;
  }
  for (j=0; j<cpanel.length; j++){
    cpanel[j].style.maxHeight = null;
  }
  
  let i;
  for (i=0; i<5; i++){  // loop to fill new items into new (previous) pages.
    document.getElementById("item"+i).style.display="block";
    if (resultData[currentItem+i]["photoURL"] != "undefined"){
          document.getElementById("photo"+i).style.display="block";
          document.getElementById("photo"+i).src=resultData[currentItem+i]["photoURL"];
        }else{
          document.getElementById("photo"+i).style.display="none";
        }
    document.getElementById("title"+i).innerHTML=resultData[currentItem+i]["title"];
    document.getElementById("category"+i).innerHTML=resultData[currentItem+i]["category"];
    document.getElementById("location"+i).innerHTML=resultData[currentItem+i]["location"];
    document.getElementById("date"+i).innerHTML=resultData[currentItem+i]["date"];
    document.getElementById("time"+i).innerHTML=",&nbsp"+resultData[currentItem+i]["time"];
    document.getElementById("description"+i).innerHTML=resultData[currentItem+i]["description"];  
  }  
}
}
/////////////////////////////////////////////////////////////////////////////////////////////////
// control the behavior of "Next" button on screen09, 10. if already in last page, do nothing.
function next(apNum){
  if (currentPage+1 < totalPages){
  currentPage = currentPage + 1;
  currentItem = currentPage * 5;
  document.getElementById("currentPage").innerHTML = currentPage + 1;
    
  let close = document.getElementsByClassName("accordion"+apNum);
  let cpanel= document.getElementsByClassName("panel"+apNum);
  let j;
  for (j=0; j<close.length; j++){  // loop to collapse drag down items
    close[j].className="accordion"+apNum;
  }
  for (j=0; j<cpanel.length; j++){
    cpanel[j].style.maxHeight = null;
  }
  
  let i;
  for (i=0; i<5; i++){ 
    document.getElementById("item"+i).style.display="none";  // disable all display boxes, for different # of items in prev/next.
  }
  
  if ((numOfItems-currentItem) >= 5 )  // loop to fill new items into new (next) pages.
    {
      let i;
      for (i=0; i<5; i++){
        document.getElementById("item"+i).style.display="block";
        if (resultData[currentItem+i]["photoURL"] != "undefined"){
          document.getElementById("photo"+i).style.display="block";
          document.getElementById("photo"+i).src=resultData[currentItem+i]["photoURL"];
        }else{
          document.getElementById("photo"+i).style.display="none";
        }
        document.getElementById("title"+i).innerHTML=resultData[currentItem+i]["title"];
        document.getElementById("category"+i).innerHTML=resultData[currentItem+i]["category"];
        document.getElementById("location"+i).innerHTML=resultData[currentItem+i]["location"];
        document.getElementById("date"+i).innerHTML=resultData[currentItem+i]["date"];
        document.getElementById("time"+i).innerHTML=",&nbsp"+resultData[currentItem+i]["time"];
        document.getElementById("description"+i).innerHTML=resultData[currentItem+i]["description"];  
      }
    }else{
      let i;
      for (i=0; i<(numOfItems-currentItem); i++){
        document.getElementById("item"+i).style.display="block";
        if (resultData[currentItem+i]["photoURL"] != "undefined"){
          document.getElementById("photo"+i).style.display="block";
          document.getElementById("photo"+i).src=resultData[currentItem+i]["photoURL"];
        }else{
          document.getElementById("photo"+i).style.display="none";
        }
        document.getElementById("title"+i).innerHTML=resultData[currentItem+i]["title"];
        document.getElementById("category"+i).innerHTML=resultData[currentItem+i]["category"];
        document.getElementById("location"+i).innerHTML=resultData[currentItem+i]["location"];
        document.getElementById("date"+i).innerHTML=resultData[currentItem+i]["date"];
        document.getElementById("time"+i).innerHTML=",&nbsp"+resultData[currentItem+i]["time"];
        document.getElementById("description"+i).innerHTML=resultData[currentItem+i]["description"];  
      }
    }
}
}
//------------------------------------------------------------------------------------------------------------
// end of "Previous" and "Next" button part
//------------------------------------------------------------------------------------------------------------


// function to convert numeric date to short alphabet format
// i.e. (2020-06-07) to (Jun 7th)
function convertDay(day){
    if ((day == "1") | (day == "2") | (day == "3")) {
    if (day == "1") {
      day = "1st";
    } else {
      if (day == "2") {
        day = "2nd";
      } else {
        day = "3rd";
      }
    }
  } else {
    day = day + "th";
  }
  return day;
}

///////////////////////////////////////////////////////////////////////////////////    navigation part
// control redirect when click "edit search" on screen09,10.
// if user just submited new item (from screen04, 07), will redirect to screen02.
// if user just searched something (from screen05, 08), will back to screen05,08. 
function backPage(){
  let whereFrom = sessionStorage.getItem("whereFrom");
  if (whereFrom == "submit"){
    window.location = './screen02.html';
  }else{
    window.history.back();
  }  
}

// when user hit "enter" key on screen03,04 or screen06,07 on bottom searching bar
// will go to searching pages screen05 or 08.
function addBarListener(){
  document.getElementById("searchBarInput").addEventListener("keyup", function(even){
  if (even.keyCode === 13){
    event.preventDefault();
    document.getElementById("littleMagnifier").click();
  }
});
}
// work with above, fill user input from searching bar.
function loadPreviousBarInput(){
  let input = sessionStorage.getItem("searchBarInput");
  if (input != ""){
    document.getElementById("title").innerHTML = input;
  } 
}

// when user click samll magnifier on searching bar, go to screen05,08.
function finderSearch(){
  let input = document.getElementById("searchBarInput").innerText;
  sessionStorage.setItem("searchBarInput", input);
  window.location = './screen05.html';
}
function seekerSearch(){
  window.location="./screen08.html"
  let input = document.getElementById("searchBarInput").innerText;
  sessionStorage.setItem("searchBarInput", input);
}
