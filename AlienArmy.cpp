#pragma once
/*----------------------------------------------------------------------------------------------------
Name: Praise Manzi
Class: Programming II
Date: April 16th, 2024
Description: This is the AlienArmy.cpp for Programming II Alien Attack game
*/
/*---------------------------------------------------------------------------------------------------*/

#include "header.h"

/*-------------------------------------------------------------------------------------------------------------------------------------*/

// AlienArmy  Functions
/*--------------------------------------------------------------------------------------------------------------------------------------*/
// getSize returns the number of aliens currently active in the army.
int AlienArmy::getSize()
{
    return aliens.size();
}
//----------------------------------------------------------------------------------
// @param: alien pixie
// Creates a row of alien entities spaced apart by a fixed distance.
//return none
void AlienArmy::createArmy(Pixie& alien)
{

    for (int i = 0; i < NUM_OF_ALIENS; i++)
    { // creates 10 aliens
        float x = i * ALIEN_SPACING; //  the x position of the alien separated by space
        Pixie newAlien = alien;// create a new alien
        newAlien.setPosition(x, MIN_DISTANCE); // set position of each alien
        aliens.push_back(newAlien);// add new alien to vector of aliens
    }
}
//--------------------------------------------------------------------------------------
// @param window
// Draw each alien in the aliens vector to the screen.
// return none
void AlienArmy::drawAliens(RenderWindow& window)
{
    for (auto& alien : aliens)
    {
        alien.draw(window); // draw each alien
    }
}
//------------------------------------------------------------------------------------------
//@param none
// @Returns the first alien in the vector if not empty, otherwise return default Pixie.
Pixie AlienArmy::getFront()
{
    if (!aliens.empty())
    {
        return aliens.front();
    }
    return Pixie(); // return a default Pixie if vector is empty
}
//-------------------------------------------------------------------------------------------
// @Param alien missile 
// Checks each alien for intersection with a given missile, erasing any that are hit.
// return none
void AlienArmy::shootAliens(Pixie& missile)
{
    auto i = aliens.begin();
    while (i != aliens.end() && !aliens.empty())
    {
        if (i->getGlobalBounds().intersects(missile.getGlobalBounds()))
        {
            aliens.erase(i); // remove alien hit by missile
            cout << "hit!" << endl;
        }
        else
        {
            ++i; // continue checking next alien
        }
    }
}
//--------------------------------------------------------------------------------------------------
// @param window
// @return none
// Updates position of each missile, moves them down the screen, and removes any that are hit.
void AlienArmy::updateMissiles(RenderWindow& window)
{
    for (auto i = missiles.begin(); i != missiles.end();)
    {
        i->move(MIN_DISTANCE, ALIEN_MISSILE_SPEED); // move missile down
        i->draw(window); // draw missile on screen
        if (i->getY() > WINDOW_HEIGHT)
        {
            i = missiles.erase(i); // remove missile if it goes off the bottom of the screen
        }
        else {
            ++i;
        }
    }
}
// -------------------------------------------------------------------------------------------------------------------- -
//@param game window
// @param ship pixie
//  Checks for collisions between any missile and the ship, reduce ship lives 
// if shipLives are over, the game ends and window closes
void AlienArmy::checkCollisions(RenderWindow& window, Pixie& ship)
{
    for (auto i = missiles.begin(); i != missiles.end();)
    {
        if (ship.getGlobalBounds().intersects(i->getGlobalBounds())) {
            cout << "Ship Shot" << endl;// if collision occurs, display message and pause game
            shipLives--;
            this_thread::sleep_for(chrono::seconds(2)); // pause after hit for 2 seconds
            cout << "Lives Remaining: " << shipLives << endl;
            i = missiles.erase(i); // remove hit missile
        }
        else
        {
            ++i;
        }
        if (shipLives <= 0)
        {
            cout << "Aliens Win" << endl;
            window.close(); // close window, end game
            break;
        }
    }
}
//----------------------------------------------------------------------------------------------------------
// @param alien missile
// @param ship pixie
// @param game window
// Fires missiles from a random alien if the number of missiles is less than the maximum allowed per screen.
void AlienArmy::shootShip(Pixie& missile, Pixie& ship, RenderWindow& window)
{

    if (aliens.empty())
    {
        return; // return if no aliens left
    }
    int currentMissiles = missiles.size();// checks the size of missile
    int neededMissiles = MAX_MISSILES - currentMissiles;// counts how many missiles to create 

    // create 3 or less missiles 
    for (int i = 0; i < neededMissiles; i++)
    {
        int randomAlien = rand() % aliens.size(); // choose a random alien
        Pixie newMissile = missile; // create newMissile by duplicating missile
        newMissile.setPosition(aliens[randomAlien].getX(), aliens[randomAlien].getY());// set missile location to the location of a random alien
        missiles.push_back(newMissile); // add new missile to vector
    }
}
//------------------------------------------------------------------------------------------------------------------
// @param none
// @return none
// Moves aliens across the screen and changes their direction when hitting screen boundaries.
void AlienArmy::moveAliens()
{
    float space = 50;// space between aliens
    bool boundaryHit = false;// checks for alien hitting the left or right boundary
    float alienSpeed = 5.0f; // speed of alien movement
    float alienStepDown = 40.0f; // steps down when boundary hit
    static bool directionRight = true; // initially move right

    Pixie& firstAlien = aliens.front();// first alien in the vector
    Pixie& lastAlien = aliens.back();// last alien in the vector
    // checks if moving right and if last alien (on the far right) hits boundary
    if (directionRight)
    {
        if (lastAlien.getX() + lastAlien.getXGlobalBounds() + alienSpeed >= WINDOW_WIDTH) {
            boundaryHit = true; // set boundaryhit to true
        }
    }
    // check left boundary
    else
    {
        if (firstAlien.getX() - alienSpeed <= 0)
        {
            boundaryHit = true; // if the far left alien hits wall, then set boundaryHit to true;
        }
    }
    // move all aliens in the vector
    for (Pixie& alien : aliens)
    {
        if (directionRight)
        {
            alien.move(alienSpeed, 0); // move right
        }
        else
        {
            alien.move(-alienSpeed, 0); // move left
        }
    }
    // check if boundary hit, then change direction and move aliens doen
    if (boundaryHit)
    {
        directionRight = !directionRight; // change direction
        for (int i = 0; i < aliens.size(); i++)
        {
            aliens[i].move(0, alienStepDown); // move all aliens down
            if (i > 0)
            {
                float desiredX = aliens[0].getX() + i * space;// reference the first alien
                if (aliens[i].getX() != desiredX)
                {
                    aliens[i].setPosition(desiredX, aliens[i].getY()); // reposition aliens horizontally
                }
            }
        }
    }
}
