//------------------------------------------------------------------------------
// many modules
//------------------------------------------------------------------------------

// some of the ones we have used before
const express = require("express");
const bodyParser = require("body-parser");
const assets = require("./assets");
//const sqlite3 = require('sqlite3');  // we'll need this later

var fs = require("fs");
const FormData = require("form-data");
const sql = require("sqlite3").verbose();

const app = express();

// and some new ones related to doing the login process
// this module handles the login process and process of pulling user data out of DB
const passport = require("passport");
// There are other strategies, including Facebook and Spotify
const GoogleStrategy = require("passport-google-oauth20").Strategy;

// Some modules related to cookies, which indicate that the user
// is logged in
// this module is used to put cookie data into the requesr
const cookieParser = require("cookie-parser");
// this module is used to decrypt the cookies and check & see if they have expired
const expressSession = require("express-session");
const request = require("request");

app.use(express.json());

//------------------------------------------------------------------------------
// google login part
//------------------------------------------------------------------------------

// Before authenticating requests, the strategy (or strategies) used by an application must be configured.
passport.use(
  new GoogleStrategy(
    // object containing data to be sent to Google to kick off the login process
    // the process.env values come from the key.env file of your app
    // They won't be found unless you have put in a client ID and secret for
    // the project you set up at Google
    {
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      callbackURL: "https://metacoders-ucd-lf.glitch.me/auth/accepted", // addr in which Google should get back to me
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo", // where to go for info
      scope: ["profile", "email"] // the information we will ask for from Google, step 3) want to ask for email too
    },
    // function to call to once login is accomplished, to get info about user from Google;
    // it is defined down below.
    gotProfile
  )
);

// Start setting up the Server pipeline

console.log("setting up pipeline");

// take HTTP message body and put it as a string into req.body
app.use(bodyParser.urlencoded({ extended: true }));

// puts cookies into req.cookies
app.use(cookieParser());

// pipeline stage that echos the url and shows the cookies, for debugging.
app.use("/", printIncomingRequest);

// Now some stages that decrypt and use cookies

// express handles decryption of cooikes, storage of data about the session,
// and deletes cookies when they expire
app.use(
  expressSession({
    secret: "chocolateChip", // a random string used for encryption of cookies
    maxAge: 6 * 60 * 60 * 1000, // Cookie time out - six hours in milliseconds
    // setting these to default values to prevent warning messages
    resave: true,
    saveUninitialized: false,
    // make a named session cookie; makes one called "connect.sid" as well
    name: "ecs162-session-cookie"
  })
);

// Initializes request object for further handling by passport
app.use(passport.initialize());

// If there is a valid cookie, will call passport.deserializeUser()
// which is defined below.  We can use this to get user data out of
// a user database table, if we make one.
// Does nothing if there is no cookie
app.use(passport.session());

// currently not used
// using this route, we can clear the cookie and close the session
app.get("/logoff", function(req, res) {
  res.clearCookie("google-passport-example");
  res.redirect("/");
});

// The usual pipeline stages

// Public files are still serverd as usual out of /public
app.get("/*", express.static("public"));

// special case for base URL, goes to index.html
app.get("/", function(req, res) {
  res.sendFile(__dirname + "/public/screen01.html");
});

// Glitch assests directory
app.use("/assets", assets);

// stage to serve files from /user, only works if user in logged in

// If user data is populated (by deserializeUser) and the
// session cookie is present, get files out
// of /user using a static server.
// Otherwise, user is redirected to public splash page (/index) by
// requireLogin (defined below)
app.get("/user/*", requireUser, requireLogin, express.static("."));

// Now the pipeline stages that handle the login process itself

// Handler for url that starts off login with Google.
// The app (in public/index.html) links to here (note not an AJAX request!)
// Kicks off login process by telling Browser to redirect to Google.
app.get("/auth/google", passport.authenticate("google"));
// The first time its called, passport.authenticate sends 302
// response (redirect) to the Browser
// with fancy redirect URL that Browser will send to Google,
// containing request for profile, and
// using this app's client ID string to identify the app trying to log in.
// The Browser passes this on to Google, which brings up the login screen.

// Google redirects here after user successfully logs in.
// This second call to "passport.authenticate" will issue Server's own HTTPS
// request to Google to access the user's profile information with the
// temporary key we got from Google.
// After that, it calls gotProfile, so we can, for instance, store the profile in
// a user database table.
// Then it will call passport.serializeUser, also defined below.
// Then it either sends a response to Google redirecting to the /setcookie endpoint, below
// or, if failure, it goes back to the public splash page.
app.get(
  "/auth/accepted",
  passport.authenticate("google", {
    successRedirect: "/setcookie",
    failureRedirect: "/"
  })
);

