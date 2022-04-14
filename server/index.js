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
  password: "mysqlpassword",
  database: "library",
});

const PORT_NUM = 5001;

// Start the server on port 5000
app.listen(PORT_NUM, () => {
  console.log("Node server running on port " + PORT_NUM);
});

/**
 * Get user endpoint where user is able to login using their email and password
 * Request body passes in email and password from the front end and queries the DB
 * If there is an user with the email password combination the user object is retured
 * back to the front end to be utilized downstream
 * @param body containing userName and password of the user who is trying to log in
 * @retruns JSON object with the user information:
 * 	  {
        card_no: card_no,
        first_name: first_name,
        last_name: last_name,
        isLibrarian: isLibrarian,
      }
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
 * @param user information email and password contained in the body
 * @returns JSON object containing user:
 *      var user = {
 *      first_name: req.body.first_name,
 *      last_name: req.body.last_name,
 *       email: req.body.email,
 *      user_password: req.body.user_password,
 *       card_no: max_card_no,
 *     };
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

//kelly
/**
 * Checks if item input exists in branch. If item exists, item is checked out
 * with item_id, user's card_no, item barcode, today's date, and a return date being
 * inserted into the signed_out table in database. Otherwise, item is unavailable and
 * signed_out table is not modified.
 *
 * Input:
 *    card_no: card number of user
 *    item_id: id of item
 *    branch_id: id of branch
 *
 * Output:
 * 		item_id: id of item
 *		card_no: card number of user
 *		item_barcode: barcode of item
 *		checkout_date: "today"'s date
 *		return_date: 31 days from "today"
 *
 */
app.post("/signout/:itemId/:branchId", (req, res) => {
  var item_copies_in_branch = [];
  var items_query = `SELECT * from has_for_branch_and_item 
                      WHERE branch_id = ${req.params.branchId} 
                      AND item_id = ${req.params.itemId} AND item_availability='1'`;

  db.query(items_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        item_copies_in_branch.push(parseInt(result[i]["item_barcode"]));
      }
    }

    // If there are no copy of item available in branch
    if (!item_copies_in_branch.length) {
      res.send({
        status: 400,
        message: "Item is currently unavailable to signout",
      });
    } else {
      let today = new Date();

      // Set a return_date
      var duedate = new Date();
      duedate.setDate(today.getDate() + 31);

      var item_to_signout = {
        item_id: req.params.itemId,
        card_no: req.body.card_no,
        item_barcode: item_copies_in_branch[0].toString(),
        checkout_date: today,
        return_date: duedate,
      };

      var sql_query = `INSERT INTO signed_out (item_id, card_no, item_barcode, checkout_date, return_date) VALUES(?, ?, ?, ?, ?)`;
      var item_to_insert = [
        item_to_signout.item_id,
        item_to_signout.card_no,
        item_to_signout.item_barcode,
        item_to_signout.checkout_date,
        item_to_signout.return_date,
      ];
      db.query(sql_query, item_to_insert, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.send([item_to_signout]);
        }
      });

      // Update item availability in has_for_branch_and_item
      var barcode = item_copies_in_branch[0].toString();
      var sql_update = `UPDATE has_for_branch_and_item SET item_availability='0' WHERE item_barcode=${barcode}`;
      db.query(sql_update, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: item_copies_in_branch[0],
          });
        } else {
          res.status(200);
        }

        var result_copy_in_branch = [];
        var result_query = `SELECT * from has_for_branch_and_item 
														WHERE item_id = ${req.params.itemId} 
																	AND item_availability='1'`;
        db.query(result_query, function (err, result) {
          if (err) {
            console.log(err);
          } else {
            for (let i = 0; i < result.length; i++) {
              item_copies_in_branch.push(parseInt(result[i]["item_barcode"]));
            }
          }

          if (!result_copy_in_branch.length) {
            var item_update = `UPDATE item SET item_availability='0' WHERE item_id=${req.params.itemId}`;
            db.query(item_update, function (err) {
              if (err) {
                console.log(err);
              } else {
                res.status(200);
              }
            });
          } else {
            res.status(200);
          }
        });
      });
    }
  });
});

