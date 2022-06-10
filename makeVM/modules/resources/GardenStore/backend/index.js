const express = require("express");
const pool = require("./Database/database");
const crypto = require("crypto");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const cors = require("cors");

require('dotenv').config();


const app = express();
const port = process.env.PORT || 5000;

app.use(express.json());
// middleware to check for errors and display them

app.use(
  (err, req, res, next) => {
  // format error
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

//to use cookies within middleware
app.use(cookieParser());

/**
 * Products endpoints
 */
app.get("/products/:id", async (req,res) =>{
  try {
    const sqlQuery = 'SELECT * FROM products WHERE product_id=?';
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).json(rows[0]);
  } catch (error) {
    res.status(400).send(error.message);
  }
  // res.status(200).json({id:req.params.id});
});

app.get("/products", async (req,res)=>{
  try {
    const sqlQuery = 'SELECT * FROM products';
    const rows = await pool.query(sqlQuery);
    res.status(200).send(rows);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

/**
 * Comments endpoints
 */
app.get("/comments/:id", async (req,res) => {
  try {
    const sqlQuery = 'SELECT comment_id, username, text, created_at, product_id FROM comments WHERE product_id=?';
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).send(rows);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

app.get("/comments", async (req,res)=>{
  try {
    const sqlQuery = 'SELECT * FROM comments';
    const rows = await pool.query(sqlQuery);
    res.status(200).send(rows);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

app.post("/comments", async (req,res) => {
  try {
    const {comment_id, username, text, created_at, product_id} = req.body;
    const sqlQuery = 'INSERT INTO comments (comment_id, username, text, created_at, product_id) VALUES (?,?,?,?,?)';
    const result = await pool.query(sqlQuery, [comment_id, username, text, created_at, product_id]);
    console.log(result);
    res.status(200);   // TODO: request result throws error that big int can't be parsed 
    return res.json({message: "comment created successfully"});
  } catch (error) {
    res.status(400).send(error.message);
  }
})
/**
 * Login & logout endpoints & helper functions
 */

app.post("/login", async (req,res) =>{
  const payload = req.body;
  const sessionId = await login(payload.email, payload.password);
  // console.log(sessionId);
  if(!sessionId){
    res.status(401);  //401 -> unauthorized
    return res.json({ message: "Wrong Email or Password."})
  }
  res.cookie("session", sessionId,{
    // httpOnly: true,  //uncomment to prevent XSS attack if browser accepts httpOnly header
    sameSite: "none",  //none = sent cookies in all contexts, 1st party and XS requests
    secure: true  //only allow secure sending of cookies - only encrypted req allowed
  });
  res.status(200);
  return res.json({status:200, sessionId: sessionId});
})

async function login(email, password){
  const isPasswordCorrect = await checkPw(email, password);
  if(isPasswordCorrect){
    const session_id = crypto.randomUUID();
    const sqlQuery = 'INSERT INTO sessions (session_id, email) VALUES (?,?)';
    const result = await pool.query(sqlQuery, [session_id, email]);
    // console.log(result);
    return session_id;
  }
  return undefined;
}

app.post("/logout", async (req,res) => {
  res.clearCookie('session');
  res.status(200);
  return res.json({message: "Successfully logged out."});
})

// check salted & hashedPW with bcrypt
async function checkPw(email, password){
  try {
    const sqlQuery = 'SELECT email, password FROM users WHERE email=?';
    const rows = await pool.query(sqlQuery, email);
    return bcrypt.compare(password, rows[0].password);
  } catch (error) {
    return undefined;
  }
}

async function isLoggedIn(req, res, next){
  const sessionCookie = req.cookies.session;
  if(!sessionCookie){
    res.status(401);
    return res.json({ message: "Authentication Error: Are you logged in?"});
  }
  let email;
  if(sessionCookie != null){
    try {
      const sqlQuery = 'SELECT session_id, email FROM sessions WHERE session_id=?';
      const rows = await pool.query(sqlQuery, sessionCookie);
      email = rows[0].email;
    } catch (error) {
      return res.send(error.message);
    }
  }else email = null;

  if (!email){
    res.status(401);
  }
  next();
}

/**
 * Users endpoints    TODO:check if logged in user can get other user data
 */
app.get("/users/:id", isLoggedIn, async (req, res) => {
  try {
    const sqlQuery = 'SELECT username, password, iban, address, email, user_id FROM users WHERE user_id=?';
    const rows = await pool.query(sqlQuery, req.params.id);
    res.status(200).send(rows);
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// creates user with salted password hash and adds it to db
app.post("/users", async (req,res) => {
  try {
    const {username, plainpassword, iban, address, email} = req.body;
    const user_id = crypto.randomUUID();
    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(plainpassword, salt);
    const sqlQuery = 'INSERT INTO users (username, password, iban, address, email, user_id) VALUES (?,?,?,?,?,?)';
    const result = await pool.query(sqlQuery, [username, password, iban, address, email, user_id]);
    console.log(result);
    res.status(200);  
    return res.json({message: "user created successfully"});
  } catch (error) {
    res.status(400).send(error.message);
  }
})

// for testing-purpose now to get all users with all their data - or leave it for vulnerable API??? 
app.get("/users", async (req,res) => {
  try{
    const sqlQuery = 'SELECT * from users';
    const rows = await pool.query(sqlQuery);
    res.status(200).send(rows);
  } catch (error){
    res.status(400).send(error.message);
  }
})

app.delete("/users/:id", (req,res) =>{
  try{ 
    pool.query('DELETE FROM users where user_id=?', req.params.id);
    res.status(204).send("user deleted sucessfully");
  } catch (error){
    res.status(400).send(error.message);
  }
})

//TODO: save sessionCookie to db and check with login

/** Start listening */
app.listen(port, () => {
  console.log(`Listening at http://localhost:${port}`);
});