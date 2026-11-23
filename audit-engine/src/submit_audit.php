<?php
declare(strict_types=1);

/**
 * Formulario de acta de auditoría ambiental ($_POST + validación + PDO).
 * Calcula el ICAS y deja el acta "pendiente" hasta que el panel pericial la apruebe.
 */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/icas.php';
require __DIR__ . '/layout.php';

$errors = [];
$result = null;
$old = $_POST;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();

    $name = post_text('name', 120);
    $osmId = post_text('osm_id', 30);
    $address = post_text('address', 200);
    $email = filter_var(trim((string) ($_POST['contact_email'] ?? '')), FILTER_VALIDATE_EMAIL);
    $auditor = post_text('auditor_name', 80);
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', (string) ($_POST['audited_at'] ?? ''));
    $notes = post_text('notes', 500);

    $m = [
        'avg_db' => post_number('avg_db', 20, 120),
        'peak_db' => post_number('peak_db', 20, 140),
        'reverberation_s' => post_number('reverberation_s', 0.05, 9.99),
        'lux' => post_number('lux', 0, 100000),
        'crowd_density' => post_number('crowd_density', 0, 20),
        'flicker' => ($_POST['flicker'] ?? '') === '1',
    ];

    if (mb_strlen($name) < 2) $errors['name'] = 'Escribe el nombre del establecimiento.';
    if ($osmId !== '' && !preg_match('/^(node|way|relation)-\d{1,15}$/', $osmId)) $errors['osm_id'] = 'El identificador de OpenStreetMap debe verse como way-123456.';
    if (($_POST['contact_email'] ?? '') !== '' && $email === false) $errors['contact_email'] = 'El correo de contacto no es válido.';
    if (mb_strlen($auditor) < 3) $errors['auditor_name'] = 'Escribe el nombre de quien realizó la auditoría.';
    if (!$date || $date > new DateTimeImmutable('today')) $errors['audited_at'] = 'Indica una fecha válida que no esté en el futuro.';
    $labels = ['avg_db' => 'Ruido promedio (20–120 dB)', 'peak_db' => 'Pico sonoro (20–140 dB)', 'reverberation_s' => 'Reverberación (0.05–9.99 s)', 'lux' => 'Iluminación (0–100 000 lux)', 'crowd_density' => 'Aforo (0–20 personas/10 m²)'];
    foreach ($labels as $key => $label) {
        if ($m[$key] === null) $errors[$key] = "$label: valor fuera de rango.";
    }
    if (!isset($errors['peak_db'], $errors['avg_db']) && $m['peak_db'] !== null && $m['avg_db'] !== null && $m['peak_db'] < $m['avg_db']) {
        $errors['peak_db'] = 'El pico sonoro no puede ser menor que el promedio.';
    }

    if (!$errors) {
        $result = calculate_icas($m);
        $pdo = db();
        $pdo->beginTransaction();
        try {
            $estId = null;
            if ($osmId !== '') {
                $q = $pdo->prepare('SELECT id FROM establishments WHERE osm_id = ?');
                $q->execute([$osmId]);
                $estId = $q->fetchColumn() ?: null;
            }
            if (!$estId) {
                $q = $pdo->prepare('INSERT INTO establishments (name, osm_id, address, contact_email) VALUES (?, ?, ?, ?)');
                $q->execute([$name, $osmId ?: null, $address ?: null, $email ?: null]);
                $estId = (int) $pdo->lastInsertId();
            }
            $q = $pdo->prepare(
                'INSERT INTO audits (establishment_id, auditor_name, audited_at, avg_db, peak_db, reverberation_s, lux, flicker, crowd_density, icas, level, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
            );
            $q->execute([
                $estId, $auditor, $date->format('Y-m-d'), $m['avg_db'], $m['peak_db'], $m['reverberation_s'],
                (int) $m['lux'], $m['flicker'] ? 1 : 0, $m['crowd_density'], $result['icas'], $result['level'], $notes ?: null,
            ]);
            $pdo->commit();
            $old = [];
        } catch (Throwable $ex) {
            $pdo->rollBack();
            error_log('submit_audit: ' . $ex->getMessage());
            $errors['name'] = 'No se pudo guardar el acta. Inténtalo de nuevo.';
            $result = null;
        }
    }
}

