<?php
declare(strict_types=1);

if (realpath($_SERVER['SCRIPT_FILENAME'] ?? '') === __FILE__) {
    http_response_code(404);
    exit;
}

/**
 * Sello "Sensory Haven Certified": hash HMAC-SHA256 del acta con BADGE_SECRET.
 * Si alguien altera los datos del acta, el hash deja de coincidir.
 */
function badge_payload(array $audit, string $folio): string
{
    return implode('|', [
        $folio, $audit['id'], $audit['establishment_id'], $audit['audited_at'],
        $audit['avg_db'], $audit['peak_db'], $audit['reverberation_s'], $audit['lux'],
        $audit['flicker'], $audit['crowd_density'], $audit['icas'],
    ]);
}

function badge_hash(array $audit, string $folio): string
{
    $secret = nn_env('BADGE_SECRET', '');
    if (strlen($secret) < 32) {
        throw new RuntimeException('Configura BADGE_SECRET (al menos 32 caracteres) en audit-engine/.env');
    }
    return hash_hmac('sha256', badge_payload($audit, $folio), $secret);
}

/** Emite el sello de un acta aprobada con ICAS ≥ 75. Devuelve el folio. */
function issue_badge(int $auditId): string
{
    $pdo = db();
    $q = $pdo->prepare('SELECT * FROM audits WHERE id = ?');
    $q->execute([$auditId]);
    $audit = $q->fetch();
    if (!$audit) throw new InvalidArgumentException('El acta no existe.');
    if ($audit['status'] !== 'approved') throw new InvalidArgumentException('Solo se certifican actas aprobadas.');
    if ((float) $audit['icas'] < 75) throw new InvalidArgumentException('El ICAS debe ser de al menos 75 para certificar.');

    $pdo->beginTransaction();
    try {
        $next = (int) $pdo->query('SELECT COALESCE(MAX(id), 0) + 1 FROM badges')->fetchColumn();
        $folio = sprintf('NN-%s-%06d', date('Y'), $next);
        $q = $pdo->prepare('INSERT INTO badges (folio, audit_id, hash, expires_at) VALUES (?, ?, ?, DATE_ADD(CURDATE(), INTERVAL 1 YEAR))');
        $q->execute([$folio, $auditId, badge_hash($audit, $folio)]);
        $pdo->commit();
        return $folio;
    } catch (Throwable $ex) {
        $pdo->rollBack();
        throw $ex;
    }
}
