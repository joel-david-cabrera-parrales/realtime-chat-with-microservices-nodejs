# Chat App — Microservicios

Monorepo con microservicios en **Node + TypeScript + Express 5 + TypeORM + PostgreSQL**, orchestrated con **Docker Compose** y expuestos detrás de un **API Gateway (nginx)**.

---

## Pasos para levantar microservicios en local

1. Hacer un copia del archivo `.env.example`, renombrar `.env` y configurar el valor de las variables (esto debes hacerlo con cada microservicio, por temas de secretos y credenciales de bases de datos).

2. Dentro del archivo `init-scripts/01-init-databases.sql`, configurar las claves de las bases de tus microservicios. Reemplazar el placeholder con las claves que mejor te parezcan.
3. Ejectuar `docker compose up --build -d`

---

## Topología y puertos

| Servicio | Puerto interno | Puerto host | Ruta base vía gateway |
|---|---|---|---|
| `nginx` (api-gateway) | 80 | **80** | — |
| `auth-service` | 3000 | no publicado | `http://localhost/api/auth` |
| `profile-service` | 3000 | no publicado | `http://localhost/api/profile` |
| `file-service` | 3000 | no publicado | `http://localhost/api/file` (alias `/api/files`) |
| `chat-service` | 3000 | no publicado | `http://localhost/api/chat` |
| `postgres` | 5432 | 5440 | — |
| `pgadmin` | 80 | 8088 | `http://localhost:8088` |
| `localstack` (S3) | 4566 | `${AWS_STORAGE_SERVICE_PORT}` (4566) | — |

> **Importante:** los microservicios **no publican puertos al host**. Todas las llamadas deben hacerse a través del gateway nginx en `http://localhost` (puerto 80). La regla de routing es:
>
> ```
> /api/<nombre-service>/<ruta>  ->  http://<nombre-service>-service:3000/api/<nombre-service>/<ruta>
> ```

Variables de entorno relevantes (`.env` de cada microservicio):

```
JWT_SECRET=change_me_access_secret
JWT_REFRESH_SECRET=change_me_refresh_secret
JWT_ACCESS_EXPIRES_IN=900            # 15 minutos (segundos)
JWT_REFRESH_EXPIRES_IN=604800        # 7 días (segundos)
INTERNAL_API_KEY=change_me_internal_api_key
```

---

## Convenciones comunes

### Envelope de respuesta

Éxito:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "OK",
  "data": {},
  "timestamp": "2026-11-13T10:00:00.000Z",
  "path": "/api/auth/signin"
}
```

Error:

```json
{
  "statusCode": 401,
  "success": false,
  "message": "Las credenciales son incorrectas",
  "error": "INVALID_CREDENTIALS",
  "timestamp": "2026-11-13T10:00:00.000Z",
  "path": "/api/auth/signin"
}
```

Error de **validación** (formato distinto, sin envelope):

```json
{
  "error": "Datos de entrada inválidos",
  "statusCode": 400,
  "details": [
    { "field": "username", "message": "El username debe tener entre 3 y 254 caracteres" }
  ]
}
```

### Autenticación

Dos mecanismos conviven:

1. **JWT Bearer** — header `Authorization: Bearer <accessToken>`
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   Payload del access token: `{ sessionId, credentialId, profileCode, username }`. Expira en 900 s (15 min).

2. **Internal API Key** — header `x-internal-api-key: change_me_internal_api_key`
   Solo para llamadas service-to-service. En `profile-service` y `file-service` este header **evade la validación JWT**.
   En `file-service` es obligatorio acompañarlo de `x-profile-code: <uuid>` cuando el token no trae `profileCode`.

Errores de auth:

| Situación | HTTP | `message` | `error` |
|---|---|---|---|
| Sin header `Authorization` | 401 | `Token no proporcionado` | `Unauthorized` |
| Token inválido / expirado | 401 | `Token inválido o expirado` | `Unauthorized` |

> **No existe Swagger/OpenAPI** en ninguno de los tres microservicios. No hay ruta `/api-docs`. Toda esta documentación es manual.

### Configuración en Postman

Crear una **Environment** con estas variables:

| Variable | Valor inicial | Descripción |
|---|---|---|
| `baseUrl` | `http://localhost` | Gateway nginx |
| `accessToken` | *(vacío)* | Se llena con el `accessToken` del login/signup |
| `refreshToken` | *(vacío)* | Se llena con el `refreshToken` del login/signup |
| `profileCode` | *(vacío)* | `data.profileCode` devuelto por auth o profile |
| `fileCode` | *(vacío)* | `data.fileCode` devuelto por file-service |
| `sessionId` | *(vacío)* | `data.session.id` devuelto por auth |

En cada request protegido usar el tab **Auth → Type: Bearer Token → Token: `{{accessToken}}`** (o header manual `Authorization: Bearer {{accessToken}}`).

En los tests de Postman se puede capturar el token automáticamente. Ejemplo para `POST /api/auth/signup`:

```javascript
const json = pm.response.json();
pm.environment.set("accessToken", json.data.tokens.accessToken);
pm.environment.set("refreshToken", json.data.tokens.refreshToken);
pm.environment.set("profileCode", json.data.profileCode);
```

---

# 1. AUTH SERVICE