//kelly
/**
 * Checks multiple things: (1) if copies of item exist in library, (2) if user has already put
 * a copy of the item on hold, and (3) if there already exists hold/s for the item in database.
 * If user does not have item put on hold yet, they may put item on hold with a card_no, item_id,
 * and a return hold position being inserted into the places_hold table in database. Otherwise,
 * user may not put item on hold again and places_hold table is not modified. Similarly, item
 * cannot be put on hold if no copies exist in database.
 *
 * Input:
 *    @param card_no: card number of user
 *    @param item_id: id of item
 *
 * Output:
 * 		card_no: card number of user
 *		item_id: id of item
 *		hold_position: user's place in waiting list for holds, generated for user
 *
 */
app.post("/hold/:itemId/:card_no", (req, res) => {
  var maxPosition;
  var hold_positions = [];
  var user_pos = [];
  var copies_in_branches = [];
  var item_copy_query = `SELECT * from has_for_branch_and_item WHERE item_id = ${req.params.itemId}`;
  var items_query = `SELECT DISTINCT * from places_hold WHERE card_no=${req.params.card_no} AND item_id=${req.params.itemId}`;
  var holds_query = `SELECT * from places_hold WHERE item_id=${req.params.itemId}`;

  db.query(item_copy_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        copies_in_branches.push(parseInt(result[i]["item_barcode"]));
      }
    }

    // If there are no copies of item in any branch
    if (!copies_in_branches.length) {
      res.send({
        status: 400,
        message: "Item is currently unavailable",
      });
    } else {
      db.query(items_query, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          for (let i = 0; i < result.length; i++) {
            user_pos.push(parseInt(result[i]["card_no"]));
          }
        }

        // If user has item on hold already
        if (user_pos.length) {
          res.send({
            status: 400,
            message: "You already have this item on hold",
          });
        } else {
          // If there exists copies of item in database and user does not have item on hold
          db.query(holds_query, function (err, result) {
            if (err) {
              console.log(err);
            } else {
              for (let i = 0; i < result.length; i++) {
                hold_positions.push(parseInt(result[i]["hold_position"]));
              }
            }

            if (hold_positions.length) {
              // If there are holds for the item in database
              // Get highest hold position for the item
              maxPosition = (Math.max(...hold_positions) + 1).toString();
            } else {
              // If no holds for item
              maxPosition = "1";
            }

            var hold_record = {
              card_no: req.params.card_no,
              item_id: req.params.itemId,
              hold_position: maxPosition,
            };

            var sql_query =
              "INSERT INTO places_hold (card_no, item_id, hold_position) VALUES(?, ?, ?)";
            var item_to_hold = [
              hold_record.card_no,
              hold_record.item_id,
              hold_record.hold_position,
            ];
            db.query(sql_query, item_to_hold, function (err) {
              if (err) {
                res.status(400);
                res.send({
                  message: err,
                });
              } else {
                res.status(200);
                res.send([hold_record]);
              }
            });
          });
        }
      });
    }
  });
});

//kelly
/**
 * Gets all current signed out items by a user
 *
 * Input:
 *    @param card_no: card number of user
 *
 * Output:
 *    loaned_items: array of objects with values:
 * 			item_id,
 * 			item_name,
 * 			item_desc,
 *			item_barcode,
 *			checkout_date,
 *			return_date
 */
app.get("/loanedItems/:card_no", (req, res) => {
  var loaned_items = [];
  var signedout_query = `SELECT DISTINCT * from signed_out as s, item as i
                        WHERE (s.item_id = i.item_id AND
                        s.card_no = ${req.params.card_no})`;

  db.query(signedout_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var item_id = result[i].item_id;
        var item_name = result[i].item_name;
        var release_date = result[i].release_date.toDateString(); //mysql date format
        var item_desc = result[i].item_desc;
        var item_barcode = result[i].item_barcode.toString();
        var checkout_date = result[i].checkout_date;
        var return_date = result[i].return_date.toString();

        // Take day of week out of date string
        release_date = release_date.split(" ").slice(1).join(" ");

        var item = {
          item_id,
          item_name,
          release_date,
          item_desc,
          item_barcode,
          checkout_date,
          return_date,
        };
        loaned_items.push(item);
      }
    }
    res.status(200);
    res.send(loaned_items);
  });
});

