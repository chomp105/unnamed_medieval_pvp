const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const engine = require('chompengine');
const chomp = new engine.Chomp(0, 0, 2000, 2000);
let players = [];

app.use(express.static(__dirname+'/public'));
app.get('/', (req, res) => {
	res.sendFile(__dirname + '/index.html');
});

for (let i = 0; i < 10; i++) {
	chomp.circles.push(new engine.Circle(Math.random() * 2000, Math.random() * 2000, Math.floor(Math.random() * 50) + 100, 1, Math.random() * 6, 0, 'tree'));
}

io.on('connection', (socket) => {
	chomp.circles.splice(players.length, 0, new engine.Circle(Math.random() * chomp.wx2, Math.random() * chomp.wy2, 50, 0, 0, 0, (players.length % 2) ? 'knight' : 'orc'));
	players.push({id: socket.id, order: players.length});
	socket.emit('update', {circles: chomp.circles, lines: chomp.lines, wx1: chomp.wx1, wy1: chomp.wy1, wx2: chomp.wx2, wy2: chomp.wy2, players: players});
	socket.emit('start');
	let lastTime = Date.now(), step = 0, xf = 0, yf = 0;
	socket.on('action', (action) => {
		for (let i = 0; i < players.length; i++) {
			if (players[i].id == socket.id) {
				xf += ((action.kp.right * step / 2) + (-action.kp.left * step / 2)) * ((action.kp.up || action.kp.down) ? .707 : 1) / chomp.circles[players[i].order].r;
				yf += ((action.kp.down * step / 2) + (-action.kp.up * step / 2)) * ((action.kp.left || action.kp.right) ? .707 : 1) / chomp.circles[players[i].order].r;
				chomp.circles[players[i].order].x += xf;
				chomp.circles[players[i].order].y += yf;
				xf -= xf / 30;
            	yf -= yf / 30;
				chomp.circles[players[i].order].angle = action.angle;
				chomp.circles[players[i].order].animation_angle = action.animation_angle;
			}
		}
		step = Date.now() - lastTime;
        lastTime = Date.now();
	});
	socket.on('disconnect', () => {
		for (let i = 0; i < players.length; i++) {
			if (players[i].id == socket.id) {
				chomp.circles.splice(players[i].order, 1);
				for (let j = i; j < players.length; j++) {
					players[j].order--;
				}
				players.splice(i, 1);
			}
		}
	});
});

setInterval(() => {
	chomp.wallCollisions();
	chomp.checkCircleCircleCollisions();
	chomp.resolveCircleCircleCollisions();
	io.sockets.emit('update', {circles: chomp.circles, lines: chomp.lines, wx1: chomp.wx1, wy1: chomp.wy1, wx2: chomp.wx2, wy2: chomp.wy2, players: players });
}, 1000/120);

server.listen(3000, () => {
	console.log('listening on *:3000');
});