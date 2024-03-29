# COGS Philips Hue plugin

DEPRECATED: Please use COGS 5 with the Zigbee plugin to use Philips Hue and other Zigbee-enabled smart home devices.

## How to use

- Download the plugin from [Releases](https://github.com/clockwork-dog/cogs-plugin-hue/releases/latest)
- Unzip into the `plugins` folder in your COGS project
- In COGS, open the project and go to `Setup` > `Settings` and enable `Hue Control`
- Click the `Hue Control` icon that appears on the left
- Set your API key and local IP address for your Philips Hue bridge

You can now use the `Hue Control: Show Scene` action in your behaviours.

## Local development in a browser

- Place this folder in the `client-content` folder in your COGS project.
- Add a "Custom" Media Master called "Hue Control dev" in COGS and select the `Custom` type
- Select `cogs-plugin-hue/build` as the content directory

```
yarn start "Hue Control dev"
```

This will connect to COGS as a simulator for the Media Master called "Hue Control dev".

## Build for your COGS project

```
yarn build
```

This folder can now be used as a plugin. Place the entire folder in the `plugins` folder of your COGS project and follow the "How to use" instructions above.
