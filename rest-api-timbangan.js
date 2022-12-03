require("console-stamp")(console, "dd-mm-yyyy HH:MM:ss.l");
var express = require("express"),
  app = express(),
  port = process.env.PORT || 8234,
  bodyParser = require("body-parser");
const server = require("http").createServer(app);
const cors = require("cors");
require('dotenv').config()
const controllerLoader = require("./utils/controller_loader.js");

app.use(cors());
app.use(bodyParser.json({ limit: 1024 * 1024 * 20 }));
app.use(bodyParser.urlencoded({ limit: 1024 * 1024 * 20, extended: true }));

controllerLoader.loadToAppFromPath(app, require("path").join(__dirname, "controllers"));

// app.listen(port, () => console.log(`Rest API timbangan listening on port: ${port}!`));
// express.timeout = 10000;

express.timeout = 10000;
server.listen(port);
console.log(`Rest API timbangan listening on port: ${port}!`)
