# FROM node:8
# WORKDIR /app
# RUN apk add --no-cache graphicsmagick
# #COPY package*.json ./
# COPY . /app
# COPY .env /app/
# RUN npm install
# EXPOSE 3001
# CMD ["node", "start"]
FROM node:18
RUN apt-get update && apt-get install -y build-essential python3
RUN apt-get update && apt-get install -y graphicsmagick
WORKDIR /app
COPY . /app
COPY .env /app/
RUN npm install
EXPOSE 3001
CMD ["npm", "start"]
