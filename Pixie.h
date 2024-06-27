#pragma once
/*----------------------------------------------------------------------------------------------------
Name: Praise Manzi
Class: Programming II
Date: April 16th, 2024
Description: This is the Pixie.h for Programming II Alien Attack game
*/
/*---------------------------------------------------------------------------------------------------*/

#include "header.h"

/*-------------------------------------------------------------------------------------------------------------------------------------*/

// Pixie class declaration
/*--------------------------------------------------------------------------------------------------------------------------------------*/
class Pixie
{
public:
	Pixie(); // Default constructor for initializing a new instance of Pixie.
	Pixie(const string& filename, float x, float y, int type);//  constructor for creating a Pixie with an image, initial position, and type.
	void draw(RenderWindow& window);// Draws the Pixie's sprite on window.
	void move(float x, float y); // Moves the Pixie's sprite in x and y directions.
	void setScale(float xScale, float yScale);  // Sets the scale of the Pixie's sprite in x and y dimensions.
	void setPosition(float x, float y); // Sets the position of the Pixie's sprite.

	// Getters 
	/*--------------------------------------------------------------------------------------------------------------------------------------*/

	float getX() const { return mySprite.getPosition().x; }  // Returns the x-coordinate of the Pixie
	float getY() const { return mySprite.getPosition().y; } // Returns the y-coordinate of the Pixie
	Vector2f getPosition() const { return mySprite.getPosition(); }  // Returns the position of the Pixie's sprite 
	Sprite getSprite() const { return mySprite; }   // Returns the Sprite object 
	Texture getTexture() const { return myTexture; } // Returns the Texture object used by this Pixie's sprite.
	int getID() const { return myID; } // Returns ID for Pixie.
	int getType() const { return pixieType; } // Returns the type of Pixie
	Pixie* getNext() const { return nextPixie; } // Returns a pointer to the next Pixie 
	Pixie* getPrevious() const { return previousPixie; }  // Returns a pointer to the previous Pixie 
	Pixie* getSelfPointer() { return this; } // Returns a pointer to this Pixie 
	float getXGlobalBounds() { return mySprite.getGlobalBounds().width; } // Returns the width of the global bounds of the sprite.
	float  getYGlobalBounds() { return mySprite.getGlobalBounds().height; } // Returns the height of the global bounds of the sprite.
	FloatRect getGlobalBounds() { return mySprite.getGlobalBounds(); } // Returns the global bounds of the sprite.

	// setters
	/*--------------------------------------------------------------------------------------------------------------------------------------*/

	void setType(int type); // Sets the type of Pixie.
	void SetX(float x); // Sets the x-coordinate of the Pixie.
	void setY(float y);  // Sets the y-coordinate of the Pixie.
	void setTextureSourceFile(string filename); // Sets the source file for the Pixie's texture.

private:
	Texture myTexture;// sets SFML texture
	Sprite mySprite;// SFML sprite object
	Pixie* nextPixie = nullptr;// points to the next pixie 
	Pixie* previousPixie = nullptr;//  points to previous pixie
	static int nextPixieID;// default 0; adds in the pixe.cpp
	static int myID;// defaults at 0
	int pixieType;// either UNDEFINED_PIXIE; PLAYER_SHIP_PIXIE; PLAYER_MISSILE_PIXIE ; BACKGROUND_PIXIE;
};

