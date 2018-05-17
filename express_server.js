//Create a web server with Express
'use strict'

var cookieParser = require('cookie-parser')
const express = require("express");
const app = express();
app.use(cookieParser());

//process.env.PORT says to listen on whatever is in the nvironment port or to listen on port 8080 if none are defined
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

//url - Data Store
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "18TVx5": "http://www.thestar.com"
};

//Users - Data Store
const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "user3RandomID": {
    id: "user3RandomID",
    email: "oprah@winfry.com",
    password: "harpo"
  }
};

// console.log(userDatabase);


//new route handler
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: userDatabase[req.cookies.user_id]
    // username: req.cookies["username"],
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({
  extended: true
}));

//Registration Page
app.get("/register", (req, res) => {
  res.render("register");
})

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
  };
  res.render("urls_show", templateVars);
});


app.get("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const urlDB = urlDatabase[shortURL];

  if (urlDB) {
    res.render("urls_show", {
      shortURL: shortURL,
      urlDB: urlDB
    });
  } else {
    res.status(404);
    res.render("urls/404");
  }
});

//post registration credentials
app.post("/register", (req, res) => {
  //generate random string
  var autogenID = generateRandomString();
  //adds a new user object in db
        console.log(autogenID);

  const newUser = req.body.email;
  const newPass = req.body.password;
    if (newUser === "" || newPass == "") {
      res.status(404).send("Your request failed! Please enter a value");
      // res.render("urls/404");
      return;
    }
    for (var id in userDatabase) {
    if (newUser === userDatabase[id].email) {
      res.status(404).send("Your request failed! becase it's a duplicate");
      // res.render("urls/404");
      return;
    }
  }
        userDatabase[autogenID] = {
        id: autogenID,
        email: newUser,
        password: newPass
      };

      res.cookie("user_id", autogenID);
      res.redirect("/urls");
            // console.log(userDatabase);
      return;
});



//post login credentials
app.post("/login", (req, res) => {
  const userName = req.body.email;
  const password = req.body.password;

  if (userName === "" || password === "") {
    res.status(404).send("Please enter valid credentials");
    return;
  }

  for (var id in userDatabase) {
    if (userName === userDatabase[id].email && password === userDatabase[id].password)
    {
  console.log("Found in database");
        //set the user_id cookie to match the id found in the db
        res.cookie("user_id", id);
        res.redirect("/urls");

  return;

    }
  }
      // res.redirect("/login");
      res.status(403).send("403 Forbidden Error");

      console.log("Does not match")
      return;

  // res.cookie("user_id", autogenID);
  // res.redirect("/urls");
            // return;
          });


app.get("/login", (req, res) => {
  res.render("login");
});

//logout
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
})

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
  console.log(req.body);
  //assign random string function to variable called random
  var random = generateRandomString();
  //add random to url DB = the value is from variable longURL
  urlDatabase[random] = req.body.longURL;
  res.redirect("http://localhost:8080/urls/" + random);
  console.log(urlDatabase);
  // urlDatabase[req.params.id]
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
// console.log(generateRandomString());