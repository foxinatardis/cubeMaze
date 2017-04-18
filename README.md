# cubeMaze
## Example usage:
  The function 'buildMap' takes a number as an argument and returns an object.
  
  var maze = buildMap(5);
  
  '5' here is the dimensions of the cube, 5 x 5 x 5
  
## The linked list of rooms
  The 'cube' property on the 'maze' object (maze.cube) is a three dimensional array of rooms where directions expressed as cardinal directions along with up and down are booleans indicating whether or not an exit is in that direction.
  Thus if you set
        
        var entrance = maze.cube[0][0][0];
        if(entrance.north) {
          there is an door leading out of the room to the north.
        }
  
The rooms are linked to eachother with the camelCase properties 'go' followed by a direction
eg. entrance.goNorth returns a reference to the room north of the entrance.
Thus we can do the following:

    var presentLocation = entrance;
    presentLocation = presentLocation.goNorth;
    presentLocation = presentLocation.goNorth;
    
And now presentLocation would be the room two rooms north of the entrance.
        
These 'go' properties can be used to work your way through the maze. Of course you can always directly access a room object by way of its coordinates within the cube

eg. maze.cube[1][3][2], where 1, 3, & 2 are the x, y, z coordinates relative to the maze entrance.
      
## Listing valid coordinates
You may wish to have more than a simple maze. Thus the constructor function also provides a list of all valid coordinates within the maze so items, foes, etc. can be added to the maze manually or via random automated process.
  
maze.mazeCoordiantes is an array of arrays where each subArray contains the [x, y, z] coordinates of a room in the maze. 
 
This array only includes rooms that are part of the maze, not the empty coordinates which were not utilized by the maze constructor.
 
By default each room has properties names 'enemies' and 'contains' which are empty arrays.
  
The removal of the 'enemies' and 'contains' arrays prior to construction will have no negative impact on the initial construciton and are only there as placeholders for my own personal use in building a self-populating text adventure.
