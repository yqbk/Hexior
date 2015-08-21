
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

var inLineXfinal = 20; // Liczba hexów w poziomie
var inLineYfinal = 16; // Liczba hexów w pionie

var inLineX = inLineXfinal * 2;
var inLineY = inLineYfinal - 1;


//-------------------Map--------------------------------------------------------

for(var i = 0; i < inLineX * inLineY; i += inLineY)
{
    if(i % (2 * inLineY) == 0)
    {
        hex.push(new Hex(100 + i/inLineY * size * 1.5, 100, size, hex.length, "soil", 0, 0, [], 0 ,0 ));
    }
    else
    {
        hex.push(new Hex(100 + i/inLineY * size * 1.5, 100 + sizeY, size, hex.length, "soil", 0, 0, [], 0 ,0));
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


//-------------------Hexagons---------------------------------------------------

function Hex(x,y,size,index,type,player,army,neighbours,path,color)
{
    this.x = x;
    this.y = y;
    this.index = index;
    this.size = size;
    this.type = type;
    this.player = player
    this.army = army;
    this.neighbours = neighbours;
	this.path = path;
	this.color = color;

	this.incArmySize = function(x)
	{
		this.army += x;
	}

    this.draw = function() {

		this.path = new Path.RegularPolygon(new Point(this.x, this.y), 6, this.size);

		this.path.strokeWidth = 3;
		this.path.strokeColor = 'black';

		this.path.onMouseEnter = function() {
			this.strokeColor = 'yellow';
		}

		this.path.onMouseLeave = function() {
			this.strokeColor = 'black';
		}


		switch(this.type)
        {
            case "water":
				this.path.fillColor = 'blue';
				this.path.strokeWidth = 3;
                break;
            case "soil":
				this.path.fillColor = '#996633';
				this.path.strokeWidth = 3;
                break;
            case "city":
				this.path.fillColor = 'grey';

				armies.push(this)

				var circle = new Path.Circle(new Point(this.x, this.y), this.army);
				circle.fillColor = '#FF0000';

				/*
				circle.style = {
				    strokeColor: 'black',
				    dashArray: [4, 10],
				    strokeWidth: 4,
				    strokeCap: 'round'
				};
				*/

				var text = new PointText({
				    point: [this.x, this.y],
				    content: army,
				    fillColor: 'black',
				    fontFamily: 'Courier New',
				    fontWeight: 'bold',
				    fontSize: 15
				});

                break;
        }
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
            neighbours_numbers = [-1, inLineYfinal - 1, inLineYfinal, 1, -inLineYfinal, -inLineYfinal - 1];
        }
        else
        {
            neighbours_numbers = [-1, inLineYfinal, inLineYfinal + 1, 1, -inLineYfinal + 1, -inLineYfinal];
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
    var a = [0, 1.5, 1.5, 0, -1.5, -1.5];
    var b = [-2, -1, 1, 2, 1, -1];

    return (new Hex(hexagon.x + a[n-1] * size, hexagon.y + b[n-1] * sizeY, size, hex.length, "soil", 0, 10, [], 0, 0));
}

function showNeighbours(n)
{
    var result = [];

    for(var i = 0; i < hex[n].neighbours.length; i++)
    {
        result.push(hex[n].neighbours[i].index);
    }
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
