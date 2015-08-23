paper.install(window);

window.onload = function() {

// Get a reference to the canvas object
var canvas = document.getElementById('myCanvas');
// Create an empty project and a view for the canvas:
paper.setup(canvas);
// Create a Paper.js Path to draw a line into it:


//-------------------Real Time--------------------------------------------------
/*
setInterval(function () {time(); drawBoard();}, 1000);
function time()
{
	for (var i = 0; i < armies.length; i++)
	{
		if (armies[i].army < 15)
		{
			armies[i].incArmySize(1);
		}
	}
}
*/
//-------------------Variables--------------------------------------------------

var hex = [];
var armies = []

var sizeY = 25;
var size = 2 * sizeY/Math.sqrt(3);

var inLineXfinal = 34; // Liczba hexów w poziomie
var inLineYfinal = 9; // Liczba hexów w pionie

var inLineX = inLineXfinal * 2;
var inLineY = inLineYfinal - 1;


//-------------------Map--------------------------------------------------------

for(var i = 0; i < inLineX * inLineY; i += inLineY)
{
    if(i % (2 * inLineY) == 0)
    {
        hex.push(new Hex(100 + i/inLineY * sizeY, 100, size, hex.length, "soil", []));
    }
    else
    {
        hex.push(new Hex(100 + i/inLineY * sizeY, 100 + 1.5 * size, size, hex.length, "soil", []));
    }

    for(var j = 0; j < inLineY; j++)
    {
        hex.push(newHex(hex[hex.length - 1], 4));
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

//showNeighbours(229);

var border = new Path.RegularPolygon(new Point(0, 0), 6, hex[0].size);
border.strokeColor = 'yellow';
border.strokeWidth = 3;

hex[50].incArmySize(14);
hex[58].incArmySize(19);

var player1 = new Player(1, "marek", "purple");
var player2 = new Player(2, "kuba", "pink");

player1.take(hex[50]);
player2.take(hex[58]);

view.update();

//-------------------Player---------------------------------------------------

function Player(id, name, color) {
	this.id = id;
	this.name = name;
	this.color = color;
	
	this.take = function(hex) {
		hex.player = this;
		hex.path.fillColor = this.color;
		//hex.incArmySize(1);
		//hex.armyFrom.decArmySize(1);
	}
}

//-------------------Hexagons---------------------------------------------------

function Hex(x, y, size, index, type, neighbours)
{
    this.x = x;
    this.y = y;
    this.index = index;
    this.size = size;
    this.type = type;
    this.player = 0;
    this.army = 0;
    this.neighbours = neighbours;
	this.path = 0;
	this.color = 0;
	this.pressed = false;
	this.armyText = 0;
	this.border = 0;
	this.addArmy = false;
	this.armyFrom = 0;
	this.mark = 0;
	somethingClicked = false;
	
	this.fight = function(hexFrom, hexTo) {
		var taken = false;
		if(hexTo.army == 0) {
			taken = true;
		} else if(hexFrom.army > hexTo.army) {
			var rnd;
			if(hexFrom.army > 2 * hexTo.army) {
				rnd = Math.floor(Math.random() * 1);
			} else {
				rnd = Math.floor(Math.random() * 2);
			}
			if(rnd == 0) {
				taken = true;
				hexTo.army = 0;
			}
		} else {
			var rnd;
			if(hexTo.army == hexFrom.army) {
				rnd = Math.floor(Math.random() * 2);
			} else if(hexTo.army < 2 * hexFrom.army) {
				rnd = Math.floor(Math.random() * 5);
			} else {
				rnd = Math.floor(Math.random() * 10);
			}
			if(rnd == 0) {
				taken = true;
				hexTo.army = 0;
			}
		}
		
		hexFrom.decArmySize(1);
		if(taken) {
			hexFrom.player.take(hexTo);
			hexTo.incArmySize(1);
			if(hexTo.army > 0) {
				hexTo.path.insertBelow(hexTo.mark);
				hexTo.armyText.insertAbove(hexTo.mark);
				border.insertAbove(hexTo.armyText);
			}
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
		this.army += x;
		this.path.insertBelow(this.armyText);
		this.armyText.content = this.army;
	}
	
	this.decArmySize = function(x)
	{
		this.army -= x;
		if(this.army <= 0) this.armyText.insertBelow(this.path);
		this.armyText.content = this.army;
	}
	
	this.clickEvent = function() {
		var self = this;
		if(self.pressed == true) {
				self.pressed = false;
				self.mark.remove();
				
				for(var i = 0; i < self.neighbours.length; i++) {
					//self.neighbours[i].path.fillColor = self.neighbours[i].color;
					self.neighbours[i].mark.remove();
					self.neighbours[i].addArmy = false;
					somethingClicked = false;
				}
			} else {
				//
				
				if(self.addArmy) {
					if(self.armyFrom.army > 0 && self.army >= 0 && self.armyFrom.player != 0) {
						if(self.player == 0 || self.player == self.armyFrom.player) {
							self.incArmySize(1);
							self.armyFrom.decArmySize(1);
							if(self.army > 0) {
								self.path.insertBelow(self.mark);
								self.armyText.insertAbove(self.mark);
								border.insertAbove(self.armyText);
							}
							self.armyFrom.player.take(self);
						} else {
							self.fight(self.armyFrom, self);
						}
					}
				} else if(!somethingClicked){
					self.pressed = true;
					somethingClicked = true;
					self.color = self.path.fillColor;
					//self.path.fillColor = "#FFFF33";
					self.mark = new Path.RegularPolygon(new Point(self.x, self.y), 6, self.size);
					self.mark.fillColor = "yellow";
					self.mark.opacity = 0.5;
					self.addEvents(self.mark);
					if(self.army > 0) self.armyText.insertAbove(self.mark);
					
					for(var i = 0; i < self.neighbours.length; i++) {
						self.neighbours[i].color = self.neighbours[i].path.fillColor;
						//self.neighbours[i].path.fillColor = "#FFFF33";
						self.neighbours[i].mark = new Path.RegularPolygon(new Point(self.neighbours[i].x, self.neighbours[i].y), 6, self.neighbours[i].size);
						self.neighbours[i].mark.fillColor = "yellow";
						self.neighbours[i].mark.opacity = 0.5;
						self.neighbours[i].addEvents(self.neighbours[i].mark);
						if(self.neighbours[i].army > 0) self.neighbours[i].armyText.insertAbove(self.neighbours[i].mark);
						self.neighbours[i].addArmy = true;
						self.neighbours[i].armyFrom = self;
					}
				}
			}
	}
	
	this.enterEvent = function() {
		var self = this;
		border.position = [self.x, self.y];
		//self.border = new Path.RegularPolygon(new Point(self.x, self.y), 6, self.size);
		//self.border.strokeColor = 'yellow';
		//self.border.strokeWidth = 3;
	}
	
	this.leaveEvent = function() {
		//var self = this;
		//self.border.remove();
	}
	
	
    this.draw = function() {
		var self = this;
		
		this.path = new Path.RegularPolygon(new Point(this.x, this.y), 6, this.size);
		
		this.path.strokeWidth = 3;
		this.path.strokeColor = 'black';

		this.addEvents(this.path);

	
		switch(this.type)
        {
            case "water":
				this.path.fillColor = '#0080FF';
				this.path.strokeWidth = 3;
                break;
            case "soil":
				this.path.fillColor = '#468B01';
				this.path.strokeWidth = 3;
                break;
            case "city":
				this.path.fillColor = 'red';

				//armies.push(this);

				//var circle = new Path.Circle(new Point(this.x, this.y), this.army);
				//circle.fillColor = '#FF0000';

				/*
				circle.style = {
				    strokeColor: 'black',
				    dashArray: [4, 10],
				    strokeWidth: 4,
				    strokeCap: 'round'
				};
				*/
                break;
        }
		
		
		this.armyText = new PointText({
			point: [this.x, this.y],
			content: this.army,
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
			neighbours_numbers = [8, 18, 9, -9, -18, -10];
        }
        else
        {
            neighbours_numbers = [9, 18, 10, -8, -18, -9];
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


function drawBoard()
{
    for(var i = 0; i < hex.length; i++)
    {
        hex[i].draw();
    }
	view.draw();
}

function newHex(hexagon, n)
{
    //var a = [0, 1.5, 1.5, 0, -1.5, -1.5];
    //var b = [-2, -1, 1, 2, 1, -1];

    //return (new Hex(hexagon.x + a[n-1] * size, hexagon.y + b[n-1] * sizeY, size, hex.length, "soil", 0, 10, [], 0, 0));
	
	n = 4;
	a = 0;
	b = 2;
	return (new Hex(hexagon.x + a * sizeY, hexagon.y + b * 1.5 * size, size, hex.length, "soil", []));
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