//kelly
/**
 * Gets all items currently put on hold by a user
 *
 * Input:
 * @param card_no: card number of user
 *
 * Output:
 *    items_on_hold: array of objects with values:
 * 			item_id,
 * 			item_name,
 * 			item_desc,
 * 			hold_position,
 *
 */
app.get("/holds/:card_no", (req, res) => {
  var items_on_hold = [];
  var holds_query = `SELECT DISTINCT * FROM places_hold as p, item as i 
										WHERE (p.item_id = i.item_id AND 
										p.card_no=${req.params.card_no})`;

  db.query(holds_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var item_id = result[i].item_id;
        var item_name = result[i].item_name;
        var release_date = result[i].release_date.toDateString(); //mysql date format
        var item_desc = result[i].item_desc;
        var hold_position = result[i].hold_position.toString();

        // Take day of week out of date string
        release_date = release_date.split(" ").slice(1).join(" ");

        var item = {
          item_id,
          item_name,
          release_date,
          item_desc,
          hold_position,
        };
        items_on_hold.push(item);
      }
    }
    res.status(200);
    res.send(items_on_hold);
  });
});

//kelly
/**
 * Gets all items on hold in database
 *
 * Output:
 *    items_on_hold: array of objects with values:
 *      card_no, (of user)
 * 			item_id,
 * 			item_name,
 * 			item_desc,
 * 			hold_position,
 *
 */
app.get("/holds", (_, res) => {
  var items_on_hold = [];
  var holds_query = `SELECT DISTINCT * FROM places_hold as p, item as i 
										WHERE p.item_id = i.item_id`;

  db.query(holds_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var card_no = result[i].card_no;
        var item_id = result[i].item_id;
        var item_name = result[i].item_name;
        var release_date = result[i].release_date.toDateString(); //mysql date format
        var item_desc = result[i].item_desc;
        var hold_position = result[i].hold_position.toString();

        // Take day of week out of date string
        release_date = release_date.split(" ").slice(1).join(" ");

        var item = {
          card_no,
          item_id,
          item_name,
          release_date,
          item_desc,
          hold_position,
        };
        items_on_hold.push(item);
      }
    }
    res.status(200);
    res.send(items_on_hold);
  });
});

/**
 * ENDPOINT URL: localhost:5001/returnItem/:card_no/:item_barcode
 *
 * Method: put
 *
 * Description: The library user is able to return an item back to the branch. The item will be removed from the
 * users record, and that item copy will be marked as available.
 *
 * Input:
 * @param card_no, (as path variables) library card number of the user
 * @param item_barcode (as path variables) item copy being returned
 *
 * Output: 
 * @returns item copy removed from user record, item_availability = true for that copy
 */
app.put("/returnItem/:card_no/:item_barcode", (req, res) => {
  //finding the copy of item being returned from the checked out items
  var checked_out_copy = [];
  var return_query = `SELECT * FROM signed_out WHERE item_barcode='${req.params.item_barcode}' AND card_no='${req.params.card_no}'`;
  db.query(return_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        checked_out_copy.push(parseInt(result[i]["item_barcode"]));
      }
    }
    // check if item copy is checked out by the user registered
    if (checked_out_copy[0] != req.params.item_barcode) {
      res.send({
        status: 400,
        message: "The user does not have this item signed out",
      });
    } else {
      //removing the checked out item
      var sql_query = `DELETE FROM signed_out WHERE item_barcode='${req.params.item_barcode}' AND card_no='${req.params.card_no}'`;
      db.query(sql_query, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          console.log(
            req.params.item_barcode +
              " has been deleted from user " +
              req.params.card_no
          );
        }
      });
      //update the availability of the item to available
      var update_query = `UPDATE has_for_branch_and_item SET item_availability = 1 WHERE item_barcode='${req.params.item_barcode}'`;
      db.query(update_query, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          console.log(
            "added item " + req.params.item_barcode + " back in stock"
          );
          res.send("added item " + req.params.item_barcode + " back in stock");
        }
      });
    }
  });
});

/**
 * User registers for an event. If the user hasn't been registered for that event yet, they will be allowed
 * to register for it. If they are currently registered for this event, they won't be able to register for it again.
 *
 * Inputs:
 * @param event_id: event to register
 * @param card_no: card number of the user
 *
 * Output:
 * @returns user is registered for that event.
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
          res.send(event_arr);
        }
      });
      console.log(event_to_register);
    }
  });
});

/**
 * Finds all the events that a user is registered for
 *
 * Inputs:
 * @param card_no: card number of the user as a path variable
 *
 * Output:
 * @returns array containing the event_id(s) that the user is registered for
 */
