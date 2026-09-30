<?php require __DIR__.'/db.php'; out(pdo()->query('SELECT * FROM products ORDER BY id')->fetchAll());
