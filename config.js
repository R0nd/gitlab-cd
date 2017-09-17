const config = {
  tokens: {
    integration: "", //the secret token set up in gitlab integration
    private: "" //private gitlab token used to download builds
  },
  port: 8746,
  projects: {
    example: {
      serviceName: "example", //service to stop before and start after deployment
      artifactPath: "example/bin/", //path within build archive to extract
      path: "/var/www/html/example" //deployment target path
    }
  }
};

module.exports = config;
