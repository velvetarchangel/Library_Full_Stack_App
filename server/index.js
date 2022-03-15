// Entrypoint for the server
const express = require("express");
const bodyparser = require("body-parser");
const app = express();
var cors = require("cors");
const mysql = require("mysql");

app.use(cors());
app.use(bodyparser.json());

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "mysqlpassword",
  database: "library",
});

const PORT_NUM = 5001;

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
        status: 400,
        message: "Incorrect email or password",
      });
    } else {
      let user = {
        card_no: result[0]["card_no"],
        first_name: result[0]["first_name"],
        last_name: result[0]["last_name"],
      };
      res.send({
        status: 200,
        user,
      });
    }
  });
});

/**
 * Add user endpoint where user is able to signup using their email and password
 * Request body passes in email and password from the front end and queries the DB
 * If there is an user with the email already in the system, error message is displayed
 * Else user is added to the system. A unique card number is generated for the user as well.
 */
app.post("/addUser", (req, res) => {
  var all_cards = [];
  var all_emails = [];
  var card_query = `SELECT * FROM library_user`;
  db.query(card_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        all_cards.push(parseInt(result[i]["card_no"]));
        all_emails.push(result[i]["email"]);
      }
    }
    // check if email is unique
    if (all_emails.includes(req.body.email)) {
      res.send({
        status: 400,
        message: "Email already exists in database",
      });
    } else {
      // Generate a card number
      var max_card_no = Math.max(...all_cards) + 1;
      var user = {
        first_name: req.body.first_name,
        last_name: req.body.last_name,
        email: req.body.email,
        user_password: req.body.user_password,
        card_no: max_card_no,
      };

      var sql_query =
        "INSERT INTO library_user (card_no, first_name, last_name, email, user_password) VALUES(?, ?, ?, ?, ?);";
      var user_arr = [
        user.card_no,
        user.first_name,
        user.last_name,
        user.email,
        user.user_password,
      ];
      db.query(sql_query, user_arr, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
        }
      });

      console.log(user);
      var library_record_query =
        "INSERT INTO library_record (card_no, fines) VALUES (?, ?)";
      var lib_rec = [user.card_no, 0];
      db.query(library_record_query, lib_rec, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          res.send({ user });
        }
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
