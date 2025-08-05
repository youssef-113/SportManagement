<?php
/**
 * login.php
 *
 * Handles login by:
 * - Validating credentials
 * - Deactivating old sessions
 * - Creating a new session
 */

header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Access-Control-Allow-Credentials: true");
header("Content-Type: application/json");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

include_once 'db.php';
include_once 'utils.php';

try {
    $email = isset($_POST['email']) ? trim($_POST['email']) : '';
    $password_raw = isset($_POST['password']) ? trim($_POST['password']) : '';

    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        http_response_code(400);
        respond('error', 'the request should only be POST');
    } else if (!$email) {
        http_response_code(400);
        respond('error', 'email is required');
    } else if (!$password_raw) {
        http_response_code(400);
        respond('error', 'password is required');
    } else if (strlen($password_raw) < 6) {
        http_response_code(400);
        respond('error', 'password must be at least 6 characters');
    } else if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        respond('error', 'invalid email address');
    }

    // Fetch user
    $sql = "SELECT uid, email, pass, role FROM users WHERE email = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        respond('error', 'query preparation failed please contact admin');
    }

    $stmt->bind_param('s', $email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 0) {
        http_response_code(400);
        respond('error', 'there is no user signed up with this email');
    }

    $row = $result->fetch_assoc();
    if ($password_raw !== $row['pass']) {
        http_response_code(400);
        respond('error', 'invalid email or password');
    }

    // Deactivate existing sessions
    $sql = "UPDATE sessions SET isActive = 0 WHERE uid = ?";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        respond('error', 'failed to deactivate previous sessions');
    }
    $stmt->bind_param('i', $row['uid']);
    $stmt->execute();

    // Create new session
    $sessionID = bin2hex(random_bytes(64));
    $token = bin2hex(random_bytes(64));
    $expiresAt = date('Y-m-d H:i:s', time() + (86400 * 90)); // 90 days
    $isActive = 1;

    $sql = "INSERT INTO sessions (sessionID, uid, token, expiresAt, isActive) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    if (!$stmt) {
        http_response_code(500);
        respond('error', 'failed to create new session');
    }

    $stmt->bind_param('sissi', $sessionID, $row['uid'], $token, $expiresAt, $isActive);
    $stmt->execute();

    setcookie('sessionID', $sessionID, [
        'expires' => strtotime($expiresAt),
        'path' => '/',
        'secure' => false,
        'httponly' => true,
        'samesite' => 'Strict'
    ]);

    respond('success', [
        'message' => 'login successful ^_^',
        'token' => $token,
        'role' => $row['role']
    ]);

} catch (Exception $e) {
    http_response_code(500);
    respond('error', 'Internal server error: ' . $e->getMessage());
}
?>
