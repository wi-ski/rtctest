var path = require("path");
var express = require("express");
var fs = require("fs");
var exp = express();
var app = require('http').Server(exp);

var config = {

	port:8080
}


exp.use(express.static('client/'));

require("../customModules/signalerService")(app);


console.log("Server will be listening on port %d",config.port)
app.listen(config.port);

