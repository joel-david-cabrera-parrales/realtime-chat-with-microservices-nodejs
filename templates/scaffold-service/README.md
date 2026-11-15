# Service template (`scaffold-service`)

Plantilla base para crear un microservicio nuevo con la misma estructura y convenciones
que el resto del proyecto (**sin seguimiento activo**: no se despliega, no entra en el
`docker-compose.yml` y no se publica en el API Gateway).

> Renombrada desde `scafold-service` (typo histórico) a `templates/scaffold-service` para
> dejar claro que es una plantilla y no un servicio vivo.

## Qué incluye

```
src/
├── health/          # health check (dominio + infraestructura), igual que en todos los servicios
├── plugins/         # axios, bcrypt, env, jwt, rate-limit, typorm, uuid
└── shared/          # server, http (api-response), middlewares (validate-token, validate-request, error-handler)
```

## Cómo usarla

1. Copia la carpeta: `cp -r templates/scaffold-service microservices/<nuevo-servicio>`
2. Renombra el campo `name` de `package.json` y el `container_name` de `docker-compose.yml`.
3. Genera su `.env`: `cp .env.example .env` y ajusta `TORM_*`.
4. Añade su servicio al `docker-compose.yml` y su ruta al `map $api_service $upstream`
   de `microservices/api-gateway/nginx.conf`.
5. Añade su base de datos en `init-scripts/01-init-databases.sh` (y su password en el `.env` raíz).
6. Crea el módulo de dominio siguiendo la estructura de
   `src/<contexto>/{domain,application,infrastructure}`.

## Convenciones que ya trae resueltas

- Express 5 con `helmet`, `cors`, `express-validator` y `rate-limit`.
- TypeORM con datasource por variables de entorno y `synchronize: true` en desarrollo.
- Envelope de respuesta uniforme (`sendSuccess` / `sendError`).
- Middleware de validación de JWT reutilizable.
- Dockerfile y `Dockerfile.dev` con hot-reload.
