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
	password: "odd&Oracle68",
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
					res.send({ item_to_insert });
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
 *    card_no: card number of user
 *    item_id: id of item
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
								res.send({ item_to_hold });
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
 *    card_no: card number of user
 *
 * Output:
 *    loaned_items: array of item_id
 * 			item_name,
 * 			item_desc,
 *			item_barcode,
 *			checkout_date,
 *			return_date
 */
app.get("/loanedItems/:card_no", (req, res) => {
	var loaned_items = {};
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
				var item_desc = result[i].item_desc;
				var item_barcode = result[i].item_barcode;
				var checkout_date = result[i].checkout_date;
				var return_date = result[i].return_date;

				loaned_items[item_id] = {
					item_name,
					item_desc,
					item_barcode,
					checkout_date,
					return_date,
				};
			}
		}
		if (!loaned_items.length) {
			res.status(200);
			res.send({
				message: "User has no items checked out",
			});
		} else {
			res.status(200);
			res.send(loaned_items);
		}
	});
});

//kelly
/**
 * Gets all items currently put on hold by a user
 *
 * Input:
 *    card_no: card number of user
 *
 * Output:
 *    checkedout_item: array of item_id
 */
app.get("/holds/:card_no", (req, res) => {
	var items_on_hold = [];
	var holds_query = `SELECT * FROM places_hold WHERE card_no='${req.params.card_no}'`;

	db.query(holds_query, function (err, result) {
		if (err) {
			console.log(err);
		} else {
			for (let i = 0; i < result.length; i++) {
				items_on_hold.push(parseInt(result[i]["item_id"]));
			}
		}
		if (!items_on_hold.length) {
			res.status(200);
			res.send({
				message: "User has no items put on hold",
			});
		} else {
			res.status(200);
			res.send({ items_on_hold });
		}
	});
});

//these next 2 endpoints will be TBD. Need to figure out the proper database implementation.
//eric
app.put("/returnItems", (req, res) => {
	//remove item from the user record
	//increment the count for returned item
	/**
	 * ENDPOINT URL: localhost:5001/returnItems
	 *
	 * Method: put
	 *
	 * Description: The library user is able to return an item back to the branch. The item will be removed from the
	 * users record, and the available quantity for that item will be incremented.
	 *
	 * Input: card_no, item_id, item_barcode
	 *
	 * Output: item_quantity++, item_availability = true (if only 1 copy)
	 */
});

//eric
//this endpoint may be removed and merged into signout items/place holds/ return items; seems redundant
app.put("/updateItemQuantityForBranch", (req, res) => {
	//condition to check if preferred branch has items available, else update for different branch with item
	/**
	 * ENDPOINT URL: localhost:5001/updateItemQuantityForBranch
	 *
	 * Method: put
	 *
	 * Description: Depending on the task, if user returns an item, increment the item_quantity. If user signs out
	 * an item, decrement the item quantity.
	 *
	 * Input: card_no, item_id, item_barcode
	 *
	 * Output: item_quantity (increment or decrement), item_availability (true or false depending on quantity remaining)
	 */
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
					res.send({ event_to_register });
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
 * card_no: card number of the user
 *
 * Output:
 * array containing the event_id(s) that the user is registered for
 */
app.get("/getUserRegisteredEvents", (req, res) => {
	//add to the registers table.
	var registered_events = [];
	var event_query = `SELECT * FROM registers WHERE card_no='${req.body.card_no}'`;
	db.query(event_query, function (err, result) {
		if (err) {
			console.log(err);
		} else {
			for (let i = 0; i < result.length; i++) {
				registered_events.push(parseInt(result[i]["event_id"]));
			}
			res.send({ registered_events });
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
			var event_to_add = {
				//event to add to object
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
app.post("/addItem", (req, res) => {
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
			var item_to_add = {
				//item to add object
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
						res.send({ item_to_add });
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
						res.send({ item_to_add });
					}
				});
			}
		}
	});
}); //added this

//himika (searching)
app.get("/searchTitle", (req, res) => {});

//tbd
app.get("/searchAuthor", (req, res) => {});

app.get("/searchDirector", (req, res) => {});

app.get("/searchActor", (req, res) => {});

//kelly
/**
 * Fetches basic info such as card_no, email, first and last name of
 * library customers (users that are not librarian)
 *
 * Inputs:
 *    none
 *
 * Output:
 *    customers: 2D array of library customers
 */
app.get("/users", (req, res) => {
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
//information on who has checked out a particular item
/**
 * Gets user(s) who has item checked out
 *
 * Input:
 *    itemId: item_id of item checked out a particular item
 *
 * Output:
 *    users:
 * 			card_no of user,
 * 			barcode of item signed out,
 * 			return date of item
 */
app.get("/itemRecord/:itemId", (req, res) => {
	var users = [];
	var signedout_query = `SELECT * from signed_out WHERE item_id = ${req.params.itemId})`;

	db.query(signedout_query, function (err, result) {
		if (err) {
			console.log(err);
		} else {
			for (let i = 0; i < result.length; i++) {
				var card_no = result[i].card_no;
				var item_barcode = result[i].item_barcode;
				var return_date = result[i].return_date;

				users = { card_no, item_barcode, return_date };
			}
		}
		if (!users.length) {
			res.status(200);
			res.send({
				message: "Item not signed out by any user",
			});
		} else {
			res.status(200);
			res.send(users);
		}
	});
});

//Kelly
/**
 * Gets all items in database
 *
 * Inputs:
 *    none
 *
 * Output:
 *    all_items: array of json object of library items
 */
app.get("/items", (_, res) => {
	var all_items = {};
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

				// Take day of week out of date string
				release_date = release_date.split(" ").slice(1).join(" ");

				all_items[item_id] = {
					item_name,
					release_date,
					item_desc,
					item_availability,
				};
			}
		}
		res.status(200);
		res.send(all_items);
	});
});

// Start the server on port 5000
app.listen(PORT_NUM, () => {
	console.log("Node server running on port " + PORT_NUM);
});
