var page = require('webpage').create();
page.open('http://www.example.com/', function (status) {
	result = page.evaluate(function () {
		return {
			RTCPeerConnection: 'RTCPeerConnection' in window,
			webkitRTCPeerConnection: 'webkitRTCPeerConnection' in window
		};
	});
	console.log('Supports WebRTC `RTCPeerConnection`? ' + result.RTCPeerConnection);
	console.log('Supports WebRTC `webkitRTCPeerConnection`? ' + result.webkitRTCPeerConnection);
	phantom.exit();
})