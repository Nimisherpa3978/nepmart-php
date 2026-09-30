<?php // POST JSON {items:[{id,q}],coupon,ship,pay,info:{name,email,phone,addr,city,prov,zip,note}}
require __DIR__.'/db.php';
$in=json_decode(file_get_contents('php://input'),true)??[];$db=pdo();sess();
if(empty($in['items'])||!in_array($in['pay']??'',['esewa','khalti','cod']))out(['error'=>'Invalid order'],400);
$i=$in['info']??[];
if(!filter_var($i['email']??'',FILTER_VALIDATE_EMAIL)||!preg_match('/^9[78]\d{8}$/',$i['phone']??'')||empty($i['name']))out(['error'=>'Invalid customer details'],422);
$db->beginTransaction();$sub=0;$rows=[];
foreach($in['items'] as $it){ // prices ALWAYS come from the DB, never from the browser
 $s=$db->prepare('SELECT * FROM products WHERE id=? FOR UPDATE');$s->execute([(int)$it['id']]);$p=$s->fetch();$q=max(1,(int)$it['q']);
 if(!$p||$p['stock']<$q){$db->rollBack();out(['error'=>'Item unavailable'],409);}
 $sub+=$p['price']*$q;$rows[]=[$p['id'],$q,$p['price']];}
$d=0;if(!empty($in['coupon'])){$s=$db->prepare('SELECT * FROM coupons WHERE code=? AND active=1');$s->execute([strtoupper($in['coupon'])]);
 if($c=$s->fetch())$d=$c['type']=='pct'?round($sub*$c['value']/100):min($c['value'],$sub);}
$ship=($in['ship']??'std')=='exp'?300:(($sub-$d)>=3000?0:150);$tot=$sub-$d+$ship;$no='NM-'.random_int(1000000,9999999);
$db->prepare('INSERT INTO orders(user_id,order_no,customer_name,email,phone,address,city,province,postal,notes,shipping,subtotal,discount,shipping_fee,total) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)')
 ->execute([$_SESSION['uid']??null,$no,$i['name'],$i['email'],$i['phone'],$i['addr']??'',$i['city']??'',$i['prov']??'',$i['zip']??'',$i['note']??'',$in['ship']=='exp'?'exp':'std',$sub,$d,$ship,$tot]);
$oid=$db->lastInsertId();
foreach($rows as [$pid,$q,$u]){$db->prepare('INSERT INTO order_items(order_id,product_id,qty,unit_price) VALUES(?,?,?,?)')->execute([$oid,$pid,$q,$u]);
 $db->prepare('UPDATE products SET stock=stock-? WHERE id=?')->execute([$q,$pid]);}
$db->prepare('INSERT INTO payments(order_id,method,amount) VALUES(?,?,?)')->execute([$oid,$in['pay'],$tot]);
$db->commit();
$res=['no'=>$no,'amt'=>$tot,'pay'=>$in['pay']];
if($in['pay']=='esewa')$res['redirect']='api/payment/esewa_start.php?no='.$no;
if($in['pay']=='khalti')$res['redirect']='api/payment/khalti_start.php?no='.$no;
out($res);