app.get("/getUserRegisteredEvents/:card_no", (req, res) => {
  //add to the registers table.
  var registered_events = [];
  var event_query = `SELECT DISTINCT * FROM registers as r, lib_events as l, event_location as e WHERE 
					          (r.card_no = '${req.params.card_no}' AND l.event_id = r.event_id AND r.event_id = e.event_id);`;
  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var event_id = result[i].event_id;
        var event_name = result[i].event_name;
        var event_start_date = result[i].event_start_date.toDateString();
        var end_date = result[i].end_date.toDateString();
        var start_time = result[i].start_time;
        var end_time = result[i].end_time;
        var e_location = result[i].e_location;

        var event = {
          event_id,
          event_name,
          event_start_date,
          end_date,
          start_time,
          end_time,
          e_location,
        };
        registered_events.push(event);
      }
      res.status(200);
      res.send(registered_events);
    }
  });
});

/**
 * create event endpoint where a librarian is able to add events to the database.
 * Inputs: information about the event being created
 * @param body containing
 * 							{
 * 							event_id,
 * 							event_name,
 * 							event_start_date,
 * 							end_date,
 * 							start_time,
 * 							end_time,
 * 							e_location
 * 							}
 * Outputs: 
 * @return event is created
 *
 */

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
        all_events.push(result[i]["event_name"]); 
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
        }
      });
      var branches;
      var get_branch_query = `SELECT branch_id FROM branch WHERE branch_name='${req.body.e_location}'`;
      db.query(get_branch_query, function (err, result) {
        if (err) {
          console.log(err);
        } else {
          branches = result[0]["branch_id"];

          var host_event_query =
            "INSERT INTO hosts_event (event_id, branch_id) VALUES (?, ?)";
          var host_events_rec = [event_to_add.event_id, branches];
          db.query(host_event_query, host_events_rec, function (err) {
            if (err) {
              res.status(400);
              res.send({
                message: err,
              });
            } else {
              res.status(200);
            }
          });
        }
      });

      var coordinates_query =
        "INSERT INTO coordinates (card_no, staff_id, event_id) VALUES (?,?, ?)";
      var coordinates_rec = [
        req.body.card_no,
        req.body.staff_id,
        event_to_add.event_id,
      ];
      db.query(coordinates_query, coordinates_rec, function (err) {
        if (err) {
          res.status(400);
          res.send({
            message: err,
          });
        } else {
          res.status(200);
          var addedEventInfo = [
            event_to_add.event_id,
            event_to_add.event_name,
            event_to_add.event_start_date,
            event_to_add.end_date,
            event_to_add.start_time,
            event_to_add.end_time,
            event_location_to_add.e_location,
            coordinates_rec[0],
            coordinates_rec[1],
          ];
          res.send(addedEventInfo);
        }
      });
    }
  });
});

/**
 * add item endpoint where a librarian is able to add items to the database.
 * 
 * Inputs:
 * @param item_name: name of item being added to the database
 * @param item_desc: description of item being added to the database
 * @param release_date: release date of item being added to the database
 * 
 * //movie item attributes
 * @param production_company: 
 * @param imdb_id: 
 * @param duration: 
 * 
 * //book item attributes
 * @param publisher_name: 
 * @param isbn: 
 * @param book_type:
 * 
 * Output:
 * @returns item being created
 * 
 * IMPORTANT: each item added will need 2 fields with imdb and isbn values; 1 of these will be null (string type) depending on item type
 * corresponding item types (book or movie) will also have fields that are specific to their type eg. isbn, imdb, etc.
 *
 * This checks whether an item with the same name is inserted to the database yet, and if not, it will add it to the item database and
 * it will also be added to the movie/book database depending on the type of the item. May be modified to check whether a complete matching
 * record is in DB via SQL.
 */
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
    } else {
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
          for (let i = 0; i < result.length; i++) {
            copy_barcodes.push(parseInt(result[i]["item_barcode"]));
          }

          max_barcode = Math.max(...copy_barcodes) + 1;
          console.log("max barcode " + max_barcode);

          var copy_item_query =
            "INSERT INTO copy_of_item (item_barcode, item_id) VALUES (?,?)";

          var copy_item_rec = [max_barcode, item_to_add.item_id];
          db.query(copy_item_query, copy_item_rec, function (err) {
            if (err) {
              res.status(400);
              res.send({
                message: err,
              });
            } else {
              res.status(200);

              //add copy to has for branch and items
              var branch_item_copy_query =
                "INSERT INTO has_for_branch_and_item (branch_id, item_id, item_barcode, item_availability) VALUES (?,?, ?, ?)";
              var branch_item_copy_rec = [
                1, //library location; default is central library
                item_to_add.item_id,
                max_barcode,
                1, //item is initially available
              ];

              db.query(
                branch_item_copy_query,
                branch_item_copy_rec,
                function (err) {
                  if (err) {
                    res.status(400);
                    res.send({
                      message: err,
                    });
                  } else {
                    res.status(200);
                    res.send([
                      item_to_add,
                      { copy_item_rec },
                      { branch_item_copy_rec },
                    ]);
                  }
                }
              );
            } 
          });
        }
      });
    }
  });
}); 

