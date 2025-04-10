FROM node:lts

WORKDIR /app

COPY package*.json .
COPY . .

RUN npm ci
RUN npm run build

ENV NODE_ENV=production
ENV PORT $PORT
EXPOSE $PORT

# CMD ["npm", "run", "dev"]
CMD ["node", "build"]