FROM node:18

WORKDIR /app

COPY package.json ./

COPY package-lock.json ./

RUN npm ci

COPY ./localizations ./localizations

COPY ./lib ./lib

COPY index.ts ./

COPY tsconfig.json ./

COPY tsconfig.build.json ./

RUN /app/node_modules/typescript/bin/tsc -p /app/tsconfig.build.json

CMD ["node", "./dist/index.js"]