const express = require("express");
const morgan = require('morgan')
const cookieParser = require('cookie-parser');

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

const users = {
  abc: {
    id: "abc",
    email: "t@t.com",
    password: "123",
  },
  def: {
    id: "def",
    email: "y@y.com",
    password: "456",
  },
};

// Middleware

app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // create and populate req.cookies

app.get("/", (req, res) => {
  res.send("Hello!");
});
// Index
// app.get("/urls", (req, res) => {
//   const templateVars = { urls: urlDatabase };
//   res.render("urls_index", templateVars);
// });
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
  console.log('Url info(post form submission received save)', urlInfo)
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
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id],
  user: users[req.cookies.username]}
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

// Update

app.post('/urls/:id', (req, res) => {
  const urlInfo = req.body;
  console.log('url info (post form submission received update)', urlInfo);
 
  const id = req.params.id
  urlDatabase[id] = urlInfo.newurl;

  console.log('updated urls', urlDatabase);
  res.redirect('/urls')

}) 


//login route get
app.get('/login', (req, res) => {
  res.render('login');
})

// login route
app.post('/login', (req, res) => {
  // grab the info from the body
  const email = req.body.email;
  let id = undefined;
  console.log(email);
  for(user in users) {
    console.log(user);
    if(users[user].email === email) {
       id = users[user].id;
    }
  }
  res.cookie('username', id);
  res.redirect('/urls');

});

// Display the username 
app.get("/urls", (req, res) => {
  const username = req.cookies.username
  const templateVars = {
    urls: urlDatabase,
    user: users[username],
    // ... any other vars

  };
  res.render("urls_index", templateVars);
});

// logout
app.post('/logout', (req, res) => {
  // clear the user's cookies
  res.clearCookie('username');
  res.redirect('/urls')
})

// register
app.get('/register', (req, res) => {
  res.render("register");
})

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  // did they not provide email and/or password
  if (!email || !password) {
    return res.status(400).send('please provide an email and a password');
  }

  // lookup the specific user from users object
  let foundUser = null;
  
  for(const user_id in users) {
    const user = users[user_id];
    if(user.email === email) {
      foundUser = user;
    }
  }

  // did we not find a user
  if (foundUser) {
     return res.status(400).send('a user with that email already exists')
  }
  
  
  // the email is unique
  // create a new user object
  const id = generateRandomString(3);
  
  const newUser = {
    id: id,
    email: email,
    password: password
  };
  
  // update the users data base
  users[id] = newUser;
  
  res.cookie('username', id);
  
  res.redirect('/urls')
});

// Delete

  app.post('/urls/:id/delete', (req, res) => {
    console.log(req.params.id)
    console.log('Delete')
     const urlKey = req.params.id;
     delete urlDatabase[urlKey];

     res.redirect("/urls");
  });
  