Base: `{{baseUrl}}/api/auth`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/auth/health` | No | Health check |
| `GET` | `/api/health` | No | Health check (alias directo, **no** pasa por gateway) |
| `POST` | `/api/auth/signup` | No | Registro + login |
| `POST` | `/api/auth/signin` | No | Login |
| `POST` | `/api/auth/refresh` | No | Renovar tokens (rotación) |
| `GET` | `/api/auth/sessions` | **JWT** | Listar sesiones por `credentialId` |
| `GET` | `/api/auth/sessions/:id` | **JWT** | Obtener sesión por UUID |
| `POST` | `/api/auth/sessions/:id/revoke` | **JWT** | Revocar sesión |
| `POST` | `/api/auth/sessions/:id/activity` | **JWT** | Actualizar `lastActivityAt` |

Rutas públicas (no requieren token): `/signin`, `/signup`, `/refresh`.

---

## 1.1 `GET /api/auth/health`

Sin autenticación. Devuelve `503` con `message: "Service is degraded"` si Postgres no responde.

```bash
curl -i http://localhost/api/auth/health
```

```bash
# health check directo al contenedor (desde la red de docker)
curl -i http://127.0.0.1:3000/api/health
```

Respuesta `200`:

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Service is healthy",
  "data": {
    "status": "ok",
    "uptime": 1234.56,
    "timestamp": "2026-11-13T10:00:00.000Z",
    "database": { "connected": true }
  },
  "timestamp": "2026-11-13T10:00:00.000Z",
  "path": "/api/auth/health"
}
```

---

## 1.2 `POST /api/auth/signup`

Crea la credencial, **crea el perfil en `profile-service`**, autentica, crea la sesión y emite el par de tokens. Si algo falla después de crear el perfil, ejecuta un rollback (`DELETE` del perfil).

**Content-Type:** `application/json`

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `username` | string | **Sí** | 3–254 caracteres, patrón `^[a-zA-Z0-9._@-]+$` |
| `password` | string | **Sí** | 8–72 caracteres (bcrypt, 10 rondas) |
| `ipAddress` | string | No | Formato IP, máx. 45 chars |
| `userAgent` | string | No | Máx. 512 chars |
| `profile.fullName` | string | **Sí** | 2–120 caracteres |
| `profile.email` | string | **Sí** | Email válido, máx. 254 chars |
| `profile.phone` | string | No | Sin validación de formato en auth |
| `profile.birthDate` | string | No | ISO 8601 |
| `profile.gender` | string | No | *No se valida enum aquí* (validado en profile-service) |

```bash
curl -X POST http://localhost/api/auth/signup \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "juanperez",
    "password": "MiPass123",
    "ipAddress": "127.0.0.1",
    "userAgent": "PostmanRuntime/7.39.0",
    "profile": {
      "fullName": "Juan Perez",
      "email": "juan@example.com",
      "phone": "+5491112345678",
      "birthDate": "1990-05-20",
      "gender": "male"
    }
  }'
```

Respuesta `201` (`message: "Cuenta creada y sesión iniciada"`):

```json
{
  "statusCode": 201,
  "success": true,
  "message": "Cuenta creada y sesión iniciada",
  "data": {
    "authenticated": true,
    "credentialId": 1,
    "credentialCode": "0f1e2d3c-...",
    "profileCode": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
    "session": {
      "id": "3f6c1e3c-6c9f-4b6f-9a3a-2b7c9f5a1d20",
      "credentialId": 1,
      "profileCode": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
      "status": "active",
      "ipAddress": "127.0.0.1",
      "userAgent": "PostmanRuntime/7.39.0",
      "lastActivityAt": "2026-11-13T10:00:00.000Z",
      "expiresAt": "2026-11-14T10:00:00.000Z",
      "revokedAt": null,
      "createdAt": "2026-11-13T10:00:00.000Z",
      "updatedAt": "2026-11-13T10:00:00.000Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIs...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
      "tokenType": "Bearer",
      "expiresIn": 900
    }
  },
  "timestamp": "2026-11-13T10:00:00.000Z",
  "path": "/api/auth/signup"
}
```

Errores:

| HTTP | `error` | Causa |
|---|---|---|
| 400 | `INVALID_USERNAME` / `INVALID_PASSWORD` / `INVALID_IP_ADDRESS` / `INVALID_USER_AGENT` | Reglas de dominio |
| 400 | `Datos de entrada inválidos` + `details[]` | Validación de `express-validator` |
| 401 | `INVALID_CREDENTIALS` / `CREDENTIAL_NOT_AUTHENTICATED` | Autenticación posterior al alta |
| 404 | `CREDENTIAL_NOT_FOUND` | |
| 409 | `USERNAME_ALREADY_EXISTS` | Username duplicado |
| 500 | `Internal Server Error` | `profile-service` inalcanzable |

---

## 1.3 `POST /api/auth/signin`

**Content-Type:** `application/json`

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `username` | string | **Sí** | 3–254 chars, `^[a-zA-Z0-9._@-]+$` |
| `password` | string | **Sí** | 8–72 chars |
| `ipAddress` | string | No | IP válida |
| `userAgent` | string | No | Máx. 512 chars |

```bash
curl -X POST http://localhost/api/auth/signin \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "juanperez",
    "password": "MiPass123",
    "ipAddress": "127.0.0.1",
    "userAgent": "curl/8.4.0"
  }'
```

Respuesta `200` (`message: "Sesión iniciada"`), `data` con la misma estructura `SigninOutput` del signup (incluye `tokens`).

Errores: `401 INVALID_CREDENTIALS` (password incorrecto), `401 CREDENTIAL_NOT_AUTHENTICATED`, `404 CREDENTIAL_NOT_FOUND`, `400 INVALID_*`.

---

## 1.4 `POST /api/auth/refresh`

Rota pública. El `refreshToken` es la credencial. Valida la firma JWT, compara el hash bcrypt contra los tokens almacenados de la sesión, exige sesión `active` y **rota** el token: el anterior queda revocado.

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `refreshToken` | string | **Sí** | Mín. 1 carácter |

