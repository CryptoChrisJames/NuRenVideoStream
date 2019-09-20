FROM node:latest
RUN add-apt-repository ppa:mc3man/trusty-media \
    && apt-get update \
    && apt-get dist-upgrade \
    && apt-get install -y --no-install-recommends \
        ffmpeg \ 
WORKDIR /app
COPY package.json /app
RUN npm install
COPY . /app
CMD node index.js
EXPOSE 80