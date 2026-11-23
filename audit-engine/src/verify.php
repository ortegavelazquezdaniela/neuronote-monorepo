<?php
declare(strict_types=1);

/**
 * Verificación pública de sellos (JSON). Usado por la API Express:
 *   GET /src/verify.php?folio=NN-2026-000001
 *   GET /src/verify.php?osm_id=way-4758957
 * Comprueba además que el hash del acta siga siendo válido.
 */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/badge.php';

$folio = (string) ($_GET['folio'] ?? '');
$osmId = (string) ($_GET['osm_id'] ?? '');

if ($folio === '' && $osmId === '') json_response(['error' => 'Indica folio u osm_id'], 400);
if ($folio !== '' && !preg_match('/^NN-\d{4}-\d{6}$/', $folio)) json_response(['error' => 'Folio no válido'], 400);
if ($osmId !== '' && !preg_match('/^(node|way|relation)-\d{1,15}$/', $osmId)) json_response(['error' => 'osm_id no válido'], 400);

$sql = 'SELECT b.folio, b.hash, b.issued_at, b.expires_at, a.*, e.name, e.osm_id
          FROM badges b JOIN audits a ON a.id = b.audit_id JOIN establishments e ON e.id = a.establishment_id
         WHERE ' . ($folio !== '' ? 'b.folio = ?' : 'e.osm_id = ?') . '
         ORDER BY b.issued_at DESC LIMIT 1';
$q = db()->prepare($sql);
$q->execute([$folio !== '' ? $folio : $osmId]);
$row = $q->fetch();

if (!$row) json_response(['certified' => false]);

$valid = hash_equals($row['hash'], badge_hash($row, $row['folio']));
$active = $row['expires_at'] >= date('Y-m-d');

json_response([
    'certified' => $valid && $active,
    'folio' => $row['folio'],
    'name' => $row['name'],
    'osmId' => $row['osm_id'],
    'icas' => (float) $row['icas'],
    'level' => $row['level'],
    'auditedAt' => $row['audited_at'],
    'expiresAt' => $row['expires_at'],
    'integrity' => $valid ? 'ok' : 'alterado',
]);
