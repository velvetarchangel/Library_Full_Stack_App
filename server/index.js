// Entrypoint for the server
const http = require("http");
const express = require("express");
const bodyparser = require("body-parser");
const app = express();
var cors = require("cors");
const mysql = require("mysql");
const res = require("express/lib/response");

app.use(cors());
app.use(bodyparser.json());

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "mysqlpassword",
  database: "library",
});

const PORT_NUM = 5001;

var library_users = [];
/**
 * Get user endpoint where user is able to login using their email and password
 * Request body passes in email and password from the front end and queries the DB
 * If there is an user with the email password combination the user object is retured
 * back to the front end to be utilized downstream
 */
app.post("/getUser", async (req, res) => {
  let body = req.body;
  // run sql query
  var sql_query = `SELECT * FROM library_user WHERE email='${body.email}' AND user_password='${body.password}'`;
  db.query(sql_query, function (err, result) {
    if (err || result.length == 0) {
      res.send({
        code: 400,
        status: "Incorrect email or password",
      });
    } else {
      let user = {
        card_no: result[0]["card_no"],
        first_name: result[0]["first_name"],
        last_name: result[0]["last_name"],
      };
      res.send({
        code: 200,
        user,
      });
    }
  });
});

/**
 * Add user endpoint where user is able to signup using their name, email and password.
 * A random 10 digit library card is generated for them.
 * Endpoint to be used with Signup in the front end.
 */
app.post("/addUser", (req, res) => {
  var user = req.body;
  var all_cards = [];
  var card_query = `SELECT card_no FROM library_user`;
  db.query(card_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        all_cards.push(parseInt(result[i]["card_no"]));
      }
      let max_card_no = Math.max(...all_cards);
      user["card_no"] = (max_card_no + 1).toString();
    }
  });

  console.log(user);

  var sql_query =
    "INSERT INTO library_user (card_no, first_name, last_name, email, user_password)\
    VALUES(?, ?, ?, ?, ?)";
  var user_arr = [
    user.card_no,
    user.first_name,
    user.last_name,
    user.email,
    user.user_password,
  ];

  db.query(sql_query, user_arr, function (err) {
    if (err) {
      res.send({
        code: 400,
        status: err,
      });
    } else {
      res.send({
        code: 200,
        status: ok,
        user,
      });
    }
  });
});

// This is a test endpoint and can be removed after actual endpoints have been
// introduced. Testing that frontend talks to backend
app.get("/testAPI", (req, res) => {
  res.json("testAPI is working");
});

// Start the server on port 5000
app.listen(PORT_NUM, () => {
  console.log("Node server running on port " + PORT_NUM);
});
