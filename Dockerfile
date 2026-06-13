FROM node:20-alpine

WORKDIR /app

COPY outputs ./outputs
COPY work ./work

ENV HOST=0.0.0.0
ENV PORT=5173

EXPOSE 5173

CMD ["node", "work/static-server.js"]
