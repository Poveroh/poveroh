
FROM nginx:stable-alpine

# Copy mkcert certificates for *.poveroh.local
COPY infra/proxy/ssl/_wildcard.poveroh.local+1.pem /etc/nginx/ssl/poveroh.local.crt
COPY infra/proxy/ssl/_wildcard.poveroh.local+1-key.pem /etc/nginx/ssl/poveroh.local.key

# Copy nginx configuration from repo into image
# build.context in compose is the repo root, so use the relative path
COPY infra/proxy/nginx.conf /etc/nginx/nginx.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
