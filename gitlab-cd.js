const express = require("express");
const fs = require("fs");
const download = require("download");
const execSync = require("child_process").execSync;
const zip = require("adm-zip");
const bodyParser = require("body-parser");
const Pushbullet = require("pushbullet");
const app = express();
app.use(bodyParser.json());

const config = require("./config.js");

var pusher;
if (config.pushbullet) pusher = new Pushbullet(config.pushbullet.token);

app.post("/gitlab-cd", (req, res) => {
  //validate gitlab integration token
  if (req.header("X-Gitlab-Token") !== config.tokens.integration) {
    res.sendStatus(401);
    return;
  }

  //process pipeline result
  var pipeline = req.body;
  console.log(JSON.stringify(pipeline));
  var build = pipeline.builds[0];
  var projectConfig = config.projects[pipeline.project.name];

  if (build.status !== "success" || !projectConfig) {
    return;
  }

  var artifactUrl = `https://gitlab.com/${
    pipeline.project.path_with_namespace
  }/-/jobs/${build.id}/artifacts/download?private_token=${
    config.tokens.private
  }`;

  var filename = `build${build.id}.zip`;

  //download build artifacts
  console.log("downloading build artifacts");
  download(artifactUrl, ".", { filename: filename })
    .then(() => {
      //stop service
      console.log("stopping service");
      execSync(`service ${projectConfig.serviceName} stop`);
      //deploy build
      console.log("deploying build");
      new zip(filename).extractEntryTo(
        projectConfig.artifactPath,
        projectConfig.path,
        false,
        true
      );
      //remove artifact archive
      console.log("removing archive");
      fs.unlink(filename);
      //start service
      console.log("starting service");
      execSync(`service ${projectConfig.serviceName} start`);

      if (pusher) {
        pusher.devices({}, (error, response) => {
          debugger;
          const device = response.devices.find(
            d => d.nickname === config.pushbullet.deviceName
          );
          pusher.note(
            device.iden,
            `gitlab-cd: ${pipeline.project.name}`,
            "Deployment complete"
          );
        });
      }
    })
    .catch(err => {
      console.log(error);
      res.sendStatus(204);
    });
});

app.listen(config.port);