```bash
curl -X POST http://localhost/api/auth/refresh \
  -H 'Content-Type: application/json' \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

Respuesta `200` (`message: "Tokens refrescados"`):

```json
{
  "statusCode": 200,
  "success": true,
  "message": "Tokens refrescados",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
    "tokenType": "Bearer",
    "expiresIn": 900
  },
  "timestamp": "2026-11-13T10:05:00.000Z",
  "path": "/api/auth/refresh"
}
```

Errores: `401 INVALID_TOKEN`, `401 TOKEN_EXPIRED`, `401 TOKEN_REVOKED`, `401 SESSION_EXPIRED`, `404 TOKEN_NOT_FOUND`, `404 SESSION_NOT_FOUND`.

---

## 1.5 `GET /api/auth/sessions`

Requiere JWT.

| Query param | Tipo | Requerido | Validación |
|---|---|---|---|
| `credentialId` | integer | **Sí** | `>= 1` (`isInt`). *No se cruza con el `credentialId` del JWT* |

```bash
curl -X GET "http://localhost/api/auth/sessions?credentialId=1" \
  -H "Authorization: Bearer {{accessToken}}"
```

Respuesta `200` (`message: "Sesiones encontradas"`): `data` es un **array** de objetos sesión. Las sesiones cuyo `expiresAt` ya venció se marcan `expired` de forma perezosa.

---

## 1.6 `GET /api/auth/sessions/:id`

Requiere JWT. `id` debe ser un **UUID válido**.

```bash
curl -X GET "http://localhost/api/auth/sessions/3f6c1e3c-6c9f-4b6f-9a3a-2b7c9f5a1d20" \
  -H "Authorization: Bearer {{accessToken}}"
```

Respuesta `200` (`message: "Sesión encontrada"`), `data` = objeto sesión.

Errores: `400` UUID inválido, `404 SESSION_NOT_FOUND` (mensaje: `No se encontró una sesión con id "<id>"`), `401`.

---

## 1.7 `POST /api/auth/sessions/:id/revoke`

Requiere JWT. Sin body. Revoca la sesión y todos sus tokens.

```bash
curl -X POST "http://localhost/api/auth/sessions/{{sessionId}}/revoke" \
  -H "Authorization: Bearer {{accessToken}}"
```

Respuesta `200` (`message: "Sesión revocada"`), `data` = sesión con `status: "revoked"` y `revokedAt` seteado.

Errores: `400 INVALID_SESSION_ID`, `400 INVALID_SESSION_TRANSITION`, `404 SESSION_NOT_FOUND`, `401`.

---

## 1.8 `POST /api/auth/sessions/:id/activity`

Requiere JWT. Sin body. Actualiza `lastActivityAt` y `updatedAt`.

```bash
curl -X POST "http://localhost/api/auth/sessions/{{sessionId}}/activity" \
  -H "Authorization: Bearer {{accessToken}}"
```

Respuesta `200` (`message: "Actividad de la sesión actualizada"`), `data` = sesión.

Errores: `400 INVALID_SESSION_ID`, `404 SESSION_NOT_FOUND`, `401 SESSION_EXPIRED`.

---

## Catálogo de errores — auth-service

| HTTP | `error` |
|---|---|
| 400 | `INVALID_USERNAME`, `INVALID_PASSWORD`, `INVALID_IP_ADDRESS`, `INVALID_USER_AGENT`, `INVALID_SESSION_ID`, `INVALID_SESSION_TRANSITION`, `INVALID_PROFILE_CODE` |
| 401 | `INVALID_CREDENTIALS`, `CREDENTIAL_NOT_AUTHENTICATED`, `INVALID_TOKEN`, `TOKEN_EXPIRED`, `TOKEN_REVOKED`, `SESSION_EXPIRED`, `SESSION_ACCESS_DENIED`, `Unauthorized` |
| 404 | `CREDENTIAL_NOT_FOUND`, `SESSION_NOT_FOUND`, `TOKEN_NOT_FOUND` |
| 409 | `USERNAME_ALREADY_EXISTS` |
| 500 | `Internal Server Error` |

> No hay roles ni RBAC en el servicio. Solo existe el bypass de rutas públicas.

---

# 2. PROFILE SERVICE

Base: `{{baseUrl}}/api/profile`

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/profile/health` | No | Health check |
| `POST` | `/api/profile` | JWT / internal key | Crear perfil |
| `GET` | `/api/profile/:id` | JWT / internal key | Obtener perfil |
| `PATCH` | `/api/profile/:id` | JWT / internal key | Actualizar perfil |
| `POST` | `/api/profile/:id/avatar` | JWT / internal key | Subir foto de perfil |
| `DELETE` | `/api/profile/:id` | JWT / internal key | Eliminar perfil (soft delete) |

Todos los endpoints `/api/profile*` (excepto health) están protegidos.

### `ProfileOutput`

```json
{
  "id": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  "fullName": "Juan Perez",
  "email": "juan@example.com",
  "phone": "+5491112345678",
  "birthDate": "1990-05-20",
  "gender": "male",
  "bio": null,
  "avatarFileCode": null,
  "createdAt": "2026-11-13T10:00:00.000Z",
  "updatedAt": "2026-11-13T10:00:00.000Z"
}
```

> `id` es el `profile_code` público (UUID), no la PK numérica.

---

## 2.1 `GET /api/profile/health`

```bash
curl -i http://localhost/api/profile/health
```

Mismo formato que el health de auth. `503` si Postgres no está disponible.

---

## 2.2 `POST /api/profile`

**Content-Type:** `application/json`

| Campo | Tipo | Requerido | Validación |
|---|---|---|---|
| `fullName` | string | **Sí** | 2–120 chars, debe contener al menos una letra |
| `email` | string | **Sí** | Email válido, máx. 254, normalizado a minúsculas |
| `phone` | string | No | Tras quitar espacios/`()`/`-`: `/^\+?[1-9]\d{6,14}$/` |
| `birthDate` | string | No | ISO 8601, no futura, no anterior a `1900-01-01` |
| `gender` | string | No | Enum: `male`, `female`, `other`, `prefer_not_to_say` |
| `bio` | string | No | Máx. 500 chars |

```bash
curl -X POST http://localhost/api/profile \
  -H "Authorization: Bearer {{accessToken}}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Ada Lovelace",
    "email": "ada@example.com",
    "phone": "+34600111222",
    "birthDate": "1990-05-21",
    "gender": "female",
    "bio": "Software pioneer"
  }'
```

