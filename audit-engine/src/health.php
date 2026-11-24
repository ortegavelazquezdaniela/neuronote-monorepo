<?php
declare(strict_types=1);

/** Comprobación de vida para Render (no toca la base de datos). */
require __DIR__ . '/bootstrap.php';

json_response(['ok' => true, 'service' => 'neuronote-audit']);
