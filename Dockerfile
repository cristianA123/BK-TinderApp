# Etapa 1: Construcción
FROM node:18.20.3-alpine AS build

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo los archivos necesarios para la instalación de dependencias
COPY package*.json ./
COPY prisma/schema.prisma ./

# Instala las dependencias de producción y desarrollo
RUN yarn install --frozen-lockfile

# Copia el resto de los archivos
COPY . .

# Compila la aplicación
RUN npm run build

# Instala solo las dependencias de producción
RUN yarn install --production --ignore-scripts --prefer-offline --frozen-lockfile

# Etapa 2: Ejecución
FROM node:18.20.2-alpine3.18 AS runtime

# Instala tini para el manejo correcto de señales
RUN apk add --no-cache tini

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia solo los archivos necesarios desde la etapa de construcción
COPY --from=build /app/package*.json ./
COPY --from=build /app/build ./build
COPY --from=build /app/src/docs ./build/src/docs
COPY --from=build /app/node_modules ./node_modules
COPY .env .env
COPY prisma/schema.prisma .

# Edita automáticamente el archivo schema.prisma para agregar "linux-musl-arm64-openssl-3.0.x" a binaryTargets
RUN sed -i 's/binaryTargets = \["native"\]/binaryTargets = \["native", "linux-musl-arm64-openssl-3.0.x"\]/' schema.prisma

# Ejecuta el comando prisma generate para regenerar el Prisma Client con la nueva configuración
RUN npx prisma generate

# Expone el puerto en el que la aplicación se ejecutará
EXPOSE 8000

# Usa tini como el proceso principal
ENTRYPOINT ["/sbin/tini", "--"]

# Comando para ejecutar la aplicación
CMD ["npm", "run", "start"]
