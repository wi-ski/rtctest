var fs = require('fs');

function systemLog(msg) {
	var arguments = Array.prototype.slice.call(arguments).splice(0, 1);
	var systemLogMsg = arguments + '\r\n';
	fs.appendFile('syslog.txt', systemLogMsg, function (err) {
		if (err) throw err;
	});
}

module.exports = systemLog;