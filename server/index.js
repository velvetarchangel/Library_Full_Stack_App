// Entrypoint for the server
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
  // console.log(body);
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
        isLibrarian: result[0]["isLibrarian"],
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

/**
 * Get feedback endpoint where user is able to get feedback based on a particular item_id
 * URL param passes item_id and feedback (comment and rating) is returned by card_no
 */
app.get("/feedback/:itemId", (req, res) => {
  // console.log(req.params);
  var itemFeedback = {};
  var feedback_query = `SELECT DISTINCT * from feedback as f, user_comments as u
                        WHERE
                        (f.item_id = u.item_id AND f.feedback_id = u.feedback_id AND
                        u.item_id = ${req.params.itemId})`;

  db.query(feedback_query, function (err, result) {
    if (err) {
      res.status(500);
      res.send(err);
    } else {
      // console.log(result);
      for (let i = 0; i < result.length; i++) {
        var card_no = result[i].card_no;
        var comment = result[i].u_comment;
        var user_rating = result[i].user_rating;
        itemFeedback[card_no] = { comment, user_rating };
      }
    }
    res.status(200);
    res.send(itemFeedback);
  });
});

//next 2 are lower priority
app.get("/getFines", (req, res) => {});

app.post("/payFines", (req, res) => {
  //really simple/dummy
});

//these 2 are similar
//kelly
app.post("/signout/:itemId/:branchId", (req, res) => {});

//kelly
app.post("/hold/:itemId/:branchId/:userId", (req, res) => {});

//kelly
app.get("/loanedItems/:card_no", (req, res) => {});

//kelly
app.get("/holds/:userId", (req, res) => {});

//kelly
app.get("/holds/:branchId", (req, res) => {});

 /**
   * ENDPOINT URL: localhost:5001/returnItem
   *
   * Method: put
   *
   * Description: The library user is able to return an item back to the branch. The item will be removed from the
   * users record, and that item copy will be marked as available.
   *
   * Input: card_no, item_barcode
   *
   * Output: item copy removed from user record, item_availability = true for that copy
   */
app.put("/returnItem", (req, res) => {
  //finding the copy of item being returned from the checked out items
  var checked_out_copy = [];
  var return_query = `SELECT * FROM signed_out WHERE item_barcode='${req.body.item_barcode}' AND card_no='${req.body.card_no}'`;
  db.query(return_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        checked_out_copy.push(parseInt(result[i]["item_barcode"]));
      }
    }

    // check if item copy is checked out by the user registered
    if (!checked_out_copy.includes(req.body.item_barcode)) {
      res.send({
        status: 400,
        message: "The user does not have this item signed out",
      });
    } else {
      //removing the checked out item
      var sql_query = `DELETE FROM signed_out WHERE item_barcode='${req.body.item_barcode}' AND card_no='${req.body.card_no}'`;
      db.query(sql_query,  function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          console.log(req.body.item_barcode + "has been deleted from user " + req.body_card_no);
        }
      });
      //update the availability of the item to available
      var update_query = `UPDATE has_for_branch_and_item SET item_availability = 1 WHERE item_barcode='${req.body.item_barcode}'`;
      db.query(update_query,  function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          console.log("added item " + req.body.item_barcode + " back in stock");
          res.send("added item " + req.body.item_barcode + " back in stock");
        }
      });
    }
  });

});


/**
 * User registers for an event. If the user hasn't been registered for that event yet, they will be allowed
 * to register for it. If they previously been registered for this event, they won't be able to register for it again.
 *
 * Inputs:
 * event_id: event to register
 * card_no: card number of the user
 *
 * Output:
 * user is registered for that event.
 */
app.post("/userRegistersEvents", (req, res) => {
  //add to the registers table.
  var registered_events = [];
  var event_query = `SELECT * FROM registers WHERE event_id='${req.body.event_id}' AND card_no='${req.body.card_no}'`;
  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        registered_events.push(parseInt(result[i]["event_id"]));
      }
    }
    // check if event has previously been registered
    if (registered_events.includes(req.body.event_id)) {
      res.send({
        status: 400,
        message: "Event has been registed for this user already",
      });
    } else {
      var event_to_register = {
        //event to add to object
        event_id: req.body.event_id,
        card_no: req.body.card_no,
      };

      var sql_query = "INSERT INTO registers (event_id, card_no) VALUES(?, ?);";
      var event_arr = [event_to_register.event_id, event_to_register.card_no];
      db.query(sql_query, event_arr, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          res.send( event_arr );
        }
      });
      console.log(event_to_register);
    }
  });
});


