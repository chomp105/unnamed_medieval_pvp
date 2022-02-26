const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const engine = require('chompengine');
const chomp = new engine.Chomp(0, 0, 2000, 2000);
let orders = [];

app.use(express.static(__dirname+'/public'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

for (let i = 0; i < 10; i++) {
	chomp.circles.push(new engine.Circle(Math.random() * 2000, Math.random() * 2000, Math.floor(Math.random() * 50) + 100, 1, 0, 'tree'));
}

io.on('connection', (socket) => {
	chomp.circles.splice(orders.length, 0, new engine.Circle(Math.random() * chomp.wx2, Math.random() * chomp.wy2, 50, 0, 0, (orders.length % 2) ? 'knight' : 'orc'));
	orders.push({id: socket.id, order: orders.length});
	socket.emit('update', {circles: chomp.circles, lines: chomp.lines, wx1: chomp.wx1, wy1: chomp.wy1, wx2: chomp.wx2, wy2: chomp.wy2, orders: orders });
	socket.emit('start');
	socket.on('action', (action) => {
		for (let i = 0; i < orders.length; i++) {
			if (orders[i].id == socket.id) {
				chomp.circles[orders[i].order].x += action.x;
				chomp.circles[orders[i].order].y += action.y;
				chomp.circles[orders[i].order].angle = action.angle;
			}
		}
	});
	socket.on('disconnect', () => {
		for (let i = 0; i < orders.length; i++) {
			if (orders[i].id == socket.id) {
				chomp.circles.splice(orders[i].order, 1);
				for (let j = i; j < orders.length; j++) {
					orders[j].order--;
				}
				orders.splice(i, 1);
			}
		}
	});
});

setInterval(() => {
	chomp.wallCollisions();
	chomp.checkCircleCircleCollisions();
	chomp.resolveCircleCircleCollisions();
	chomp.circleCircleCollisions = [];
	io.sockets.emit('update', {circles: chomp.circles, lines: chomp.lines, wx1: chomp.wx1, wy1: chomp.wy1, wx2: chomp.wx2, wy2: chomp.wy2, orders: orders });
}, 1000/120);

server.listen(3000, () => {
	console.log('listening on *:3000');
});