/**
 * add item copy endpoint where a librarian is able to add copies of items to the database.
 * input: 
 * @param item_name: item name of copy to be created
 * @param branch_id: copy being created to this branch
 * 
 * output: 
 * @returns copy of the item name is created for the specified branch
 *
 * This checks whether the item to make a copy of is inserted to the database already, and if so, it will add a copy of the item database 
 * for the specified branch. If the item is not currently in the database, this function will not add that item (need to use addItem endpoint).
 */
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
    } else {
      var item_copy_id;
      var item_id_query = `SELECT item_id FROM item WHERE item_name='${req.body.item_name}'`;
      db.query(item_id_query, function (err, result) {
        if (err) {
          console.log(err);
        } else {
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
          for (let i = 0; i < result.length; i++) {
            copy_barcodes.push(parseInt(result[i]["item_barcode"]));
          }

          max_barcode = Math.max(...copy_barcodes) + 1;
          console.log("max barcode " + max_barcode);

          var copy_item_query =
            "INSERT INTO copy_of_item (item_barcode, item_id) VALUES (?,?)";

          var copy_item_rec = [max_barcode, item_copy_id];
          db.query(copy_item_query, copy_item_rec, function (err) {
            if (err) {
              res.status(400);
              res.send({
                message: err,
              });
            } else {
              res.status(200);
            

              //add copy to has for branch and items
              var branch_item_copy_query =
                "INSERT INTO has_for_branch_and_item (branch_id, item_id, item_barcode, item_availability) VALUES (?,?, ?, ?)";
              var branch_item_copy_rec = [
                req.body.branch_id, 
                item_copy_id,
                max_barcode,
                1, //item is initially available
              ];
              db.query(
                branch_item_copy_query,
                branch_item_copy_rec,
                function (err) {
                  if (err) {
                    res.status(400);
                    res.send({
                      message: err,
                    });
                  } else {
                    res.status(200);
                    res.send([{ copy_item_rec }, { branch_item_copy_rec }]);
                  }
                }
              );
            }
          });
        }
      });
    }
  });
});

/**
 *	Search endpoint where a librarian is able to search for books, events or movies
 *	based on keywords. Currently this feature works for a single word only. There is
 *	no chaining of queries.
 *	@param searchType: Selects category such as books, movies, events
 *	@param searchTerm: contains the query string
 *	@returns a JSON object containing the matches to the search
 */
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

  if (searchType == "Books") {
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
  } else if (searchType == "Movies") {
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
  } else if (searchType == "Events") {
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
            event_name: result[i].event_name,
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
 *    customers: array of objects of library customers
 */
app.get("/users", (_, res) => {
  var customers = [];
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

        var object = { card_no, first_name, last_name, email };
        customers.push(object);
      }
    }
    res.status(200);
    res.send(customers);
  });
});

/**
 * End point to get unique events.
 * @returns JSON object with a list of events keyed by event id
 */
