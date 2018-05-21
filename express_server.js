//Create a web server with Express
'use strict'

// const cookieParser = require('cookie-parser')
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const PORT = process.env.PORT || 8080;
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')
var Keygrip = require('keygrip');
const methodOverride = require('method-override');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(methodOverride("_method"));
app.use(bodyParser.urlencoded({extended: true}));


app.use(cookieSession({
  name: 'session',
    keys: ["keyone","keytwo"],
  // Cookie Options
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

let urlDatabase = {
  b2xVn2: {
    url: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  b2xSn2:{
    url: "http://www.lightshouselabs.ca",
    userID: "userRandomID2"
},
  "b2xVl1": {
    shortURL: "b2xVl1",
    longURL: "http://www.facebook.com",
    userId: "banana"
    },
  "9sm5xK": {
    shortURL: "9sm5xK",
    longURL: "http://www.ttc.com",
    userId: "user3RandomID"
}
};


const userDatabase = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    hashedPassword: "test"
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    hashedPassword: "test"
  },
  user3RandomID: {
    id: "user3RandomID",
    email: "oprah@winfry.com",
    hashedPassword: "test"
  },
    user4RandomID: {
    id: "user4RandomID",
    email: "ok@go.co",
    hashedPassword: "test"
  }
};

function generateRandomString() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
function getId(object, key, value) {
  for (const id in object){
    if (object[id][key] === value) return id;
  }
  return false;
}


function usersUrls(user_id) {
  const urls = {};
  for (const shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === user_id) {
      urls[shortURL] = urlDatabase[shortURL].url;
    }
  }
  return urls;
}

app.get("/", (req, res) => {
  if (req.session.user_id) {
  res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

app.get("/login", (req, res) => {
  if (req.session.user_id){
    res.redirect("/urls")
  }
  const templateVars = {
    user: userDatabase[req.session.user_id],
    urls: usersUrls(req.session.user_id)
  };
  res.render("login", templateVars);
});

app.get("/register", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    const templateVars = {
      user: userDatabase[req.session.user_id]
    };
  res.render("register", templateVars);
}
});

app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].url;
    res.redirect(longURL);
  } else {
    res.status(404).send("Invalid URL");
  }
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id]
  }
  if (templateVars.user){
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

app.get("/urls", (req, res) => {
  if (req.session.user_id){
  let templateVars = {
    user: userDatabase[req.session.user_id],
    urls: usersUrls(req.session.user_id)
  };
  res.render("urls_index", templateVars);
} else {
    res.status(401).send("Please loggin to view your URLs")

}
});

app.get("/urls/:id", (req, res) => {
  const userUrls = usersUrls(req.session.user_id);
  if (urlDatabase[req.params.id]) {
    if (req.session.user_id) {
      let templateVars = {
      user: userDatabase[req.session.user_id],
      shortURL: req.params.id,
      urls: userUrls,
      error: ""
      };
      if (userUrls[req.params.id]) {
        res.render("urls_show", templateVars);
      } else {
        templateVars = { ...templateVars, error: "You are not authorized to perform this action" };
        res.render("urls_show", templateVars);
      }
    } else {
      res.status(401).send("Please login");
    }
  }
  else {
    res.status(404).send("This URL is not found");
  }
});


app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    url: req.body.longURL,
    userID: req.session.user_id
  }
  res.redirect('/urls');
});

app.delete("/urls/:id/delete",(req, res) => {
  const userUrls = usersUrls(req.session.user_id);
  if(urlDatabase[req.params.id]){
    if(req.session.user_id){
      if(userUrls[req.params.id]){
        delete (urlDatabase[req.params.id]);
        res.redirect('/urls');
      } else {
        res.status(401);
      }
    } else {
        res.status(401);
    }
  } else {
        res.status(401);
  }
})

app.put("/urls/:id",(req, res) => {
  if (urlDatabase[req.params.id]) {
    if (req.session.user_id) {
      if (usersUrls(req.session.user_id)[req.params.id]){
        urlDatabase[req.params.id].url = req.body.newLongURL;
        res.redirect('/urls');
      }
    } else {
      res.status(401).send("You are not authorized to perform this action");
    }
  } else {
    res.status(404).send("url not found");
  }
});

app.post("/login", (req, res) => {
  const userId = getId(userDatabase, "email", req.body.email);
  if (userId && bcrypt.compareSync(req.body.password, userDatabase[userId].hashedPassword)){
    req.session.user_id = userId;
    res.redirect('/urls');
  } else {
    res.status(401).send("Please try again");
  }
});

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password ){
    res.status(400).send("Please enter valid credentials for email and password")
  } else if (getId(userDatabase, "email", req.body.email)){
    res.status(403).send("This user already exists. Please Try again");
  } else {
    const userid = generateRandomString();
    userDatabase[userid] = {
      email: req.body.email,
      hashedPassword: bcrypt.hashSync(req.body.password, 10)
    }
   req.session.user_id = userid;
   res.redirect("/urls");
  }
});

app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT} !`);

});
