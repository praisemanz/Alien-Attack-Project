#include "header.h"
/*----------------------------------------------------------------------------------------------------
Name: Praise Manzi
Class: Programming II
Date: April 16th, 2024
Description: This is the shipFunctions.cpp file for Programming II Alien Attack game
*/
/*---------------------------------------------------------------------------------------------------*/
/*
*  moveShip - This function is called to handle a keyPress event.
*     Keyboard input is detected and ship is moved.
*   ** Part of the lab is to also handle firing a missile **
*  INPUT: The ship sprite is passed.  This merely a drawn object on the screen.
*  RETURN: None
*/
void moveShip(Pixie& ship)
{
	 // Leftwards movement
	if (Keyboard::isKeyPressed(Keyboard::Left))
	{
		float positionX = ship.getX();// gets X position of ship
		// Check if the ship has reached the left boundary
		if (positionX - DISTANCE >= 0)
		{
			ship.move(-DISTANCE, 0);
		}
	}
	// Rightwards movement
	else if (Keyboard::isKeyPressed(Keyboard::Right))
	{
		float positionX = ship.getX(); // gets X position of ship
		float shipWidth = ship.getXGlobalBounds();
		// check if the ship has reached the right boundary
		if (positionX + shipWidth + DISTANCE <= WINDOW_WIDTH)
		{
			ship.move(DISTANCE, 0);
		}
	}

}
/*moveAlien - This function is called to handle alien movement in x and y directions
*INPUT: The alien sprite is passed.This merely a drawn object on the screen.
* RETURN : None
* */
void moveAlien(Pixie& alien)
{
	float positionX = alien.getX(); // gets X position of alien
	float alienWidth = alien.getXGlobalBounds();
	// check if the alien has reached the right boundary
	if (positionX + alienWidth + DISTANCE <= WINDOW_WIDTH)
	{
		alien.move(DISTANCE, 0);
	}
	else if (positionX + alienWidth + DISTANCE == WINDOW_WIDTH)
	{
		alien.move(DISTANCE, 0);
	}
}
