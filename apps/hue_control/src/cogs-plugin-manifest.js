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
        },
      },
      {
        name: "Default Scene",
        value: {
          type: "string",
        },
      },
    ],
    events: {
      toCogs: [],
      fromCogs: [
        {
          name: "Show Scene",
          value: {
            type: "string",
          },
        },
      ],
    },
    state: [],
    store: {
      items: {
        apiKeys: { persistValue: true },
      },
    },
    media: {},
    window: { height: 500, width: 500 },
  });