// One more time! a cookie is set before redirecting
// to the protected homepage
// this route uses two middleware functions.
// requireUser is defined below; it makes sure req.user is defined
// The second one makse sure the referred request came from Google, and if so,
// goes ahead and marks the date of the cookie in a property called
// google-passport-example
app.get("/setcookie", requireUser, function(req, res) {
  //    if(req.get('Referrer') && req.get('Referrer').indexOf("google.com")!=-1){          // I comment few lines of this function, you can delete later.
  // mark the birth of this cookie
  res.cookie("google-passport-example", new Date());
  res.redirect("/user/screen02.html");
  //    } else {
  //       res.redirect('/');
  //    }
});

//------------------------------------------------------------------------------
// end of google login part
//------------------------------------------------------------------------------

// Some functions called by the handlers in the pipeline above

// Function for debugging. Just prints the incoming URL, and calls next.
// Never sends response back.
function printIncomingRequest(req, res, next) {
  console.log("Serving", req.url);
  if (req.cookies) {
    console.log("cookies", req.cookies);
  }
  next();
}

// function that handles response from Google containint the profiles information.
// It is called by Passport after the second time passport.authenticate
// is called (in /auth/accepted/)
function gotProfile(accessToken, refreshToken, profile, done) {
  console.log("Google profile", profile);
  // here is a good place to check if user is in DB,
  // and to store him in DB if not already there.
  // Second arg to "done" will be passed into serializeUser,
  // should be key to get user out of database.

  let dbRowID = profile.emails[0].value.split("@")[1]; /////////////////// add this to replace next line.
  console.log("dbRowID:" + dbRowID);

  if (dbRowID != "ucdavis.edu") {
    console.log("This is not UCD email!"); // for test purpose, can delete.
    request.get(
      "https://accounts.google.com/o/oauth2/revoke",
      {
        qs: { token: accessToken }
      },
      function(err, res, body) {
        console.log("revoked token");
      }
    );
  }

  //let dbRowID = 1;  // temporary! Should be the real unique //////////////////////////// can delete this.

  // key for db Row for this user in DB table.
  // Note: cannot be zero, has to be something that evaluates to
  // True.

  // in gotProfile, when you determine that user has not used a UC Davis email, run the following lines to send an API request to Google to ask
  // them to invalidate the Server's token

  /*request.get('https://accounts.google.com/o/oauth2/revoke', { 
  qs:{token: accessToken }},  function (err, res, body) {
          console.log("revoked token");
  }) */

  done(null, dbRowID);
}

// Part of Server's sesssion set-up.
// The second operand of "done" becomes the input to deserializeUser
// on every subsequent HTTP request with this session's cookie.
// For instance, if there was some specific profile information, or
// some user history with this Website we pull out of the user table
// using dbRowID.  But for now we'll just pass out the dbRowID itself.
passport.serializeUser((dbRowID, done) => {
  console.log("SerializeUser. Input is", dbRowID);
  done(null, dbRowID);
});

// Called by passport.session pipeline stage on every HTTP request with
// a current session cookie (so, while user is logged in)
// This time,
// whatever we pass in the "done" callback goes into the req.user property
// and can be grabbed from there by other middleware functions
passport.deserializeUser((dbRowID, done) => {
  console.log("deserializeUser. Input is:", dbRowID);
  // here is a good place to look up user data in database using
  // dbRowID. Put whatever you want into an object. It ends up
  // as the property "user" of the "req" object.
  //let userData = {userData: "maybe data from db row goes here"};    /////////////////// I comment this line, can delete it.
  let userData = dbRowID;
  done(null, userData);
});

function requireUser(req, res, next) {
  if (req.user != "ucdavis.edu") {
    ///////////// I made change here
    console.log("Please, Log-in with UCD email!"); //////////// I made change here
    // if unacceptable user, redirect to splash page + warning alert
    res.redirect("/warning.html");
  } else {
    console.log("user is", req.user);
    next();
  }
}

function requireLogin(req, res, next) {
  console.log("checking:", req.cookies);
  if (!req.cookies["ecs162-session-cookie"]) {
    res.redirect("/");
  } else {
    next();
  }
}

//------------------------------------------------------------------------------
// upload photo part
//------------------------------------------------------------------------------
var imageName;
const multer = require("multer");

// Make a "storage" object that explains to multer where to store the images...in /images
let storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, __dirname + "/images");
  },
  // keep the file's original name
  // the default behavior is to make up a random string
  filename: function(req, file, cb) {
    cb(null, file.originalname);
  }
});

// Use that storage object we just made to make a multer object that knows how to
// parse FormData objects and store the files they contain
let uploadMulter = multer({ storage: storage });

