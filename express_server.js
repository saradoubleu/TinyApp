//Create a web server with Express
'use strict'


// const cookieParser = require('cookie-parser')
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const bcrypt = require('bcrypt');
var cookieSession = require('cookie-session')
var Keygrip = require('keygrip');


// const password = "purple-monkey-dinosaur"; // you will probably this from req.params
// const hashedPassword = bcrypt.hashSync(password, 10);

// app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
    keys: new Keygrip(['key1', 'key2'], 'SHA384', 'base64'),
  // keys: [/* secret keys */],

  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
app.use(bodyParser.urlencoded({
  extended: true
}));

app.set("view engine", "ejs");

//URL DATA STORE VERSION 2
const urlDatabase = {
  "userRandomID":
  {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "b2xVl1": "http://www.facebook.com",
  },
  "user2RandomID":
  {
    "18TVx5": "http://www.google.com",
    "11xVl1": "http://www.thestar.com",
  },
  "user3RandomID":
  {
    "9sm5xK": "http://www.ttc.ca",
  }
}

//USERS - DATA STORE
const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "test"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "test"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "oprah@winfry.com",
    password: "harpo"
  },
    "user4RandomID": {
    id: "user4RandomID",
    email: "ok@go.co",
    password: "test"
  }
};


//GET ALL URLS FOR LOGGED IN USER
app.get("/urls", (req, res) => {
  let templateVars = {
    // urls: urlDatabase[req.cookies.user_id],
        urls: urlDatabase[req.session.user_id],
            username: userDatabase[req.session.user_id],
    // username: userDatabase[req.cookies.user_id],
  };

  res.render("urls_index", templateVars);
console.log(templateVars);

});


//REGISTRATION PAGE
app.get("/register", (req, res) => {
  res.render("register");
});

//CREATE A NEW SHORT URL
app.post("/urls/new", (req, res) => {
  var random = generateRandomString();
    urlDatabase[req.session.user_id][random] = req.body.longURL;
  // urlDatabase[req.cookies.user_id][random] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect("/urls");
});


//LOGOUT
app.post("/logout", (req, res) => {
  // res.clearCookie("user_id");
    req.session=null;
  res.redirect("/urls");

});

//***GET NEW URLS
app.get("/urls/new", (req, res) => {
//   var templateVars={
//     urlDatabase[req.cookies.user_id]){
//     userID: longURL
// }

    if(!userDatabase[req.session.user_id]){
      res.redirect("login");
    }
    res.render("urls_new");
});

//***GET NEW URLS
app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});


//CREATE NEW USERS
app.post("/register", (req, res) => {
    const newUser = req.body.email;
  const newPass = req.body.password
  // const newPass = req.body.password;

  // const bcrypt = require('bcrypt');
const hashedPassword = bcrypt.hashSync(newPass, 10);

  var autogenID = generateRandomString();
  console.log(autogenID);


  if (newUser === "" || newPass == "") {
    res.status(404).send("Your request failed! Please enter a value");
    return;
  }
  for (var id in userDatabase) {
    if (newUser === userDatabase[id].email) {
      res.status(404).send("Your request failed! becase it's a duplicate");
      return;
    }
  }
  userDatabase[autogenID] = {
    id: autogenID,
    email: newUser,
    password: hashedPassword
  };

req.session.user_id = "user_id", autogenID;
  // res.cookie("user_id", autogenID);
  res.redirect("/urls");
  // console.log(userDatabase);
  return;
});


//LOGIN
app.post("/login", (req, res) => {
  const userName = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (userName === "" || password === "") {
    return res.status(404).send("Please enter valid credentials");
  }

  for (var id in userDatabase) {
    if (userName === userDatabase[id].email && bcrypt.compareSync(password, hashedPassword)) {
            req.session.user_id = id;
      // res.cookie("user_id", id);
      return res.redirect("/urls");
    }
  }

  return res.status(403).send("403 Forbidden Error");

});

//RENDER LOGIN SCREEN
app.get("/login", (req, res) => {
  res.render("login");
});

//EDIT URL
app.get("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  // const owner = req.cookies.user_id;
  const urlDB = urlDatabase[owner];

// console.log(urlDB);
// //   // const dbID = req.params.id;
// //   // const urlDB = urlDatabase[dbID];

// // if(owner === urlDatabase[userID])
// //  // urlDatabase[userID])
// {
//     res.render("urls_show", {
//       shortURL: shortURL,
//       urlDB: urlDB
//     }
//   } else {
//     res.status(404).send("Please login");
//   }
});


//POST URLS FOR USER
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL) {
    urlDatabase[shortURL] = req.body.adr;
    res.redirect("/urls/");
  } else {
    res.redirect(`/urls/${shortURL}`);
  }
});

//DELETE SHORT URL
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const urlDB = urlDatabase[shortURL];

  if (urlDB) {

    delete urlDatabase[shortURL];
    res.redirect("/urls");

  } else {

    res.redirect("/urls");
  }
});


//RENDER LOCAL HOST
app.get("/", (req, res) => {
  res.end("Hello!'");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT} !`);
});

app.post("/urls", (req, res) => {
  var userIdent = req.session.user_id;
  // console.log(req.body);
  //assign random string function to variable called random
  var random = generateRandomString();
  //add random to url DB = the value is from variable longURL
  // urlDatabase[random] = req.body.urlDatabanewse;
  urlDatabase[random] = {
  id:random,
  longURL: req.body.longURL,
  userID:userIdent
};

  res.redirect("http://localhost:8080/urls/" + random);
  console.log(urlDatabase);
  // urlDatabase[req.params.id]
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)

});

//
app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//RANDOM STRING GENERATOR
function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
// console.log(generateRandomString());