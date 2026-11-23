<?php
declare(strict_types=1);

/**
 * Endpoint JSON del ICAS (sin guardar nada): POST con las mediciones.
 * Útil para previsualizar el índice antes de registrar el acta.
 */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/icas.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['error' => 'Usa POST con avg_db, peak_db, reverberation_s, lux, flicker y crowd_density'], 405);
}

$m = [
    'avg_db' => post_number('avg_db', 20, 120),
    'peak_db' => post_number('peak_db', 20, 140),
    'reverberation_s' => post_number('reverberation_s', 0.05, 9.99),
    'lux' => post_number('lux', 0, 100000),
    'crowd_density' => post_number('crowd_density', 0, 20),
];
$invalid = array_keys(array_filter($m, fn ($v) => $v === null));
if ($invalid) {
    json_response(['error' => 'Mediciones fuera de rango', 'fields' => $invalid], 400);
}
$m['flicker'] = ($_POST['flicker'] ?? '') === '1';

json_response(calculate_icas($m));
