# cubeMaze
// Example usage:
//		var maze = buildMap(5); '5' here is the dimensions of the cube, 5 x 5 x 5
//		maze.cube is a linked list of rooms where directions expressed as cardinal directions along 
//      	with up and down are booleans indicating whether or not an exit is in that directions
//			the rooms are linked to eachother with the camelCase properties 'go' followed by a direction 
//     		eg. 'goUp' would link to the room above
//		maze.mazeCoordiantes is an array of arrays, each subArray contains the [x, y, z] coordinates of a room in the maze. 
//     		This array only includes rooms that are part of the maze, not the empty rooms which were not utilized by the constructor
//			this can be used to parse through and systematically add properties to the rooms, 
//     		 or to fill in the 'enemies' and 'contains' arrays which are inherent properties of each room
//		It can be said that removal of the 'enemies' and 'contains' arrays prior to construction 
//     		 will have no negative impact on the initial construciton and are only there as placeholders 
//     		 for my own personal use in building a self-populating text adventure
