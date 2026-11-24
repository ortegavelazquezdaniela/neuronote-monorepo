# audit-engine — Motor de auditoría (PHP 8 + MySQL)

```bash
# Base de datos (una vez, con XAMPP/MySQL encendido)
C:\xampp\mysql\bin\mysql.exe -u root < db/schema.sql
cp .env.example .env        # usuario de BD dedicado, hash de la contraseña del panel y BADGE_SECRET

# Servidor (desde la raíz del monorepo)
npm run audit:serve         # http://localhost:8080

# Pruebas
C:\xampp\php\php.exe tests/icas_test.php
```

| Archivo | Responsabilidad |
|---|---|
| `index.php` | Panel pericial (HTTP Basic + `password_verify`): CRUD de actas y profesionales |
| `src/icas.php` | Índice de Confort Acústico y Sensorial (fórmula y pesos documentados) |
| `src/calculate_index.php` | Endpoint JSON del ICAS (POST, no guarda nada) |
| `src/submit_audit.php` | Formulario de acta (`$_POST`, CSRF, validación, transacción PDO) |
| `src/register_professional.php` | Registro de psicólogos con cédula (7–8 dígitos) |
| `src/generate_badge.php` | Emite el sello (ICAS ≥ 75, acta aprobada) y muestra el dictamen |
| `src/badge.php` | Hash HMAC-SHA256 del acta con `BADGE_SECRET` |
| `src/verify.php` | Verificación pública en JSON (la usa la API Express) |
| `src/health.php` | Comprobación de vida para Render (no usa la base) |
| `db/schema.sql` | Tablas `establishments`, `audits`, `professionals`, `badges` (MySQL, MariaDB o TiDB) |
| `Dockerfile` | Imagen PHP 8.3 + Apache para Render Free (ver el README raíz) |

Seguridad: sentencias preparadas (`ATTR_EMULATE_PREPARES = false`), `htmlspecialchars` en toda salida, tokens CSRF, cookies `HttpOnly` + `SameSite=Strict`, cabeceras CSP y `X-Frame-Options`, archivos internos no accesibles por URL.
