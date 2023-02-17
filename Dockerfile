FROM node:lts-alpine3.17

WORKDIR /usr/scr/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8000
CMD [ "npm", "start" ]