# COGS Phillips Hue Plugin
This is a plugin to allow [COGS](https://cogs.show/) to interact with lights and smart plugs from the [Phillips Hue](https://www.philips-hue.com/en-gb) brand.

> [!IMPORTANT]
> In order to use this plugin, you must have a [Hue Bridge](https://www.philips-hue.com/en-gb/p/hue-bridge/8719514342583) (either regular or pro). You cannot use this plugin with only lightbulbs or smart plugs.
## Quick-start
1. If you haven't already, set up your Hue bridge with the Hue app
2. In the app, go to `Settings > Hue Bridges > {Your Bridge Name}` and note down the `IP address`. This should be four numbers separated by dots e.g. "5.6.7.8".
3. Download the plugin [here](https://example.org) and unzip the folder into the `plugins` folder in your COGS project
4. Open the project in COGS and enable the Hue Control in the Plugins menu
5. Go to the new Hue Control section in the left panel and input the IP address you found earlier
6. Follow the instructions in the plugin window to pair COGS with your bridge
7. You are all set up! Experiment with the new "Hue Control" actions or keep reading to learn more.
# Interacting with Hue
When you set up your Hue lights, you will likely be told by Hue to put them in rooms. COGS does not care how you set this up, so just make sure it makes sense to you! COGS only cares about *zones*. Zones are a more flexible version of rooms, so we chose to make this plugin interact only with zones. 

Create a Zone for every group of lights you want to control and create a scene in that zone for every state you might want your lights to be in. You can then use the "Set Zone To Scene" action with the name of the desired scene to activate it. If you want to turn all lights in a zone off, you can use the "Set Zone Off" action with the name of the zone.

If you have smart plugs, it may be annoying to need a zone for every single one and a scene to turn each one on. For this, we recommend the "Set Device On/Off" action.

> [!WARNING]
> We do not recommend mixing the "Set Device On/Off" action and the zone/scene system. For lights, try to use scenes and zones. For plugs, use the individual device actions.

## Duration
By default, all transitions take place over 0.4 seconds to give a smooth change. If you want to make transitions happen faster or slower, simply add ":{duration}" to the end of the name of the scene/zone/device you are controlling. E.g. you could do a "Set Zone To Scene" action with "green-lights:1.3" to make the transition take 1.3 seconds.
# Example
Here's an example of how you might set up your spaceship to light it up with COGS! 
Zones:
- Rocket boosters (3 colour bulbs)
- Fuel gauge (LED Strip)
- Cabin lights (5 white spotlights)
- Front cabin lights (2 of the lights from the "Cabin lights" zone)
- Rear cabin lights (the other 3 lights from the "Cabin lights" zone)
- Smoke machine (Smart plug)

For the rocket boosters, you could have 2 scenes:
- Ignition (Dark orange)
- Blazing (Bright red)

You could trigger these from COGS using the "Set Zone To Scene" action, then once the rocket booster has been jettisoned, you want to turn off the bulbs! That's what the "Set Zone Off" action is for.

> [!INFO]
> You can't create a scene with every bulb in the zone off - that's why you need to use the "Set Zone Off" action!

For the fuel gauge, you could create scenes in the Hue app which have a gradient on the LED Strip to make the gauge show a slowly dropping amount of fuel, with a gradient from green at the top to red at the bottom.

For the cabin lights, you could turn all of them on or off using scenes in the "Cabin lights" zone, or control the front and the back independently using their respective zones. Remember though, if you set a scene on the "Cabin lights" zone, it will overwrite the colour of the bulbs set in the other scenes. You could use the optional [[#Duration]] parameter as described above to make the Cabin lights fade out slowly. Or even make the cabin lights shut off instantly, with a transition time of 0 seconds!

For the smoke machine, you could use the "Set Device On/Off" actions to turn it on when things go pear-shaped!