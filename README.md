# gitlab-cd
Continuous delivery using Gitlab integration webhooks

Simple nodejs express web app that allows continuous delivery of builds from Gitlab CI.
Receives pipeline event notifications via Gitlab webhooks, pulls the build artifact archive and deploys it.

The deployed application is assumed to be an init/systemd service.

## Configuration
The settings are in config.js file. Fill in your Gitlab integration secret token, Gitlab private token and listen port.
The URL for use in Gitlab integrations will be http://host:port/gitlab-cd
Add each integrated project to `config.projects`. The item's key must match the Gitlab project name, `serviceName` is the name of the service to stop before and start after deployment, `artifactPath` is the path within the artifact archive to be extracted to the target folder, and `path` is path to the target folder.
