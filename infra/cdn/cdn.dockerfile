FROM nginx:alpine

COPY ./infra/cdn/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3002

CMD ["nginx", "-g", "daemon off;"]

