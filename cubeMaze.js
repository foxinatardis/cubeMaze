/*jshint esversion:6*/

// Example usage:
//		var maze = buildMap(5); '5' here is the dimensions of the cube, 5 x 5 x 5
//		maze.cube is a linked list of rooms where directions expressed as cardinal directions along with up and down are booleans indicating whether or not an exit is in that directions
//			the rooms are linked to eachother with the camelCase properties 'go' followed by a direction eg. 'goUp' would link to the room above
//		maze.mazeCoordiantes is an array of arrays, each subArray contains the [x, y, z] coordinates of a room in the maze. This array only includes rooms that are part of the maze, not the empty rooms which were not utilized by the constructor
//			this can be used to parse through and systematically and properties to the rooms, or to fill in the 'enemies' and 'contains' arrays which are inherent properties of each room
//		It can be said that removal of the 'enemies' and 'contains' arrays prior to construction will have no negative impact on the initial construciton and are only there as placeholders for my own personal use in building a self-populating text adventure

function buildMap(size) {
	var cube = buildCube(size);
	setBounds(cube);
	var sol = solCube(cube, 0, 0, 0);
	var maze = createMaze(sol, cube);
	cubeAware(cube, sol, maze);
	var full = [];

	for (let e of sol) {
		full.push(e);
	}

	for (let e of maze) {
		full.push(e);
	}

	giveDescriptions(full, cube);
	giveNames(sol, maze, cube);

	var map = {
		cube: cube,
		mazeCoordiantes: full,
	};

	return map;

	// Room definitions needed for initial construction, can be added to as neccessary
	function Room(x, y, z) {
		this.north = false;
		this.south = false;
		this.west = false;
		this.east = false;
		this.up = false;
		this.down = false;
		this.mainPath = false;
		this.contains = [];
		this.enemies = [];
	}
	// Create the cube of rooms
	function buildCube(size) {
		var cubeArray = [];
		for (var i = 0; i < size; i++) {
			cubeArray[i] = [];
			for (var j = 0; j < size; j++) {
				cubeArray[i][j] = [];
				for (var k = 0; k < size; k++) {
					cubeArray[i][j][k] = new Room(i, j, k);
				}
			}
		}
		return cubeArray;
	}
	// Set the directions leading out of the edge of the cube to be out of bounds
	function setBounds(cubeArray) {
		var edge = cubeArray.length - 1;
		var room;
		for (var i = 0; i <= edge; i++) {
			for (var j = 0; j <= edge; j++) {
				for (var k = 0; k <= edge; k++) {
					if (i === 0) {
						room = cubeArray[i][j][k];
						room.west = "OOB";
					} else if (i === edge) {
						room = cubeArray[i][j][k];
						room.east = "OOB";
					}

					if (j === 0) {
						cubeArray[i][j][k].south = "OOB";
					} else if (j === edge) {
						cubeArray[i][j][k].north = "OOB";
					}

					if (k === 0) {
						cubeArray[i][j][k].down = "OOB";
					} else if (k === edge) {
						cubeArray[i][j][k].up = "OOB";
					}
				}
			}
		}
	}
	// create the main or solution path through the maze
	function solCube(arr, startX, startY, startZ) {
		var currentX, currentY, currentZ;
		currentX = startX;
		currentY = startY;
		currentZ = startZ;
		size = arr.length - 1;
		arr[currentX][currentY][currentZ].mainPath = true;
		var mainArr = [arr[startX][startY][startZ]]; //array to store references to the rooms on the main path.
		var coordinateArr = [[startX, startY, startZ]];

		while (currentX < size && currentY < size && currentZ < size) {
			var x = currentX;
			var y = currentY;
			var z = currentZ;

			var currentRoom = arr[x][y][z];
			var nextRoom;
			var possible;
			var direction;
			var nextLoc;

			possible = availableMoves(x, y, z); //sets possible to an array of directions to rooms not already part of the main path
			if (!possible) { //check if boxed in
				unBox(mainArr);
			}
			direction = possible[Math.floor(Math.random() * possible.length)]; //pick a random possible direction
			currentRoom[direction] = true;
			nextLoc = dirToCoor(direction, x, y, z); //get coordinates for next room as an array with opposite direction
			x = nextLoc[0]; //set x, y, z equal to coordinates of next room
			y = nextLoc[1];
			z = nextLoc[2];

			nextRoom = arr[x][y][z];
			nextRoom[nextLoc[3]] = true; //sets the way back from next room to true
			nextRoom.mainPath = true;
			mainArr.push(nextRoom);
			coordinateArr.push([x,y,z]);
			enterNext();
		}

		function unBox(arr) {
			var room;
			for (var i = 0; i < 3; i++) {
				coordinateArr.pop(); //pops coordinates just to keep that array synced with solution array
				room = arr.pop();
				resetRoom();
			}
			function resetRoom() {
				for(var i in room) {
					room[i] = false;
				}
			}
		}

		function availableMoves(a, b, c) {
			var moves = [];
			if(!arr[a + 1][b][c].mainPath) {
				moves.push("east");
			}
			if(a > 0 && !arr[a - 1][b][c].mainPath) {
				moves.push("west");
			}
			if(!arr[a][b + 1][c].mainPath) {
				moves.push("north");
			}
			if(b > 0 && !arr[a][b - 1][c].mainPath) {
				moves.push("south");
			}
			if(!arr[a][b][c + 1].mainPath) {
				moves.push("up");
			}
			if(c > 0 && !arr[a][b][c - 1].mainPath) {
				moves.push("down");
			}
			if (moves.length > 0){
				return moves;
			} else {
				return false;
			}
		}


		function enterNext() { //sets current location to the next location
			currentX = x;
			currentY = y;
			currentZ = z;
		}
		mainArr[mainArr.length - 1].exit = true;
		return coordinateArr;
	}
	// Create the branches off of the solution path to fill in the remaining 85% of the cube.
	function createMaze(coArr, cubeArr) { //coArr is array of solution coordinates, cubeArr is the main cube of rooms
		var x, y, z;
		size = cubeArr.length - 1;
		var boxCount = 0;
		var fillArr = []; //holds coordinates of filler rooms
		var percent = Math.floor(Math.pow(cubeArr.length, 3) * 0.85);
		var validFill = [];

		while(fillArr.length < coArr.length * 2) { //fill loop from main path
			var rando;
			var a;
			var b;
			var c;
			var currentRoom; //assign variable to current working room
			var possible, direction;
			var tempArr;

			rando = Math.floor(Math.random() * (coArr.length - 1)); //chooses random coordinates from fullArr

			a = coArr[rando][0]; //to hold working coordinates
			b = coArr[rando][1];
			c = coArr[rando][2];
			currentRoom = cubeArr[a][b][c];

			possible = checkDoors(currentRoom); //assign array of possible directions not already open
			if (!possible) { //if no valid branches from current path continue to pick a new beginning
				continue;
			}
			direction = possible[Math.floor(Math.random() * possible.length)]; //pick a random direction
			tempArr = createPath(a, b, c, direction); //set a temporary array equl to the result of creating a new path
			if (!!tempArr) { //if successful path created
				for (var e of tempArr) {
					fillArr.push(e); //push the temp array onto the fill array
					validFill.push(e);
				}
			}
		}


		while((coArr.length + fillArr.length) < (Math.pow(cubeArr.length, 3) * 0.8)) { //fill loop from secondary paths
			let rando;
			let a;
			let b;
			let c;
			let currentRoom; //assign letiable to current working room
			let possible, direction;
			let tempArr;

			rando = Math.floor(Math.random() * (validFill.length - 1)); //chooses random coordinates from fullArr

			a = validFill[rando][0]; //to hold working coordinates
			b = validFill[rando][1];
			c = validFill[rando][2];
			currentRoom = cubeArr[a][b][c];

			possible = checkDoors(currentRoom); //assign array of possible directions not already open
			if (!possible) { //if no valid branches from current path continue to pick a new beginning
				for (var i in validFill) {
					if(validFill[i][0] === a && validFill[i][1] === b && validFill[i][2] === c) {
						validFill.splice(i, 1);
					}
				}
				continue;
			}
			direction = possible[Math.floor(Math.random() * possible.length)]; //pick a random direction
			tempArr = createPath(a, b, c, direction); //set a temporary array equl to the result of creating a new path
			if (!!tempArr) { //if successful path created
				for (let e of tempArr) {
					fillArr.push(e); //push the temp array onto the fill array
					validFill.push(e);
				}
			}
		}


		function createPath(startX, startY, startZ, dir) { //create a path from a starting point and direction
			var pathArr = [];
			var a = startX;
			var b = startY;
			var c = startZ;
			var workingRoom, nextRoom;
			var move = dir;
			var nextLoc;
			var possible;
			var pathStart = dirToCoor (dir, a, b, c);
			var branchP, branchD;

			if (pathStart[0] < 0 || pathStart[0] > size || pathStart[1] < 0 || pathStart[1] > size || pathStart[2] < 0 || pathStart[2] > size) {
				return pathArr; //if out of bounds return path array which if empty won't break
			}

			do {
				nextLoc = dirToCoor(move, a, b, c); //get array of next room coordinates and direction back from said room

				if (nextLoc[0] < 0 || nextLoc[1] < 0 || nextLoc[2] < 0) {
					return pathArr;
				}


				nextRoom = cubeArr[nextLoc[0]][nextLoc[1]][nextLoc[2]]; //set next room equal to the retirieved coordinates

				if(nextRoom.mainPath) {
					return pathArr;
				}
				workingRoom = cubeArr[a][b][c]; //set working room
				workingRoom[move] = true; //set direction to next room to true
				nextRoom[nextLoc[3]] = true; //set way back to true

				if(!nextRoom.fillPath && !nextRoom.mainPath) {
					pathArr.push([nextLoc[0], nextLoc[1], nextLoc[2]]); //push next room coordinates to pathArray
					nextRoom.fillPath = true;
				}

				a = nextLoc[0]; //set working coordinates
				b = nextLoc[1]; //to the coordinates of
				c = nextLoc[2]; //the next room

				possible = checkDoors(nextRoom); //check the doors in the next room and get an array of possible directions

				if(!possible) {
					return pathArr; //if no possible moves from the next room, return the pathArray
				} else {
					move = possible[Math.floor(Math.random() * possible.length)]; //set direction of next move to move
				}



			} while (a >= 0 && a < size && b >= 0 &&  b < size && c >= 0 &&  c < size);

			return pathArr;
		}


		function checkDoors(room) {
			var directions = [];
			if (!room.east){
				directions.push("east");
			}
			if (!room.west) {
				directions.push("west");
			}
			if (!room.north) {
				directions.push("north");
			}
			if (!room.south) {
				directions.push("south");
			}
			if (!room.up) {
				directions.push("up");
			}
			if (!room.down) {
				directions.push("down");
			}
			if (directions.length > 0) {
				return directions;
			} else {
				return false;
			}
		}

		return fillArr;
	}

	function dirToCoor(dir, a, b, c) { //takes a direction and a set of coordinates
			var coordinates;
			if (dir === "east") {
				coordinates = [a + 1, b, c, "west"];
			} else if (dir === "west") {
				coordinates = [a - 1, b, c, "east"];
			} else if (dir === "north") {
				coordinates = [a, b + 1, c, "south"];
			} else if (dir === "south") {
				coordinates = [a, b - 1, c, "north"];
			} else if (dir === "up") {
				coordinates = [a, b, c + 1, "down"];
			} else {
				coordinates = [a, b, c - 1, "up"];
			}
			return coordinates; //returns coordiates to given direction and a pointer back
	}
	// gives each room it's coordinates and those of neighboring rooms
	function cubeAware(cubeArr, solArr, mazeArr) { //function to assign rooms coordinates, directions
		var workingRoom;

		for(var e of solArr) {
			workingRoom = cubeArr[e[0]][e[1]][e[2]];
			workingRoom.x = e[0];
			workingRoom.y = e[1];
			workingRoom.z = e[2];
			setNeighbors(workingRoom, cubeArr); //give directions coordinates to adjactent room
			setDoorNum(workingRoom);
		}

		for(let e of mazeArr) {
			workingRoom = cubeArr[e[0]][e[1]][e[2]];
			workingRoom.x = e[0];
			workingRoom.y = e[1];
			workingRoom.z = e[2];
			setNeighbors(workingRoom, cubeArr); //give directions coordinates to adjactent room
			setDoorNum(workingRoom);
		}

	}
	// give each room a property 'doorCount' indicating the number of exits from that room.
	function setDoorNum(room) {
		var doorCount = 0;
		if (room.east === true) {
			doorCount++;
		}
		if (room.west === true) {
			doorCount++;
		}
		if (room.north === true) {
			doorCount++;
		}
		if (room.south === true) {
			doorCount++;
		}
		if (room.up === true) {
			doorCount++;
		}
		if (room.down === true) {
			doorCount++;
		}
		room.exitCount = doorCount;
	}
	// creates a linked list of the rooms
	function setNeighbors(room, cubeArr) { //set's goDirections to references to the neighboring room

		if (room.east === true) {
			room.goEast = cubeArr[room.x + 1][room.y][room.z];
		}
		if (room.west === true) {
			room.goWest = cubeArr[room.x - 1][room.y][room.z];
		}
		if (room.north === true) {
			room.goNorth = cubeArr[room.x][room.y + 1][room.z];
		}
		if (room.south === true) {
			room.goSouth = cubeArr[room.x][room.y - 1][room.z];
		}
		if (room.up === true) {
			room.goUp = cubeArr[room.x][room.y][room.z + 1];
		}
		if (room.down === true) {
			room.goDown = cubeArr[room.x][room.y][room.z - 1];
		}
	}

	function giveDescriptions(fullArr, cube) {
		var currentRoom;
		for(var e of fullArr) {
			var description = "There are paths to the ";
			currentRoom = cube[e[0]][e[1]][e[2]];

			describeRoom(currentRoom);
		}
	}

	// simply adds some text describing available exits.
	function describeRoom(room) {
		var dirArr = [];
		var vertArr = [];
		var rando = Math.random();
		var description = "";

		if(room.exitCount === 1) {
			room.description = "The only way out of this room is to turn back the way you came.";
			return;
		} else {
			if (room.goEast) {
				dirArr.push("east");
			}
			if (room.goWest) {
				dirArr.push("west");
			}
			if (room.goNorth) {
				dirArr.push("north");
			}
			if (room.goSouth) {
				dirArr.push("south");
			}
			if (room.goUp) {
				vertArr.push("a ladder leading up through the ceiling");
			}
			if (room.goDown) {
				vertArr.push("a trap door in the floor");
			}
		}

		if (dirArr.length === 1) {
			if (rando > 0.75) {
				description += "You see a passage heading to the " + dirArr[0] + ". ";
			} else if (rando > 0.5) {
				description += "There is a door on the " + dirArr[0] + " side of the room. ";
			} else if (rando > 0.25) {
				description += "There is a way out to the " + dirArr[0] + ". ";
			} else {
				description += "A corridor exits the room in the " + dirArr[0] + "ern direction. ";
			}
		} else if (dirArr.length === 2) {
			if (rando > 0.75) {
				description += "You see passages heading to the " + dirArr[0] + " and " + dirArr[1] + ". ";
			} else if (rando > 0.5) {
				description += "There are doors on the " + dirArr[0] + " and " + dirArr[1] + " sides of the room. ";
			} else if (rando > 0.25) {
				description += "There is a way out to the " + dirArr[0] + " and another to the " + dirArr[1] + ". ";
			} else {
				description += "A corridor exits the room in the " + dirArr[0] + "ern direction, and a doorway opens to the " + dirArr[1] + ". ";
			}
		} else if (dirArr.length === 3) {
			if (rando > 0.75) {
				description += "You see passages heading to the " + dirArr[0] + ", " + dirArr[1] + ", and " + dirArr[2] +". ";
			} else if (rando > 0.5) {
				description += "There are doors on the " + dirArr[0] + ", " + dirArr[1] + ", and " + dirArr[2] + " sides of the room. ";
			} else if (rando > 0.25) {
				description += "There is a way out to the " + dirArr[0] + " and two others leading " + dirArr[1] + " and " + dirArr[2] + ". ";
			} else {
				description += "A corridor exits the room in the " + dirArr[0] + "ern direction, a doorway opens to the " + dirArr[1] + " and a dark passage leads " + dirArr[2] + ". ";
			}
		} else if (dirArr.length === 4) {
			description += "There are doors leading in each of the four cardinal directions. ";
		}

		if (dirArr.length === 0) {
			if (vertArr.length === 1) {
				description += "There is " + vertArr[0] + ".";
			} else if (vertArr.length === 2) {
				description += "There is " + vertArr[0] + " and " + vertArr[1] + ".";
			}
		} else {
			if (vertArr.length === 1) {
				description += "There is also " + vertArr[0] + ".";
			} else if (vertArr.length === 2) {
				description += "There is also " + vertArr[0] + " and " + vertArr[1] + ".";
			}
		}

		room.description = description;

	}
	// names are initialized to indicate whether part of the solution path or a filler path
	function giveNames(sol, maze, cube) {
		for(var e of sol) {
			cube[e[0]][e[1]][e[2]].name = "Main Path";
		}

		for(let e of maze) {
			cube[e[0]][e[1]][e[2]].name = "Fill Path";
		}

	}
}
