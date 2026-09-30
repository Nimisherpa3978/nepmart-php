<?php
require __DIR__ . '/../api/db.php';
require_role('admin', 'employee');
$db = pdo();
$statuses = ['placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $token = $_POST['csrf_token'] ?? '';
    if (!hash_equals(csrf_token(), $token)) {
        http_response_code(403);
        exit('Invalid request token');
    }
    $id = (int)($_POST['order_id'] ?? 0);
    $status = $_POST['status'] ?? '';
    if ($id < 1 || !in_array($status, $statuses, true)) {
        http_response_code(422);
        exit('Invalid order status');
    }
    $stmt = $db->prepare('UPDATE orders SET status=? WHERE id=?');
    $stmt->execute([$status, $id]);
    header('Location: orders.php');
    exit;
}
$rows = $db->query('SELECT id,order_no,customer_name,phone,total,status,created_at FROM orders ORDER BY id DESC')->fetchAll();
$token = htmlspecialchars(csrf_token(), ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="en">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>Manage orders | NepMart</title>
    <link rel="stylesheet" href="../css/style.css">
</head>

<body>
    <main>
        <p><a href="../index.html#/account">← Account</a><?php if (($_SESSION['urole'] ?? '') === 'admin'): ?> · <a href="payments.php">Payment management</a><?php endif; ?></p>
        <h1>Manage orders</h1>
        <table style="width:100%;background:#fff;border-collapse:collapse">
            <thead>
                <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Phone</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Placed</th>
                    <th>Update</th>
                </tr>
            </thead>
            <tbody>
                <?php foreach ($rows as $r): ?><tr>
                        <td><?= htmlspecialchars($r['order_no'], ENT_QUOTES, 'UTF-8') ?></td>
                        <td><?= htmlspecialchars($r['customer_name'], ENT_QUOTES, 'UTF-8') ?></td>
                        <td><?= htmlspecialchars($r['phone'], ENT_QUOTES, 'UTF-8') ?></td>
                        <td>रु <?= number_format($r['total']) ?></td>
                        <td><?= htmlspecialchars(ucwords(str_replace('_', ' ', $r['status'])), ENT_QUOTES, 'UTF-8') ?></td>
                        <td><?= htmlspecialchars($r['created_at'], ENT_QUOTES, 'UTF-8') ?></td>
                        <td>
                            <form method="post"><input type="hidden" name="csrf_token" value="<?= $token ?>"><input type="hidden" name="order_id" value="<?= (int)$r['id'] ?>"><label><span class="skip">Status for <?= htmlspecialchars($r['order_no'], ENT_QUOTES, 'UTF-8') ?></span><select name="status"><?php foreach ($statuses as $status): ?><option value="<?= $status ?>" <?= $status === $r['status'] ? 'selected' : '' ?>><?= htmlspecialchars(ucwords(str_replace('_', ' ', $status)), ENT_QUOTES, 'UTF-8') ?></option><?php endforeach; ?></select></label> <button class="btn sm">Save</button></form>
                        </td>
                    </tr><?php endforeach; ?>
            </tbody>
        </table>
    </main>
</body>

</html>