<?php
declare(strict_types=1);

/**
 * Pruebas del ICAS sin dependencias: php tests/icas_test.php
 * Sale con código 1 si alguna falla (lo usa la CI).
 */
require __DIR__ . '/../src/icas.php';

$failures = 0;
function check(string $name, bool $ok): void
{
    global $failures;
    echo ($ok ? '  ✓ ' : '  ✗ ') . $name . PHP_EOL;
    if (!$ok) $failures++;
}

$calm = calculate_icas(['avg_db' => 35, 'peak_db' => 60, 'reverberation_s' => 0.4, 'lux' => 300, 'flicker' => false, 'crowd_density' => 0]);
check('Lugar ideal = 100 y nivel alto', $calm['icas'] === 100.0 && $calm['level'] === 'alto');

$loud = calculate_icas(['avg_db' => 80, 'peak_db' => 95, 'reverberation_s' => 2.5, 'lux' => 1200, 'flicker' => true, 'crowd_density' => 4]);
check('Lugar muy ruidoso = 0 y nivel bajo', $loud['icas'] === 0.0 && $loud['level'] === 'bajo');

$mid = calculate_icas(['avg_db' => 55, 'peak_db' => 75, 'reverberation_s' => 1.2, 'lux' => 300, 'flicker' => false, 'crowd_density' => 1.5]);
// 50 en cada componente salvo iluminación (100): 0.35·50 + 0.15·50 + 0.15·50 + 0.20·100 + 0.15·50 = 60
check('Valores intermedios = 60 (moderado)', $mid['icas'] === 60.0 && $mid['level'] === 'moderado');

$flicker = calculate_icas(['avg_db' => 35, 'peak_db' => 60, 'reverberation_s' => 0.4, 'lux' => 300, 'flicker' => true, 'crowd_density' => 0]);
check('El parpadeo resta 30 puntos de iluminación (×0.20 = 6)', $flicker['icas'] === 94.0);

check('Iluminación baja (100 lux) = 50', icas_light(100, false) === 50.0);
check('Iluminación alta (750 lux) = 50', icas_light(750, false) === 50.0);
check('Escala recorta a 0..100', icas_scale(10, 35, 75) === 100.0 && icas_scale(200, 35, 75) === 0.0);

echo $failures ? "\n$failures prueba(s) fallaron\n" : "\nTodas las pruebas del ICAS pasan\n";
exit($failures ? 1 : 0);