$v = fn (string $k, string $d = '') => e($old[$k] ?? $d);

page_start('Registrar auditoría');
?>
<h1>Acta de auditoría ambiental</h1>
<p class="lead">Registra las mediciones tomadas en el lugar. El ICAS se calcula al guardar y el acta queda pendiente de revisión pericial.</p>

<?php error_summary($errors); ?>

<?php if ($result): ?>
  <div class="msg ok" role="status">
    <p><strong>Acta registrada.</strong> ICAS: <strong><?= e($result['icas']) ?></strong> (nivel <?= e($result['level']) ?>).</p>
    <ul>
      <?php foreach ($result['components'] as $k => $score): ?>
        <li><?= e(ucfirst($k)) ?>: <?= e($score) ?> / 100</li>
      <?php endforeach; ?>
    </ul>
  </div>
<?php endif; ?>

<form method="post" novalidate class="form">
  <?= csrf_field() ?>
  <fieldset>
    <legend>Establecimiento</legend>
    <label for="name">Nombre (obligatorio)</label>
    <input id="name" name="name" maxlength="120" required value="<?= $v('name') ?>">
    <label for="osm_id">Identificador de OpenStreetMap (opcional)</label>
    <input id="osm_id" name="osm_id" maxlength="30" placeholder="way-4758957" value="<?= $v('osm_id') ?>">
    <label for="address">Dirección (opcional)</label>
    <input id="address" name="address" maxlength="200" value="<?= $v('address') ?>">
    <label for="contact_email">Correo de contacto (opcional)</label>
    <input id="contact_email" name="contact_email" type="email" maxlength="254" value="<?= $v('contact_email') ?>">
  </fieldset>

  <fieldset>
    <legend>Auditoría</legend>
    <label for="auditor_name">Persona auditora (obligatorio)</label>
    <input id="auditor_name" name="auditor_name" maxlength="80" required value="<?= $v('auditor_name') ?>">
    <label for="audited_at">Fecha (obligatorio)</label>
    <input id="audited_at" name="audited_at" type="date" required max="<?= date('Y-m-d') ?>" value="<?= $v('audited_at', date('Y-m-d')) ?>">
  </fieldset>

  <fieldset class="grid">
    <legend>Mediciones</legend>
    <div><label for="avg_db">Ruido promedio dB(A)</label><input id="avg_db" name="avg_db" type="number" step="0.1" min="20" max="120" required value="<?= $v('avg_db') ?>"></div>
    <div><label for="peak_db">Pico sonoro dB(A)</label><input id="peak_db" name="peak_db" type="number" step="0.1" min="20" max="140" required value="<?= $v('peak_db') ?>"></div>
    <div><label for="reverberation_s">Reverberación RT60 (s)</label><input id="reverberation_s" name="reverberation_s" type="number" step="0.01" min="0.05" max="9.99" required value="<?= $v('reverberation_s') ?>"></div>
    <div><label for="lux">Iluminación (lux)</label><input id="lux" name="lux" type="number" step="1" min="0" required value="<?= $v('lux') ?>"></div>
    <div><label for="crowd_density">Aforo (personas / 10 m²)</label><input id="crowd_density" name="crowd_density" type="number" step="0.1" min="0" max="20" required value="<?= $v('crowd_density') ?>"></div>
    <div class="check"><input id="flicker" name="flicker" type="checkbox" value="1" <?= ($old['flicker'] ?? '') === '1' ? 'checked' : '' ?>><label for="flicker">Hay parpadeo visible de luces</label></div>
  </fieldset>

  <label for="notes">Observaciones (opcional)</label>
  <textarea id="notes" name="notes" maxlength="500" rows="4"><?= $v('notes') ?></textarea>

  <button type="submit">Calcular ICAS y guardar acta</button>
</form>
<?php
page_end();
