paper.install(window);

window.onload = function() {

// Get a reference to the canvas object
var canvas = document.getElementById('myCanvas');
// Create an empty project and a view for the canvas:
paper.setup(canvas);
// Create a Paper.js Path to draw a line into it:

var buttonType;

$(".fieldTypes").click(function() {
     buttonType = this.id;
    });

var raster = new Raster('map');

raster.position = new Point(300,300);
raster.scale(0.65);


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


var inLineXfinal = prompt("ile na ile"); // Liczba hexów w poziomie
var inLineYfinal = inLineXfinal/2; // Liczba hexów w pionie

var inLineX = inLineXfinal * 2;
var inLineY = inLineYfinal - 1;


//-------------------Map--------------------------------------------------------

for(var i = 0; i < inLineX * inLineY; i += inLineY)
{
    if(i % (2 * inLineY) == 0)
    {
        hex.push(new Hex(100 + i/inLineY * sizeY, 100, size, hex.length, "default", []));
    }
    else
    {
        hex.push(new Hex(100 + i/inLineY * sizeY, 100 + 1.5 * size, size, hex.length, "default", []));
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
//createMap(4, 12, 10, 2);

// Drawing a board
drawBoard();

//showNeighbours(229);

var border = new Path.RegularPolygon(new Point(0, 0), 6, hex[0].size);
border.strokeColor = 'yellow';
border.strokeWidth = 3;

/*
hex[50].incArmySize(14);
hex[58].incArmySize(19);

var player1 = new Player(1, "marek", "purple");
var player2 = new Player(2, "kuba", "pink");

player1.take(hex[50]);
player2.take(hex[58]);
*/
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

	this.clickEvent = function()
    {

        var self = this;

        self.type = buttonType;

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
                break;
            case "default":
                //this.path.fillColor = 'white';

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
			neighbours_numbers = [inLineYfinal - 1, 2 * inLineYfinal, inLineYfinal, -inLineYfinal, -2 * inLineYfinal, -inLineYfinal -1];
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
	return (new Hex(hexagon.x + a * sizeY, hexagon.y + b * 1.5 * size, size, hex.length, "default", []));
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
