<?php
declare(strict_types=1);

/**
 * Registro formal de psicólogas y psicólogos con cédula profesional.
 * Queda "pendiente" hasta que el panel pericial verifique la cédula en el
 * Registro Nacional de Profesionistas (SEP) y la apruebe manualmente.
 */
require __DIR__ . '/bootstrap.php';
require __DIR__ . '/layout.php';

$errors = [];
$saved = false;
$old = $_POST;

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $fullName = post_text('full_name', 100);
    $cedula = preg_replace('/\D/', '', (string) ($_POST['cedula'] ?? ''));
    $specialty = post_text('specialty', 80);
    $email = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
    $whatsapp = preg_replace('/\D/', '', (string) ($_POST['whatsapp'] ?? ''));
    $consent = ($_POST['consent'] ?? '') === '1';

    if (mb_strlen($fullName) < 5) $errors['full_name'] = 'Escribe tu nombre completo.';
    if (!preg_match('/^\d{7,8}$/', $cedula)) $errors['cedula'] = 'La cédula profesional tiene 7 u 8 dígitos.';
    if (mb_strlen($specialty) < 3) $errors['specialty'] = 'Indica tu especialidad.';
    if ($email === false) $errors['email'] = 'El correo no es válido.';
    if ($whatsapp !== '' && !preg_match('/^\d{10,15}$/', $whatsapp)) $errors['whatsapp'] = 'El WhatsApp debe incluir código de país, solo números (p. ej. 525512345678).';
    if (!$consent) $errors['consent'] = 'Necesitamos tu autorización para verificar la cédula.';

    if (!$errors) {
        try {
            $q = db()->prepare('INSERT INTO professionals (full_name, cedula, specialty, email, whatsapp) VALUES (?, ?, ?, ?, ?)');
            $q->execute([$fullName, $cedula, $specialty, $email, $whatsapp ?: null]);
            $saved = true;
            $old = [];
        } catch (PDOException $ex) {
            if ($ex->getCode() === '23000') {
                $errors['cedula'] = 'Esa cédula ya está registrada.';
            } else {
                error_log('register_professional: ' . $ex->getMessage());
                $errors['full_name'] = 'No se pudo guardar el registro. Inténtalo de nuevo.';
            }
        }
    }
}

$v = fn (string $k) => e($old[$k] ?? '');

page_start('Registro de profesionales');
?>
<h1>Registro de profesionales de salud mental</h1>
<p class="lead">Tu perfil solo aparecerá en NEURONOTE después de que verifiquemos tu cédula profesional. No publicamos disponibilidad que no podamos confirmar.</p>

<?php error_summary($errors); ?>
<?php if ($saved): ?>
  <div class="msg ok" role="status"><p><strong>Registro recibido.</strong> Revisaremos tu cédula y te escribiremos al correo indicado.</p></div>
<?php endif; ?>

<form method="post" novalidate class="form">
  <?= csrf_field() ?>
  <label for="full_name">Nombre completo (obligatorio)</label>
  <input id="full_name" name="full_name" maxlength="100" required autocomplete="name" value="<?= $v('full_name') ?>">

  <label for="cedula">Cédula profesional (obligatorio)</label>
  <input id="cedula" name="cedula" inputmode="numeric" maxlength="8" required value="<?= $v('cedula') ?>">

  <label for="specialty">Especialidad (obligatorio)</label>
  <input id="specialty" name="specialty" maxlength="80" required placeholder="Psicología clínica, terapia cognitivo-conductual…" value="<?= $v('specialty') ?>">

  <label for="email">Correo (obligatorio)</label>
  <input id="email" name="email" type="email" maxlength="254" required autocomplete="email" value="<?= $v('email') ?>">

  <label for="whatsapp">WhatsApp con código de país (opcional)</label>
  <input id="whatsapp" name="whatsapp" inputmode="tel" maxlength="15" value="<?= $v('whatsapp') ?>">

  <div class="check">
    <input id="consent" name="consent" type="checkbox" value="1" <?= ($old['consent'] ?? '') === '1' ? 'checked' : '' ?>>
    <label for="consent">Autorizo que NEURONOTE verifique mi cédula en el Registro Nacional de Profesionistas.</label>
  </div>

  <button type="submit">Enviar registro</button>
</form>
<?php
page_end();
