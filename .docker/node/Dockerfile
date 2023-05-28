ARG NODE_IMAGE=node:19-alpine
FROM $NODE_IMAGE

RUN npm install -g sequelize-cli
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["npm", "run", "start"]