FROM node:alpine

COPY deploy.sh /usr/bin/deploy
COPY . /rancher-deploy
WORKDIR /rancher-deploy

ENTRYPOINT ["deploy"]
