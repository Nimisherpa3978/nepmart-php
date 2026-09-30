<?php // Builds the signed form and auto-submits the browser to eSewa. No password/PIN/OTP touches NepMart.
require __DIR__ . '/../db.php';
if (parse_url(BASE_URL, PHP_URL_SCHEME) !== 'https' || !parse_url(BASE_URL, PHP_URL_HOST)) {
    http_response_code(503);
    exit('Set NEPMART_BASE_URL to your publicly reachable HTTPS URL before using eSewa.');
}
if (ESEWA_PRODUCT_CODE === '' || ESEWA_SECRET_KEY === '') {
    http_response_code(503);
    exit('Set your eSewa merchant product code and secret key.');
}
$s = pdo()->prepare('SELECT o.order_no,o.total FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.order_no=? AND p.method="esewa" AND p.status="pending"');
$s->execute([$_GET['no'] ?? '']);
$o = $s->fetch();
if (!$o) exit('Order not found');
$amt = number_format((float)$o['total'], 2, '.', '');
$uuid = $o['order_no'];   // transaction_uuid = our order number (must be unique per attempt; append suffix for retries)
$msg = "total_amount=$amt,transaction_uuid=$uuid,product_code=" . ESEWA_PRODUCT_CODE;
$f = [
    'amount' => $amt,
    'tax_amount' => '0',
    'total_amount' => $amt,
    'transaction_uuid' => $uuid,
    'product_code' => ESEWA_PRODUCT_CODE,
    'product_service_charge' => '0',
    'product_delivery_charge' => '0',
    'success_url' => BASE_URL . '/api/payment/esewa_return.php?no=' . $uuid,
    'failure_url' => BASE_URL . '/api/payment/esewa_return.php?r=fail&no=' . $uuid,
    'signed_field_names' => 'total_amount,transaction_uuid,product_code',
    'signature' => base64_encode(hash_hmac('sha256', $msg, ESEWA_SECRET_KEY, true))
];
echo '<!doctype html><html lang="en"><meta charset="utf-8"><title>Redirecting to eSewa</title><form id="f" method="post" action="' . htmlspecialchars(ESEWA_FORM_URL, ENT_QUOTES, 'UTF-8') . '">';
foreach ($f as $k => $v) echo '<input type="hidden" name="' . htmlspecialchars($k, ENT_QUOTES, 'UTF-8') . '" value="' . htmlspecialchars($v, ENT_QUOTES, 'UTF-8') . '">';
echo '</form><p>Redirecting to eSewa…</p><script>f.submit()</script>';
