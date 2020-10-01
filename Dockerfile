FROM node:13-alpine
WORKDIR /usr/build
COPY tsconfig.json package.json package-lock.json /usr/build/
RUN npm install
COPY ./src /usr/build/src/
RUN npm run build

FROM node:13-alpine
WORKDIR /usr/bot
COPY package.json package-lock.json /usr/bot/
RUN npm install --production
COPY --from=0 /usr/build/dist /usr/bot/dist

CMD [ "node", "/usr/bot/dist/index.js" ]
