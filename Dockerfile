FROM alpine:3.14
ENV TZ="Europe/Helsinki"
ENV PORT=3000

RUN apk update && apk upgrade && \
    apk add tzdata && \ 
    cp /usr/share/zoneinfo/$TZ /etc/localtime && \ 
    echo $TZ > /etc/timezone && \
    apk add curl nodejs npm && \
    rm -rf /var/cache/apk/*

WORKDIR /app

COPY ./ ./

RUN npm update && \
    npm install

EXPOSE 3000

CMD ["npm", "start", "--", "--p", "3000"]

#RUN rm -rf /var/cache/apk/* && apk del tzdata

#CMD ["/bin/ash"]