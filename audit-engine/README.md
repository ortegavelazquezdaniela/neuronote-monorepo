# audit-engine — Motor de auditoría (PHP 8 + MySQL)

Se implementa en la **Fase 4**. Responsabilidades según la propuesta técnica:

- `src/calculate_index.php` — cálculo del Índice de Confort Acústico y Sensorial (ICAS).
- `src/submit_audit.php` — formulario de acreditación de oasis y psicólogos (`$_POST`, sanitización, validación).
- `src/generate_badge.php` — emisión de dictamen con hash criptográfico.
- `db/schema.sql` — tablas MySQL de peritaje y folios.
- CRUD con PDO y sentencias preparadas.

Requisitos locales: XAMPP instalado en `C:\xampp` (PHP 8.2.12 con PDO MySQL, MariaDB 10.4.32), verificado el 22-nov-2026. Servidor de desarrollo: `npm run audit:serve` desde la raíz del monorepo.
