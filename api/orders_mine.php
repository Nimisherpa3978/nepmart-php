<?php require __DIR__.'/db.php';sess();if(empty($_SESSION['uid']))out(['error'=>'Login required'],401);
$s=pdo()->prepare('SELECT o.order_no,o.total,o.status,o.created_at,p.method,p.status pay_status FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.user_id=? ORDER BY o.id DESC');
$s->execute([$_SESSION['uid']]);out($s->fetchAll());
