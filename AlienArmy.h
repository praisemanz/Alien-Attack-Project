#pragma once
/*----------------------------------------------------------------------------------------------------
Name: Praise Manzi
Class: Programming II
Date: April 16th, 2024
Description: This is the AlienArmy.h for Programming II Alien Attack game
*/
/*---------------------------------------------------------------------------------------------------*/

#include "header.h"

class AlienArmy // manages all alien pixies---> uses vectors to manage individual aliens
{
public:
	
	int getSize();// returns size of alien army
	void createArmy(Pixie& alien);	// creates an army of aliens using vectors
	void drawAliens(RenderWindow& window);// draws aliens on the screen
	Pixie getFront();// gets the first alien of the alien army
	void shootAliens(Pixie& missile);// shoots missiles from ship to alien
	void updateMissiles(RenderWindow& window);// updates lication of alien
	void shootShip(Pixie& missile, Pixie& ship, RenderWindow& window);// shots missiles from alien to ship
	void checkCollisions(RenderWindow& window, Pixie& ship);// checks if alien missile collided with ship
	void moveAliens();// moves aliens leftwards, rightwards, and then downwards whenever at window boundary

private:
	vector<Pixie> aliens;// vector of aliens
	vector <Pixie> missiles;// vector of missiles
	int shipLives = 3;// number of lives the ship has

};