// First, server any static file requests
app.use(express.static("public"));

// Next, serve any images out of the /images directory
app.use("/images", express.static("images"));

// Next, handle post request to upload an image
// by calling the "single" method of the object uploadMulter that we made above
app.post("/upload", uploadMulter.single("newImage"), function(
  request,
  response
) {
  // file is automatically stored in /images
  // WARNING!  Even though Glitch is storing the file, it won't show up
  // when you look at the /images directory when browsing your project
  // until later (or unless you open the console (Tools->Terminal) and type "refresh").
  // So sorry.
  console.log(
    "Recieved",
    request.file.originalname,
    request.file.size,
    "bytes"
  );
  // the file object "request.file" is truthy if the file exists
  if (request.file) {
    // Always send HTTP response back to the browser.  In this case it's just a quick note.
    response.end("Server recieved " + request.file.originalname);
    imageName = "/images/" + request.file.originalname;
  } else throw "error";
});

// function called when the button is pushed
// handles the upload to the media storage API
function sendMediaStore(imageName, serverRequest, serverResponse) {
  let apiKey = process.env.ECS162KEY;
  if (apiKey === undefined) {
    serverResponse.status(400);
    serverResponse.send("No API key provided");
  } else {
    // we'll send the image from the server in a FormData object
    let form = new FormData();

    // we can stick other stuff in there too, like the apiKey
    form.append("apiKey", apiKey);
    // stick the image into the formdata object
    form.append("storeImage", fs.createReadStream(__dirname + imageName));
    // and send it off to this URL
    form.submit("http://ecs162.org:3000/fileUploadToAPI", function(
      err,
      APIres
    ) {
      // did we get a response from the API server at all?
      if (APIres) {
        // OK we did
        console.log("API response status", APIres.statusCode);
        // the body arrives in chunks - how gruesome!
        // this is the kind stream handling that the body-parser
        // module handles for us in Express.
        let body = "";
        APIres.on("data", chunk => {
          body += chunk;
        });
        APIres.on("end", () => {
          // now we have the whole body
          if (APIres.statusCode != 200) {
            serverResponse.status(400); // bad request
            serverResponse.send(" Media server says: " + body);
          } else {
            serverResponse.status(200);
            serverResponse.send(body);
            fs.unlink("." + imageName, err => {
              if (err) {
                console.log("CANNOT DELETE /images!"); // code to delete Glitch image after upload to ecs162
              }
            });
          }
        });
      } else {
        // didn't get APIres at all
        serverResponse.status(500); // internal server error
        serverResponse.send("Media server seems to be down.");
      }
    });
  }
}

app.get("/sendUploadToAPI", function(request, response) {
  sendMediaStore(imageName, request, response);
});

//------------------------------------------------------------------------------
// end of photo upload part
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// create and insert database part
//------------------------------------------------------------------------------
const lfDB = new sql.Database("lost_found.db");

function createLostFoundDB(response) {
  // create new database if there is no .db file in server
  const cmd =
    "CREATE TABLE LostAndFoundTable (queryString TEXT PRIMARY KEY, lostfound TEXT, title TEXT, category TEXT, description TEXT, photoURL TEXT, date TEXT, time TEXT, location TEXT)";
  lfDB.run(cmd, function(err, val) {
    if (err) {
      console.log("Database creation failure", err.message);
      response.send("Database creation failure");
    } else {
      console.log("Created database");
      response.send("Created database");

      let cmd2 =
        "INSERT INTO LostAndFoundTable (queryString, lostfound, title, category, description, photoURL, date, time, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
      lfDB.run(
        cmd2,
        "1",
        "lostfound",
        "title",
        "category",
        "description",
        "photoURL",
        "date",
        "time",
        "location",
        function(err) {
          if (err) {
            console.log("DB insert error", err.message);
          } else {
            console.log("Initial DB insert OK");
          }
        }
      );
    }
  });
}
// check if database exist or not, if not, call above function to create one.
function checkDB(response) {
  let cmd =
    " SELECT * FROM LostAndFoundTable ORDER BY queryString DESC LIMIT 1 ";
  lfDB.get(cmd, function(err, val) {
    console.log(err, val);
    if (val == undefined) {
      console.log("No database file - creating one");
      createLostFoundDB(response);
    } else {
      console.log("Database file found");
      response.send("Database file found");
    }
  });
}

//------------------------------------------------------------------------------
// when receive a data "post" request, write data into lost_found.db.
// this happen when user click "submit" on screen04,07.
//------------------------------------------------------------------------------
app.post("/postData", function(req, res) {
  let x = req.body;
  let Data = JSON.stringify(x);
  insertDataToDB(Data, res); // this is the actual call to insert to database. see below.
});

