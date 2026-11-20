<?php
$host = 'localhost';
$db_name = 'misk_perfumes';
$username = 'root';
$password = ''; // إذا كان لديك كلمة مرور لـ XAMPP أو WampServer أضفها هنا

try {
    $pdo = new PDO("mysql:host=$host;dbname=$db_name;charset=utf8mb4", $username, $password);
    // تفعيل وضع الأخطاء للاكتشاف السريع
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $exception) {
    echo json_encode([
        "status" => "error", 
        "message" => "فشل الاتصال بقاعدة البيانات: " . $exception->getMessage()
    ], JSON_UNESCAPED_UNICODE);
    exit();
}
?>