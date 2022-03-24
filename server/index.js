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
  password: "password1!",
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


//himika 
app.post("/sendFeedback", (req, res) => {
 //figure out if reply
});

//himika 
app.get("/getFeedback", (req, res) => {

});

//next 2 are lower priority
app.get("/getFines", (req, res) => {

});

app.post("/payFines", (req, res) => {
//really simple/dummy
});

//these 2 are similar
//kelly
app.post("/signoutItem", (req, res) => {

});

//kelly
app.post("/placeHold", (req, res) => {

});

//kelly
app.get("/getCheckedOutItems", (req, res) => {

});

//kelly
app.get("/getCurrentHolds", (req, res) => {

});

//eric 
app.put("/returnItems", (req, res) => {

});
//eric 
app.post("/userRegistersEvents", (req, res) => {

});
/**
 * create event endpoint where a librarian is able to add events to the database. 
 * CURRENT IMPLEMENTATION: The librarian needs to add a unique event ID as they are entering events to the database; 
 * this is because there can be multiple events with the same name and we need a way to identify these. 
 */
app.post("/createEvent", (req, res) => {
  var all_events = []; 
  var event_query = `SELECT * FROM lib_events`;
  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        all_events.push(parseInt(result[i]["event_id"]));
      }
    }
    // check if event is unique based on item name
    if (all_events.includes(req.body.event_id)) {
      res.send({
        status: 400,
        message: "Item already exists in database",
      });
    } else {
      var event_to_add = { //event to add to object
        event_id: req.body.event_id,
        event_name: req.body.event_name,
        event_start_date: req.body.event_start_date,
        end_date: req.body.end_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
      };

      var sql_query =
        "INSERT INTO lib_events (event_id, event_name, event_start_date, end_date, start_time, end_time) VALUES(?, ?, ?, ?, ?, ?);";
      var event_arr = [
        event_to_add.event_id,
        event_to_add.event_name,
        event_to_add.event_start_date,
        event_to_add.end_date,
        event_to_add.start_time,
        event_to_add.end_time,
      ];
      db.query(sql_query, event_arr, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
        }
      });
      console.log(event_to_add);

      var event_location_query =
      "INSERT INTO event_location (event_id, e_location) VALUES (?, ?)";
    var event__location_rec = [event_to_add.event_id, req.body.e_location];
    db.query(event_location_query, event__location_rec, function (err) {
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

//eric
app.put("/updateItemQuantityForBranch", (req, res) => {
//condition to check if preferred branch has items available, else update for different branch with item 
});


/**
 * add item endpoint where a librarian is able to add items to the database. 
 * minimal attributes needed (from item superclass): item name, item description, item release date.  
 * IMPORTANT: each item added will need 2 fields with imdb and isbn values; 1 of these will be null (string type) depending on item type
 * corresponding item types (book or movie) will also have fields that are specific to their type eg. isbn, imdb, etc.
 * 
 * This checks whether an item with the same name is inserted to the database yet, and if not, it will add it to the item database and 
 * it will also be added to the movie/book database depending on the type of the item. 
*/
app.put("/addItem", (req, res) => {

  var all_items = []; 
  var all_item_name = []; 
  var item_query = `SELECT * FROM item`;
  db.query(item_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        all_items.push(parseInt(result[i]["item_id"]));
        all_item_name.push(result[i]["item_name"]);
      }
    }
    // check if item is unique based on item name
    if (all_item_name.includes(req.body.item_name)) {
      res.send({
        status: 400,
        message: "Item already exists in database",
      });
    } else {
      // Generate a item id
      var max_id = Math.max(...all_items) + 1;
      var item_to_add = { //item to add object
        item_name: req.body.item_name,
        item_desc: req.body.item_desc,
        release_date: req.body.release_date,
        item_availability: 1,
        item_id: max_id,
      };

      var sql_query =
        "INSERT INTO item (item_id, release_date, item_desc, item_name, item_availability) VALUES(?, ?, ?, ?, ?);";
      var item_arr = [
        item_to_add.item_id,
        item_to_add.release_date,
        item_to_add.item_desc,
        item_to_add.item_name,
        item_to_add.item_availability,
      ];
      db.query(sql_query, item_arr, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
        }
      });
      console.log(item_to_add);

      //if item is a movie
      if (req.body.isbn == 'null') { 
        var movies_query =
        "INSERT INTO movies (item_id, production_company, imdb_id, duration) VALUES (?, ?, ?, ?)";
        var movie_rec = [
          item_to_add.item_id, 
          res.body.production_company,
          req.body.imdb_id,
          req.body.duration];
         
          db.query(movies_query, movie_rec, function (err) {
            if (err) {
              res.status(400);
              res.send({
                message: err,
              });
            } else {
              res.status(200);
              res.send({ item_to_add });
            }
          });
      } 
      
      //if item is a book
      else {
      var books_query =
        "INSERT INTO books (item_id, isbn, publisher_name, book_type) VALUES (?, ?, ?, ?)";
        var book_rec = [
          item_to_add.item_id, 
          res.body.isbn,
          req.body.publisher_name,
          req.body.book_type];
      db.query(books_query, book_rec, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          res.send({ item_to_add });
        }
      });
      }
    }
  });
});

//himika (searching)
app.get("/searchTitle", (req, res) => {

});

//tbd
app.get("/searchAuthor", (req, res) => {

});

app.get("/searchDirector", (req, res) => {

});

app.get("/searchActor", (req, res) => {

});

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
