const express = require("express");
const morgan = require('morgan')
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, generateRandomString } = require('./helpers');

const app = express();
const PORT = 8080; 

app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "abc",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  },
};

const users = {
  abc: {
    id: "abc",
    email: "t@t.com",
    password: "$2a$10$h4xEnoBOikDmMh2AwtIsleccnG1XeF88EAH1u/smuoLLPn39WOEnK", //123
  },
  def: {
    id: "def",
    email: "y@y.com",
    password: "$2a$10$PCbjWCrOaSp224H7hHWWBeIoSEjfwRVEF3VjmFtIUplJUL7dQBJHO", //456
  },
};

// Middleware
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'session',
  keys: ["key"],
}))

app.get("/", (req, res) => {
  if(req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("urls_landingpage.ejs");
  }
});

app.get("/urls/new", (req, res) => {
  if(!req.session.user_id) {
    res.redirect('/login')
  } else {
    res.render("urls_new", { user: users[req.session.user_id] });
  }
});
// Save
// post request
app.post("/urls", (req, res) => {
  if(!req.session.user_id) {
    res.send('You are not allowed to shorten urls, you need to login first')
  } else {
  const urlInfo = req.body; // Log the POST request body to the console
  const longURL = urlInfo.longURL;
  const userId = req.session.user_id;
  let shortURL = generateRandomString();
  urlDatabase[shortURL]= {
    longURL: longURL,
    userID: userId,
  };
  res.redirect(`/urls/${shortURL}`)
  }
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  for (let key in urlDatabase) {
     if(id === key) {
      const longURL = urlDatabase[req.params.id].longURL
       res.redirect(longURL); 
     } 
}
});

app.get("/urls/:id", (req, res) => {
  if(!req.session.user_id) {
    res.send('You must be login first')
  } else {
    const shortURL = req.params.id;
    const url = urlDatabase[shortURL];
    if (!url) {
       return res.status(404).send("url not found")
    }   
    const userId = req.session.user_id;
    if (url.userID !== userId) {
      return res.status(403).send("You are not authorized to access this url")
    } 
    const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id]}
    res.render("urls_show", templateVars);
  }
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
  if(!req.session.user_id) {
    res.send('You must login first')
  } else {
    const shortURL = req.params.id;
    const url = urlDatabase[shortURL];
    if (!url) {
      return res.status(404).send("url not found")
   } 
   const userId = req.session.user_id;
   if (url.userID !== userId) {
    return res.status(403).send("You are not authorized to access this url")
  }
    const urlInfo = req.body;
    urlDatabase[shortURL].longURL = urlInfo.newurl;
    res.redirect('/urls')
  }
});

//login route get
app.get('/login', (req, res) => {
  if(req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.render('login',{user: users[req.session.user_id] });
  }
});

// login route
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if(!email || !password) {
    return res.status(400).send('Cannot leave fields empty');
  }
  if(!user) {
    return res.status(403).send('You have to create an account first!');
  }
  if(!bcrypt.compareSync(password, user.password)) {
     return res.status(400).send('password did not match');
  }
    req.session.user_id = user.id;
  res.redirect('/urls');
});

// logout
app.post('/logout', (req, res) => {
  req.session.user_id = null;
  res.redirect('/login')
})

// Display the user_id 
app.get("/urls", (req, res) => {
  if(!req.session.user_id) {
    res.send('You must login first or create an account')
  } else {
    const user_id = req.session.user_id;
    const user = users[user_id];
    const urls = urlsForUser(user_id);
    const templateVars = {
      urls: urls,
      user: user
    };
    res.render("urls_index", templateVars);
  }
});

// register
app.get('/register', (req, res) => {
  if(req.session.user_id) {
    res.redirect('/urls')
  } else {
    const templateVars = {
      user: users[req.session.user_id],
      user_id: req.session.user_id,
    };
    res.render("register", templateVars);
  }
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);
  if (!email || !password) {
    return res.status(400).send('please provide an email and a password');
  }
  if (user) {
     return res.status(400).send('a user with that email already exists')
  }
  const id = generateRandomString();
  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(password, salt); 
  const newUser = {
    id: id,
    email: email,
    password: hash,
  };
  users[id] = newUser;
  req.session.user_id = id;
  res.redirect('/urls')
});

// Delete
app.post('/urls/:id/delete', (req, res) => {
  if(!req.session.user_id) {
    res.send('You must login first')
  } else {
    const shortURL = req.params.id;
    const url = urlDatabase[shortURL];
    if (!url) {
      return res.status(404).send("url not found")
  } 
  const userId = req.session.user_id;
  if (url.userID !== userId) {
    return res.status(403).send("You are not authorized to access this url")
  }
    delete urlDatabase[shortURL];
    res.redirect("/urls");
}
  });
  
  //Helper
  function urlsForUser(id) {
    let obj = {};
    for (key in urlDatabase) {
      if(urlDatabase[key].userID === id) {
        obj[key] = urlDatabase[key]
      }
    }
    return obj;
  }
  urlsForUser();
