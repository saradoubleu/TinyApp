//Create a web server with Express
'use strict'

const express = require("express");
const app = express();
//process.env.PORT says to listen on whatever is in the nvironment port or to listen on port 8080 if none are defined
const PORT = process.env.PORT || 8080;

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//new route handler
app.get("/urls", (req, res) =>{
  let templateVars = {
    urls: urlDatabase,
    // message: 'Hi'
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/", (req, res)=> {
  res.end("Hello!'");
});

app.get("/urls.json", (req, res) => {
  //sends a json response
  res.json(urlDatabase);
  //JSON.stringify(urlDatabase)
});

app.get("/hello", (req, res) => {
res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
console.log(`Example app listening on port ${PORT} !`);
});