//update this so it sends all the event info, not just the name of the event
/**
 * Finds all the events that a user is registered for
 *
 * Inputs:
 * card_no: card number of the user
 *
 * Output:
 * array containing the event_id(s) that the user is registered for
 */
//TODO: add more event info here
app.get("/getUserRegisteredEvents", (req, res) => {
  //add to the registers table.
  var registered_events = [];
  var event_query = `SELECT * FROM registers NATURAL JOIN lib_events WHERE card_no='${req.body.card_no}'`; //natural join with events?
  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        registered_events.push(result[i]); //push actual event information here. need to join with the lib_events table
      }
      res.send( registered_events );
    }
  });
});

//ERIC: create an endpoint to find all users registered for each event. 
app.get("/getEventsParticipants", (req, res) => {
  //add to the registers table.
  var registered_events = [];
  var event_query = `SELECT card_no FROM registers WHERE event_id='${req.body.event_id}'`; //natural join with events?
  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        registered_events.push(result[i]); //push actual event information here
      }
      res.send(registered_events );
    }
  });
});

/**
 * create event endpoint where a librarian is able to add events to the database.
 * Inputs: event_id, event_name, event_start_date, end_date, start_time, end_time, e_location
 * Outputs: event is created
 *
 * CURRENT IMPLEMENTATION: The librarian needs to add a unique event ID as they are entering events to the database;
 * this is because there can be multiple events with the same name and we need a way to identify these.
 */

//add query for coordinates info
app.post("/createEvent", (req, res) => {
  var all_events = [];
  var all_event_id = [];

  var event_query = `SELECT * FROM lib_events`;
  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        all_event_id.push(parseInt(result[i]["event_id"]));
      }
    }
  });

  var event_query = `SELECT * FROM lib_events NATURAL JOIN event_location WHERE event_name='${req.body.event_name}' AND event_start_date='${req.body.event_start_date}' 
  AND end_date='${req.body.end_date}' AND start_time='${req.body.start_time}' AND end_time='${req.body.end_time}' AND e_location='${req.body.e_location}' `;
  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        all_events.push(result[i]["event_name"]); //change to ???
        all_event_id.push(parseInt(result[i]["event_id"]));
      }
    }

    // check if event is unique based on item name
    if (all_events.includes(req.body.event_name)) {
      res.send({
        status: 400,
        message: "Event already exists in database",
      });
    } else {
      var event_to_add = {
        //event to add to object
        event_id: Math.max(...all_event_id) + 1,  
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

      var event_location_to_add = {
        //event to add to object
        event_id: req.body.event_id,
        e_location: req.body.e_location,
      };
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
          res.send({ event_to_add, event_location_to_add });
        }
      });
    }
  });
});

/**
 * add item endpoint where a librarian is able to add items to the database.
 * minimal input needed (from item superclass): item name, item description, item release date.
 * IMPORTANT: each item added will need 2 fields with imdb and isbn values; 1 of these will be null (string type) depending on item type
 * corresponding item types (book or movie) will also have fields that are specific to their type eg. isbn, imdb, etc.
 *
 * This checks whether an item with the same name is inserted to the database yet, and if not, it will add it to the item database and
 * it will also be added to the movie/book database depending on the type of the item. May be modified to check whether a complete matching
 * record is in DB via SQL.
 */
