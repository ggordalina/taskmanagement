FROM node:lts-alpine3.17

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

EXPOSE 8000
CMD [ "npm", "start" ]