// Entrypoint for the server
const http = require("http");
const express = require("express");
const app = express();
var cors = require("cors");
const mysql = require("mysql");

app.use(cors());
app.use(express.static(path.join(__dirname, "../my-app/build")));

const test = "hey this is from the server :)";

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "mysqlpassword",
  database: "library",
});

const PORT_NUM = 5001;

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../my-app/build/index.html"));
});

app.post("/addUser", (req, res) => {
  // This user needs to be populated dynamically
  const user = {
    email: "abc@123.com",
    user_password: "abc",
    card_no: 123123123,
    first_name: "Himika",
    last_name: "Dastidar",
  };

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

  db.query(sql_query, user_arr, function (err, result) {
    if (err) {
      res.send({
        code: 400,
        status: err,
      });
    } else {
      res.send({
        code: 200,
        status: ok,
      });
    }
  });
});

// app.get("/books", (req, res) => {
//   books = [];
//   db.query("SELECT * FROM library.book", function (err, result, fields) {
//     if (err) throw err;
//     for (let i = 0; i < result.length(); i++) {
//       books.push(result[i]["item_id"]);
//     }

//     console.log(books);
//   });
// });

// This is a test endpoint and can be removed after actual endpoints have been
// introduced. Testing that frontend talks to backend
app.get("/testAPI", (req, res) => {
  console.log("testAPI endpoint called");
  res.json("API is connected to frontend");
});

// Start the server on port 5000
app.listen(PORT_NUM, () => {
  console.log("Node server running on port " + PORT_NUM);
});
