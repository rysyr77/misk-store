<?php
// السماح بالوصول من أي مصدر (CORS) وتحديد نوع المحتوى JSON
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../db.php';
require_once '../auth.php';

// قراءة البيانات المرسلة من الواجهة الأمامية
$data = json_decode(file_get_contents("php://input"), true);

$username = $data['username'] ?? $_POST['username'] ?? '';
$password = $data['password'] ?? $_POST['password'] ?? '';

// التحقق من أن الحقول ليست فارغة
if (empty($username) || empty($password)) {
    echo json_encode([
        "status" => "error", 
        "message" => "الرجاء إدخال اسم المستخدم وكلمة المرور"
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // البحث عن المدير في الجدول مع استخدام العمود الجديد admin_password
    $stmt = $pdo->prepare("SELECT * FROM admins WHERE username = :username");
    $stmt->execute([':username' => $username]);
    $admin = $stmt->fetch(PDO::FETCH_ASSOC);

    // التحقق من وجود المستخدم ومطابقة كلمة المرور باستخدام password_verify
    if ($admin && password_verify($password, $admin['admin_password'])) {
        session_regenerate_id(true);
        $_SESSION['admin_id'] = $admin['id'];
        $_SESSION['admin_username'] = $admin['username'];
        echo json_encode([
            "status" => "success",
            "message" => "تم تسجيل الدخول بنجاح",
            "admin" => [
                "id" => $admin['id'],
                "username" => $admin['username']
            ]
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "اسم المستخدم أو كلمة المرور غير صحيحة"
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "حدث خطأ في النظام: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>
