const $ = (s, r = document) => r.querySelector(s),
  M = $("#main");
const rs = (n) => "रु " + n.toLocaleString("en-IN");
const ld = (k, d) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? d;
  } catch {
    return d;
  }
};
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const sv = (k, v) => {
  try {
    localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};
let cart = ld("nm_cart", []),
  wish = ld("nm_wish", []),
  recent = ld("nm_recent", []),
  coupon = ld("nm_coupon", null),
  co = ld("nm_co", { step: 0, info: {}, ship: "std", pay: "esewa" }),
  order = ld("nm_order", null);
const pid = (id) => P.find((p) => p.id == id),
  off = (p) =>
    p.old > p.price ? Math.round(100 - (p.price * 100) / p.old) : 0;
function toast(m, bad) {
  const t = document.createElement("div");
  t.className = "toast" + (bad ? " bad" : "");
  t.textContent = m;
  $("#toasts").append(t);
  setTimeout(() => t.remove(), 2600);
}
function save() {
  sv("nm_cart", cart);
  sv("nm_wish", wish);
  sv("nm_coupon", coupon);
  sv("nm_co", co);
  sv("nm_order", order);
  $("#cc").textContent = cart.reduce((a, c) => a + c.q, 0);
}
function add(id, q = 1) {
  const p = pid(id);
  if (!p.stock) return toast("Out of stock", "bad");
  const c = cart.find((x) => x.id == id);
  c ? (c.q = Math.min(c.q + q, p.stock)) : cart.push({ id: +id, q });
  save();
  toast(p.name + " added to cart");
}
function toggleWish(id) {
  const i = wish.indexOf(+id);
  i < 0 ? wish.push(+id) : wish.splice(i, 1);
  save();
  toast(i < 0 ? "Saved to wishlist" : "Removed from wishlist");
  route();
}
function totals() {
  const sub = cart.reduce((a, c) => a + pid(c.id).price * c.q, 0);
  let d = 0;
  if (coupon) {
    const c = COUPONS[coupon];
    d = c.t == "pct" ? Math.round((sub * c.v) / 100) : Math.min(c.v, sub);
  }
  const ship = !cart.length
    ? 0
    : co.ship == "exp"
      ? 300
      : sub - d >= 3000
        ? 0
        : 150;
  return { sub, d, ship, tot: sub - d + ship };
}
function card(p) {
  const o = off(p);
  return `<article class="card"><div class="img" style="background:${p.bg}" role="img" aria-label="${p.name}" data-q="${p.id}">${p.icon}${o ? `<span class="badge">-${o}%</span>` : ""}
<button class="wish ${wish.includes(p.id) ? "on" : ""}" data-w="${p.id}" aria-label="Toggle wishlist for ${p.name}" aria-pressed="${wish.includes(p.id)}">♥</button></div>
<div class="body"><h3><a href="#/product/${p.id}">${p.name}</a></h3><div aria-label="Rated ${p.rating} of 5">★ ${p.rating}</div>
<div class="price"><b>${rs(p.price)}</b>${o ? `<s>${rs(p.old)}</s>` : ""}</div>
<span class="stock ${!p.stock ? "out" : p.stock < 6 ? "low" : ""}">${!p.stock ? "Out of stock" : p.stock < 6 ? "Only " + p.stock + " left" : "In stock"}</span>
<div class="row"><button class="btn sm" data-a="${p.id}" ${p.stock ? "" : "disabled"}>Add to cart</button><button class="btn sm alt" data-q="${p.id}">Quick view</button></div></div></article>`;
}
const sec = (t, l) =>
  `<h2>${t}</h2><div class="grid">${l.map(card).join("")}</div>`;
const crumbs = (...a) =>
  `<nav class="crumbs" aria-label="Breadcrumb"><a href="#/">Home</a>${a.map((x) => " / " + x).join("")}</nav>`;

function home() {
  const rv = recent.map(pid).filter(Boolean);
  M.innerHTML = `<section class="hero"><div><h1>Local makers. Everyday finds. One cart.</h1><p>From Ilam tea to Dhaka topi, shop Nepal's best in NPR with delivery across the valley and beyond.</p>
<p><a class="btn" href="#/shop">Shop now</a> <a class="btn alt" href="#/shop">Explore categories</a></p></div>
<div class="stack" aria-hidden="true"><div class="tile t1">🎩</div><div class="tile t2">🍵</div><div class="tile t3">🔔</div></div></section>
<div class="cats">${CATS.map((c) => `<a href="#/shop/${encodeURIComponent(c)}">${c}</a>`).join("")}</div>
${sec("Trending now", P.filter((p) => p.rating >= 4.6).slice(0, 4))}
<div class="deal"><div><h2>Tihar-ready savings</h2><p>Use <code>WELCOME10</code> for 10% off or <code>SAVE200</code> for रु 200 off.</p></div><a class="btn alt" href="#/shop">See deals</a></div>
${sec("New arrivals", P.slice(-4))}
${rv.length ? sec("Recently viewed", rv.slice(0, 4)) : ""}
<h2>Why NepMart</h2><div class="perks"><div><b>Cash on delivery</b><br>Pay when your order arrives.</div><div><b>Secure wallets</b><br>eSewa and Khalti checkout happens on their site.</div><div><b>7-day returns</b><br>Easy returns on eligible items.</div></div>`;
}

let F = { q: "", cat: "", max: 10000, avail: false, sort: "pop", page: 1 };
function shop(cat) {
  if (cat !== undefined) F.cat = decodeURIComponent(cat || "");
  let l = P.filter(
    (p) =>
      (!F.cat || p.cat == F.cat) &&
      p.price <= F.max &&
      (!F.avail || p.stock) &&
      p.name.toLowerCase().includes(F.q.toLowerCase()),
  );
  l.sort((a, b) =>
    F.sort == "lo"
      ? a.price - b.price
      : F.sort == "hi"
        ? b.price - a.price
        : b.rating - a.rating,
  );
  const per = 6,
    pages = Math.max(1, Math.ceil(l.length / per));
  F.page = Math.min(F.page, pages);
  M.innerHTML = `${crumbs("Shop" + (F.cat ? " / " + F.cat : ""))}<h1>${F.cat || "All products"}</h1><button class="btn alt sm fbtn" id="fb">Filters</button>
<div class="layout"><aside class="filters" id="fl" aria-label="Filters"><div class="field"><label for="fc">Category</label><select id="fc"><option value="">All</option>${CATS.map((c) => `<option ${c == F.cat ? "selected" : ""}>${c}</option>`).join("")}</select></div>
<div class="field"><label for="fm">Max price: ${rs(+F.max)}</label><input id="fm" type="range" min="500" max="10000" step="250" value="${F.max}"></div>
<label><input type="checkbox" id="fa" ${F.avail ? "checked" : ""}> In stock only</label>
<div class="field"><label for="fs">Sort by</label><select id="fs"><option value="pop" ${F.sort == "pop" ? "selected" : ""}>Top rated</option><option value="lo" ${F.sort == "lo" ? "selected" : ""}>Price: low to high</option><option value="hi" ${F.sort == "hi" ? "selected" : ""}>Price: high to low</option></select></div></aside>
<div>${
    l.length
      ? `<div class="grid">${l
          .slice((F.page - 1) * per, F.page * per)
          .map(card)
          .join("")}</div>
<p>${Array.from({ length: pages }, (_, i) => `<button class="btn sm ${i + 1 == F.page ? "" : "alt"}" data-pg="${i + 1}" aria-label="Page ${i + 1}">${i + 1}</button>`).join(" ")}</p>`
      : `<div class="empty"><h2>No products match</h2><p>Try a higher price limit or clear the category.</p><button class="btn" id="clr">Clear filters</button></div>`
  }</div></div>`;
  const re = () => {
    F.page = 1;
    shop();
  };
  $("#fb").onclick = () => $("#fl").classList.toggle("open");
  $("#fc").onchange = (e) => {
    F.cat = e.target.value;
    re();
  };
  $("#fm").onchange = (e) => {
    F.max = e.target.value;
    re();
  };
  $("#fa").onchange = (e) => {
    F.avail = e.target.checked;
    re();
  };
  $("#fs").onchange = (e) => {
    F.sort = e.target.value;
    re();
  };
  const c = $("#clr");
  if (c)
    c.onclick = () => {
      F = { q: "", cat: "", max: 10000, avail: false, sort: "pop", page: 1 };
      shop();
    };
}

function product(id) {
  const p = pid(id);
  if (!p)
    return (M.innerHTML = `<div class="empty"><h2>Product not found</h2><a class="btn" href="#/shop">Back to shop</a></div>`);
  recent = [p.id, ...recent.filter((x) => x != p.id)].slice(0, 8);
  sv("nm_recent", recent);
  let q = 1;
  M.innerHTML = `${crumbs(`<a href="#/shop/${encodeURIComponent(p.cat)}">${p.cat}</a>`, p.name)}<div class="two"><div class="big" style="background:${p.bg}" role="img" aria-label="${p.name} product image (hover to zoom)"><span>${p.icon}</span></div>
<div><h1>${p.name}</h1><p>★ ${p.rating} · 128 reviews</p><p class="price"><b style="font-size:28px">${rs(p.price)}</b>${off(p) ? `<s>${rs(p.old)}</s> <span class="badge" style="position:static">-${off(p)}%</span>` : ""}</p><p>${p.desc}</p>
<div class="qty" role="group" aria-label="Quantity"><button id="m" aria-label="Decrease">−</button><span id="n">1</span><button id="pl" aria-label="Increase">+</button></div>
<p><button class="btn" id="ad" ${p.stock ? "" : "disabled"}>Add to cart</button> <button class="btn ok" id="bn" ${p.stock ? "" : "disabled"}>Buy now</button> <button class="btn alt" data-w="${p.id}">${wish.includes(p.id) ? "Saved ♥" : "Wishlist ♡"}</button></p>
<ul><li>Delivery: 1–2 days in Kathmandu Valley, 3–5 days elsewhere</li><li>Returns: 7 days on eligible items</li><li>Payment: eSewa, Khalti or Cash on Delivery</li></ul></div></div>
${sec("Similar products", P.filter((x) => x.cat == p.cat && x.id != p.id).slice(0, 4))}`;
  $("#m").onclick = () => ($("#n").textContent = q = Math.max(1, q - 1));
  $("#pl").onclick = () => ($("#n").textContent = q = Math.min(p.stock, q + 1));
  $("#ad").onclick = () => add(p.id, q);
  $("#bn").onclick = () => {
    add(p.id, q);
    location.hash = "#/checkout";
  };
}

function cartPage() {
  if (!cart.length)
    return (M.innerHTML = `<div class="empty"><h2>Your cart is empty</h2><p>Add something from the shop to get started.</p><a class="btn" href="#/shop">Continue shopping</a></div>`);
  const t = totals();
  M.innerHTML = `${crumbs("Cart")}<h1>Your cart</h1><div class="layout" style="grid-template-columns:1fr 340px"><div>${cart
    .map((c) => {
      const p = pid(c.id);
      return `<div class="cartrow"><div class="th" style="background:${p.bg}">${p.icon}</div><div><b>${p.name}</b><br>${rs(p.price)}</div>
<div class="qty"><button data-d="${p.id}" aria-label="Decrease ${p.name}">−</button><span>${c.q}</span><button data-i="${p.id}" aria-label="Increase ${p.name}">+</button></div><button class="btn sm alt" data-r="${p.id}">Remove</button></div>`;
    })
    .join("")}<a href="#/shop">← Continue shopping</a></div>
<aside class="sum"><div class="field"><label for="cp">Coupon code</label><input id="cp" value="${coupon || ""}" placeholder="WELCOME10"><button class="btn sm" id="ap">Apply</button></div>
<p><span>Subtotal</span><span>${rs(t.sub)}</span></p><p><span>Discount</span><span>− ${rs(t.d)}</span></p><p><span>Shipping</span><span>${t.ship ? rs(t.ship) : "Free"}</span></p><p class="tot"><span>Total</span><span>${rs(t.tot)}</span></p><a class="btn ok" href="#/checkout">Proceed to checkout</a></aside></div>`;
  $("#ap").onclick = () => {
    const v = $("#cp").value.trim().toUpperCase();
    if (COUPONS[v]) {
      coupon = v;
      toast(COUPONS[v].m);
    } else {
      coupon = null;
      toast("Coupon not valid. Try WELCOME10 or SAVE200", "bad");
    }
    save();
    cartPage();
  };
}

const STEPS = ["Address", "Delivery", "Payment", "Confirm"];
function checkout() {
  if (!cart.length) return (location.hash = "#/cart");
  const t = totals(),
    i = co.info;
  const steps = `<ol class="steps">${STEPS.map((s, n) => `<li class="${n < co.step ? "done" : n == co.step ? "on" : ""}" ${n == co.step ? 'aria-current="step"' : ""}>${s}</li>`).join("")}</ol>`;
  const F_ = (id, l, type = "text", req = 1) =>
    `<div class="field"><label for="${id}">${l}</label><input id="${id}" type="${type}" value="${i[id] || ""}" ${req ? "required" : ""}><span class="err" id="e_${id}"></span></div>`;
  let body = "";
  if (co.step == 0)
    body = `<form id="f" novalidate><div class="fgrid">${F_("name", "Full name")}${F_("email", "Email", "email")}${F_("phone", "Phone (98XXXXXXXX)", "tel")}${F_("city", "City / Municipality")}${F_("addr", "Street address")}
<div class="field"><label for="prov">Province</label><select id="prov">${["Koshi", "Madhesh", "Bagmati", "Gandaki", "Lumbini", "Karnali", "Sudurpashchim"].map((x) => `<option ${i.prov == x ? "selected" : ""}>${x}</option>`).join("")}</select></div>${F_("zip", "Postal code", "text", 0)}</div>
<div class="field"><label for="note">Order notes</label><textarea id="note">${i.note || ""}</textarea></div><button class="btn">Continue to delivery</button></form>`;
  if (co.step == 1)
    body = `<form id="f">${[
      [
        "std",
        "Standard delivery",
        "3–5 days · free above रु 3,000, else रु 150",
      ],
      ["exp", "Express delivery", "Next day in valley · रु 300"],
    ]
      .map(
        ([v, a, b]) =>
          `<label class="pay"><input type="radio" name="sh" value="${v}" ${co.ship == v ? "checked" : ""}><span><b>${a}</b><small>${b}</small></span></label>`,
      )
      .join(
        "",
      )}<button class="btn alt" type="button" id="bk">Back</button> <button class="btn">Continue to payment</button></form>`;
  if (co.step == 2)
    body = `<form id="f"><h2 style="margin-top:0">Choose payment method</h2>${[
      ["esewa", "eSewa", "#60bb46", "Pay securely using eSewa"],
      [
        "khalti",
        "Khalti / Other",
        "#5c2d91",
        "Pay securely using another supported digital wallet",
      ],
      ["cod", "Cash on Delivery", "#0D9488", "Pay when your order arrives"],
    ]
      .map(
        ([v, n, c, d]) =>
          `<label class="pay"><input type="radio" name="pm" value="${v}" ${co.pay == v ? "checked" : ""}><i style="background:${c}" aria-hidden="true">${n[0]}</i><span><b>${n}</b><small>${d}</small>${v != "cod" ? `<span class="lock">🔒 You will pay on the provider's secure page. NepMart never sees your PIN or OTP.</span>` : ""}</span></label>`,
      )
      .join("")}
<button class="btn alt" type="button" id="bk">Back</button> <button class="btn ok">Place order</button></form>`;
  M.innerHTML = `${crumbs("Checkout")}<h1>Checkout</h1>${steps}<div class="layout" style="grid-template-columns:1fr 340px"><div>${body}</div><aside class="sum"><h3>Order summary</h3>${cart.map((c) => `<p><span>${pid(c.id).name} × ${c.q}</span><span>${rs(pid(c.id).price * c.q)}</span></p>`).join("")}<p><span>Discount</span><span>− ${rs(t.d)}</span></p><p><span>Shipping</span><span>${rs(t.ship)}</span></p><p class="tot"><span>Total</span><span>${rs(t.tot)}</span></p></aside></div>`;
  const go = (n) => {
      co.step = n;
      save();
      checkout();
    },
    bk = $("#bk");
  if (bk) bk.onclick = () => go(co.step - 1);
  $("#f").onsubmit = (e) => {
    e.preventDefault();
    if (co.step == 0) {
      let ok = true;
      const rule = {
        name: (v) => v.length > 2,
        email: (v) => /^\S+@\S+\.\S+$/.test(v),
        phone: (v) => /^9[78]\d{8}$/.test(v),
        city: (v) => v,
        addr: (v) => v,
      };
      for (const k in rule) {
        const v = $("#" + k).value.trim();
        i[k] = v;
        $("#e_" + k).textContent = rule[k](v)
          ? ""
          : "Please enter a valid " + k;
        if (!rule[k](v)) ok = false;
      }
      i.prov = $("#prov").value;
      i.zip = $("#zip").value;
      i.note = $("#note").value;
      save();
      if (ok) go(1);
    } else if (co.step == 1) {
      co.ship = e.target.sh.value;
      go(2);
    } else {
      co.pay = e.target.pm.value;
      save();
      place();
    }
  };
}

async function place() {
  const t = totals(),
    btn = $(".btn.ok");
  btn.disabled = true;
  try {
    const r = await fetch("api/order.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart,
        coupon,
        ship: co.ship,
        pay: co.pay,
        info: co.info,
      }),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Could not place order");
    order = {
      no: d.no,
      pay: d.pay,
      amt: d.amt,
      date: new Date().toLocaleDateString("en-GB"),
      status: "pending",
      addr: co.info,
    };
    save();
    if (d.redirect) location.href = d.redirect;
    else {
      location.hash = "#/result/success";
    }
  } catch (e) {
    btn.disabled = false;
    toast(e.message, "bad");
  }
}
function pay() {
  if (!order) return (location.hash = "#/cart");
  const n = order.pay == "esewa" ? "eSewa" : "Khalti";
  M.innerHTML = `<div class="state"><div class="spin"></div><h2>Redirecting to ${n}…</h2><p>Order ${order.no} · ${rs(order.amt)}</p>
<div class="demo"><b>Demo mode.</b> In production this step redirects to ${n}'s own secure page, and your server verifies the result before confirming. Choose a demo outcome:</div>
<p><button class="btn ok" data-res="success">Demo: payment successful</button> <button class="btn alt" data-res="failed">Demo: failed</button> <button class="btn alt" data-res="cancelled">Demo: cancelled</button></p></div>`;
}
function result(s) {
  if (!order) return (location.hash = "#/");
  const back = `<a class="btn alt" href="#/checkout" id="cp2">Choose another payment method</a>`;
  const V = {
    success: [
      "s",
      "✓",
      "Payment Successful ✓",
      `Order ${order.no} · ${order.pay.toUpperCase()} · ${rs(order.amt)} · ${order.date}<br>Transaction reference: <i>(placeholder — issued by provider)</i>`,
    ],
    failed: [
      "f",
      "!",
      "Payment Failed",
      "We couldn't complete your payment. Your cart and details are saved.",
    ],
    cancelled: [
      "c",
      "×",
      "Payment Cancelled",
      "You cancelled the payment. Nothing was charged.",
    ],
  }[s];
  if (s == "success") {
    order.status = order.pay == "cod" ? "cod" : "paid";
    const o = order;
    cart = [];
    coupon = null;
    co.step = 0;
    save();
  }
  M.innerHTML = `<div class="state"><div class="ic ${V[0]}">${V[1]}</div><h1>${V[2]}</h1><p>${V[3]}</p>${
    s == "success"
      ? `<a class="btn" href="#/track">Track order</a> <a class="btn alt" href="#/shop">Continue shopping</a>`
      : `${s == "failed" ? `<p><a class="btn" href="#/pay">Try again</a></p>` : ""}<p>${back} <a href="#/checkout" id="rc">Return to checkout</a></p>`
  }</div>`;
  document.getElementById("cp2")?.addEventListener("click", () => {
    co.step = 2;
    save();
  });
  document.getElementById("rc")?.addEventListener("click", () => {
    co.step = 0;
    save();
  });
}
function track() {
  if (!order)
    return (M.innerHTML = `<div class="empty"><h2>No orders yet</h2><a class="btn" href="#/shop">Start shopping</a></div>`);
  const L = [
      "Order placed",
      "Payment confirmed",
      "Processing",
      "Shipped",
      "Out for delivery",
      "Delivered",
    ],
    cod = order.pay == "cod",
    done = cod ? 1 : 2;
  M.innerHTML = `<div class="state" style="max-width:640px"><h1>Order ${order.no}</h1><p><b>${cod ? "Cash on Delivery — pay " + rs(order.amt) + " when it arrives" : "Paid via " + order.pay.toUpperCase()}</b></p>
<ol class="tl">${L.map((l, n) => `<li class="${n < done ? "done" : ""}">${l === "Payment confirmed" && cod ? "Payment due on delivery" : l}</li>`).join("")}</ol><p>Estimated delivery: 3–5 days</p></div>`;
}

