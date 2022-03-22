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
app.get("/getUser", async (req, res) => {
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

      // console.log(user);
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

/**
 * Add feedback endpoint where user is able to add feedback based on a particular item_id
 * and provide an optional comment
 * Request body passes in user_rating, item_id, card_no, comment and the feedback table is updated
 * if the comment is not null then the comments table is also updated.
 */
app.post("/sendFeedback", async (req, res) => {
  var user_rating = req.body.user_rating;
  var item_id = req.body.item_id;
  var card_no = req.body.card_no;
  var u_comment = req.body.u_comment;

  var all_feedbackIds = [];
  var getAllFeedback = `SELECT * FROM feedback`;
  var feedback_query = `INSERT INTO feedback (card_no, feedback_id, user_rating, item_id) VALUES(?, ?, ?, ?)`;
  db.query(getAllFeedback, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      var maxFeedbackId;
      if (result.length == 0) maxFeedbackId = 1;
      else {
        for (let i = 0; i < result.length; i++) {
          all_feedbackIds.push(parseInt(result[i]["feedback_id"]));
        }
        maxFeedbackId = Math.max(...all_feedbackIds) + 1;
      }

      var feedbackBody = [card_no, maxFeedbackId, user_rating, item_id];
      db.query(feedback_query, feedbackBody, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          // res.send({ feedbackBody });
          if (u_comment == "") {
            res.send({ feedbackBody });
          }
        }
      });

      if (u_comment != "") {
        var update_comment_query = `INSERT into user_comments (card_no, feedback_id, u_comment, item_id) VALUES (?, ?, ?, ?)`;
        var commentBody = [card_no, maxFeedbackId, u_comment, item_id];

        db.query(update_comment_query, commentBody, function (err) {
          if (err) {
            res.status(400);
            res.send({
              message: err,
            });
          } else {
            res.status(200);
            res.send({ commentBody });
          }
        });
      }
    }
  });
});

//himika
app.get("/feedback/:itemId", (req, res) => {});

//next 2 are lower priority
app.get("/getFines", (req, res) => {});

app.post("/payFines", (req, res) => {
  //really simple/dummy
});

//these 2 are similar
//kelly
app.post("/signoutItem", (req, res) => {});

//kelly
app.post("/placeHold", (req, res) => {});

//kelly
app.get("/getCheckedOutItems", (req, res) => {});

//kelly
app.get("/getCurrentHolds", (req, res) => {});

//eric
app.put("/returnItems", (req, res) => {});
//eric
app.post("/userRegistersEvents", (req, res) => {});
//eric
app.post("/createEvent", (req, res) => {});

//eric
app.put("/updateItemQuantityForBranch", (req, res) => {
  //condition to check if preferred branch has items available, else update for different branch with item
});
//eric
app.put("/addItem", (req, res) => {
  //condition if item exists in db yet
});

//himika (searching)
app.get("/searchTitle", (req, res) => {});

//tbd
app.get("/searchAuthor", (req, res) => {});

app.get("/searchDirector", (req, res) => {});

app.get("/searchActor", (req, res) => {});

//kelly
app.get("/users", (req, res) => {
  //sees all the users and their records/ actual info. json object
});

//kelly
app.get("/itemRecord", (req, res) => {
  //information on who has checked out a particular item
});

// Start the server on port 5000
app.listen(PORT_NUM, () => {
  console.log("Node server running on port " + PORT_NUM);
});
