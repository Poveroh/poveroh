
FROM nginx:stable-alpine

# Copy nginx configuration from repo into image
# build.context in compose is the repo root, so use the relative path
COPY infra/proxy/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
