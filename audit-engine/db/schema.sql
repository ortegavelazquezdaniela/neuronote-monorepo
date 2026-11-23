-- =============================================================================
-- NEURONOTE · Motor de auditoría · Esquema MySQL / MariaDB (XAMPP)
-- Actas de verificación ambiental, Índice de Confort Acústico y Sensorial (ICAS),
-- registro de profesionales con cédula y folios de sellos emitidos.
-- =============================================================================

CREATE DATABASE IF NOT EXISTS neuronote_audit
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE neuronote_audit;

CREATE TABLE IF NOT EXISTS establishments (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(120) NOT NULL,
  osm_id        VARCHAR(30)  NULL UNIQUE,          -- p. ej. way-4758957
  address       VARCHAR(200) NULL,
  contact_email VARCHAR(254) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS audits (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  establishment_id INT UNSIGNED NOT NULL,
  auditor_name     VARCHAR(80)  NOT NULL,
  audited_at       DATE         NOT NULL,
  avg_db           DECIMAL(4,1) NOT NULL,   -- nivel sonoro promedio (dB(A))
  peak_db          DECIMAL(4,1) NOT NULL,   -- pico sonoro (dB(A))
  reverberation_s  DECIMAL(3,2) NOT NULL,   -- tiempo de reverberación RT60 (s)
  lux              SMALLINT UNSIGNED NOT NULL,
  flicker          TINYINT(1)   NOT NULL DEFAULT 0,
  crowd_density    DECIMAL(3,1) NOT NULL,   -- personas por cada 10 m²
  icas             DECIMAL(4,1) NOT NULL,
  level            ENUM('alto','moderado','bajo') NOT NULL,
  notes            VARCHAR(500) NULL,
  status           ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_audit_establishment FOREIGN KEY (establishment_id) REFERENCES establishments(id) ON DELETE CASCADE,
  CONSTRAINT chk_avg_db CHECK (avg_db BETWEEN 20 AND 120),
  CONSTRAINT chk_peak_db CHECK (peak_db BETWEEN 20 AND 140),
  CONSTRAINT chk_rt CHECK (reverberation_s BETWEEN 0.05 AND 9.99),
  CONSTRAINT chk_crowd CHECK (crowd_density BETWEEN 0 AND 20),
  CONSTRAINT chk_icas CHECK (icas BETWEEN 0 AND 100)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS professionals (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  full_name   VARCHAR(100) NOT NULL,
  cedula      VARCHAR(10)  NOT NULL UNIQUE,     -- cédula profesional (7 u 8 dígitos)
  specialty   VARCHAR(80)  NOT NULL,
  email       VARCHAR(254) NOT NULL,
  whatsapp    VARCHAR(15)  NULL,                -- solo dígitos con código de país
  status      ENUM('pending','approved','suspended') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  reviewed_at TIMESTAMP NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS badges (
  id        INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  folio     VARCHAR(20) NOT NULL UNIQUE,        -- NN-2026-000001
  audit_id  INT UNSIGNED NOT NULL UNIQUE,
  hash      CHAR(64)    NOT NULL,               -- SHA-256 del acta
  issued_at TIMESTAMP   NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at DATE       NOT NULL,
  CONSTRAINT fk_badge_audit FOREIGN KEY (audit_id) REFERENCES audits(id) ON DELETE CASCADE
) ENGINE=InnoDB;