async function refreshAuthNav() {
  const link = $("#auth-link"),
    logout = $("#nav-logout");
  try {
    const response = await fetch("api/auth.php?action=me");
    const data = await response.json();
    link.textContent = data.user ? "Account" : "Log in";
    logout.hidden = !data.user;
  } catch {
    link.textContent = "Log in";
    logout.hidden = true;
  }
}

async function logoutCurrentUser() {
  try {
    const response = await fetch("api/auth.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Could not log out");
    await refreshAuthNav();
    toast("Logged out");
    if (location.hash === "#/account") account();
  } catch (error) {
    toast(error.message || "Could not log out", true);
  }
}

async function account() {
  const j = async (u, b) =>
    (
      await fetch(
        u,
        b
          ? {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(b),
            }
          : {},
      )
    ).json();
  let me;
  try {
    me = await j("api/auth.php?action=me");
  } catch {
    return (M.innerHTML = `<div class="empty"><h2>Server not reachable</h2><p>Run <code>php -S localhost:8000</code> and open the site from that address.</p></div>`);
  }
  if (!me.user) {
    const fm = (id, t, extra) =>
      `<form id="${id}" class="sum" style="position:static"><h2 style="margin-top:0">${t}</h2>${extra}<div class="field"><label for="${id}e">Email</label><input id="${id}e" type="email" required></div><div class="field"><label for="${id}p">Password</label><input id="${id}p" type="password" minlength="8" required></div><p class="err" id="${id}r" role="alert"></p><button class="btn">${t}</button></form>`;
    M.innerHTML = `${crumbs("Account")}<div class="two">${fm("lg", "Log in", "")}${fm("rg", "Create account", '<div class="field"><label for="rgn">Full name</label><input id="rgn" required></div>')}</div>`;
    for (const [id, a] of [
      ["lg", "login"],
      ["rg", "register"],
    ])
      $("#" + id).onsubmit = async (e) => {
        e.preventDefault();
        const d = await j("api/auth.php", {
          action: a,
          name: $("#rgn")?.value,
          email: $("#" + id + "e").value,
          password: $("#" + id + "p").value,
        });
        if (d.error) $("#" + id + "r").textContent = d.error;
        else {
          toast("Welcome, " + d.user.name);
          await refreshAuthNav();
          account();
        }
      };
    return;
  }
  const o = await j("api/orders_mine.php");
  M.innerHTML = `${crumbs("Account")}<h1>Hi, ${me.user.name}</h1><button class="btn alt sm" id="lo">Log out</button><h2>Your orders</h2>${Array.isArray(o) && o.length ? o.map((x) => `<div class="cartrow" style="grid-template-columns:1fr auto"><div><b>${x.order_no}</b><br>${x.created_at} · ${x.method.toUpperCase()}</div><div>${rs(+x.total)}<br><small>Payment: ${x.pay_status}</small></div></div>`).join("") : `<div class="empty"><p>No orders yet.</p><a class="btn" href="#/shop">Start shopping</a></div>`}
<p>Account type: <b>${me.user.role}</b></p>${me.user.role === "admin" || me.user.role === "employee" ? `<p><a class="btn" href="admin/orders.php">Manage orders</a> ${me.user.role === "admin" ? `<a class="btn alt" href="admin/payments.php">Payments</a>` : ""}</p>` : ""}
<h2>Wishlist</h2>${wish.length ? `<div class="grid">${wish.map(pid).map(card).join("")}</div>` : `<p>Nothing saved yet. Tap ♥ on any product.</p>`}`;
  $("#lo").onclick = async () => {
    logoutCurrentUser();
  };
}

