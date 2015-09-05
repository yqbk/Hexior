var server_port = process.env.OPENSHIFT_NODEJS_PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1'

var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var path = require('path');

var players = [];
var iterator = 0;
var hexy = [];

var roundTime = 30;
var time = roundTime;
var timer = setInterval(function() {
	if(time < 0) {
		changePlayers();
		}
	if(players.length > 0) io.emit('player and time', raportTime(players[iterator]));
	time--;
	}, 1000);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
  //res.sendFile('index.html', { root: path.join(__dirname, '/')});
  res.sendfile('hexior.html');
});

function changePlayers() {
	time = roundTime;
	iterator++;
	if(iterator > players.length - 1) iterator = 0; 
	if(players.length > 0) { 
		io.emit('change', JSON.stringify(players[iterator]));
		io.emit('log', endOfRound(players[iterator]));
		} else {
			hexy = [];
		}
}

function endOfRound(player) {
	return '<li class="list-group-item">' +
			'Time\'s up: <b style="color:' + player.color + '">' + player.name + '</b>\'s turn</li>'; 
}

function raportTime(player) {
	return '<b style="color:' + player.color + '">' + player.name + '</b>\'s turn: <b>' + time + '</b> seconds left'; 
}

function playerJoined(player, number) {
	return '<li class="list-group-item">' +
			'<b style="color:' + player.color + '">' + player.name + '</b> joined - players: <b>' + number + '</b></li>'; 
}

function userDisconnected(player, number) {
	return '<li class="list-group-item">' +
			'<b style="color:' + player.color + '">' + player.name + '</b> disconnected - players: <b>' + number + '</b></li>'; 
}

function isPlayer(player) {
	for(var i = 0; i < players.length; i++) {
		if(players[i].name == player.name) return true;
	}
	return false;
}

function Player(socketId, name, color) {
	this.socketId = socketId;
	this.name = name;
	this.color = color;
}

function Hexy(type, color, player, army) {
	this.type = type;
	this.color = color;
	this.player = player;
	this.army = army;
}

function find(id) {
	for(var i = 0; i < players.length; i++) {
		if(players[i].socketId == id) return i;
	}
	return -1;
}


io.on('connection', function(socket) {
	socket.on('welcome', function(obj) {
	
		var player = JSON.parse(obj)[0];
		var board = JSON.parse(obj)[1];
		var p = JSON.parse(player);
	  	if(!isPlayer(p)) {
	  		players.push(new Player(socket.id, p.name, p.color));
	  	}
	  	
	  	if(players.length > 0) io.emit('change', JSON.stringify(players[iterator]));
	  	
	  	var b;
	  	
	  	if(hexy.length == 0) {
	  		hexy = [];
	  		for(var i = 0; i < board.length; i++) {
	  			b = JSON.parse(board[i]);
	  			hexy.push(JSON.stringify(new Hexy(b.type, b.color, b.player, b.army)));
	  		}
	  		time = roundTime;
			//console.log("puste");
	  	} else {
	  		var msg = [JSON.stringify(p), hexy];
	  		io.emit('shareBoard', JSON.stringify(msg));
			//console.log("pelne");
	  	}
	  	
	  	
	  	var info = [p.name, players.length];
	  	
	  	
	  	io.emit('log', playerJoined(p, players.length));
	});
	
	
	
  	socket.on('message', function(obj) {
  		var msg = JSON.parse(obj);
 		
 		var tempH = JSON.parse(hexy[msg.index]);
  		tempH.army = msg.army;
  		tempH.player = msg.player;
  		hexy[msg.index] = JSON.stringify(tempH);
  		
	  	io.emit('message', obj);
  	});
  	
  	socket.on('chat message', function(msg) {
	  	io.emit('chat message', msg);
  	});
  	
  	socket.on('log', function(msg) {
	  	io.emit('log', msg);
  	});
	
	socket.on('change', function(msg) {
	  	changePlayers();
  	});
  
	socket.on('disconnect', function() {
		var k = find(socket.id);
		if(k != -1) {
			console.log("user disconnected " + socket.id);
			io.emit('log', userDisconnected(players[k], players.length - 1));
			players.splice(k, 1);
			changePlayers();
		}
	});

});

//server_port, server_ip_address,
http.listen(3000, function(){
  console.log("Listening on " + server_ip_address + ", server_port " + server_port);
});
