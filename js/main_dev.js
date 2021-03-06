//	Copyright (c) 2019,2020 Jérôme Desquilbet <jeromede@fr.ibm.com>
//
//	Permission to use, copy, modify, and distribute this software for any
//	purpose with or without fee is hereby granted, provided that the above
//	copyright notice and this permission notice appear in all copies.
//
//	THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
//	WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
//	MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
//	ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
//	WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
//	ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
//	OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.

function trace(text) {
	document.getElementById("log").textContent = text;
}
function throttle(fun, interval) {
	let enable = false;
	return function(...args) {
		if (!enable) return;
		enable = false;
		fun.apply(this, args);
		setTimeout(function() {enable = true}, interval);
	}
}

// ---------------------------------------------------------------------------

function errorFun(err) {
	trace('*** Error: ' + err);
	client.disconnect();
	document.body.style.backgroundColor = "blue";
	trace('*** Disconnected after error');
}
function timeoutFun() {
	trace('--- About to disconnect');
	client.disconnect();
	document.body.style.backgroundColor = "lightblue";
	trace('--- Disconnected');
}
function commandFun(command, format, payload) {
	trace('%%% Device command '+command);
	switch(command) {
        case 'alert':
            document.body.style.backgroundColor = "red";
            break;
        case 'clear':
            document.body.style.backgroundColor = "white";
            break;
		default:
			document.body.style.backgroundColor = "lightblue";
            break;
    }
}
function devicemotionFun(event) {
	ax = event.accelerationIncludingGravity.x;
	ay = event.accelerationIncludingGravity.y;
	az = event.accelerationIncludingGravity.z;
	document.getElementById("x").textContent = ax.toFixed(2);;
	document.getElementById("y").textContent = ay.toFixed(2);;
	document.getElementById("z").textContent = az.toFixed(2);;
	// client.publish(evt, "json", event_as_json_string, qos);
	client.publish(
		"a",
		"json",
		'{ "x" : '+x+', "y" :'+y+', "z" : '+z+' }',
		qos
	);
}
function deviceorientationFun(event) {
	rotateDegrees = event.alpha; // rotation around z-axis
	leftToRight = event.gamma; // left to right around y-axis
	frontToBack = event.beta; // front back motion around x-axis
	document.getElementById("Alpha").textContent = rotateDegrees;
	document.getElementById("Beta").textContent = frontToBack;
	document.getElementById("Gamma").textContent = leftToRight;
	// client.publish(evt, "json", event_as_json_string, qos);
	client.publish(
		"o",
		"json",
		'{ "g" : '+frontToBack+', "b" :'+leftToRight+', "a" : '+rotateDegrees+' }',
		qos
	);
}
function connectFun() {	
    if(window.DeviceOrientationEvent) {
    window.addEventListener('deviceorientation', throttle(deviceorientationFun, throttleInterval), true);
     
   } else {
     // Le navigateur ne supporte pas l'événement deviceorientation
     trace('Pas de support de DeviceOrientationEvent');
     console.log("DeviceOrientation is not supported");
   }
   
   if(window.DeviceMotionEvent) {
     window.addEventListener('devicemotion', throttle(devicemotionFun, throttleInterval), true);
   } else {
     // Le navigateur ne supporte pas l'événement devicemotion
     trace('Pas de support de DeviceMotionEvent');
   }
}

// ---------------------------------------------------------------------------

trace('--- Hello!');
var config = {
	"org" : org_id,
	"id" : device_id,
	"domain": domain,
	"type" : device_type,
	"auth-method" : "token",
	"auth-token" : dev_auth_token
};
trace('--- About to create client');
var client = new IBMIoTF.IotfDevice(config);
trace('--- Client created');
client.log.setLevel('trace');
client.on('error', errorFun);
setTimeout(timeoutFun, disconnect_after*1000);
client.on('command', commandFun);
client.on('connect', connectFun);
trace('--- About to connect');
document.getElementById("device").textContent = device_id;
client.connect();
document.body.style.backgroundColor = "white";
trace('--- Connected');