function modal(id) {
  const p = pid(id),
    m = $("#modal");
  m.hidden = false;
  $(".sheet", m).innerHTML =
    `<h2 id="mt" style="margin-top:0">${p.name}</h2><div class="two"><div class="big" style="background:${p.bg};font-size:90px">${p.icon}</div><div><p>${p.desc}</p><p><b>${rs(p.price)}</b></p><button class="btn" data-a="${p.id}">Add to cart</button> <a class="btn alt" href="#/product/${p.id}" data-x>Full details</a> <button class="btn alt" data-x>Close</button></div></div>`;
  $(".sheet button", m).focus();
}
const closeM = () => ($("#modal").hidden = true);

document.addEventListener("click", (e) => {
  const t = e.target.closest(
    "[data-a],[data-w],[data-q],[data-x],[data-d],[data-i],[data-r],[data-pg],[data-res]",
  );
  if (!t) return;
  const d = t.dataset;
  if (d.a) add(d.a);
  else if (d.w) toggleWish(d.w);
  else if (d.q) modal(d.q);
  else if ("x" in d) closeM();
  else if (d.d || d.i || d.r) {
    const c = cart.find((x) => x.id == (d.d || d.i || d.r));
    if (d.d) c.q--;
    if (d.i) c.q = Math.min(c.q + 1, pid(c.id).stock);
    if (d.r || c.q < 1) cart = cart.filter((x) => x != c);
    save();
    cartPage();
  } else if (d.pg) {
    F.page = +d.pg;
    shop();
    scrollTo(0, 0);
  } else if (d.res) location.hash = "#/result/" + d.res;
});
document.addEventListener("keydown", (e) => {
  if (e.key == "Escape") closeM();
});
$("#modal").addEventListener("click", (e) => {
  if (e.target.id == "modal") closeM();
});
const q = $("#q"),
  sg = $("#sugg");