Variante **service-to-service** (con internal API key, sin JWT):

```bash
curl -X POST http://localhost/api/profile \
  -H "x-internal-api-key: change_me_internal_api_key" \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ada Lovelace","email":"ada@example.com"}'
```

Respuesta `201` (`message: "Perfil creado"`), `data` = `ProfileOutput`.

Errores: `400 INVALID_EMAIL` / `INVALID_FULL_NAME` / `INVALID_PHONE` / `INVALID_BIRTH_DATE` / `INVALID_GENDER` / `INVALID_BIO`, `409 EMAIL_ALREADY_EXISTS` (`Ya existe un perfil con el email "..."`), `401`, `500`.

---

## 2.3 `GET /api/profile/:id`

`id` debe ser un **UUID válido** (`El id debe ser un UUID válido`).

```bash
curl -X GET http://localhost/api/profile/{{profileCode}} \
  -H "Authorization: Bearer {{accessToken}}"
```

Respuesta `200` (`message: "Perfil encontrado"`), `data` = `ProfileOutput`.

Errores: `400` UUID inválido, `404 PROFILE_NOT_FOUND` (`No se encontró un perfil con id "<id>"`), `401`.

---

## 2.4 `PATCH /api/profile/:id`

Todos los campos son opcionales; solo se modifican los enviados. Enviar `null` limpia el valor.

| Campo | Tipo | Validación |
|---|---|---|
| `fullName` | string | 2–120 chars, al menos una letra |
| `phone` | string \| null | Mismo regex que en create; `null` limpia |
| `birthDate` | string \| null | ISO 8601, no futura, ≥ 1900-01-01; `null` limpia |
| `gender` | string \| null | Enum `male\|female\|other\|prefer_not_to_say`; `null` limpia |
| `bio` | string \| null | Máx. 500 chars; `null` limpia |

> **`email` NO es actualizable** — aunque se envíe, se ignora silenciosamente.

```bash
curl -X PATCH http://localhost/api/profile/{{profileCode}} \
  -H "Authorization: Bearer {{accessToken}}" \
  -H "Content-Type: application/json" \
  -d '{
    "fullName": "Juan Carlos Perez",
    "bio": "Ingeniero de software",
    "phone": null
  }'
```

Respuesta `200` (`message: "Perfil actualizado"`), `data` = `ProfileOutput` completo.

---

## 2.5 `POST /api/profile/:id/avatar`

**Content-Type:** `multipart/form-data`

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `file` | binario | **Sí** | 1 archivo, máx. **5 MiB** |

El archivo se reenvía a `file-service` (`POST /profile-photo`) con los headers `x-profile-code` y `X-Internal-Api-Key`; el `fileCode` devuelto se guarda en `avatarFileCode`.

```bash
curl -X POST http://localhost/api/profile/{{profileCode}}/avatar \
  -H "Authorization: Bearer {{accessToken}}" \
  -F "file=@./avatar.png;type=image/png"
```

Respuesta `201` (`message: "Foto de perfil actualizada"`), `data` = `ProfileOutput` con `avatarFileCode` seteado.

Errores: `400 FILE_REQUIRED` (`No se recibió el archivo en el campo "file"`), `413 LIMIT_FILE_SIZE` (> 5 MiB), `404 PROFILE_NOT_FOUND`, `401`, `500` (file-service inalcanzable).

---

## 2.6 `DELETE /api/profile/:id`

Sin body. Elimina el avatar en `file-service` (si existe) y hace **soft delete** del perfil.

```bash
curl -X DELETE http://localhost/api/profile/{{profileCode}} \
  -H "Authorization: Bearer {{accessToken}}"
```

Respuesta `200` (`message: "Perfil eliminado"`), `data: null`.

Errores: `400` UUID inválido, `404 PROFILE_NOT_FOUND`, `401`, `500`.

---

## Catálogo de errores — profile-service

| HTTP | `error` |
|---|---|
| 400 | `INVALID_EMAIL`, `INVALID_FULL_NAME`, `INVALID_PHONE`, `INVALID_BIRTH_DATE`, `INVALID_GENDER`, `INVALID_BIO`, `INVALID_PROFILE_ID`, `INVALID_AVATAR_FILE_CODE`, `FILE_REQUIRED`, `Unauthorized`, `Datos de entrada inválidos` (+`details[]`) |
| 401 | `Unauthorized` |
| 404 | `PROFILE_NOT_FOUND` |
| 409 | `EMAIL_ALREADY_EXISTS` |
| 413 | `LIMIT_FILE_SIZE` |
| 500 | `Internal Server Error` |

---

# 3. FILE SERVICE

Base: `{{baseUrl}}/api/file` — **alias**: `{{baseUrl}}/api/files` (ambos funcionan).

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| `GET` | `/api/file/health` | No | Health check |
| `GET` | `/api/file/public/:fileCode` | **No** | Foto de perfil pública (stream binario) |
| `POST` | `/api/file/profile-photo` | JWT / internal key | Subir foto de perfil |
| `POST` | `/api/file/documents` | JWT / internal key | Subir documento |
| `GET` | `/api/file/` | JWT / internal key | Listar archivos del perfil |
| `GET` | `/api/file/profile-photo` | JWT / internal key | Obtener foto de perfil propia |
| `DELETE` | `/api/file/profile-photo` | JWT / internal key | Eliminar foto de perfil propia |
| `GET` | `/api/file/:fileCode` | JWT / internal key | Metadatos del archivo |
| `GET` | `/api/file/:fileCode/download` | JWT / internal key | Descargar binario |
| `DELETE` | `/api/file/:fileCode` | JWT / internal key | Eliminar archivo |

### `FileOutput`

