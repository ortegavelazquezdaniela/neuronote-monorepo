<?php
declare(strict_types=1);

/**
 * Panel administrativo pericial (CRUD con PDO y sentencias preparadas):
 * aprobar/rechazar actas, emitir sellos, aprobar/suspender/editar/eliminar profesionales.
 */
require __DIR__ . '/src/bootstrap.php';
require __DIR__ . '/src/layout.php';

require_admin();
$pdo = db();
$flash = isset($_GET['msg']) ? mb_substr((string) $_GET['msg'], 0, 200) : '';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_check();
    $action = (string) ($_POST['action'] ?? '');
    $id = filter_var($_POST['id'] ?? null, FILTER_VALIDATE_INT, ['options' => ['min_range' => 1]]);
    $msg = 'Acción no válida.';

    if ($id) {
        switch ($action) {
            case 'audit_approve':
            case 'audit_reject':
                $q = $pdo->prepare('UPDATE audits SET status = ? WHERE id = ?');
                $q->execute([$action === 'audit_approve' ? 'approved' : 'rejected', $id]);
                $msg = 'Acta actualizada.';
                break;
            case 'pro_approve':
            case 'pro_suspend':
                $q = $pdo->prepare('UPDATE professionals SET status = ?, reviewed_at = NOW() WHERE id = ?');
                $q->execute([$action === 'pro_approve' ? 'approved' : 'suspended', $id]);
                $msg = 'Profesional actualizado.';
                break;
            case 'pro_update':
                $specialty = post_text('specialty', 80);
                $whatsapp = preg_replace('/\D/', '', (string) ($_POST['whatsapp'] ?? ''));
                if (mb_strlen($specialty) < 3 || ($whatsapp !== '' && !preg_match('/^\d{10,15}$/', $whatsapp))) {
                    $msg = 'Datos no válidos: revisa especialidad y WhatsApp.';
                    break;
                }
                $q = $pdo->prepare('UPDATE professionals SET specialty = ?, whatsapp = ? WHERE id = ?');
                $q->execute([$specialty, $whatsapp ?: null, $id]);
                $msg = 'Datos del profesional guardados.';
                break;
            case 'pro_delete':
                $q = $pdo->prepare('DELETE FROM professionals WHERE id = ?');
                $q->execute([$id]);
                $msg = 'Registro eliminado.';
                break;
        }
    }
    header('Location: /?msg=' . rawurlencode($msg), true, 303);
    exit;
}

$audits = $pdo->query(
    'SELECT a.*, e.name, e.osm_id, b.folio
       FROM audits a JOIN establishments e ON e.id = a.establishment_id LEFT JOIN badges b ON b.audit_id = a.id
      ORDER BY a.created_at DESC LIMIT 100'
)->fetchAll();
$pros = $pdo->query('SELECT * FROM professionals ORDER BY FIELD(status, "pending", "approved", "suspended"), created_at DESC LIMIT 200')->fetchAll();

function action_button(string $action, int $id, string $label, string $class = ''): string
{
    return '<form method="post" class="inline">' . csrf_field()
        . '<input type="hidden" name="action" value="' . e($action) . '"><input type="hidden" name="id" value="' . $id . '">'
        . '<button type="submit" class="' . e($class) . '">' . e($label) . '</button></form>';
}

page_start('Panel pericial');
?>
<h1>Panel pericial</h1>
<?php if ($flash): ?><div class="msg ok" role="status"><p><?= e($flash) ?></p></div><?php endif; ?>

