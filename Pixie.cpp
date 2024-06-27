/*----------------------------------------------------------------------------------------------------
Name: Praise Manzi
Class: Programming II
Date: April 16th, 2024
Description: This is the Pixie.cpp for Programming II Alien attack game
*/
/*---------------------------------------------------------------------------------------------------*/

#include "header.h"  

int Pixie::nextPixieID = 0;
int Pixie::myID = nextPixieID++;
// Pixie constructor
// param filename, x direction, y direction, and pixie type
Pixie::Pixie(const string& filename, float x, float y, int type)
{
	setTextureSourceFile(filename);
	pixieType = type;
	mySprite.setPosition(x, y);
}
// Function draws pixies on window
// param window
// return none
void Pixie::draw(RenderWindow& window) {
	window.draw(mySprite);
}
// Function moves pixies on window in x and Y directions
// param x direction
// param y direction
// return none
void Pixie::move(float x, float y) {
	mySprite.move(x, y);
}
// function used to set scale of the background pixie
// param x dimension
// param y dimension
// return none
void Pixie::setScale(float xScale, float yScale) {
	mySprite.setScale(xScale, yScale);
}
// Function sets pixies on window in x and Y directions
// param x coordinate
// param y coordinate
// return none
void Pixie::setPosition(float x, float y) {
	mySprite.setPosition(x, y);
}
//Function sets the type of pixie 
// param type of pixie
// return none
void Pixie::setType(int type) {
	pixieType = type;
}
// Function that sets the X position of the pixie
// param x coordinate
// return none
void Pixie::SetX(float x) {
	mySprite.setPosition(x, getY());
}
// Function that sets the Y position of the pixie
// param y coordinate 
// return none
void Pixie::setY(float y) {
	mySprite.setPosition(getX(), y);
}
// Function that sets the texture of the pixie
// param filename
// return none
void Pixie::setTextureSourceFile(string filename)
{
	if (!myTexture.loadFromFile(filename))
	{
		cout << "Unable to load texture!" << endl;
		exit(EXIT_FAILURE);
	}
	mySprite.setTexture(myTexture);
}
// Default constructor: sets every int to 0, pointer to null, myID to nextPixieID++, and pixieType to UNDEFINED_PIXIE
// param none
// return none
Pixie::Pixie()
{
	nextPixie = nullptr;
	previousPixie = nullptr;
	int pixieType = UNDEFINED_PIXIE;
	myID = nextPixieID++;
}
