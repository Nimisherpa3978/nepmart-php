<?php // eSewa sends the customer back here. NEVER trust the redirect: verify with eSewa's status API.
require __DIR__ . '/../db.php';
$no = $_GET['no'] ?? '';
if (($_GET['r'] ?? '') == 'fail') {
    set_payment($no, 'cancelled');
    back('cancelled', $no);
}
$s = pdo()->prepare('SELECT total FROM orders WHERE order_no=?');
$s->execute([$no]);
$o = $s->fetch();
if (!$o) back('failed', $no);
$amt = number_format((float)$o['total'], 2, '.', '');
$r = get_json(ESEWA_STATUS_URL . '?' . http_build_query(['product_code' => ESEWA_PRODUCT_CODE, 'total_amount' => $amt, 'transaction_uuid' => $no]));
$verified = ($r['status'] ?? '') === 'COMPLETE'
    && ($r['product_code'] ?? '') === ESEWA_PRODUCT_CODE
    && ($r['transaction_uuid'] ?? '') === $no
    && isset($r['total_amount'])
    && number_format((float)$r['total_amount'], 2, '.', '') === $amt;
if ($verified) {
    set_payment($no, 'paid', $r['ref_id'] ?? null);
    back('success', $no);
}
set_payment($no, 'failed');
back('failed', $no);
