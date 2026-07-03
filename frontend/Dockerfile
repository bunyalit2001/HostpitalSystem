# Stage 1: Build
FROM node:18-alpine AS build
WORKDIR /app

ARG REACT_APP_API_URL
# ENV REACT_APP_API_URL=$REACT_APP_API_URL
ENV REACT_APP_API_URL=https://hostpitalsystem-719145195998.asia-southeast3.run.app

COPY package*.json ./
RUN npm install
COPY . .
# ต้องมั่นใจว่าใน Vite/React config มีการอ่านค่าจาก process.env

RUN npm run build

# Stage 2: Serve with Nginx
FROM nginx:alpine
# Copy build file ไปที่ nginx
COPY --from=build /app/build /usr/share/nginx/html
# Copy nginx config (สำคัญมากสำหรับ React Router)
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]