app.get("/events", (_, res) => {
  var events = {};
  var event_query = `SELECT DISTINCT h.event_id, event_name, event_start_date, end_date, start_time, end_time, u.card_no, staff_id, e_location, branch_id, first_name, last_name
  FROM lib_events as l, coordinates as c, event_location as el, hosts_event as h, library_user as u
  WHERE h.event_id = l.event_id 
	AND c.event_id = el.event_id
  AND h.event_id = el.event_id
  AND c.event_id = l.event_id
  AND c.card_no = u.card_no`;
  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var event_name = result[i].event_name;
        var event_time = result[i].event_start_date;
        var event_location = result[i].e_location;
        var staff_id = result[i].staff_id;
        var event_id = result[i].event_id;
        var name = result[i].first_name + " " + result[i].last_name;
        var start_time = result[i].start_time;
        var end_time = result[i].end_time;
        events[event_id] = {
          event_name,
          event_time,
          event_location,
          staff_id,
          name,
          start_time,
          end_time
        };
      }
    }
    res.status(200);
    res.send(events);
  });
});

//kelly
//information on who has checked out a particular item
/**
 * Gets user(s) who has item checked out
 *
 * Input:
 *    itemId: item_id of item checked out a particular item
 *
 * Output:
 *    all_users: array of objects with values:
 * 			card_no of user,
 * 			barcode of item signed out,
 * 			return date of item
 */
app.get("/itemRecord/:itemId", (req, res) => {
  var all_users = [];
  var signedout_query = `SELECT * from signed_out WHERE item_id = ${req.params.itemId}`;

  db.query(signedout_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var card_no = result[i].card_no;
        var item_barcode = result[i].item_barcode;
        var return_date = result[i].return_date;

        var user = { card_no, item_barcode, return_date };
        all_users.push(user);
      }
    }
    res.status(200);
    res.send(all_users);
  });
});

//Kelly
/**
 * Gets all available (to sign out) items in database
 *
 * Inputs:
 *    none
 *
 * Output:
 *    all_items: array of item objects with values:
 * 			item_id,
 * 			item_barcode,
 * 			item_availability,
 * 			branch_id
 */
app.get("/availableItems", (_, res) => {
  var available_items = [];
  var item_query = `SELECT * from has_for_branch_and_item`;

  db.query(item_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var item_id = result[i].item_id;
        var item_barcode = result[i].item_barcode;
        var item_availability = result[i].item_availability;
        var branch_id = result[i].branch_id;

        var item = {
          item_id,
          item_barcode,
          item_availability,
          branch_id,
        };
        available_items.push(item);
      }
    }
    res.status(200);
    res.send(available_items);
  });
});

//Kelly
/**
 * Gets all branches (and their infro) from database
 *
 * Inputs:
 *    none
 *
 * Output:
 *    all_branches: array of branch objects with values:
 * 			branch_id,
 * 			branch_name,
 * 			branch_address
 */
app.get("/branches", (_, res) => {
  var branches = [];
  var branch_query = `SELECT * from branch`;

  db.query(branch_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var branch_id = result[i].branch_id;
        var branch_name = result[i].branch_name;
        var branch_address = result[i].branch_address;

        var branch = {
          branch_id,
          branch_name,
          branch_address,
        };
        branches.push(branch);
      }
    }
    res.status(200);
    res.send(branches);
  });
});

/**
 * Gets all items in database
 * Output:
 *    all_items: array of item objects with values:
 * 			item_id,
 * 			item_name,
 * 			release_date,
 * 			item_desc,
 * 			item_availability
 *
 */
app.get("/items", (_, res) => {
  var all_items = [];
  var movies = [];
  var books = [];
  var item_query = `SELECT * from item`;
  var movies_query = `SELECT * from movies`;
  var books_query = `SELECT * from book`;

  db.query(movies_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        movies.push(parseInt(result[i]["item_id"]));
      }
    }
  });

  db.query(books_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        books.push(parseInt(result[i]["item_id"]));
      }
    }
  });
  var item_query = `SELECT * from item`;
  var item_query = `SELECT * from item`;

  db.query(item_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var item_id = result[i].item_id;
        var item_name = result[i].item_name;
        var release_date = result[i].release_date.toDateString(); //mysql date format
        var item_desc = result[i].item_desc;
        var item_availability = result[i].item_availability;
        var item_type;

        // Take day of week out of date string
        release_date = release_date.split(" ").slice(1).join(" ");

        if (movies.includes(item_id)) {
          item_type = "Movie";
        } else if (books.includes(item_id)) {
          item_type = "Book";
        }
        var item = {
          item_id,
          item_name,
          release_date,
          item_desc,
          item_availability,
          item_type,
        };
        all_items.push(item);
      }
    }
    res.status(200);
    res.send(all_items);
  });
});