// when get POST request, insert the card's data into database, each time generate random queryID.
// work with "POST, /postdata" request. see above.
function insertDataToDB(x, res) {
  let data = JSON.parse(x); // extract data
  let lostfound = data["lostfound"];
  let title = data["title"];
  let category = data["category"];
  let description = data["description"];
  let photoURL = data["photoURL"];
  let date = data["date"];
  let time = data["time"];
  let llocation = data["location"];
  let r = Math.random()
    .toString(36)
    .substring(2);
  let s = Math.random()
    .toString(36)
    .substring(2);
  let queryString = r + s; // add two random strings as queryID
  //  insert data to database.
  let cmd =
    "INSERT INTO LostAndFoundTable (queryString, lostfound, title, category, description, photoURL, date, time, location) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
  lfDB.run(
    cmd,
    queryString,
    lostfound,
    title,
    category,
    description,
    photoURL,
    date,
    time,
    llocation,
    function(err) {
      if (err) {
        console.log("DB insert error", err.message);
      } else {
        console.log("DB insert OK");
        res.send("Item submitted successfully!"); // send successful message when inserted item.
      }
    }
  );
}

app.get("/checkDB", function(request, response) {
  checkDB(response);
});

//------------------------------------------------------------------------------
// end of create, insert database for server end
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// search item part
//------------------------------------------------------------------------------

app.post("/SearchItemInDB", function(req, res) {
  let x = JSON.stringify(req.body);
  let data = JSON.parse(x);
  finderSearchItemInDB(data, res);
});

function finderSearchItemInDB(data, res) {
  let lostfound = data["lostfound"];
  let title = data["title"];
  let category = data["category"];
  let datef = data["datef"];
  let timef = data["timef"];
  let datet = data["datet"];
  let timet = data["timet"];
  let llocation = data["location"];
  
  if (title == ""){
    title = "title";
  }else{
    title = "%"+title+"%";
  }
  if (category == "") {
    category = "category";
  }else{
    category = "%"+category+"%";
  }
  if (llocation == "") {
    llocation = "location";
  }else{
    llocation = "%"+llocation+"%";
  }
  if (datef == "") {
    datef = "date";
  }
  if (datet == "") {
    datet = "date";
  }
  if (timef == "") {
    timef = "time";
  }
  if (timet == "") {
    timet = "time";
  }

  let cmd =
    'SELECT * FROM LostAndFoundTable WHERE lostfound="' +
    lostfound +
    '" AND title LIKE "' +
    title+
    '" AND category LIKE "' +
    category +
    '" AND date>="' +
    datef +
    '" AND date<="' +
    datet +
    '" AND time<="' +
    timef +
    '" AND time>="' +
    timet +
    '" AND location LIKE "' +
    llocation +
    '"' +
    " ORDER BY date DESC, time DESC LIMIT 50";
  console.log(cmd);

  lfDB.all(cmd, function(err, val) {
    console.log(err, val);
    if (val == "") {
      console.log("No Item found!");
      res.send("No Item found!");
    } else {
      console.log("Items found, send to user.");
      let result = JSON.stringify(val);
      res.send(result);
    }
  });
}

//------------------------------------------------------------------------------
// end of search item part
//------------------------------------------------------------------------------

//------------------------------------------------------------------------------
// server code for Google Map
//------------------------------------------------------------------------------

// USE REVERSE GEOCODING TO GET ADDRESS
// SEE https://developers.google.com/maps/documentation/geocoding/intro#reverse-example
app.get("/getAddress", (req, res) => {
  let url =
    "https://maps.googleapis.com/maps/api/geocode/json?latlng=" +
    req.query.lat +
    ", " +
    req.query.lng +
    "&key=" +
    process.env.API_KEY;
  request(url, { json: true }, (error, response, body) => {
    if (error) {
      return console.log(error);
    }
    res.json(body);
  });
});

// USE KEYWORDS TO FIND ADDRESS
// SEE https://developers.google.com/places/web-service/search#find-place-examples
app.get("/searchAddress", (req, res) => {
  // LOCATION BIAS
  var url =
    "https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=" +
    req.query.input +
    "&inputtype=textquery&fields=photos,formatted_address,name,rating,opening_hours,geometry&locationbias=circle:100000@38.5367859,-121.7553711&key=" +
    process.env.API_KEY;
  request(url, { json: true }, (error, response, body) => {
    if (error) {
      return console.log(error);
    }
    res.json(body);
  });
});

//------------------------------------------------------------------------------
// end server code for Google Map
//------------------------------------------------------------------------------

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