```json
{
  "fileCode": "33333333-3333-4333-8333-333333333333",
  "profileCode": "3f2504e0-4f89-41d3-9a0c-0305e82c3301",
  "category": "PROFILE_PHOTO",
  "originalName": "avatar.png",
  "mimeType": "image/png",
  "sizeBytes": 12345,
  "url": "http://localhost:3000/api/file/33333333-.../download",
  "publicUrl": "http://localhost:3000/api/file/public/33333333-...",
  "createdAt": "2026-11-13T10:00:00.000Z"
}
```

> `publicUrl` es `null` para la categoría `DOCUMENT`. Las URLs se construyen con `PUBLIC_BASE_URL` (`http://localhost:3000` por defecto) — **no** apuntan al gateway en el puerto 80.

### Resolución del `profileCode`

Orden de precedencia:

1. `res.locals.profileCode` (payload del JWT)
2. Header `x-profile-code: <uuid>`
3. → `400 PROFILE_CODE_REQUIRED` (`El token o el header "x-profile-code" deben incluir el profile code`)

### Ownership

En `GET /:fileCode`, `GET /:fileCode/download` y `DELETE /:fileCode`: si el JWT trae `profileCode` y es distinto al dueño del archivo → `403 FILE_ACCESS_DENIED`. Con `x-internal-api-key` el chequeo se omite.

### Rate limit

Los endpoints de subida (`/profile-photo` y `/documents`) aplican **30 requests / 15 min por IP** → `429 Too Many Requests` (`Demasiadas subidas. Intente nuevamente en 15 minutos.`).

### Límites de multer

| Límite | Valor |
|---|---|
| Tamaño máximo (transporte) | 15 MiB |
| Archivos por request | 1 |
| Storage | memoria (memoryStorage) |

### Políticas por categoría

| Categoría | Prefijo S3 | Tamaño máx. | MIME permitidos |
|---|---|---|---|
| `PROFILE_PHOTO` | `profiles/{profileCode}/{fileCode}.{ext}` | **5 MiB** | `image/jpeg`, `image/png`, `image/webp`, `image/gif` |
| `DOCUMENT` | `documents/{profileCode}/{fileCode}.{ext}` | **15 MiB** | `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`, `application/vnd.ms-excel`, `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`, `text/csv`, `application/csv`, `text/plain` |

> La **extensión del archivo tiene prioridad** sobre el `Content-Type` enviado por el cliente. Solo hay una foto de perfil activa por perfil (índice único parcial en Postgres): al subir una nueva se borra la anterior.

---

## 3.1 `GET /api/file/health`

```bash
curl -i http://localhost/api/file/health
```

---

## 3.2 `GET /api/file/public/:fileCode`

**Sin autenticación.** Devuelve el binario. Solo sirve archivos de categoría `PROFILE_PHOTO` (en otro caso `404 FILE_NOT_FOUND`).

| Path param | Tipo | Requerido | Validación |
|---|---|---|---|
| `fileCode` | string | **Sí** | UUID válido |

| Query param | Tipo | Requerido | Valores |
|---|---|---|---|
| `disposition` | string | No | `inline` (default) \| `attachment` |

```bash
curl -i http://localhost/api/file/public/{{fileCode}}

curl -i "http://localhost/api/file/public/{{fileCode}}?disposition=attachment"
```

Respuesta: stream binario con `Content-Type`, `Content-Length` (si se conoce) y `Content-Disposition: inline; filename="..."`.

Errores: `400` (UUID inválido, con `details[]`), `404 FILE_NOT_FOUND`, `500`.

---

## 3.3 `POST /api/file/profile-photo`

**Content-Type:** `multipart/form-data`

| Campo | Tipo | Requerido |
|---|---|---|
| `file` | binario | **Sí** |

```bash
curl -i -X POST http://localhost/api/file/profile-photo \
  -H "Authorization: Bearer {{accessToken}}" \
  -F "file=@./avatar.png;type=image/png"
```

Variante **service-to-service**:

```bash
curl -i -X POST http://localhost/api/file/profile-photo \
  -H "x-internal-api-key: change_me_internal_api_key" \
  -H "x-profile-code: {{profileCode}}" \
  -F "file=@./avatar.png"
```

Respuesta `201` (`message: "Archivo subido"`), `data` = `FileOutput`.

Errores: `400 FILE_REQUIRED`, `400 PROFILE_CODE_REQUIRED`, `401`, `413 LIMIT_FILE_SIZE`, `413 FILE_TOO_LARGE` (> 5 MiB), `415 FILE_TYPE_NOT_ALLOWED`, `429`, `500`.

---

## 3.4 `POST /api/file/documents`

**Content-Type:** `multipart/form-data` — mismo campo `file`.

```bash
curl -i -X POST http://localhost/api/file/documents \
  -H "Authorization: Bearer {{accessToken}}" \
  -F "file=@./contract.pdf;type=application/pdf"

curl -i -X POST http://localhost/api/file/documents \
  -H "Authorization: Bearer {{accessToken}}" \
  -F "file=@./data.csv;type=text/csv"
```

Respuesta `201` (`message: "Archivo subido"`), `data` = `FileOutput`.

Errores: idénticos a 3.3, con `FILE_TOO_LARGE` a partir de **15 MiB**.

---

## 3.5 `GET /api/file/`

Lista los archivos del `profileCode` resuelto, del más nuevo al más viejo.

| Query param | Tipo | Requerido | Valores |
|---|---|---|---|
| `category` | string | No | `PROFILE_PHOTO` \| `DOCUMENT` (cualquier otro valor se ignora) |

```bash
curl -i -H "Authorization: Bearer {{accessToken}}" http://localhost/api/file/

curl -i -H "Authorization: Bearer {{accessToken}}" "http://localhost/api/file/?category=DOCUMENT"

curl -i -H "x-internal-api-key: change_me_internal_api_key" \
  -H "x-profile-code: {{profileCode}}" \
  http://localhost/api/file/
```

Respuesta `200` (`message: "Archivos obtenidos"`), `data` = **array** de `FileOutput`.

Errores: `400 PROFILE_CODE_REQUIRED`, `401`, `500`.

---

## 3.6 `GET /api/file/profile-photo`

