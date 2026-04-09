module.exports =
  /**
   * @type {const}
   * @satisfies {import("@clockworkdog/cogs-client").CogsPluginManifest}
   */
  ({
    name: "Hue Control",
    description: "Basic Hue controller",
    icon: "lightbulb-on",
    version: "0.2.1",
    // TODO: Check how backwards compatible we can make this
    minCogsVersion: "5.10.0",
    config: [
      {
        name: "Bridge IP Address",
        value: {
          type: "string",
          default: "",
        },
      },
      {
        name: "Reset Behaviour",
        value: {
          type: "option",
          options: [
            "None", // No action
            "All Off", // Turns "bridge home" off
            "Default Scene", // Recalls scene "Default"
          ],
          default: "None",
        },
      },
    ],
    events: {
      toCogs: [],
      fromCogs: [
        {
          name: "Set Zone To Scene",
          value: {
            type: "string", // `{scene_name}:{transition_time_ms}` (transition optional, default uses Hue default)
          },
        },
        {
          name: "Set Zone Off",
          value: {
            type: "string", // `{zone_name}:{transition_time_ms}` (transition optional, default uses Hue default)
          },
        },
        {
          name: "Set Device Off",
          value: {
            type: "string", // `{device_name}:{transition_time_ms}` (transition optional, default uses Hue default)
          },
        },
        {
          name: "Set Device On",
          value: {
            type: "string", // `{device_name}:{transition_time_ms}` (transition optional, default uses Hue default)
          },
        },
      ],
    },
    state: [
      {
        name: "Bridge Connected",
        value: { type: "boolean", default: false },
        writableFromClient: true,
      },
    ],
    store: {
      items: {
        apiKeys: { persistValue: true },
      },
    },
    media: {},
    window: { height: 1000, width: 1000 },
  });
