const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");




function generateRandomString() {
  return Math.random().toString(32).substr(2, 6);
};

function urlsForUser(userId, urlDatabase) {
  const userUrl = {};
  for (let dBentry in urlDatabase) {
    if (urlDatabase[dBentry].userID === userId) {
      userUrl[dBentry] = urlDatabase[dBentry]
    }   
    return userUrl
  }
}

app.set("view engine", "ejs");

          
const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ48lW"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  },
}

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

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
  const userId = req.cookies["user_id"]
  const userUrl = {};
  for (let dBentry in urlDatabase) {
    if (urlDatabase[dBentry].userID === userId) {
      userUrl[dBentry] = urlDatabase[dBentry]
    } 
  };
    const templateVars = { 
    urls: userUrl,
    user_id: users[req.cookies["user_id"]] }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const userId = req.cookies["user_id"]
  const userUrl = {};
  for (let dBentry in urlDatabase) {
    if (urlDatabase[dBentry].userID === userId) {
      userUrl[dBentry] = urlDatabase[dBentry]
    }   
  }
    const templateVars = { 
    urls: userUrl,
    user_id: users[req.cookies["user_id"]] }
  if (userId) {
    res.render("urls_new", templateVars);
    } else {
    res.redirect("/login");
    }
});

app.get("/urls/:shortURL", (req, res) => { 
  const userId = req.cookies["user_id"]
  const userUrl = urlsForUser(userId, urlDatabase);
  const userObject = userUrl[req.params.shortURL]
  if (!userObject) { return res.status(400).send("Please login") }
  
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: userObject["longURL"],
    user_id: users[req.cookies["user_id"]] }
  if (userId) {
  res.render("urls_show", templateVars);
  } else {
  res.redirect("/urls")
  }
});

app.get("/register", (req, res) => {
  
  res.render("urls_registration")
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL
  const longURL = urlDatabase[shortURL].longURL
  res.redirect(longURL);
});

app.get("/login", (req, res) => {

  res.render("urls_loginPage");
});

app.post("/urls", (req, res) => {
  // Log the POST request body to the console
  const id = generateRandomString()
  const url = req.body;
  urlDatabase[id] = url.longURL;

  res.redirect("/url/"+id);
});

app.post("/urls/:id", (req, res) => {
  const userId = req.cookies["user_id"]
  const userUrl = urlsForUser(userId, urlDatabase);
  const userObject = userUrl[req.params.shortURL]
  if (!userObject) { return res.status(400).send("Please login") }
  const shortURL = req.params.id
  const newLongURL = req.body.longURL
  urlDatabase[shortURL] = newLongURL
  res.redirect("/urls/"+shortURL)
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const userId = req.cookies["user_id"]
  const userUrl = urlsForUser(userId, urlDatabase);
  const userObject = userUrl[req.params.shortURL]
  if (!userObject) { return res.status(400).send("Please login") }
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL].longURL
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
    for (let user in users) {
    if (users[user].email === req.body.email) {
      if (bcrypt.compareSync(req.body.password, users[user].password)) {
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

app.post("/register", (req, res) => {
  const id = generateRandomString()
  const newUser = {
    id, 
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
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