q.oninput = () => {
  const v = q.value.toLowerCase(),
    r = v ? P.filter((p) => p.name.toLowerCase().includes(v)).slice(0, 5) : [];
  sg.hidden = !r.length;
  sg.innerHTML = r
    .map(
      (p) =>
        `<li role="option" tabindex="0" data-go="${p.id}">${p.icon} ${p.name}</li>`,
    )
    .join("");
};
sg.onclick = sg.onkeydown = (e) => {
  const li = e.target.closest("li");
  if (li && (e.type == "click" || e.key == "Enter")) {
    location.hash = "#/product/" + li.dataset.go;
    sg.hidden = true;
    q.value = "";
  }
};
q.onkeydown = (e) => {
  if (e.key == "Enter") {
    F.q = q.value;
    F.cat = "";
    sg.hidden = true;
    location.hash = "#/shop";
    route();
  }
};

function route() {
  closeM();
  const [, r, a] = location.hash.split("/");
  M.innerHTML = `<div class="grid" style="padding-top:40px">${'<div class="sk"></div>'.repeat(4)}</div>`;
  setTimeout(() => {
    (
      ({
        "": home,
        shop: () => shop(a),
        product: () => product(a),
        cart: cartPage,
        checkout,
        pay,
        result: () => result(a),
        track,
        account,
      })[r || ""] || home
    )();
    M.focus();
    scrollTo(0, 0);
  }, 120);
}
async function boot() {
  $("#nav-logout").addEventListener("click", logoutCurrentUser);
  refreshAuthNav();
  try {
    const r = await fetch("api/products.php");
    if (r.ok) {
      const rows = await r.json();
      if (Array.isArray(rows) && rows.length) {
        const old = Object.fromEntries(P.map((p) => [p.id, p]));
        P.splice(
          0,
          P.length,
          ...rows.map((d) => ({
            id: +d.id,
            name: d.name,
            cat: d.category,
            price: +d.price,
            old: +(d.old_price || d.price),
            rating: +d.rating,
            stock: +d.stock,
            desc: d.description,
            icon: old[d.id]?.icon || "🛍️",
            bg: old[d.id]?.bg || "#e2e8f0",
          })),
        );
      }
    }
  } catch {}
  addEventListener("hashchange", route);
  save();
  route();
}
boot();