Devuelve la foto de perfil activa del `profileCode` resuelto. Si no hay, devuelve `200` con `data: null`.

```bash
curl -i -H "Authorization: Bearer {{accessToken}}" http://localhost/api/file/profile-photo
```

Respuesta `200` (`message: "Foto de perfil obtenida"`), `data` = `FileOutput` o `null`.

---

## 3.7 `DELETE /api/file/profile-photo`

Elimina la foto de perfil propia (soft delete en Postgres + borrado del objeto S3). Si no había foto, `200` con `data: null`.

```bash
curl -i -X DELETE -H "Authorization: Bearer {{accessToken}}" http://localhost/api/file/profile-photo
```

Respuesta `200` (`message: "Foto de perfil eliminada"`), `data` = `FileOutput` o `null`.

---

## 3.8 `GET /api/file/:fileCode`

`fileCode` debe ser un UUID válido. Devuelve metadatos, con chequeo de ownership.

```bash
curl -i -H "Authorization: Bearer {{accessToken}}" http://localhost/api/file/{{fileCode}}
```

Respuesta `200` (`message: "Archivo encontrado"`), `data` = `FileOutput`.

Errores: `400` (UUID inválido), `401`, `403 FILE_ACCESS_DENIED`, `404 FILE_NOT_FOUND` (`No se encontró el archivo con code "<code>"`), `500`.

---

## 3.9 `GET /api/file/:fileCode/download`

Devuelve el binario con chequeo de ownership.

| Query param | Tipo | Requerido | Valores |
|---|---|---|---|
| `disposition` | string | No | `attachment` (default) \| `inline` |

```bash
curl -i -H "Authorization: Bearer {{accessToken}}" \
  http://localhost/api/file/{{fileCode}}/download

# guardar en disco con el nombre original
curl -OJ -H "Authorization: Bearer {{accessToken}}" \
  "http://localhost/api/file/{{fileCode}}/download?disposition=attachment"
```

Respuesta: stream binario con `Content-Type`, `Content-Length`, `Content-Disposition`.

Errores: `400`, `401`, `403 FILE_ACCESS_DENIED`, `404 FILE_NOT_FOUND`, `500`.

---

## 3.10 `DELETE /api/file/:fileCode`

Soft delete en Postgres + borrado del objeto en S3.

```bash
curl -i -X DELETE -H "Authorization: Bearer {{accessToken}}" \
  http://localhost/api/file/{{fileCode}}
```

Respuesta `200` (`message: "Archivo eliminado"`), `data` = `FileOutput` del archivo eliminado.

Errores: `400`, `401`, `403 FILE_ACCESS_DENIED`, `404 FILE_NOT_FOUND`, `500`.

---

## Catálogo de errores — file-service

| HTTP | `error` |
|---|---|
| 400 | `FILE_REQUIRED`, `PROFILE_CODE_REQUIRED`, `Unauthorized`, `Datos de entrada inválidos` (+`details[]`), errores de multer (`LIMIT_UNEXPECTED_FILE`, etc.) |
| 401 | `Unauthorized` |
| 403 | `FILE_ACCESS_DENIED` |
| 404 | `FILE_NOT_FOUND` |
| 413 | `LIMIT_FILE_SIZE` (límite multer 15 MiB), `FILE_TOO_LARGE` (política de categoría: 5 MiB foto / 15 MiB doc) |
| 415 | `FILE_TYPE_NOT_ALLOWED` |
| 429 | `Too Many Requests` (30 subidas / 15 min por IP) |
| 500 | `Internal Server Error` |

---

# 4. CHAT SERVICE

