const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser')



function generateRandomString(length = 6) {
  return Math.random().toString(32).substr(2, 6);
};


app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

// go to views and find those that render _header
// find end points that render those views and pass username inside templatevars object.

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/set", (req, res) => {
 const a = 1;
 res.send(`a = ${a}`);
});

app.get("/fetch", (req, res) => {
 res.send(`a = ${a}`);
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    user_id: users[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["user_id"]
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => { 
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  const templateVars = { 
    shortURL, 
    longURL,
    username: req.cookies["user_id"]
   };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  const id = generateRandomString()
  const url = req.body;
  urlDatabase[id] = url.longURL;
  res.redirect("/url/"+id);
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id
  const newLongURL = req.body.longURL
  urlDatabase[shortURL] = newLongURL
  res.redirect("/urls/"+shortURL)
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL]
  res.redirect(longURL);
});

app.get("/login", (req, res) => {

  res.render("urls_loginPage");
})

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
    for (let user in users) {
    if (users[user].email === req.body.email) {
      if (users[user].password === req.body.password) {
        res.cookie("user_id", users[user].id);
        res.redirect("/urls");
      }
      res.status(403).send("Incorrect email or password")
    }
  }
  res.status(403).send("Incorrect email or password")
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id")
  res.redirect("/urls");
}); 

app.get("/register", (req, res) => {
  
  res.render("urls_registration")
});

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const newUser = {
    id, 
    email: req.body.email,
    password: req.body.password
  }
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please complete registration")
  }
  //match reg.body.email to new user email
  for (let user in users) {
    if (users[user].email === req.body.email) {
      res.status(400).send("Please login")
    }
  }
  users[id] = newUser;
  res.cookie("user_id", id);
  res.redirect("/urls");
});



