#include "header.h"
/*----------------------------------------------------------------------------------------------------
Name: Praise Manzi
Class: Programming II
Date: April 16th, 2024
Description: This is the gameHeader.h filefor Programming II Alien Attack game
*/
/*---------------------------------------------------------------------------------------------------*/

int main()
{
	// Create the window for graphics. 
	//  The "aliens" is the text in the title bar on the window. 
	RenderWindow window(VideoMode(WINDOW_WIDTH, WINDOW_HEIGHT), "aliens!");

	// Limit the framerate to 60 frames per second
	window.setFramerateLimit(60);

	float missileX = window.getSize().x / 2.0f;// initial x position of the missile
	float missileY = window.getSize().y / 2.2f;// initial y position of the missile
	float shipX = window.getSize().x / 2.0f;// initial x position of the ship
	float shipY = window.getSize().x / 2.0f;// initial y position of the ship
	float alienX = 0;// initial x position of the missile
	float alienY = 0;// initial y position of the missile
	// Declare all pixies
	Pixie background("stars.jpg", START_X, START_Y, BACKGROUND_PIXIE);
	Pixie shipMissile("shipMissile.bmp", missileX, missileY, PLAYER_MISSILE_PIXIE);
	Pixie alienMissile("alienMissile.bmp", 0, 0, PLAYER_MISSILE_PIXIE);
	Pixie ship("ship.png", shipX, shipY, PLAYER_SHIP_PIXIE);
	Pixie alien("alien.bmp", alienX, alienY, PLAYER_ALIEN_PIXIE);
	AlienArmy aliens; 

	aliens.createArmy(alien);

	// Sets background scale, missile position
	background.setScale(BACKGROUND_X_SCALE, BACKGROUND_Y_SCALE);
	shipMissile.setPosition(ship.getX(), ship.getY());

	bool isShipMissileInFlight = false; // used to know if a missile is 'on screen'. 

	while (window.isOpen())
	{
		// check all the window's events that were triggered since the last iteration of the loop
		// For now, we just need this so we can click on the window and close it
		Event event;

		// This while loop checks to see if anything happened since last time
		// we drew the window and all its graphics. 
		while (window.pollEvent(event))
		{
			if (event.type == Event::Closed) // Did the user kill the window by pressing the "X"?
				window.close();
			else if (event.type == Event::KeyPressed) // did the user press a key on the keyboard?
			{
				if (event.key.code == Keyboard::Space && !isShipMissileInFlight)// if user presses space, shoot missile
				{

					isShipMissileInFlight = true;
					shipMissile.setPosition(ship.getX(), (ship.getY() - shipMissile.getYGlobalBounds()));

				}
			}
		}
		window.clear();
		
		// draw background first, so everything that's drawn later 
		// will appear on top of background
		background.draw(window);
			aliens.drawAliens(window);
			// check to see if aliens haven't reached the level of the ship
			if ((aliens. getFront ()).getY () < ship.getY())
			{
				aliens.moveAliens();
			}
			else
			{
				cout << "ALIENS WON!" << endl;
				window.close();
			}
			
		// draw the ship on top of background 
		ship.draw(window);
		moveShip(ship);

		if (isShipMissileInFlight)// if there was a spacekeypress, 
		{
				
				shipMissile.move(MIN_DISTANCE, -DISTANCE);// move missile in an upward direction
				aliens.shootAliens(shipMissile);// try shooting aliens
				// stop drawing missile when it has flown out of the screen
				if (shipMissile.getY() < MIN_DISTANCE)
				{
					isShipMissileInFlight = false;
				}
				// only draw missile when it is moving
				else
				{
					shipMissile.draw(window);
				}	

		}
		aliens.shootShip(alienMissile, ship, window);
		aliens. updateMissiles(window);  // Update the position of missiles
		aliens.checkCollisions(window, ship);  // Check for collisions

		window.display();
		// At this point the frame we have built is now visible on screen.
		// Now control will go back to the top of the animation loop
		// to build the next frame. Since we begin by drawing the
		// background, each frame is rebuilt from scratch.

	} // end body of animation loop

	return 0;
}

