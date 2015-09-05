var socket = io();

paper.install(window);


window.onload = function() {

var canvas = document.getElementById('myCanvas');
paper.setup(canvas);

var tool = new Tool();


//-------------------Variables--------------------------------------------------

var hex = [];

var sizeY = 22;
var size = 2 * sizeY/Math.sqrt(3);

var inLineXfinal = 34; // Liczba hexów w poziomie
var inLineYfinal = 12; // Liczba hexów w pionie

var inLineX = inLineXfinal * 2;
var inLineY = inLineYfinal - 1;

var viewX = size;
var viewY = size; 

var inControl = true;

var maximumNumberOfMoves = 6;
var currentNumberOfMoves = 0;

var lastNode = -1;

//-------------------Map--------------------------------------------------------

for(var i = 0; i < inLineX * inLineY; i += inLineY)
{
    if(i % (2 * inLineY) == 0)
    {
        hex.push(new Hex(viewX + i/inLineY * sizeY, viewY, size, hex.length, "soil", [], []));
    }
    else
    {
        hex.push(new Hex(viewX + i/inLineY * sizeY, viewY + 1.5 * size, size, hex.length, "soil", [], []));
    }

    for(var j = 0; j < inLineY; j++)
    {
		hex.push(new Hex(hex[hex.length - 1].x, hex[hex.length - 1].y + 3 * size, size, hex.length, "soil", [], []));
    }
}

// Adding neighbours
for (var i = 0; i < hex.length; i++)
{
    hex[i].neighbour();
}

//Create map
function createMap(seasCount, maxSeaSize, citiesCount, players)
{
    //Seas
    for (var i = 0; i < seasCount; i++)
    {
        var rnd = Math.floor((Math.random() * hex.length));
        hex[rnd].sea(maxSeaSize);
    }

    //Cities
    for (var i = 0; i < citiesCount; i++)
    {
        var rnd = Math.floor((Math.random() * hex.length));

        if (hex[rnd].city())
        {
            i--;
        }
    }
}

// Creating a map
createMap(4, 12, 10, 2);

// Drawing a board
drawBoard();

//Indicator
var border = new Path.RegularPolygon(new Point(0, 0), 6, hex[0].size);
border.strokeColor = 'yellow';
border.strokeWidth = 3;

var r = Math.floor(Math.random() * 255);
var g = Math.floor(Math.random() * 255);
var b = Math.floor(Math.random() * 255);





//Example players
//hex[50].incArmySize(14);
//hex[58].incArmySize(19);

//var player1 = new Player(1, "marek", "purple");
//var player2 = new Player(2, "kuba", "pink");

//player1.take(hex[50]);
//player2.take(hex[58]);


//Dimensions
canvas.width = hex[hex.length - 1].x + size;
canvas.height = hex[hex.length - 1].y + size;

var WIDTH = screen.width;
var HEIGHT = screen.height;


//Credits
var somethingInLightenUp = false;

//Initial update
view.update();

//Creating a map

/*
var mapScale = 0.1;
var map = new Group();

for(var i = 0; i < hex.length; i++) {
	map.addChild(hex[i].path.clone());
}

map.scale(mapScale);
map.position = new Point(canvas.width * mapScale/2, canvas.height * mapScale/2);

map.onClick = function(event) {
	//alert(event.point);
	canvasMove(event.point.x - canvas.width * mapScale/2, canvas.height * mapScale/2 - event.point.y);
	map.position = new Point(canvas.width * mapScale/2, canvas.height * mapScale/2);
}
*/

//Start receiving messges from server
receiveMsg();

//w budowie
//$("#message").prop('disabled', true);
//$("#submit").prop('disabled', true);


//var back = new Path.Rectangle(new Rectangle(new Point(0, 0), new Point(canvas.width, canvas.height)));
//back.fillColor = '#e9e9ff';
//back.opacity = 0.5;

//var yourName = prompt("Your name");
var yourName = Math.floor(Math.random() * 10000);

var you = new Player(4, yourName, "rgb("+ r +", "+ g +", "+ b +")");

sendWelcome();


//$("input").prop('disabled', false);

//-------------------Client - Server-----------------------------------------

function Message(player, index, army, possesion) {
	this.player = player;
	this.index = index;
	this.army = army;
	this.possesion = possesion;
}

function Hexy(type, color, player, army) {
	this.type = type;
	this.color = color;
	this.player = player;
	this.army = army;
}

function Chat(name, color, text) {
	this.name = name;
	this.color = color;
	this.text = text;
}

function sendWelcome() {
	var hexy = [];
	for(var i = 0; i < hex.length; i++) {
		hexy.push(JSON.stringify(new Hexy(hex[i].type, hex[i].color, JSON.stringify(hex[i].player), hex[i].armyText.content)));
	}
	var msg = [JSON.stringify(you), hexy];
	socket.emit('welcome', JSON.stringify(msg));
}

function sendMsg(hex) {
	var obj = new Message(JSON.stringify(you), hex.index, hex.armyText.content, JSON.stringify(hex.player));
	var msg = JSON.stringify(obj);
	socket.emit('message', msg);
}

function sendLog(msg) {
	socket.emit('log', msg);
}

function playersFight(playerFrom, playerTo, numberFrom, numberTo, hexFrom, hexTo, result) {
	return '<li class="list-group-item">' +
			'<b style="color:' + playerFrom.color + '">' + playerFrom.name + '</b>(' + numberFrom + ') attacked ' +
			'<b style="color:' + playerTo.color + '">' + playerTo.name + '</b>(' + numberTo + ') ' +
			'<br/>Result: <b>' + result + '</b></li>'; 
}

function movesLeft() {
	return '<li class="list-group-item">' +
			'<b style="color:' + you.color + '">' + you.name + '</b>: ' + (maximumNumberOfMoves - currentNumberOfMoves) + ' moves left</li>'; 
}


$('#submit').click(function() {
	var msg = new Chat(you.name, you.color, $('#message').val());
	socket.emit('chat message', JSON.stringify(msg));
	$('#message').val('');
	return false;
	});
	
$("#chat-flip").click(function() {
	$("#chat-panel").slideToggle();
	if($("#chat-flip").html() == "Hide Chat") {
		$("#chat-flip").html('Show Chat');
	} else {
		$("#chat-flip").html('Hide Chat');
		}
	});
	
$("#logs-flip").click(function() {
	$("#logs-panel").slideToggle();
	if($("#logs-flip").html() == "Hide Logs") {
		$("#logs-flip").html('Show Logs');
	} else {
		$("#logs-flip").html('Hide Logs');
		}
	});
	

function receiveMsg() {
	socket.on('log', function(msg) {
		$('#logs-panel ul').append(msg);
		var objDiv = document.getElementById("logs-panel");
		objDiv.scrollTop = objDiv.scrollHeight;
	});
	
	socket.on('player and time', function(msg) {
		$('#logs .alert').html(msg);
	});
	
	socket.on('chat message', function(msg) {
		var obj = JSON.parse(msg);
		$('#chat-show ul').append('<li class="list-group-item">' + '<b style="color:' + obj.color + '">' + obj.name + '</b>: ' + obj.text + '</li>');
		var objDiv = document.getElementById("chat-show");
		objDiv.scrollTop = objDiv.scrollHeight;
	});


	socket.on('message', function(obj){
		var msg = JSON.parse(obj);
		var possesion = JSON.parse(msg.possesion);
		var player = JSON.parse(msg.player);
		
		if(player.name != yourName) {
			hex[msg.index].armyText.content = msg.army;
			if(possesion != 0) {
				hex[msg.index].player = new Player(possesion.id, possesion.name, possesion.color);
				hex[msg.index].drawBorders();
				}
			hex[msg.index].viewOrder();
		}
		view.update(); 
	});
	
	socket.on('change', function(msg) {
		var player = JSON.parse(msg);
		if(player.name != yourName) {
			inControl = false;
		} else {
			currentNumberOfMoves = 0;
			inControl = true;
		}
	});
	
	socket.on('shareBoard', function(obj) {
		var p = JSON.parse(JSON.parse(obj)[0]);	
		var board = JSON.parse(obj)[1];
		var b, n;
		if(p.name == yourName) {
			for(var i = 0; i < board.length; i++) {
				b = JSON.parse(board[i]);
				hex[i].type = b.type;
				hex[i].armyText.content = b.army;
				hex[i].path.fillColor = b.color;
				n = JSON.parse(b.player);
				if(n != 0) {
					hex[i].player = new Player(5, n.name, n.color);
					hex[i].drawBorders();
					hex[i].viewOrder();
				}
			}
		}
		view.update();
	});
}


//-------------------Player---------------------------------------------------

function Player(id, name, color) {
	this.id = id;
	this.name = name;
	this.color = color;
	
	this.take = function(hex) {
		hex.player = this;
		//hex.path.strokeColor = this.color;
		//hex.path.strokeScaling = false;
		//hex.path.strokeWidth = 3;
		hex.viewOrder();
	}
}

//-------------------Hexagons---------------------------------------------------

function Hex(x, y, size, index, type, neighbours, borders)
{
	this.x = x;
    this.y = y;
	this.index = index;
	this.size = size;
	this.type = type;
	this.player = 0;
    this.neighbours = neighbours;
	this.color = 0;
	this.armyFrom = 0;
	this.press = "starting point";
	this.activated = false;
	
	this.path = 0;
	this.armyText = 0;
	this.borders = 0;
	
	this.drawBorders = function() {
		if(this.player != 0) this.drawBorder();
		for(var i = 0; i < this.neighbours.length; i++) {
			if(this.neighbours[i].player != 0) this.neighbours[i].drawBorder();
			for(var j = 0; j < this.neighbours[i].neighbours.length; j++) {
				if(this.neighbours[i].neighbours[j].player != 0) this.neighbours[i].neighbours[j].drawBorder();
			}
		}
	}

	this.drawBorder = function() {
		if(this.borders != 0) this.borders.remove();
		this.borders = new Group();
		var point1 = new Point(this.x, this.y - sizeY - 2);
		var point2 = new Point(this.x, this.y - sizeY - 2);
		
		for(var i = 0; i < this.neighbours.length; i++) {
			if(this.neighbours[i].player.name != this.player.name) {
				//alert("done!");
				var tempPoint1 = point1.rotate(60 * i, new Point(this.x, this.y));
				var tempPoint2 = point2.rotate(60 * (i + 1), new Point(this.x, this.y));
				var border = new Path(tempPoint1, tempPoint2);
				border.strokeColor = this.player.color;
				border.strokeWidth = 5;
				border.strokeCap = 'round';
				this.borders.addChild(border);
			}
		}
	}
	
	
	this.viewOrder = function() {
		this.path.bringToFront();
		if(this.armyText.content > 0) this.armyText.bringToFront();
		if(this.borders != 0) this.borders.bringToFront();
		this.drawBorders();
	}
	
	this.fight = function(hexFrom, hexTo) {
		var taken = false;
		var playerFrom = [];
		var playerTo = [];
		if(hexTo.armyText.content == 0) {
			taken = true;
		} else {
			var j = parseInt(hexFrom.armyText.content);
			for(var i = 0; i < j; i++) {
				playerFrom.push(Math.floor(Math.random() * 100));
			}
			playerFrom = Math.max.apply(null, playerFrom);

			
			j = parseInt(hexTo.armyText.content);
			for(var i = 0; i < hexTo.armyText.content; i++) {
				playerTo.push(Math.floor(Math.random() * 100));
			}
			playerTo = Math.max.apply(null, playerTo);
			
			var result = "Loss";
			if(playerFrom > playerTo) {
				taken = true;
				result = "Victory!";
				}
				
			sendLog(playersFight(hexFrom.player, hexTo.player, playerFrom, playerTo, hexFrom, hexTo, result));
		}
		
		hexFrom.decArmySize(1);
		if(taken) {
			hexFrom.player.take(hexTo);
			hexTo.armyText.content = 0;
			hexTo.incArmySize(1);
		}
	}
	

	this.addEvents = function(data) {
		var self = this;
		data.onMouseEnter = function() {
			self.enterEvent();
		}

		data.onMouseLeave = function() {
			self.leaveEvent();
		}
		
		data.onClick = function() {
			self.clickEvent();
		}
	}
	
	this.incArmySize = function(x)
	{
		var tempNumber = parseInt(this.armyText.content);
		tempNumber += x;
		this.armyText.content = tempNumber;
		//this.path.insertBelow(this.armyText);
		this.viewOrder();
	}
	
	this.decArmySize = function(x)
	{
		this.armyText.content -= x;
		if(this.armyText.content <= 0) this.armyText.insertBelow(this.path);
	}
	
	this.clickEvent = function() {
		var self = this;
		
		switch(self.press) {
            case "light up":
				if(inControl) {
				    switchOffAll();
					self.path.selected = true;
					self.activated = true;
					self.press = "switch off";
					for(var i = 0; i < self.neighbours.length; i++) {
						self.neighbours[i].path.selected = true;
						self.neighbours[i].activated = true;
						self.neighbours[i].press = "add army";
						self.neighbours[i].armyFrom = self;
					}
					
					somethingInLightenUp = true;
				}
                break;
			case "switch off":
				self.path.selected = false;
				self.activated = false;
				self.press = "light up";
				for(var i = 0; i < self.neighbours.length; i++) {
					self.neighbours[i].path.selected = false;
					self.neighbours[i].activated = false;
					self.neighbours[i].press = "light up";
				}
				break;
			case "add army":
				if(self.armyFrom.armyText.content > 0) {
					if(self.player == 0 || self.player.color == self.armyFrom.player.color) {
						self.incArmySize(1);
						self.armyFrom.decArmySize(1);
						self.armyFrom.player.take(self);
					} else {
						self.fight(self.armyFrom, self);
					}
					if(lastNode != self.index) {
						currentNumberOfMoves++;
						//sendLog(movesLeft());
						}
					lastNode = self.index;
					if(currentNumberOfMoves >= maximumNumberOfMoves) {
						currentNumberOfMoves = 0;
						switchOffAll();
						inControl = false;
						socket.emit('change', true);
						lastNode = -1;
					}
				}
				sendMsg(self);
				sendMsg(self.armyFrom);
				break;
			case "starting point":
				switchOffAll();
				self.armyText.content = 30;
				you.take(self);
				sendMsg(self);
				break;
		}
	}
	
	this.enterEvent = function() {
		if(somethingInLightenUp) {
			if(!this.activated) {
				switchOffAll();
			}
		}
		this.path.selectedColor = 'yellow';
		this.path.selected = true;
	}
	
	this.leaveEvent = function() {
		if(!this.activated) this.path.selected = false;
	}
	
    this.draw = function() {
		var self = this;
		this.path = new Path.RegularPolygon(new Point(this.x, this.y), 6, this.size);
		this.path.strokeWidth = 1;
		this.path.strokeColor = 'black';
		this.addEvents(this.path);
		this.path.selectedColor = 'yellow';

		switch(this.type)
        {
            case "water":
				this.path.fillColor = '#0080FF';
				this.color = '#0080FF';
                break;
            case "soil":
				this.path.fillColor = '#468B01';
				this.color = '#468B01';
                break;
            case "city":
				this.path.fillColor = 'red';
				this.color = 'red';
                break;
        }
		
		this.armyText = new PointText({
			point: [this.x, this.y],
			content: 0,
			fillColor: 'black',
			fontFamily: 'Courier New',
			fontWeight: 'bold',
			fontSize: 20,
			justification: 'center'
		});
		
		this.armyText.insertBelow(this.path);
		this.addEvents(this.armyText);
    }

    this.sea = function(x)
    {
        if (x>0)
        {
            this.type = "water";
            var rnd = Math.floor((Math.random() * this.neighbours.length));

            for (var i = 0; i < rnd; i++)
            {
                x--;
                var k = Math.floor((Math.random() * rnd));
                hex[this.neighbours[k].index].sea(x);
            }
        }
    }

    this.city = function()
    {
        if (this.type != "water")
        {
            this.type = "city";

            return 0;
        }

      return 1;
    }

    this.neighbour = function()
    {
        var neighbours_numbers;

        if(temp(this.index) % 2 == 0)
        {
			neighbours_numbers = [inLineYfinal - 1, 2 * inLineYfinal, inLineYfinal, -inLineYfinal, -2 * inLineYfinal, -inLineYfinal - 1];
        }
        else
        {
            neighbours_numbers = [inLineYfinal, 2 * inLineYfinal, inLineYfinal + 1, -inLineYfinal + 1, -2 * inLineYfinal, -inLineYfinal];
        }

        for (var i = 0; i < neighbours_numbers.length; i++)
        {
            if ((this.index + neighbours_numbers[i]) > 0  && (this.index + neighbours_numbers[i]) < (hex.length - 1))
            {
                neighbours.push(hex[this.index + neighbours_numbers[i]]);
            }
        }
    }
}

function switchOffAll() {
	for(var i = 0; i < hex.length; i++) {
		hex[i].press = "light up";
		hex[i].activated = false;
		hex[i].path.selected = false;
	}
}

function drawBoard()
{
    for(var i = 0; i < hex.length; i++)
    {
        hex[i].draw();
    }
	view.draw();
}

function showNeighbours(n)
{
    var result = [];

    for(var i = 0; i < hex[n].neighbours.length; i++)
    {
        result.push(hex[n].neighbours[i].index);
    }
	
	var text = new PointText({
				    point: [50,900],
				    content: result,
				    fillColor: 'black',
				    fontFamily: 'Courier New',
				    fontWeight: 'bold',
				    fontSize: 15
				});
}

function temp(n)
{
    for(var i = 0; i < 2 * inLineXfinal; i++)
    {
        if (n >= i * inLineYfinal && n < i * inLineYfinal + inLineYfinal)
        {
            return i;
        }
    }
    return 0;
}
}
