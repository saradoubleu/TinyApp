//Create a web server with Express
// 'use strict'

const express = require("express");
const app = express();
//process.env.PORT says to listen on whatever is in the nvironment port or to listen on port 8080 if none are defined
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "18TVx5": "http://www.thestar.com"
};
//new route handler
app.get("/urls", (req, res) =>{
  let templateVars = {
    urls: urlDatabase,
    // message: 'Hi'
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});


app.get("/urls/:id/edit", (req, res) => {
  const shortURL = req.params.id;
  const urlDB = urlDatabase[shortURL];

  if(urlDB){
    res.render("urls_show", {shortURL: shortURL, urlDB:urlDB});
  } else {
    res.status(404);
    res.render("dogs/404");
  }
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];

  if (longURL){
    urlDatabase[shortURL] = req.body.adr;
    res.redirect("/urls/");
  }else{
    res.redirect(`/urls/${shortURL}`);
  }
});

app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const urlDB = urlDatabase[shortURL];

  if (urlDB){

    delete urlDatabase[shortURL];

  }else{

    res.redirect("/urls");
  }
});

app.get("/", (req, res)=> {
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
  console.log(req.body);  // debug statement to see POST parameters
  var random = generateRandomString();
  urlDatabase[random] = req.body.longURL;
  res.redirect("http://localhost:8080/urls/"+random);
  console.log(urlDatabase);
  // urlDatabase[req.params.id]
  // res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});


function generateRandomString(){
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 6; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
console.log(generateRandomString());
