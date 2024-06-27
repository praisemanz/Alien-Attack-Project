#pragma once
/*----------------------------------------------------------------------------------------------------
Name: Praise Manzi
Class: Programming II
Date: April 16th, 2024
Description: This is the gameHeader.h filefor Programming II Alien Attack game
*/
/*---------------------------------------------------------------------------------------------------*/
// includes go below

#include <iostream>
#include <algorithm> 
#include <vector> 
#include <cstdlib> // for random number generator
#include <ctime>   // for time(0)
#include <thread>  // for timer that pauses game once ship hit
#include <chrono> // for timer that pauses game once ship hit
using namespace std;
// these two lines are specific to the SFML graphics library. 
#include <SFML/Graphics.hpp>b
using namespace sf;

#include "Pixie.h"
#include "AlienArmy.h"
//#include "Game.h"

// Constants for the game 
const float DISTANCE = 30.0f; // When the ship moves it moves 5 pixels at a time. 
const int WINDOW_WIDTH = 800; // window is 800 pixels wide
const int WINDOW_HEIGHT = 600;// window is 600 pixels vertically "high"
const double BACKGROUND_X_SCALE = 1.5;// x value of background scale 
const double BACKGROUND_Y_SCALE = 1.5;// y value of background scale
const float MIN_DISTANCE = 0.0;// minimum distance is 0 for everything
const int UNDEFINED_PIXIE = 0;// Default undefined pixie is 0
const int PLAYER_SHIP_PIXIE = 1;//Default player pixie is 1
const int START_X = 0; // The window begins at 0 x
const int START_Y = 0;// The window begins at 0 y
const int PLAYER_MISSILE_PIXIE = 2;//Default missile pixie is 2
const int BACKGROUND_PIXIE = 3;//Default background pixie is 3
const int PLAYER_ALIEN_PIXIE = 4; //Default alien pixie is 3
const int ALIEN_SPACING = 100; // spacing between aliens
const int NUM_OF_ALIENS = 10; // There are to be 10 aliens
const int ALIEN_MISSILE_SPEED = 60.0f; // speed of alien missiles
const int MAX_MISSILES = 2; // these are the missiles allowed on screen at a time

// Game Functions
void moveShip(Pixie& ship);// Moves the ship right and left
void moveAlien(Pixie& alien);// Moves alien leftwards