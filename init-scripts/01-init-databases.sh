#!/usr/bin/env bash
# ==========================================
# Inicializacion de las bases de datos por microservicio
# ==========================================
# Crea un usuario y una base de datos por servicio. Las credenciales se toman de
# variables de entorno (ver docker-compose.yml -> postgres.environment) y deben
# coincidir con TORM_USER_DB / TORM_PASSWORD_DB / TORM_NAME_DB de cada servicio.
#
# Este script solo se ejecuta cuando el volumen de Postgres esta vacio.

create_user_and_db() {
    local db_user="$1"
    local db_password="$2"
    local db_name="$3"

    # Escapa comillas simples para que la password sea segura en el literal SQL
    local safe_password="${db_password//\'/\'\'}"

    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
        DO \$\$
        BEGIN
            IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${db_user}') THEN
                CREATE USER ${db_user} WITH PASSWORD '${safe_password}';
            END IF;
        END
        \$\$;

        SELECT 'CREATE DATABASE ${db_name} OWNER ${db_user}'
        WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '${db_name}')\gexec

        GRANT ALL PRIVILEGES ON DATABASE ${db_name} TO ${db_user};
EOSQL
}

create_user_and_db "auth_user" "${AUTH_DB_PASSWORD:-change_me_password}" "auth_db"
create_user_and_db "profile_user" "${PROFILE_DB_PASSWORD:-change_me_password}" "profile_db"
create_user_and_db "chat_user" "${CHAT_DB_PASSWORD:-change_me_password}" "chat_db"
create_user_and_db "storage_user" "${STORAGE_DB_PASSWORD:-change_me_password}" "storage_db"
create_user_and_db "notification_user" "${NOTIFICATION_DB_PASSWORD:-change_me_password}" "notification_db"

echo "[init-databases] Bases de datos inicializadas correctamente"
