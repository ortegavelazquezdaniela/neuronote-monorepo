# NEURONOTE · Motor de auditoría (PHP 8.3 + Apache) para Render Free (Docker).
# La configuración y los secretos llegan como variables de entorno del panel de
# Render; ningún .env entra en la imagen (ver .dockerignore).
FROM php:8.3-apache

# Extensión PDO MySQL (compatible con MySQL, MariaDB y TiDB) + php.ini de producción.
RUN docker-php-ext-install pdo_mysql \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini" \
    && printf 'expose_php = Off\nsession.use_strict_mode = 1\n' > "$PHP_INI_DIR/conf.d/neuronote.ini"

# Apache: escucha en $PORT (Render lo define), sin firma de versión ni listados.
RUN sed -ri 's/^Listen 80$/Listen ${PORT}/' /etc/apache2/ports.conf \
    && sed -ri 's/<VirtualHost \*:80>/<VirtualHost *:${PORT}>/' /etc/apache2/sites-available/000-default.conf \
    && printf 'ServerTokens Prod\nServerSignature Off\nTraceEnable Off\n<Directory /var/www/html>\n  Options -Indexes\n  AllowOverride None\n</Directory>\n' \
       > /etc/apache2/conf-available/neuronote.conf \
    && a2enconf neuronote

ENV PORT=8080 \
    TRUST_PROXY=1 \
    DB_SSL_CA=/etc/ssl/certs/ca-certificates.crt

COPY index.php /var/www/html/
COPY src/ /var/www/html/src/
COPY assets/ /var/www/html/assets/

USER www-data
EXPOSE 8080
