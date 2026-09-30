# NepMart (HTML/CSS/JS + PHP + MySQL)

1. Import `db/schema.sql` (phpMyAdmin / `mysql < db/schema.sql`).
2. Configure the database in `api/config.php`. eSewa test mode uses the official UAT merchant code and test key by default.
3. In this folder run: `php -S localhost:8000` (needs PHP 8+ with pdo_mysql and curl enabled; XAMPP optional)
4. Open http://localhost:8000 and create an account. Promote trusted accounts to staff using the SQL below; staff then sign in through Account.

## eSewa setup

- Default `ESEWA_MODE` is `test`; it uses `EPAYTEST`, eSewa's published UAT secret, and the official test form/status URLs.
- At the eSewa-hosted test login, use eSewa ID `9711111111` (or `9711111112` / `9711111113`), password `Test@123`, and token `123456`. MPIN `1122` is for app-based flows. Do not put these payer login details into NepMart.
- The SDK `client_id`/`client_secret` and Intent product code belong to different integrations and are not used by this website's ePay v2 redirect flow. The merchant code and secret are already configured for test mode in `api/config.php`.
- eSewa requires the success/failure URLs to be reachable. For local testing, expose the PHP server with an HTTPS tunnel, then set `NEPMART_BASE_URL` to the tunnel URL. Example PowerShell setup before starting PHP: `$env:NEPMART_BASE_URL='https://your-tunnel-host'; php -S localhost:8000`.
- Live mode requires your own merchant credentials and a public HTTPS site: set `ESEWA_MODE=live`, `ESEWA_PRODUCT_CODE`, `ESEWA_SECRET_KEY`, and `NEPMART_BASE_URL` in the server environment. The live eSewa endpoints are selected automatically. Never use the published UAT key for live payments.
- The return handler verifies the eSewa status response, product code, transaction UUID, and total amount before marking a payment as paid.
- Khalti remains configured with `KHALTI_SECRET_KEY` and `KHALTI_BASE` in `api/config.php`.
- Flow files: `api/payment/esewa_start.php` -> eSewa -> `api/payment/esewa_return.php`; the Khalti flow is in the corresponding Khalti files.

## Accounts & database products

- Existing database? If it predates accounts, run `db/upgrade.sql` first. Then run `db/roles_upgrade.sql` once to add role support. Fresh install: `schema.sql` already includes accounts and roles.
- Products now load from `api/products.php` (falls back to `js/data.js` if the server/DB is unreachable). Edit products in the `products` table; icons/colours still come from `data.js` by id.
- Auth: `api/auth.php` (register/login/logout/me, bcrypt via password_hash, PHP sessions). Public registration always creates customer accounts. Orders placed while logged in appear under Account.
- Roles: `customer`, `employee`, and `admin`. Existing customers may be promoted by an administrator directly in MySQL, for example `UPDATE users SET role='admin' WHERE email='you@example.com';` or set the role to `employee`. Sign out and back in after changing a role. Only admins can view payments; admins and employees can update order statuses.
