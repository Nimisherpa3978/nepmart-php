<?php // Verify with Khalti's lookup API using the stored pidx (not the one in the URL).
require __DIR__.'/../db.php';$no=$_GET['no']??'';
$s=pdo()->prepare('SELECT p.gateway_id,p.amount FROM payments p JOIN orders o ON o.id=p.order_id WHERE o.order_no=?');$s->execute([$no]);$p=$s->fetch();if(!$p)back('failed',$no);
$r=post_json(KHALTI_BASE.'epayment/lookup/',['pidx'=>$p['gateway_id']],['Authorization: key '.KHALTI_SECRET_KEY]);
$st=$r['status']??'';
if($st==='Completed'&&(int)$r['total_amount']===(int)round($p['amount']*100)){set_payment($no,'paid',$r['transaction_id']??null);back('success',$no);}
if(in_array($st,['User canceled','Expired'])){set_payment($no,'cancelled');back('cancelled',$no);}
if($st==='Pending'||$st==='Initiated'){back('failed',$no);}
set_payment($no,'failed');back('failed',$no);
