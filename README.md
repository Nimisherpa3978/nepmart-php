# NepMart

### A Nepal-focused e-commerce experience, built with PHP, MySQL, and vanilla JavaScript.

NepMart is a full-stack online shop concept for discovering local products, building a cart, checking out, and following an order. The project brings together a responsive storefront, PHP APIs, relational data, role-based staff pages, and payment-provider flows in one working application.

**Project by [Nimi Sherpa](https://github.com/Nimisherpa3978)** · [View the public repository](https://github.com/Nimisherpa3978/nepmart-php)

## My Semester Project

I developed NepMart as a **6th-semester B.Sc. CSIT e-commerce project** to put my coursework into practice by building a complete shopping workflow, not just a set of static pages. Using the technical resources available to me—including course concepts, software documentation, and repeated development and testing—I worked to connect the storefront, PHP backend, MySQL database, account sessions, staff roles, and payment-provider flows into one application.

This project gave me practical experience with frontend interaction design, server-side validation, relational data modeling, authentication, inventory-aware order processing, and payment integration. I learned by building, testing, finding issues, and improving the work step by step. The eSewa connection is demonstrated with its UAT sandbox; this is a student learning project, not a production store.

> **Demo status:** eSewa is configured for its UAT sandbox. No real payments are processed. Khalti integration code is present but needs merchant credentials. This project is a learning and portfolio demonstration, not a production-ready store.

## What You Can Explore

- **Shop and discover:** Browse Fashion, Home & Craft, Food & Tea, and Electronics. Search products, use suggestions, filter by category, price, and stock, sort results, and move through paginated listings.
- **Product details:** View descriptions, ratings, prices, discounts, stock levels, similar products, and quick previews. Adjust quantities and add items to a cart or wishlist.
- **Cart and promotions:** Change quantities, remove items, and try `WELCOME10` for 10% off or `SAVE200` for NPR 200 off. Shipping totals update for standard and express delivery.
- **Multi-step checkout:** Enter delivery information, choose a shipping method, and select eSewa, Khalti, or cash on delivery.
- **Customer accounts:** Register, log in, log out, and view orders associated with your account. Sessions distinguish customer, employee, and admin roles.
- **Staff operations:** Employees and admins can review orders and update fulfillment status. Admins also have access to payment records.
- **Payment-provider flows:** The eSewa ePay v2 flow creates a signed request and verifies the returned transaction with eSewa. The Khalti flow demonstrates payment initiation and lookup.

## Engineering Highlights

The project is designed to demonstrate more than a storefront UI:

- Order totals are recalculated on the server using database prices; browser-submitted prices are not trusted.
- Product availability is checked inside a database transaction while stock is reserved, helping prevent overselling.
- PDO prepared statements are used for database operations.
- Passwords are stored as hashes. Login regenerates the session ID, and protected staff pages enforce role checks.
- Order-status updates use CSRF tokens.
- eSewa payment status is checked server-side against the expected product code, transaction UUID, and total amount before marking a payment paid.
- The frontend uses hash-based navigation and browser storage for convenience state such as cart contents, wishlist, and recent products.

## Technology

| Layer         | Tools                                                   |
| ------------- | ------------------------------------------------------- |
| Frontend      | HTML5, CSS3, vanilla JavaScript                         |
| Backend       | PHP 8+, PDO, PHP sessions                               |
| Database      | MySQL with InnoDB transactions                          |
| Payment demos | eSewa ePay v2 UAT; Khalti ePayment integration scaffold |

## Run Locally

You need PHP 8 or later with `pdo_mysql` and `curl`, plus a running MySQL server.

1. Create the database by importing [`db/schema.sql`](db/schema.sql) in phpMyAdmin, or run `mysql -u root -p < db/schema.sql`.
2. Update the database connection values in [`api/config.php`](api/config.php) for your local MySQL account.
3. From the project directory, start PHP’s development server:

   ```powershell
   php -S localhost:8000
   ```

4. Open [http://localhost:8000](http://localhost:8000). Create a customer account from **Account** to try the account workflow.

For an older database, run [`db/upgrade.sql`](db/upgrade.sql) if it predates the account tables, then run [`db/roles_upgrade.sql`](db/roles_upgrade.sql) to add role support. Do not run a migration twice.

## Try eSewa UAT

The default `ESEWA_MODE` is `test`. NepMart uses the published UAT merchant code and test key from [`api/config.php`](api/config.php). These are public sandbox values, not live merchant credentials.

The success and failure callback URLs must be reachable from the browser. For local checkout testing, expose port 8000 through a temporary HTTPS tunnel, then set the tunnel URL **before starting PHP**:

```powershell
$env:NEPMART_BASE_URL = "https://your-temporary-tunnel.example"
php -S localhost:8000
```

At eSewa’s hosted test login, use its published UAT payer credentials: eSewa ID `9711111111` (or `9711111112` / `9711111113`), password `Test@123`, and token `123456` if prompted. Enter these only on eSewa’s hosted page, never in NepMart.

To use live eSewa, set `ESEWA_MODE=live`, your own `ESEWA_PRODUCT_CODE` and `ESEWA_SECRET_KEY`, and a stable public HTTPS `NEPMART_BASE_URL` in the server environment. Never use the published UAT key for live payments. The current Khalti configuration also requires your own server-side merchant key before that flow can be used.

## Project Map

| Path                                       | Purpose                                                                 |
| ------------------------------------------ | ----------------------------------------------------------------------- |
| [`index.html`](index.html)                 | Storefront shell and navigation                                         |
| [`js/app.js`](js/app.js)                   | Shop views, cart, checkout, account UI, routing                         |
| [`js/data.js`](js/data.js)                 | Demo product and coupon fallback data                                   |
| [`api/auth.php`](api/auth.php)             | Registration, login, logout, and session identity                       |
| [`api/order.php`](api/order.php)           | Server-side order validation, stock update, and payment record creation |
| [`api/payment/`](api/payment/)             | eSewa and Khalti initiation and return handlers                         |
| [`admin/orders.php`](admin/orders.php)     | Staff order-status management                                           |
| [`admin/payments.php`](admin/payments.php) | Admin payment overview                                                  |
| [`db/schema.sql`](db/schema.sql)           | Database tables and sample catalogue data                               |

## Known Demo Limitations

- The eSewa setup is for UAT and requires a reachable HTTPS callback URL; a temporary tunnel URL can change or stop working.
- Khalti cannot be used until valid merchant credentials are configured.
- The browser stores cart, wishlist, and recent-product state locally, so that state does not synchronize across devices.
- The tracking screen is a demonstration view; it is not a live carrier-tracking service.
- Before production use, configure secrets outside source control, deploy behind HTTPS, use live merchant credentials, and complete end-to-end security and payment testing.

## Acknowledgments

Payment integration follows the public [eSewa ePay documentation](https://developer.esewa.com.np/pages/Epay). This project was developed as a practical demonstration of full-stack web development, database-backed workflows, authentication, and payment integration.
