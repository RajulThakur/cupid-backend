const { WebSocketServer, WebSocket } = require("ws");
const http = require("http");
let userCount = 0;
//create http sserver
const users = {};
const server = http.createServer((req, res) => {
  console.log(new Date() + "Received request for" + req.url);
  res.end("hi there");
});

//create websocket instance
const wss = new WebSocketServer({ server });
wss.on("connection", function connection(socket) {
  socket.on("message", function message(data) {
    const { type, user, to, message, msgType, createdAt } = JSON.parse(data);
    if (type === "connection") {
      users[user] = socket;
    } else if (type === "message") {
      const receiverSocket = users[to];
      if (receiverSocket) {
        receiverSocket.send(
          JSON.stringify({
            type: "message",
            message: message,
            msgType,
            from: user,
            createdAt,
          }),
          { binary: false }
        );
      } else {
        console.log(`User ${to} not connected`);
      }
    }
  });

  console.log("User connected", ++userCount);
});

server.listen(8080, function () {
  console.log(new Date() + "Server is listening on port 8080");
});
