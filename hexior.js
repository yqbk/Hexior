

//-------------------Variables--------------------------------------------------

//var c = document.getElementById("myCanvas");
var ctx = new fabric.Canvas('myCanvas');

//var p = [200, 100];
//var path = new fabric.Path('M 0 0 L ' + p[0] + ' ' + p[1] + ' L 170 200 z');

//ctx.add(path);

//var ctx = c.getContext("2d");
var hex = [];

var sizeY = 25;
var size = 2 * sizeY/Math.sqrt(3);

var inLineXfinal = 20; // Liczba hexów w poziomie
var inLineYfinal = 16; // Liczba hexów w pionie

var inLineX = inLineXfinal * 2;
var inLineY = inLineYfinal - 1;

//ctx.canvas.width  = window.innerWidth;
//ctx.canvas.height = window.innerHeight;


//-------------------Map--------------------------------------------------------

for(var i = 0; i < inLineX * inLineY; i += inLineY)
{
    if(i % (2 * inLineY) == 0)
    {
        hex.push(new Hex(100 + i/inLineY * size * 1.5, 100, size, hex.length, "soil", 0, 0, []));
    }
    else
    {
        hex.push(new Hex(100 + i/inLineY * size * 1.5, 100 + sizeY, size, hex.length, "soil", 0, 0, []));
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
//alert("fdsfds");

//var lastColor;



ctx.on('mouse:over', function(e) {
	ctx.bringToFront(e.target);
    e.target.setStroke('yellow');
    ctx.renderAll();
  });
  
ctx.on('mouse:out', function(e) {
	ctx.sendToBack(e.target);
	e.target.setStroke('black');
    ctx.renderAll();
  });
  

//-------------------Hexagons---------------------------------------------------

function Hex(x,y,size,index,type,player,army,neighbours)
{
    this.x = x;
    this.y = y;
    this.index = index;
    this.size = size;
    this.type = type;
    this.player = player
    this.army = army;
    this.neighbours = neighbours;

    this.draw = function() {
        var a = this.x + this.size;
        var b = this.y;
        var result = this.rotate(a, b, -60 * Math.PI/180);
        var p = [];
		p.push(result[0]);
        p.push(result[1]);
		
        for(var i = -120; i >= -360; i -= 60) 
		{
            result = this.rotate(a, b, i * Math.PI/180);
            p.push(result[0]);
            p.push(result[1]);
            
        }
	
		var path = new fabric.Path('M ' + a + ' ' + b + ' L ' + p[0] + ' ' + p[1] + 'L ' + p[2] + ' ' + p[3] + 'L ' + p[4] + ' ' + p[5] + 'L ' + p[6] + ' ' + p[7] + 'L ' + p[8] + ' ' + p[9] + 'L ' + p[10] + ' ' + p[11] + ' z');

		//path.set({ fill: 'red', stroke: 'green', opacity: 0.5 });
		path.set({ strokeWidth: 3, stroke: 'black', selectable: false});
        switch(this.type)
        {
            case "water":
				path.set({ fill: 'blue'});
                //ctx.fillStyle = "blue";
                //ctx.fill();
                //ctx.stroke();
                //ctx.lineWidth = 3;
				ctx.add(path);
                break;
            case "soil":
				path.set({ fill: 'brown'});
                //ctx.fillStyle = "brown";
                //ctx.fill();
                //ctx.stroke();
                //ctx.lineWidth = 3;
				ctx.add(path);
                break;
            case "city":
				path.set({ fill: 'grey'});
                //ctx.fillStyle = "grey";
                //ctx.fill();
                //ctx.stroke();
                //ctx.lineWidth = 3;
                //ctx.beginPath();
				circle = new fabric.Circle({ radius: 15, fill: 'green', left: this.x - 16, top: this.y - 16, strokeWidth: 5, stroke: '#003300', selectable: false});
				ctx.add(path);
				ctx.add(circle);
                //ctx.arc(this.x, this.y, 15, 0, 2 * Math.PI, false);
                //ctx.fillStyle = 'green';
                //ctx.fill();
                //ctx.lineWidth = 5;
                //ctx.strokeStyle = '#003300';
                //ctx.stroke();
                //ctx.fillStyle = "white";
                //ctx.font = "15px Verdana";
                //ctx.fillText(index, this.x - this.size/2, this.y);
                break;
        }
		
        //Numery klocków
        //ctx.fillStyle = "white";
        //ctx.font="10px Verdana";
        //ctx.fillText(index, this.x, this.y);
	
    }

    this.rotate = function(x, y, angle)
    {
        var result = [x,y];

        result[0] = (x - this.x) * Math.cos(angle) - (y - this.y) * Math.sin(angle) + this.x;
        result[1] = (x - this.x) * Math.sin(angle) - (y - this.y) * Math.cos(angle) + this.y;

        return result;
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
	ctx.renderAll();
}

function newHex(hexagon, n)
{
    var a = [0, 1.5, 1.5, 0, -1.5, -1.5];
    var b = [-2, -1, 1, 2, 1, -1];

    return (new Hex(hexagon.x + a[n-1] * size, hexagon.y + b[n-1] * sizeY, size, hex.length, "soil", 0, 0, []));
}

function showNeighbours(n)
{
    var result = [];

    for(var i = 0; i < hex[n].neighbours.length; i++)
    {
        result.push(hex[n].neighbours[i].index);
    }
    //alert(result);
    //ctx.font="20px Verdana";
    //ctx.fillText("Hex o indexie " + n + " ma sąsiadów o indexach: " + result, 50, 950);
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
