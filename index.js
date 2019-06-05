
const express = require('express');
const app = require('express-ws-routes')();
const chokidar = require('chokidar');
const EventEmitter = require('events');
class ServerEvents extends EventEmitter {}
const serverEvents = new ServerEvents();

app.use(express.static('./public'));
app.post('/data',(req,res) =>{ 
	var data = [];
	req.on("data",(chunk)=>{
		data.push(chunk);
	});
	req.on("end",() => {
		const body = data.join("");
		var json = JSON.parse(body);
		res.json({});
	});
});
app.websocket('/wdata', function(info, cb, next) {
    console.log(
        'ws req from %s using origin %s',
        info.req.originalUrl || info.req.url,
        info.origin
	);
    cb(function(socket) {
		console.log(socket.data);
		socket.send('connected!');
		socket.on('message', function(msg) {
			console.log("<<",msg);
		});
		serverEvents.on("refresh",() => {
			socket.send("refresh");
		});
	});
});

chokidar.watch('./public',{
	interval: 100,
	cwd : '.',
	depth:99
})
.on('change',(path)=> {
	console.log("change",path);
	serverEvents.emit("refresh");
});

app.listen(4001,()=> console.log("server at 4001") );


