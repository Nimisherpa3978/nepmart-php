<?php
require __DIR__.'/../db.php';
$s=pdo()->prepare('SELECT o.*,p.id pid FROM orders o JOIN payments p ON p.order_id=o.id WHERE o.order_no=? AND p.method="khalti" AND p.status="pending"');$s->execute([$_GET['no']??'']);$o=$s->fetch();if(!$o)exit('Order not found');
$r=post_json(KHALTI_BASE.'epayment/initiate/',[
 'return_url'=>BASE_URL.'/api/payment/khalti_return.php?no='.$o['order_no'],'website_url'=>BASE_URL,
 'amount'=>(int)round($o['total']*100),   // Khalti uses paisa
 'purchase_order_id'=>$o['order_no'],'purchase_order_name'=>'NepMart order '.$o['order_no'],
 'customer_info'=>['name'=>$o['customer_name'],'email'=>$o['email'],'phone'=>$o['phone']]],['Authorization: key '.KHALTI_SECRET_KEY]);
if(empty($r['payment_url'])){set_payment($o['order_no'],'failed');back('failed',$o['order_no']);}
pdo()->prepare('UPDATE payments SET gateway_id=? WHERE id=?')->execute([$r['pidx'],$o['pid']]);
header('Location: '.$r['payment_url']);
