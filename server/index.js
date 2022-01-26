// Entrypoint for the server

const http = require("http");
const PORT_NUM = 5000;

// Create an instance of the http server to handle HTTP requests
let app = http.createServer((req, res) => {
  // Set a response type of plain text for the response
  res.writeHead(200, { "Content-Type": "text/plain" });

  // Send back a response and end the connection
  res.end("Hello World!\n");
});

// Start the server on port 5000
app.listen(PORT_NUM, "127.0.0.1");
console.log("Node server running on port " + PORT_NUM);
