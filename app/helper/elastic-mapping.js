exports.ElasticSearchUserCrud = {
  indexMapping: {
    properties: {
      email: {
        type: "text",
      },
      first_name: {
        type: "text",
      },
      last_name: {
        type: "text",
      },
      twoWayAuth: {
        type: "boolean",
      },
      forceLogout: {
        type: "boolean",
      },
      deActivated: {
        type: "boolean",
      },
    },
  },
};
