<?php require __DIR__ . '/../api/db.php';
require_role('admin');
$rows = pdo()->query('SELECT o.order_no,o.customer_name,p.method,p.amount,p.status,o.created_at FROM payments p JOIN orders o ON o.id=p.order_id ORDER BY o.id DESC')->fetchAll(); ?>
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Payments | NepMart</title>
<link rel="stylesheet" href="../css/style.css">
<main>
    <p><a href="../index.html#/account">← Account</a> · <a href="orders.php">Manage orders</a></p>
    <h1>Payment management</h1>
    <table style="width:100%;background:#fff;border-collapse:collapse">
        <tr>
            <th>Order
            <th>Customer
            <th>Method
            <th>Amount
            <th>Status
            <th>Date
        </tr>
        <?php foreach ($rows as $r): ?><tr>
                <td><?= htmlspecialchars($r['order_no'], ENT_QUOTES, 'UTF-8') ?>
                <td><?= htmlspecialchars($r['customer_name'], ENT_QUOTES, 'UTF-8') ?>
                <td><?= htmlspecialchars($r['method'], ENT_QUOTES, 'UTF-8') ?>
                <td>रु <?= number_format($r['amount']) ?>
                <td><b><?= htmlspecialchars(ucfirst($r['status']), ENT_QUOTES, 'UTF-8') ?></b>
                <td><?= htmlspecialchars($r['created_at'], ENT_QUOTES, 'UTF-8') ?>
            </tr><?php endforeach; ?>
    </table>
</main>

</html>