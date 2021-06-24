FROM node:14-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm install --only=production
RUN mkdir ./src
COPY src/*.js ./src/
CMD [ "npm", "start" ]

# docker build -t my-bolt-app .
# docker run -p 3000:3000 -e SLACK_BOT_TOKEN=${SLACK_BOT_TOKEN} -e SLACK_SIGNING_SECRET=${SLACK_SIGNING_SECRET} -it my-bolt-app
