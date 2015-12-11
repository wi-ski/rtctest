var path = require("path");
var express = require("express");
var fs = require("fs");
var exp = express();
var app = require('http').Server(exp);

exp.use(express.static('client/'));
require('reliable-signaler')(app);

app.listen(8080);

