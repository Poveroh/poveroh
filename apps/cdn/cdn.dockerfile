FROM nginx:alpine

COPY ./apps/cdn/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]

