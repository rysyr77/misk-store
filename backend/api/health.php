<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
require_once '../db.php';
try {
    $pdo->query('SELECT 1');
    echo json_encode(["status" => "success", "message" => "الاتصال بقاعدة البيانات يعمل"], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "تعذر فحص قاعدة البيانات"], JSON_UNESCAPED_UNICODE);
}
?>
