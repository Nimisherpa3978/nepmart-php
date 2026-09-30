const CATS=["Fashion","Home & Craft","Food & Tea","Electronics"];
const P=[
[1,"Dhaka Topi (Premium)","Fashion",1800,2200,4.7,25,"🎩","#e0e7ff","Hand-woven Dhaka fabric cap from Palpa. Breathable, festival-ready."],
[2,"Pashmina Shawl","Fashion",6500,8000,4.8,8,"🧣","#fce7f3","Soft Himalayan pashmina blend, 70x200 cm."],
[3,"Tibetan Singing Bowl","Home & Craft",3200,3200,4.6,14,"🔔","#fef3c7","Hand-hammered bowl with mallet and cushion."],
[4,"Thanka Wall Art","Home & Craft",4200,5000,4.5,3,"🖼️","#ffedd5","Hand-painted mandala thanka, 30x40 cm."],
[5,"Ilam Orthodox Tea (250g)","Food & Tea",850,1000,4.9,60,"🍵","#dcfce7","Whole-leaf tea from the hills of Ilam."],
[6,"Himalayan Honey (500g)","Food & Tea",720,720,4.4,0,"🍯","#fef9c3","Wild honey from Gorkha. Currently out of stock."],
[7,"Wireless Earbuds","Electronics",2400,3200,4.2,40,"🎧","#dbeafe","Bluetooth 5.3, 24-hour battery, USB-C."],
[8,"Power Bank 20,000mAh","Electronics",2900,3400,4.3,5,"🔋","#ccfbf1","Fast charging, dual output, load-shedding ready."],
[9,"Lokta Paper Journal","Home & Craft",550,700,4.6,32,"📓","#f5f5f4","Handmade Lokta paper, 120 pages."],
[10,"Yak Wool Socks","Fashion",650,800,4.5,44,"🧦","#ede9fe","Warm trekking socks, pack of 2."],
[11,"Timur Pepper (100g)","Food & Tea",380,450,4.7,70,"🌶️","#fee2e2","Citrusy Sichuan-style pepper from the hills."],
[12,"Smart Watch","Electronics",4800,6000,4.1,12,"⌚","#e0f2fe","Heart-rate, step tracking, 7-day battery."]
].map(a=>({id:a[0],name:a[1],cat:a[2],price:a[3],old:a[4],rating:a[5],stock:a[6],icon:a[7],bg:a[8],desc:a[9]}));
const COUPONS={WELCOME10:{t:"pct",v:10,m:"10% off applied"},SAVE200:{t:"flat",v:200,m:"रु 200 off applied"}};
