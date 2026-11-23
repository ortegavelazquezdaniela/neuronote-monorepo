<?php
declare(strict_types=1);

/**
 * Índice de Confort Acústico y Sensorial (ICAS) · 0 a 100.
 *
 * Fórmula PROPIA de NEURONOTE (no es una norma oficial). Combina cinco
 * componentes normalizados de 0 a 100 con pesos documentados:
 *
 *   ruido promedio (dB(A))     35 %   35 dB → 100   · 75 dB → 0
 *   picos sonoros  (dB(A))     15 %   60 dB → 100   · 90 dB → 0
 *   reverberación  (RT60, s)   15 %   0.4 s → 100   · 2.0 s → 0
 *   iluminación    (lux)       20 %   150–500 lux → 100; 0 si < 50 o > 1000;
 *                                     -30 puntos si hay parpadeo visible
 *   aforo (personas / 10 m²)   15 %   0 → 100       · 3 → 0
 *
 * Niveles: ≥ 75 alto (certificable) · 55–74.9 moderado · < 55 bajo.
 */

/** Interpola linealmente: $best → 100, $worst → 0, con recorte a [0, 100]. */
function icas_scale(float $value, float $best, float $worst): float
{
    $score = ($worst - $value) / ($worst - $best) * 100;
    return max(0.0, min(100.0, $score));
}

function icas_light(float $lux, bool $flicker): float
{
    if ($lux >= 150 && $lux <= 500) {
        $score = 100.0;
    } elseif ($lux < 150) {
        $score = icas_scale($lux, 150, 50);
    } else {
        $score = icas_scale($lux, 500, 1000);
    }
    return max(0.0, $score - ($flicker ? 30 : 0));
}

/**
 * @param array{avg_db: float, peak_db: float, reverberation_s: float, lux: float, flicker: bool, crowd_density: float} $m
 * @return array{icas: float, level: string, components: array<string, float>}
 */
function calculate_icas(array $m): array
{
    $components = [
        'ruido' => icas_scale($m['avg_db'], 35, 75),
        'picos' => icas_scale($m['peak_db'], 60, 90),
        'reverberacion' => icas_scale($m['reverberation_s'], 0.4, 2.0),
        'iluminacion' => icas_light($m['lux'], $m['flicker']),
        'aforo' => icas_scale($m['crowd_density'], 0, 3),
    ];
    $weights = ['ruido' => 0.35, 'picos' => 0.15, 'reverberacion' => 0.15, 'iluminacion' => 0.20, 'aforo' => 0.15];

    $total = 0.0;
    foreach ($weights as $key => $weight) {
        $total += $components[$key] * $weight;
    }
    $icas = round($total, 1);

    return [
        'icas' => $icas,
        'level' => $icas >= 75 ? 'alto' : ($icas >= 55 ? 'moderado' : 'bajo'),
        'components' => array_map(fn (float $v) => round($v, 1), $components),
    ];
}
