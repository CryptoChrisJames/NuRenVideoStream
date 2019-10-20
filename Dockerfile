FROM node:latest
RUN apt-get -y update
RUN apt-get install -y ffmpeg
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node index.js
EXPOSE 80