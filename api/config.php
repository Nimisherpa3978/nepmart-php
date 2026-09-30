<?php
// ===== EDIT THIS FILE ONLY =====
const DB_DSN  = 'mysql:host=127.0.0.1;dbname=nepmart;charset=utf8mb4';
const DB_USER = 'root';
const DB_PASS = '';
define('BASE_URL', rtrim(getenv('NEPMART_BASE_URL') ?: 'http://localhost:8000', '/'));

$esewaMode = getenv('ESEWA_MODE') ?: 'test';
define('ESEWA_MODE', $esewaMode);
define('ESEWA_FORM_URL', $esewaMode === 'live'
    ? 'https://epay.esewa.com.np/api/epay/main/v2/form'
    : 'https://rc-epay.esewa.com.np/api/epay/main/v2/form');
define('ESEWA_STATUS_URL', $esewaMode === 'live'
    ? 'https://esewa.com.np/api/epay/transaction/status/'
    : 'https://rc.esewa.com.np/api/epay/transaction/status/');
// ePay v2 merchant credentials; payer credentials are entered only on eSewa's hosted page.
define('ESEWA_PRODUCT_CODE', getenv('ESEWA_PRODUCT_CODE') ?: ($esewaMode === 'test' ? 'EPAYTEST' : ''));
define('ESEWA_SECRET_KEY', getenv('ESEWA_SECRET_KEY') ?: ($esewaMode === 'test' ? '8gBm/:&EnhH.1/q' : ''));

// --- Khalti (ePayment). Get key from Khalti merchant dashboard ---
const KHALTI_BASE = 'https://dev.khalti.com/api/v2/';   // TEST; live: https://khalti.com/api/v2/
const KHALTI_SECRET_KEY = 'PUT_KHALTI_SECRET_KEY_HERE'; // "Live/Test secret key", server-side only
