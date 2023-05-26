const express = require("express");
const morgan = require('morgan')
const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");

function generateRandomString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  
  for (let i = 0; i <length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// Middleware

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});
app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});
/**
 * CREATE
 */
// Create
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// Save
// post request
 app.post("/urls", (req, res) => {
  const urlInfo = req.body; // Log the POST request body to the console
  console.log('Pet info(post form submission received)', urlInfo)
  let shortURL = generateRandomString(6);
  urlDatabase[shortURL] = urlInfo.longURL;
  console.log('new urldatabase', urlDatabase);
  res.redirect(`/urls/${shortURL}`)
});

app.get("/u/:id", (req, res) => {
  // const longURL = ...
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params);
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id]}
  res.render("urls_show", templateVars);
});
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
app.get("/set", (req, res) => {
  const a = 2;
  res.send(`a = ${a}`);
 });
 app.get("/fetch", (req, res) => {
   res.send(`a = ${a}`);
  });
  

  app.listen(PORT, () => {
    console.log(`Example app listening on port ${PORT}!`);
  });

// Delete

  app.post('/urls/:id/delete', (req, res) => {
    console.log(req.params.id)
     const urlKey = req.params.id;
     delete urlDatabase[urlKey];

     res.redirect("/urls");
  });
  
