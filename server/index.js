// Entrypoint for the server
const http = require("http");
const express = require("express");
const app = express();
var cors = require("cors");
const mysql = require("mysql");

app.use(cors());

const db = mysql.createConnection({
  user: "root",
  host: "localhost",
  password: "YOUR_PASSWORD",
  database: "librarySystem",
});

const PORT_NUM = 5001;

//PLACE API REQUESTs here
//Create routes

// The following is an example write to a db
// app.post("/add", (req, res) => {
//   const title = req.body.title;
//   const author = req.body.title;

//   // !!!!!please note this DB does not exist yet and will not work!!!!!!
//   db.query(
//     "INSERT INTO books  (title, author) VALUES (?,?)",
//     [title, author],
//     (err, result) => {
//       if (err) {
//         console.log(err);
//       } else {
//         res.send(200, OK);
//       }
//     }
//   );
// });

// This is a test endpoint and can be removed after actual endpoints have been
// introduced. Testing that frontend talks to backend
app.use("/testAPI", (req, res) => {
  res.send("API is working correctly");
});

// Start the server on port 5000
app.listen(PORT_NUM, () => {
  console.log("Node server running on port " + PORT_NUM);
});
