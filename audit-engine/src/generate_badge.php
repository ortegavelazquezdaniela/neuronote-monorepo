<?php
declare(strict_types=1);

/**
 * Emisión de dictamen/sello con hash criptográfico.
 *   POST (panel pericial): emite el sello de un acta aprobada.
 *   GET ?folio=…        : muestra el sello imprimible con su folio y hash.
 */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/badge.php';
require __DIR__ . '/layout.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_admin();
    csrf_check();
    $auditId = filter_var($_POST['audit_id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    try {
        if (!$auditId) throw new InvalidArgumentException('Acta no válida.');
        $folio = issue_badge($auditId);
        header('Location: /src/generate_badge.php?folio=' . rawurlencode($folio), true, 303);
    } catch (InvalidArgumentException $ex) {
        header('Location: /?msg=' . rawurlencode($ex->getMessage()), true, 303);
    } catch (Throwable $ex) {
        error_log('generate_badge: ' . $ex->getMessage());
        header('Location: /?msg=' . rawurlencode('No se pudo emitir el sello. Revisa la configuración.'), true, 303);
    }
    exit;
}

$folio = (string) ($_GET['folio'] ?? '');
if (!preg_match('/^NN-\d{4}-\d{6}$/', $folio)) {
    http_response_code(400);
    exit('Folio no válido');
}

$q = db()->prepare(
    'SELECT b.*, a.icas, a.level, a.audited_at, e.name, e.address
       FROM badges b JOIN audits a ON a.id = b.audit_id JOIN establishments e ON e.id = a.establishment_id
      WHERE b.folio = ?'
);
$q->execute([$folio]);
$badge = $q->fetch();
if (!$badge) {
    http_response_code(404);
    exit('Sello no encontrado');
}

page_start('Sello ' . $folio);
?>
<article class="seal" aria-labelledby="seal-title">
  <p class="seal-kicker">Sensory Haven Certified</p>
  <h1 id="seal-title"><?= e($badge['name']) ?></h1>
  <?php if ($badge['address']): ?><p><?= e($badge['address']) ?></p><?php endif; ?>
  <dl>
    <div><dt>Folio</dt><dd><?= e($badge['folio']) ?></dd></div>
    <div><dt>ICAS</dt><dd><?= e($badge['icas']) ?> / 100 (confort <?= e($badge['level']) ?>)</dd></div>
    <div><dt>Auditoría</dt><dd><?= e($badge['audited_at']) ?></dd></div>
    <div><dt>Vigente hasta</dt><dd><?= e($badge['expires_at']) ?></dd></div>
    <div><dt>Hash HMAC-SHA256</dt><dd><code><?= e($badge['hash']) ?></code></dd></div>
  </dl>
  <p class="small">Verifica este sello en <code>/src/verify.php?folio=<?= e($badge['folio']) ?></code>. El índice describe las condiciones medidas el día de la auditoría; no garantiza que el lugar sea cómodo para todas las personas.</p>
</article>
<?php
page_end();