//make sure to send 1 of book or movie isbn/imdb as null depending on item type during front-end connection
app.post("/addItem", (req, res) => {
  var all_items = []; //for creating new item ids
  var all_item_name = []; //for checking if item exists in db yet
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
    } 
    else {
      // Generate a item id
      var max_id = Math.max(...all_items) + 1;
      var item_to_add = {
        //item to add object
        item_name: req.body.item_name,
        item_desc: req.body.item_desc,
        release_date: req.body.release_date,
        item_availability: 1, //bool
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
      if (req.body.isbn == "null") {
        var movies_query =
          "INSERT INTO movies (item_id, production_company, imdb_id, duration) VALUES (?, ?, ?, ?)";
        var movie_rec = [
          item_to_add.item_id,
          req.body.production_company,
          req.body.imdb_id,
          req.body.duration,
        ];
        db.query(movies_query, movie_rec, function (err) {
          if (err) {
            res.status(400);
            res.send({
              message: err,
            });
          } else {
            res.status(200);
           // res.send({ item_to_add });
          }
        });
      }

      //if item is a book
      else {
        var books_query =
          "INSERT INTO book (item_id, isbn, publisher_name, book_type) VALUES (?, ?, ?, ?)";
        var book_rec = [
          item_to_add.item_id,
          req.body.isbn,
          req.body.publisher_name,
          req.body.book_type,
        ];
        db.query(books_query, book_rec, function (err) {
          if (err) {
            res.status(400);
            res.send({
              message: err,
            });
          } else {
            res.status(200);
           // res.send({ item_to_add });
          }
        });
      }
      //add a copy of the item
      var copy_barcodes = []; //finding the max barcode to create
      var max_barcode;
      var event_query = `SELECT * FROM copy_of_item`;
      db.query(event_query, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        //var max_barcode;
          for (let i = 0; i < result.length; i++) {
            //console.log(result[i]["item_barcode"]);
          copy_barcodes.push(parseInt(result[i]["item_barcode"]));
       }

      max_barcode = Math.max(...copy_barcodes) + 1; 
      console.log("max barcode " + max_barcode);
      
      var copy_item_query = "INSERT INTO copy_of_item (item_barcode, item_id) VALUES (?,?)";
     
      var copy_item_rec = [
        max_barcode,
        item_to_add.item_id
      ];
      db.query(copy_item_query, copy_item_rec, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          //res.send({item_to_add, copy_item_rec });


          //add copy to has for branch and items
          var branch_item_copy_query = "INSERT INTO has_for_branch_and_item (branch_id, item_id, item_barcode, item_availability) VALUES (?,?, ?, ?)";
          var branch_item_copy_rec = [
            1, //library location; can change this, but default is central library
            item_to_add.item_id,
            max_barcode,
            1, //item is initially available
          ];
          
          db.query(branch_item_copy_query, branch_item_copy_rec, function (err) {
            if (err) {
              res.status(400);
              res.send({
                message: err,
              });
            } else {
              res.status(200);  
              res.send({item_to_add, copy_item_rec,branch_item_copy_rec  });
            } 
            });

        } //semicolon for else 
      });
    
      }
      });
    }
  });
}); //added this


app.post("/addItemCopy", (req, res) => {
  var all_item_name = []; //for checking if item exists in db yet
  var item_query = `SELECT * FROM item`;
  db.query(item_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        all_item_name.push(result[i]["item_name"]);
      }
    }
    // check if item exists in db based on item name
    if (!all_item_name.includes(req.body.item_name)) {
      res.send({
        status: 400,
        message: "Item does not exist in database",
      });
    } 
    else {
      var item_copy_id
      var item_id_query = `SELECT item_id FROM item WHERE item_name='${req.body.item_name}'`;
      db.query(item_id_query, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          //res.status(200);
          item_copy_id = result[0]["item_id"];
        }
      });

      //add a copy of the item
      var copy_barcodes = []; //finding the max barcode to create
      var max_barcode;
      var event_query = `SELECT * FROM copy_of_item`;
      db.query(event_query, function (err, result) {
      if (err) {
        console.log(err);
      } else {
        //var max_barcode;
          for (let i = 0; i < result.length; i++) {
            //console.log(result[i]["item_barcode"]);
          copy_barcodes.push(parseInt(result[i]["item_barcode"]));
       }

      max_barcode = Math.max(...copy_barcodes) + 1; 
      console.log("max barcode " + max_barcode);
      
      var copy_item_query = "INSERT INTO copy_of_item (item_barcode, item_id) VALUES (?,?)";
     
      var copy_item_rec = [
        max_barcode,
        item_copy_id
      ];
      db.query(copy_item_query, copy_item_rec, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
         // res.send({copy_item_rec });
         
          //add copy to has for branch and items
          var branch_item_copy_query = "INSERT INTO has_for_branch_and_item (branch_id, item_id, item_barcode, item_availability) VALUES (?,?, ?, ?)";
          var branch_item_copy_rec = [
            1, //library location; can change this, but default is central library. replace with req.body.branch_id and add 2nd input
            item_copy_id,
            max_barcode,
            1, //item is initially available
          ];
          db.query(branch_item_copy_query, branch_item_copy_rec, function (err) {
            if (err) {
              res.status(400);
              res.send({
                message: err,
              });
            } else {
              res.status(200);  
              res.send({copy_item_rec,branch_item_copy_rec  });
            } 
            });


        }
      });
    
      }
      });
    }
  });
}); 



   




