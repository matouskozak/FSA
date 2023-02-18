# Full Spead Ahead (FSA)
**Full Spead Ahead** is Hill Climb Racing like game. Goal of the game is to ride 
as far as possible without toppling over or running out of fuel. <br>

Semester project for NI-APH at CTU in Prague.

## Controls 
> Arrow left - **Move Forward**<br>
> Arrow right - **Move Backward**<br>

## Deployment
Game is deployed on Heroku: https://ni-aph-fsa.herokuapp.com/<br>
Reaload a few times might be necessary.

## Localhost
> Install game requirements: npm install<br>
> To run game on http://localhost:1234/: npm run start


## Class Diagram
![image info](./class_diagram.png)

Among the key classes are *Game.ts*, *Car.ts* and *Terrain.ts* which represent most of the
game play. Entire game is directed by *GameManager.ts* class which controls 
the switching of screens. Lifecycle of the game is from ECS library (**pixi-ecs**) and
physics is implemented using **matter.js** library.



