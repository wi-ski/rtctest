var path = require("path");
var express = require("express");
var fs = require("fs");
var exp = express();
var app = require('http').Server(exp);

require('module').Module._initPaths();
var config = {
	port: 1337
}

exp.use(express.static('client/'));
require("signalerService")(app);

console.log("Server will be listening on port %d", config.port);
app.listen(config.port);