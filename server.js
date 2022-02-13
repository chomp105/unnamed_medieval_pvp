//import { Circle, Line, CircleCircleCollision, CircleLineCollision, Chomp } from "./engine.js"

const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const engine = require('chompengine');

app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

let chomp = new engine.Chomp(0, 0, 400, 400);

let orders = [];

setInterval(() => {
	chomp.wallCollisions();
	chomp.checkCircleCircleCollisions();
	chomp.resolveCircleCircleCollisions();
	chomp.circleCircleCollisions = [];
	io.sockets.emit('update', {circles: chomp.circles, lines: chomp.lines, wx1: chomp.wx1, wy1: chomp.wy1, wx2: chomp.wx2, wy2: chomp.wy2, orders: orders });
}, 1000/120);

io.on('connection', (socket) => {
	chomp.circles.push(new engine.Circle(Math.random() * 400, Math.random() * 400, 50, "dynamic"));
	orders.push({id: socket.id, order: chomp.circles.length - 1});
	socket.emit('update', {circles: chomp.circles, lines: chomp.lines, wx1: chomp.wx1, wy1: chomp.wy1, wx2: chomp.wx2, wy2: chomp.wy2, orders: orders });
	socket.emit('start');
	socket.on('action', (action) => {
		for (let i = 0; i < orders.length; i++) {
			if (orders[i].id == action.id) {
				chomp.circles[i].x = action.x;
				chomp.circles[i].y = action.y;
			}
		}
	});
	socket.on('disconnect', () => {
		let count;
		for (let i = 0; i < orders.length; i++) {
			if (orders[i].id == socket.id) {
				count = i;
			}
		}
		console.log(socket.id + " joined!");
		for (let i = count + 1; i < orders.length; i++) {
			orders[i].order--;
		}
		orders.splice(count, 1);
		chomp.circles.splice(count, 1);
	});
});

server.listen(3000, () => {
	console.log('listening on *:3000');
});
