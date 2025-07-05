module.exports = function override(config, env) {
    config.module.rules.forEach((rule) => {
      if (rule.use) {
        rule.use = rule.use.filter(
          (loader) =>
            !(typeof loader === "string" && loader.includes("source-map-loader"))
        );
      }
    });
    return config;
  };
  