Base: `{{baseUrl}}/api/chat`. Todos los endpoints requieren **JWT Bearer** (el actor se obtiene del `credentialCode` del token).

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/chat/conversations` | Crear conversación (`direct` o `group`) |
| `GET` | `/api/chat/conversations` | Listar mis conversaciones (`?cursor=&limit=`) |
| `GET` | `/api/chat/conversations/:code` | Detalle de una conversación |
| `POST` | `/api/chat/conversations/:code/participants` | Añadir participante (solo admin del grupo) |
| `DELETE` | `/api/chat/conversations/:code/participants/:credentialCode` | Quitar participante (solo admin del grupo) |
| `POST` | `/api/chat/conversations/:code/leave` | Salir de la conversación |
| `PATCH` | `/api/chat/conversations/:code` | Renombrar la conversación (solo admin del grupo) |
| `DELETE` | `/api/chat/conversations/:code` | Eliminar conversación (borrado lógico) |
| `POST` | `/api/chat/conversations/:code/messages` | Enviar mensaje |
| `GET` | `/api/chat/conversations/:code/messages` | Listar mensajes (`?cursor=&limit=`) |
| `GET` | `/api/chat/messages/:code` | Detalle de un mensaje |
| `PATCH` | `/api/chat/messages/:code` | Editar mensaje (solo el emisor) |
| `DELETE` | `/api/chat/messages/:code` | Eliminar mensaje (emisor o admin del grupo) |
| `POST` | `/api/chat/messages/:code/delivered` | Marcar mensaje como entregado |
| `POST` | `/api/chat/messages/:code/read` | Marcar mensaje como leído |

### Identidad

El actor se identifica por el **`credentialCode`** (UUID) presente en el JWT de `auth-service`. Ese campo se añadió al payload del token (`sessionId`, `credentialId`, `credentialCode`, `profileCode`, `username`).

### `ConversationOutput`

```json
{
  "code": "8a3f1c22-5f7b-4c2e-9d1a-0f2b6c8d4e10",
  "type": "group",
  "title": "Equipo de desarrollo",
  "participants": [
    {
      "credentialCode": "1a2b3c4d-1111-4111-8111-111111111111",
      "role": "admin",
      "status": "active",
      "joinedAt": "2026-11-15T10:00:00.000Z",
      "leftAt": null
    }
  ],
  "createdBy": "1a2b3c4d-1111-4111-8111-111111111111",
  "lastMessageAt": "2026-11-15T10:05:00.000Z",
  "createdAt": "2026-11-15T10:00:00.000Z",
  "updatedAt": "2026-11-15T10:05:00.000Z",
  "deletedAt": null
}
```

### `MessageOutput`

```json
{
  "code": "5c7d8e9f-2222-4333-8444-555555555555",
  "conversationCode": "8a3f1c22-5f7b-4c2e-9d1a-0f2b6c8d4e10",
  "senderCredentialCode": "1a2b3c4d-1111-4111-8111-111111111111",
  "content": "Hola a todos",
  "status": "read",
  "deliveredAt": "2026-11-15T10:05:01.000Z",
  "readAt": "2026-11-15T10:05:30.000Z",
  "editedAt": null,
  "deletedAt": null,
  "deletedBy": null,
  "createdAt": "2026-11-15T10:05:00.000Z",
  "updatedAt": "2026-11-15T10:05:30.000Z"
}
```

### Reglas de dominio

- **Conversación `direct`**: exactamente 2 participantes, sin título. La pareja de participantes genera una clave determinista (`direct_key`, sha256) que impide duplicar el mismo chat 1:1: al crear una conversación directa que ya existe, el endpoint devuelve la existente en lugar de crear otra.
- **Conversación `group`**: mínimo 2 participantes, título obligatorio (3–80 caracteres) y al menos un administrador (`role: admin`). El creador es el administrador inicial.
- **Participantes**: máximo 256 por conversación. No se puede quitar al último administrador. En conversaciones `direct` el conjunto de participantes es inmutable (salir de la conversación sí se permite).
- **Mensajes**: contenido de 1 a 4096 caracteres. Estados globales `sent → delivered → read` (monótonos). La edición solo la realiza el emisor y exige un contenido distinto. El borrado es lógico (`deleted_at`) y lo puede hacer el emisor o un administrador del grupo.
- **Acuses**: cada participante genera su propio acuse (`message_receipts`), además del estado global del mensaje.
- **Paginación por cursor**: `?cursor=<createdAt>|<code>&limit=<1..100>`. La respuesta incluye `nextCursor` (o `null` si no hay más resultados). Los mensajes se listan en orden cronológico ascendente; las conversaciones, de más reciente a más antigua.

### Realtime (socket.io)

El servicio expone un servidor **socket.io** en el path `/api/chat/socket.io` (push-only: el socket **notifica**, las acciones se siguen haciendo por REST).

**Conexión** — el JWT viaja en el handshake (`auth.token`) o, como fallback, en `?token=` o en la cabecera `Authorization`:

```js
const socket = io("http://localhost", {
  path: "/api/chat/socket.io",
  transports: ["websocket"],
  auth: { token: "<accessToken>" },
});

