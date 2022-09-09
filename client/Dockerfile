# builder : name of this first step
FROM node:16-alpine as builder   

WORKDIR '/app'

COPY ./package.json ./

RUN npm install

COPY ./ ./

RUN npm run build


FROM nginx 
# expose port for EBS
EXPOSE 3000 
# nginx will serve the build version
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/build /usr/share/nginx/html