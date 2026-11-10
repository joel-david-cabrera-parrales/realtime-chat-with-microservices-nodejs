# Pasos para levantar microservicios en local

1. Hacer un copia del archivo `.env.example`, renombrar `.env` y configurar el valor de las variables (esto debes hacerlo con cada microservicio, por temas de secretos y credenciales de bases de datos).

2. Dentro del archivo `init-scripts/01-init-databases.sql`, configurar las claves de las bases de tus microservicios. Reemplazar el placeholder con las claves que mejor te parezcan.
3. Ejectuar `docker compose up --build -d`