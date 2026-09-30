<?php // GET ?action=me | POST JSON {action:register|login|logout, name, email, password}
require __DIR__ . '/db.php';
sess();
$in = json_decode(file_get_contents('php://input'), true) ?? [];
$a = $in['action'] ?? ($_GET['action'] ?? 'me');
$db = pdo();
function user()
{
    return isset($_SESSION['uid']) ? ['id' => $_SESSION['uid'], 'name' => $_SESSION['uname'], 'role' => $_SESSION['urole'] ?? 'customer'] : null;
}
function login_as($u)
{
    session_regenerate_id(true);
    $_SESSION['uid'] = (int)$u['id'];
    $_SESSION['uname'] = $u['name'];
    $_SESSION['urole'] = $u['role'] ?? 'customer';
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
}
if ($a === 'me') out(['user' => user()]);
if ($a === 'logout') {
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(['error' => 'POST required'], 405);
    $_SESSION = [];
    if (ini_get('session.use_cookies')) {
        $p = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000, $p['path'], $p['domain'], $p['secure'], $p['httponly']);
    }
    session_destroy();
    out(['ok' => true]);
}
if (!in_array($a, ['register', 'login'], true)) out(['error' => 'Unknown action'], 400);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') out(['error' => 'POST required'], 405);
$email = strtolower(trim($in['email'] ?? ''));
$pw = $in['password'] ?? '';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) out(['error' => 'Enter a valid email'], 422);
if ($a === 'register') {
    $name = trim($in['name'] ?? '');
    if (strlen($name) < 2 || strlen($pw) < 8) out(['error' => 'Name is required and password needs 8+ characters'], 422);
    $s = $db->prepare('SELECT id FROM users WHERE email=?');
    $s->execute([$email]);
    if ($s->fetch()) out(['error' => 'This email is already registered. Log in instead.'], 409);
    $db->prepare('INSERT INTO users(name,email,password_hash) VALUES(?,?,?)')->execute([$name, $email, password_hash($pw, PASSWORD_DEFAULT)]);
    login_as(['id' => $db->lastInsertId(), 'name' => $name]);
    out(['user' => user()]);
}
if ($a === 'login') {
    $s = $db->prepare('SELECT * FROM users WHERE email=?');
    $s->execute([$email]);
    $u = $s->fetch();
    if (!$u || !password_verify($pw, $u['password_hash'])) out(['error' => 'Email or password is incorrect'], 401);
    login_as($u);
    out(['user' => user()]);
}
out(['error' => 'Unknown action'], 400);
