const { WebSocketServer } = require("ws");
const http = require("http");
let activeConnections = 0;
const PORT=process.env.PORT || 8080
//create http sserver
const users = {};
const allowedOrigins = [
  'https://cupid-messenger.vercel.app',
  'http://localhost:3000'  // for local development
];

const server = http.createServer((req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight requests
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  console.log(new Date() + "Received request for" + req.url);
  res.end("hi there");
});

//create websocket instance
const wss = new WebSocketServer({ 
  server,
  verifyClient: ({ origin }, callback) => {
    if (allowedOrigins.includes(origin)) {
      callback(true);
    } else {
      callback(false, 403, 'Origin not allowed');
    }
  }
});
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
            message,
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
  socket.on("close", function close() {
    console.log("User disconnected", --activeConnections);
  });

  console.log("User connected", ++activeConnections);
});

server.listen(PORT, function () {
  console.log(new Date() + `Server is listening on port ${PORT}`);
});
