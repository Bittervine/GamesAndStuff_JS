# Ignatius Rocketfrock Plan

## Basic
- Use full screen for play area.
- Use webgl for performance
- Separate the game into IngnatiusRocketfrock_SIM.js and put the thin presentation layer in IngnatiusRocketfrock_SIM.js. 
- Make a testbench that can run IngnatiusRocketfrock_SIM.js completely headless to verify everything.
- Centered on the left hand edge of the screen there will be a rocket fuel gauge
- The movement of the wizard will be based on a newtonian physics simulation
- Wizard will be able to jump vertically on his own twice his height (we will use the wizard height as a length scale now)
- Wizard will be able to run fast enough to be able to jump four times his height.
- The game will be playable via keyboard (maybe mouse) and gamepad.
   LeftArrow, GamepadLeftDPad, GamepadLeftStickLeft = Wizard runs to the left
   RightArrow, GamepadRightDPad, GamepadLeftStickRight = Wizard runs to the right
   UpArrow, GamepadRightDUp, GamepadLeftStickUp, GamepadA = Wizard Jump
   Space, GamepadB = Rocket launch

- Rocket should probably be designed as a state machine to adhere to the rules that follows

## Rocket fuel

- Fuel gauge will recharge at moderate speed up to green level (25%) when rocket isnt used. 
- There will be boosters that permanently allow it to be able to self-recharge up to 50% (yellow level)
- There will be pickups that fills the fuel by 10% up to max 100% (red level)
- Recharge is delayed for 2 second after rocket has been used.

## Rocket boosting (still attached to the wizard)
- Boosting: Releasing and re-pressing jump while wizard is already in the air will fire the rocket which will still be attached to the wizard as long as button is pressed and fuel remain. 
- Boosting: With 50% of rocket fuel available the rocket will incur enough vertical force to raise the wizard from stationary up to one half screen height.
- Boosting: Boosting is only vertical force. It will not affect the horizontal speed/momentum of the wizard. It will be a FORCE that incurs a=F/m vertical acceleration straihgt up.
- Boosting: Boosting is only vertical force. It will not affect the horizontal speed/momentum of the wizard.

## Rocket launching (flies of the wizard back)
- Launching: Rocket will always be launched straight up to clear the wizards head before transitioning in the direction discussed below.
- Launching: Pressing and holding the Rocket Launch button will slow down time allowing the rocket to be aimed by moving a target reticle. Rocket is launched when button is released.
- Launching: Clicking the Rocket Launch button will fire the rocket and it will lock onto an enemy and attempt tosteer itself towards it.
- Launching: Doubleclicking Rocket Launch button will fire the rocket and it will travel in a ballistic parabola towards the direction the wizard is heading (hitting ground level about 1/3 of a screen away)
- Launching: You may delay the launch for 0.2 second after detecting the button being pressed to have time to detect if this is a "click", "doubleclick" or a "hold"
- Launching: There will be several modes for Rocket Launch later. (Like the rocket splitting into many small independent rockets. Make sure the design will support this.)
- Launching: When a launched rocket hits something it will explode. It will use 10% of the rocket fuel initially (later upgrades may cause it to use more)


## Levels
- The levels will be both horizontal and vertically scrolling typically 20 screens wide and 10 screens high
- There will be few or no jumping puzzles. For now just create an areana where the movement of the wizard can be tested. Add a few stationary monsters for target practice
- Levels will each have a different themes and likely procedurally generated.
- Levels will start with the wizard entering from the left hand side of the screen.


# STORY #

Ignatius Rocketfrock is out resertching his travelbook. Every level will start with a mailbox where he picks up a letter from his editor that describes the level.
His thoughs will be displayed as though bubbles above the wizard.
The editors letter will show up as a scroll above the wizard.

The editor will constatnly suggest new names for the travelbook matching the new level:

Ignatius Rocketfrock and the Introductory Pit of Mild Regret  
Ignatius Rocketfrock and the Caverns of Questionable Safety
Ignatius Rocketfrock and the Bridge That Was Probably Inspected
Ignatius Rocketfrock and the Mushroom Grotto of Suspicious Bounce
Ignatius Rocketfrock and the Library of Poorly Shelved Spells
Ignatius Rocketfrock and the Windmill of Vertical Opinions
Ignatius Rocketfrock and the Mines of Acceptable Liability
Ignatius Rocketfrock and the Clocktower of Unhelpful Timing
Ignatius Rocketfrock and the Sewer of Necessary Plot Development
Ignatius Rocketfrock and the Volcano of Editorial Concern
Ignatius Rocketfrock and the Labyrinth of the Ancient McGuffin, Formerly the Caverns of Questionable Safety, Briefly the Tunnel of Reasonable Doom, Revised Edition

The editor can gradually become more unhinged or more personally invested:
"P.S. After further reflection, I have decided to retitle your account: Ignatius Rocketfrock and the Caverns of Questionable Safety. I trust this better reflects the dignity of your current predicament."
"P.P.S. I have also adjusted the subtitle again. Marketing insists that 'deathtrap' tests poorly with families."
"P.S. I am now calling this chapter Ignatius Rocketfrock and the Ravine of Perfectly Avoidable Consequences. Please try to make the title inaccurate."



