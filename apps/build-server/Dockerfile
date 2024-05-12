FROM ubuntu:focal

RUN apt-get update 
RUN apt-get install -y curl 
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs
RUN apt-get install git -y
RUN npm install -g typescript

WORKDIR /home/app
COPY package*.json .
COPY kafka_ca.pem kafka_ca.pem
COPY tsconfig.json tsconfig.json
RUN npm install typescript
RUN npm install 

COPY main.sh main.sh
COPY index.ts index.ts

RUN tsc -b
RUN chmod +x main.sh
RUN chmod +x index.ts
RUN chmod +x index.js


ENTRYPOINT [ "/home/app/main.sh" ]