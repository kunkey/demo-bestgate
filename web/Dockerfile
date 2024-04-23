FROM node:21-alpine AS builder
WORKDIR /app
COPY package*.json ./
COPY yarn.lock ./

RUN yarn
COPY . .
RUN yarn build

# Stage 2: Production-ready image (smaller Nginx image)
FROM nginx:1.23-alpine

RUN sed -i '/^\s*root \s*\/usr\/share\/nginx\/html;/d' /etc/nginx/conf.d/default.conf \
    && sed -i '/^\s*index \s*index.html.*;/d' /etc/nginx/conf.d/default.conf \
    && sed -i '/server_name/a\\n    root /usr/share/nginx/html;\n    index index.html;' /etc/nginx/conf.d/default.conf \
    && sed -i '/location \/ {/a\      try_files \$uri \$uri/ /index.html?\$query_string;' /etc/nginx/conf.d/default.conf

EXPOSE 80
COPY --from=builder /app/dist /usr/share/nginx/html
CMD ["nginx", "-g", "daemon off;"]
