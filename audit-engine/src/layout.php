<?php
declare(strict_types=1);

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

/** Encabezado HTML común (HTML5 semántico, mismo sistema visual que la app). */
function page_start(string $title): void
{
    ?>
<!doctype html>
<html lang="es-MX">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title><?= e($title) ?> · NEURONOTE Auditoría</title>
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <a class="skip" href="#contenido">Saltar al contenido</a>
  <header class="top">
    <div class="wrap">
      <a class="brand" href="/">NEURO<span>NOTE</span> · Motor de auditoría</a>
      <nav aria-label="Secciones">
        <a href="/src/submit_audit.php">Registrar auditoría</a>
        <a href="/src/register_professional.php">Registro de profesionales</a>
        <a href="/">Panel pericial</a>
      </nav>
    </div>
  </header>
  <main id="contenido" class="wrap">
    <?php
}

function page_end(): void
{
    ?>
  </main>
  <footer class="wrap foot">
    <p>ICAS: fórmula propia de NEURONOTE, documentada en <code>src/icas.php</code>. No es una norma oficial.</p>
  </footer>
</body>
</html>
    <?php
}

/** Lista de errores de validación con enlaces a cada campo. */
function error_summary(array $errors): void
{
    if (!$errors) {
        return;
    }
    echo '<div class="msg error" role="alert" tabindex="-1"><p><strong>Revisa ' . count($errors) . ' campo(s):</strong></p><ul>';
    foreach ($errors as $field => $message) {
        echo '<li><a href="#' . e($field) . '">' . e($message) . '</a></li>';
    }
    echo '</ul></div>';
}
