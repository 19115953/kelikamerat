FROM node:22-alpine
ENV TZ="Europe/Helsinki"
ENV PORT=3000

RUN apk update && apk upgrade && \
    apk add --no-cache tzdata && \ 
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \ 
    echo $TZ > /etc/timezone && \
    rm -rf /var/cache/apk/*

WORKDIR /app

COPY ./ ./

RUN yarn install && \
    yarn cache clean

EXPOSE 3000

# CMD ["yarn", "start", "--", "--p", "3000"]

CMD ["yarn", "start", "--p", "3000"]



#RUN rm -rf /var/cache/apk/* && apk del tzdata

#CMD ["/bin/ash"]