//himika (searching)
app.get("/search/:searchType/:searchTerm", (req, res) => {
  var searchType = req.params.searchType;
  var searchTerm = req.params.searchTerm;
  console.log(searchType, searchTerm);
  var bookQuery = `SELECT b.item_id, b.publisher_name, b.isbn, i.release_date, i.item_desc, i.item_name, a.author_name 
                  FROM book as b, item as i, writes as w, author as a WHERE 
                              i.item_id = b.item_id AND w.item_id = i.item_id 
                              AND a.author_id = w.author_id
                              AND (item_desc LIKE '%${searchTerm}%' 
                                  OR item_name LIKE '%${searchTerm}%' 
                                  OR publisher_name like '%${searchTerm}%'
                                  OR author_name like '%${searchTerm}%'
                                  OR b.isbn like '%${searchTerm}%'
                                  OR item_desc like '%${searchTerm}%'
                                  )`;
  var movieQuery = ``;
  var eventQuery = `SELECT DISTINCT h.event_id, event_name, event_start_date, end_date, start_time, end_time, card_no, staff_id, e_location, branch_id
                    FROM lib_events as l, coordinates as c, event_location as el, hosts_event as h
                    WHERE h.event_id = l.event_id 
                      AND c.event_id = el.event_id
                      AND h.event_id = el.event_id
                      AND c.event_id = l.event_id
                      AND (event_name LIKE '%${searchTerm}%' 
                        OR e_location like '%${searchTerm}%'
                        OR event_start_date like '%${searchTerm}%'
                        OR end_date like '%${searchTerm}%'
                        OR start_time like '%${searchTerm}%'
                        OR end_time like '%${searchTerm}%'
                      );`;

  if (searchType == "book") {
    db.query(bookQuery, function (err, result) {
      if (err) {
        console.log(err);
        res.send({
          status: 400,
          message: "Unable to connect to DB",
        });
      } else {
        var books = [];
        for (let i = 0; i < result.length; i++) {
          var book = {
            item_id: result[i].item_id,
            publisher_name: result[i].publisher_name,
            isbn: result[i].isbn,
            release_date: result[i].release_date,
            item_desc: result[i].item_desc,
            item_name: result[i].item_name,
            author_name: result[i].author_name,
          };
          books.push(book);
          console.log(books);
        }
        res.status(200);
        res.send({
          books,
        });
      }
    });
  } else if (searchType == " movie") {
    db.query(movieQuery, function (err, result) {
      if (err) {
        console.log(err);
        res.send({
          status: 400,
          message: "Unable to connect to DB",
        });
      } else {
        var movies = [];
        for (let i = 0; i < result.length; i++) {
          var movie = {
            // event_id: result[i].event_id,
            // event_start_date: result[i].event_start_date,
            // end_date: result[i].end_date,
            // start_time: result[i].start_time,
            // end_time: result[i].end_time,
            // card_no: result[i].card_no,
            // staff_id: result[i].staff_id,
            // e_location: result[i].e_location,
            // branch_id: result[i].branch_id,
          };
          movies.push(movie);
        }
        res.status(200);
        res.send({
          movie,
        });
      }
    });
  } else if (searchType == "event") {
    db.query(eventQuery, function (err, result) {
      if (err) {
        console.log(err);
        res.send({
          status: 400,
          message: "Unable to connect to DB",
        });
      } else {
        var events = [];
        for (let i = 0; i < result.length; i++) {
          var event = {
            event_id: result[i].event_id,
            event_start_date: result[i].event_start_date,
            end_date: result[i].end_date,
            start_time: result[i].start_time,
            end_time: result[i].end_time,
            card_no: result[i].card_no,
            staff_id: result[i].staff_id,
            e_location: result[i].e_location,
            branch_id: result[i].branch_id,
          };
          events.push(event);
        }
        res.status(200);
        res.send({
          events,
        });
      }
    });
  }
});

//kelly
/**
 * Fetches basic info such as card_no, email, first and last name of
 * library customers (users that are not librarian) ***UNLESS LIBRARIANS INCLUDED????
 *
 * Inputs:
 *    none
 *
 * Output:
 *    customers: 2D array of library customers
 */
app.get("/users", (_, res) => {
  var customers = {};
  var user_query = `SELECT * from library_user WHERE isLibrarian='0'`;

  db.query(user_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var card_no = result[i].card_no;
        var first_name = result[i].first_name;
        var last_name = result[i].last_name;
        var email = result[i].email;

        customers[card_no] = { first_name, last_name, email };
      }
    }
    res.status(200);
    res.send(customers);
  });
});

//kelly
app.get("/itemRecord/:itemId", (req, res) => {
  //information on who has checked out a particular item
});

// Start the server on port 5000
app.listen(PORT_NUM, () => {
  console.log("Node server running on port " + PORT_NUM);
});
