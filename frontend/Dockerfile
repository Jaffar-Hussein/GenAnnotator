FROM node:lts-bullseye-slim

LABEL author="leo.jourdain@etu-upsaclay.fr"

RUN mkdir frontend

WORKDIR /frontend

COPY . /frontend

RUN npm install

RUN npm run build

CMD ["npm", "run", "start"]