/**
 * Endpoint to get user name and email based on their card_no
 * @param userId: which is card_no of the libray user
 * @returns { name: user_name, email: user_email}
 */
app.get("/user/:userId", (req, res) => {
  var userId = req.params.userId;
  //console.log(userId);
  var userQuery = `SELECT * FROM library_user WHERE card_no = ${userId}`;
  db.query(userQuery, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      var user = {
        name: result[0].first_name + " " + result[0].last_name,
        email: result[0].email,
      };
      res.status(200);
      res.send(user);
    }
  });
});

/**
 *	Endpoint to get information for all staff in the database
 *	with their id and name
 *	@param: None
 *	@returns: Array of JSON objects containing staff_id and name
							[
								{
									staff_id: staff_id,
									name: staff_name
								}
							]
 */
app.get("/staff/", (_, res) => {
  var staffQuery = `SELECT l.staff_id, u.first_name, u.last_name, u.email FROM library_user as u, librarian as l
                    WHERE l.card_no = u.card_no`;
  var users = [];
  db.query(staffQuery, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var staff_id = result[i].staff_id;
        var name = result[i].first_name + " " + result[i].last_name;
        var user = { staff_id, name };
        users.push(user);
      }
    }
    res.status(200);
    res.send(users);
  });
});

/**
 *	Endpoint to get information for all staff in the database
 *	with their id and name
 *	@param: None
 *	@returns: Array of JSON objects containing staff_id and name
							[
								{
									staff_id: staff_id,
									name: staff_name
								}
							]
 */
app.get("/staff/", (_, res) => {
  var staffQuery = `SELECT l.staff_id, u.first_name, u.last_name, u.email FROM library_user as u, librarian as l
                    WHERE l.card_no = u.card_no`;
  var users = [];
  db.query(staffQuery, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var staff_id = result[i].staff_id;
        var name = result[i].first_name + " " + result[i].last_name;
        var user = { staff_id, name };
        users.push(user);
      }
    }
    res.status(200);
    res.send(users);
  });
});

/**
 *	Endpoint to get all participants of an event given an eventId
 *	@param eventId: The unique identifier of the event
 *	@returns an array of JSON object containing information about the users
 *					 registered in an event.
 *					 [
	 						{
								card_no: card_no, 
								name: name, 
								email: email
							}
						]
 */
app.get("/participants/:eventId", (req, res) => {
  var query = `SELECT DISTINCT r.card_no, u.first_name, u.last_name, u.email FROM 
              lib_events as l, registers as r, library_user as u
              WHERE r.card_no = u.card_no AND r.event_id = l.event_id AND l.event_id = '${req.params.eventId}';`;
  var users = [];
  db.query(query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        var card_no = result[i].card_no;
        var name = result[i].first_name + " " + result[i].last_name;
        var email = result[i].email;
        var user = { card_no, name, email };
        users.push(user);
      }
      res.status(200);
      res.send(users);
    }
  });
});

//kelly
app.put("/unregisterEvent/:userId/:eventId", async (req, res) => {
  var target = [];
  var event_query = `SELECT * from registers WHERE card_no=${req.params.userId} AND event_id=${req.params.eventId}`;

  db.query(event_query, function (err, result) {
    if (err) {
      console.log(err);
    } else {
      for (let i = 0; i < result.length; i++) {
        target.push(parseInt(result[i]["card_no"]));
      }
    }

    // If the user is not in table (somehow)
    if (!target.length) {
      res.send({
        status: 400,
        message: "User is not signed out for this event.",
      });
    } else {
      var sql_query = `DELETE from registers WHERE card_no=${req.params.userId} AND event_id=${req.params.eventId}`;

      db.query(sql_query, function (err) {
        if (err) {
          console.log(err);
        } else {
          res.send({
            status: 200,
            message:
              req.params.userId +
              " has been removed from event " +
              req.params.eventId,
          });
        }
      });
    }
  });
});