socket.on("connect_error", (error) => console.error(error.message)); // "UNAUTHORIZED" si el token falla
```

Ejemplos listos en `microservices/chat-service/scripts/`:

```bash
cd microservices/chat-service
CHAT_TOKEN=<jwt> CHAT_CONVERSATION_CODE=<uuid> npx tsx scripts/socket-client.example.ts
CHAT_TOKEN=<jwt> CHAT_CONVERSATION_CODE=<uuid> npx tsx scripts/socket-typing.example.ts
```

**Eventos que el servidor emite** (todos incluyen el `conversationCode`):

| Evento | Cuándo se emite | Payload |
|---|---|---|
| `chat.message.created` | Nuevo mensaje | `{ conversationCode, messageCode, senderCredentialCode, content, createdAt }` |
| `chat.message.updated` | Mensaje editado | `{ conversationCode, messageCode, content, editedAt }` |
| `chat.message.deleted` | Mensaje eliminado | `{ conversationCode, messageCode, deletedBy, deletedAt }` |
| `chat.message.delivered` | Acuse de entrega | `{ conversationCode, messageCode, credentialCode, deliveredAt }` |
| `chat.message.read` | Acuse de lectura | `{ conversationCode, messageCode, credentialCode, readAt }` |
| `chat.conversation.created` | Conversación creada | `{ conversationCode, type, title, createdBy, participantCredentialCodes }` |
| `chat.conversation.renamed` | Conversación renombrada | `{ conversationCode, title }` |
| `chat.conversation.deleted` | Conversación eliminada | `{ conversationCode }` |
| `chat.conversation.participant.added` | Participante añadido | `{ conversationCode, participantCredentialCode, role }` |
| `chat.conversation.participant.removed` | Participante eliminado por un admin | `{ conversationCode, participantCredentialCode }` |
| `chat.conversation.participant.left` | Participante salió | `{ conversationCode, participantCredentialCode }` |
| `chat.presence.online` | Un usuario se conecta | `{ credentialCode, conversationCode, since }` |
| `chat.presence.offline` | Un usuario se desconecta | `{ credentialCode, conversationCode, at }` |
| `chat.typing` | Un usuario está escribiendo | `{ conversationCode, credentialCode, isTyping }` |
| `chat.typing.stopped` | Se agota el indicador de escritura (5 s) | `{ conversationCode, credentialCode, isTyping }` |

**Eventos que el cliente puede enviar** (solo uno, y no altera el dominio):

| Evento | Payload | Efecto |
|---|---|---|
| `chat:typing` | `{ conversationCode }` | Emite `chat.typing` al resto de la conversación (se ignora si el socket no está en la sala) |

**Rooms internas**: `user:<credentialCode>` (todas las conexiones de un usuario) y `conversation:<conversationCode>`. Al conectar, el servidor mete al socket en las salas de todas las conversaciones del usuario; cuando se crea una conversación o se añade un participante, sus sockets entran automáticamente en la sala correspondiente.

**Origen de los eventos**: los agregados registran eventos de dominio (`MessageCreatedEvent`, `ConversationCreatedEvent`, `ParticipantLeftEvent`…) con el patrón de `auth-service`; la aplicación los publica en un `DomainEventPublisher` (adapter en memoria) y un `DomainEventListener` los traduce a emisiones de socket. Ese seam es el punto donde se enchufa Kafka cuando haya balanceador de carga.

### Catálogo de errores - chat-service

| Código HTTP | Códigos de error |
|---|---|
| 400 | `INVALID_CONVERSATION_CODE`, `INVALID_MESSAGE_CODE`, `INVALID_MESSAGE_RECEIPT_CODE`, `INVALID_CREDENTIAL_CODE`, `INVALID_CONVERSATION_TITLE`, `INVALID_CONVERSATION_TYPE`, `INVALID_PARTICIPANT_ROLE`, `INVALID_PARTICIPANT_STATUS`, `INVALID_MESSAGE_CONTENT`, `INVALID_MESSAGE_STATUS`, `INVALID_RECEIPT_STATUS`, `INVALID_DIRECT_KEY`, `INVALID_PAGINATION_CURSOR`, `CONVERSATION_TITLE_REQUIRED`, `DIRECT_CONVERSATION_REQUIRES_TWO_PARTICIPANTS`, `GROUP_CONVERSATION_REQUIRES_TWO_PARTICIPANTS`, `DIRECT_CONVERSATION_PARTICIPANTS_IMMUTABLE`, `Datos de entrada inválidos` (+`details[]`) |
| 401 | `Unauthorized` |
| 403 | `CONVERSATION_NOT_PARTICIPANT`, `CONVERSATION_NOT_ADMIN`, `LAST_ADMIN_CANNOT_BE_REMOVED`, `MESSAGE_NOT_EDITABLE` |
| 404 | `CONVERSATION_NOT_FOUND`, `MESSAGE_NOT_FOUND`, `RECEIPT_NOT_FOUND` |
| 409 | `CONVERSATION_ALREADY_EXISTS`, `DUPLICATE_CONVERSATION_PARTICIPANT`, `CONVERSATION_PARTICIPANT_LIMIT_REACHED`, `MESSAGE_ALREADY_DELETED`, `MESSAGE_CONTENT_UNCHANGED` |
| 500 | `Internal Server Error` |

---

# 5. Colección Postman — orden de ejecución

1. `POST /api/auth/signup` → guarda `accessToken`, `refreshToken`, `profileCode`, `session.id`.
2. `POST /api/auth/signin` (opcional, para reemitir tokens).
3. `POST /api/auth/refresh` (opcional, rota tokens).
4. `GET /api/profile/{{profileCode}}` (verifica el perfil creado por el signup).
5. `PATCH /api/profile/{{profileCode}}`.
6. `POST /api/profile/{{profileCode}}/avatar` → guarda `fileCode` desde `data.avatarFileCode`.
7. `GET /api/file/` — lista.
8. `GET /api/file/profile-photo`.
9. `GET /api/file/public/{{fileCode}}` — público, sin token.
10. `GET /api/file/{{fileCode}}/download`.
11. `DELETE /api/file/profile-photo`.
12. `DELETE /api/file/{{fileCode}}`.
13. `GET /api/auth/sessions?credentialId=1`.
14. `GET /api/auth/sessions/{{sessionId}}`.
15. `POST /api/auth/sessions/{{sessionId}}/activity`.
16. `POST /api/auth/sessions/{{sessionId}}/revoke`.
17. `POST /api/chat/conversations` — crear conversación `direct` con el `credentialCode` de otro usuario → guarda `conversationCode`.
18. `POST /api/chat/conversations/{{conversationCode}}/messages` — enviar mensaje → guarda `messageCode`.
19. `GET /api/chat/conversations` — listar conversaciones del usuario.
20. `GET /api/chat/conversations/{{conversationCode}}/messages` — listar mensajes (polling).
21. `POST /api/chat/messages/{{messageCode}}/read` — marcar como leído.

### Variables de entorno sugeridas

```
baseUrl       = http://localhost
accessToken   = (desde signup/signin -> data.tokens.accessToken)
refreshToken  = (desde signup/signin -> data.tokens.refreshToken)
profileCode   = (desde signup/signin -> data.profileCode)
credentialCode= (desde signup/signin -> data.credentialCode)
sessionId     = (desde signup/signin -> data.session.id)
fileCode      = (desde file upload -> data.fileCode)
conversationCode = (desde POST /api/chat/conversations -> data.code)
messageCode   = (desde POST /api/chat/conversations/:code/messages -> data.code)
```

---

# 6. Notas y limitaciones conocidas

- **No hay OpenAPI/Swagger** en `auth-service`, `profile-service` ni `file-service`. Este README es la única especificación disponible.
- **Los microservicios no exponen puertos al host**; el único punto de entrada público es el gateway nginx (`http://localhost`). Para depurar un servicio aislado hay que levantar el contenedor con `docker compose exec` o agregar un mapeo `ports:`.
- `GET /api/health` **no funciona a través del gateway**: la regla de nginx lo enviaría a `health-service`, que no existe. Usar `GET /api/auth/health`, `/api/profile/health` o `/api/file/health`.
- **`chat-service` expone realtime con socket.io** (push de mensajes, acuses, participantes, presencia e indicador de escritura). La entrega es **una sola instancia**: el fan-out entre réplicas todavía no existe, así que antes de añadir un balanceador hay que sustituir el `InMemoryDomainEventPublisherAdapter` por el de Kafka.
- **`chat-service` no soporta adjuntos**: los mensajes son solo texto. La integración con `file-service` (imágenes, audio, documentos) queda pendiente.
- **El borrado de mensajes es "para todos"**: no existe el borrado "solo para mí", que requeriría visibilidad por participante.
- La presencia y el indicador de escritura son **efímeros y en memoria**: no se persisten y se pierden al reiniciar el servicio.
- Las tablas del chat (`conversations`, `conversation_participants`, `messages`, `message_receipts`) se crean automáticamente porque el datasource usa `synchronize: true`.
