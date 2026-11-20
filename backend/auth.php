<?php
if (session_status() !== PHP_SESSION_ACTIVE) {
    session_start();
}

function requireAdmin(): void {
    if (empty($_SESSION['admin_id'])) {
        http_response_code(401);
        echo json_encode([
            "status" => "error",
            "message" => "يجب تسجيل دخول المدير أولاً"
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
}
?>