<section aria-labelledby="t-audits">
  <h2 id="t-audits">Actas de auditoría</h2>
  <?php if (!$audits): ?>
    <p class="empty">Todavía no hay actas. <a href="/src/submit_audit.php">Registra la primera</a>.</p>
  <?php else: ?>
  <div class="table-wrap"><table>
    <caption class="visually-hidden">Actas registradas, de la más reciente a la más antigua</caption>
    <thead><tr><th scope="col">Lugar</th><th scope="col">Fecha</th><th scope="col">ICAS</th><th scope="col">Estado</th><th scope="col">Acciones</th></tr></thead>
    <tbody>
    <?php foreach ($audits as $a): ?>
      <tr>
        <td><?= e($a['name']) ?><?php if ($a['osm_id']): ?><br><small><?= e($a['osm_id']) ?></small><?php endif; ?></td>
        <td><?= e($a['audited_at']) ?></td>
        <td><strong><?= e($a['icas']) ?></strong> <small><?= e($a['level']) ?></small></td>
        <td><?= e($a['status']) ?></td>
        <td class="actions">
          <?php if ($a['status'] === 'pending'): ?>
            <?= action_button('audit_approve', (int) $a['id'], 'Aprobar') ?>
            <?= action_button('audit_reject', (int) $a['id'], 'Rechazar', 'secondary') ?>
          <?php elseif ($a['folio']): ?>
            <a href="/src/generate_badge.php?folio=<?= e(rawurlencode($a['folio'])) ?>">Ver sello <?= e($a['folio']) ?></a>
          <?php elseif ($a['status'] === 'approved' && (float) $a['icas'] >= 75): ?>
            <form method="post" action="/src/generate_badge.php" class="inline"><?= csrf_field() ?>
              <input type="hidden" name="audit_id" value="<?= (int) $a['id'] ?>"><button type="submit">Emitir sello</button></form>
          <?php else: ?>
            <small>Sin sello (ICAS &lt; 75 o rechazada)</small>
          <?php endif; ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
  <?php endif; ?>
</section>

<section aria-labelledby="t-pros">
  <h2 id="t-pros">Profesionales</h2>
  <p class="small">Antes de aprobar, verifica la cédula en el Registro Nacional de Profesionistas de la SEP.</p>
  <?php if (!$pros): ?>
    <p class="empty">No hay registros. Comparte <a href="/src/register_professional.php">el formulario de registro</a>.</p>
  <?php else: ?>
  <div class="table-wrap"><table>
    <caption class="visually-hidden">Profesionales registrados</caption>
    <thead><tr><th scope="col">Nombre</th><th scope="col">Cédula</th><th scope="col">Estado</th><th scope="col">Editar</th><th scope="col">Acciones</th></tr></thead>
    <tbody>
    <?php foreach ($pros as $p): ?>
      <tr>
        <td><?= e($p['full_name']) ?><br><small><?= e($p['email']) ?></small></td>
        <td><?= e($p['cedula']) ?></td>
        <td><?= e($p['status']) ?></td>
        <td>
          <form method="post" class="edit"><?= csrf_field() ?>
            <input type="hidden" name="action" value="pro_update"><input type="hidden" name="id" value="<?= (int) $p['id'] ?>">
            <label for="sp-<?= (int) $p['id'] ?>">Especialidad</label>
            <input id="sp-<?= (int) $p['id'] ?>" name="specialty" maxlength="80" value="<?= e($p['specialty']) ?>">
            <label for="wa-<?= (int) $p['id'] ?>">WhatsApp</label>
            <input id="wa-<?= (int) $p['id'] ?>" name="whatsapp" maxlength="15" value="<?= e($p['whatsapp']) ?>">
            <button type="submit" class="secondary">Guardar</button>
          </form>
        </td>
        <td class="actions">
          <?php if ($p['status'] !== 'approved'): ?><?= action_button('pro_approve', (int) $p['id'], 'Aprobar') ?><?php endif; ?>
          <?php if ($p['status'] !== 'suspended'): ?><?= action_button('pro_suspend', (int) $p['id'], 'Suspender', 'secondary') ?><?php endif; ?>
          <?= action_button('pro_delete', (int) $p['id'], 'Eliminar', 'danger') ?>
        </td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table></div>
  <?php endif; ?>
</section>
<?php
page_end();
