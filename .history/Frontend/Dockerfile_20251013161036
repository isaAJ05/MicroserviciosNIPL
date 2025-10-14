# Dockerfile para una app React (Frontend)
FROM node:18-alpine

# Establece el directorio de trabajo
WORKDIR /app

# Copia los archivos de dependencias
COPY package.json package-lock.json ./

# Instala las dependencias
RUN npm install

# Copia el resto de los archivos de la app
COPY . .

# Expone el puerto que usa React
EXPOSE 3000

# Comando por defecto para iniciar la app
CMD ["npm", "start"]
