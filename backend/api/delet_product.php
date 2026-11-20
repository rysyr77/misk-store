<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE");

include '../db.php';

// قراءة الـ ID المرسل (سواء عبر JSON أو POST)
$data = json_decode(file_get_contents("php://input"), true);
$id = $data['id'] ?? $_POST['id'] ?? $_GET['id'] ?? null;

if (empty($id)) {
    echo json_encode([
        "status" => "error",
        "message" => "معرّف المنتج (ID) مطلوب"
    ], JSON_UNESCAPED_UNICODE);
    exit();
}

try {
    // 1. جلب اسم الصورة المرتبطة لحذفها من المجلد محلياً
    $stmtImg = $pdo->prepare("SELECT image FROM products WHERE id = :id");
    $stmtImg->execute([':id' => $id]);
    $product = $stmtImg->fetch(PDO::FETCH_ASSOC);

    if ($product) {
        if (!empty($product['image'])) {
            $imagePath = '../../uploads/' . $product['image'];
            if (file_exists($imagePath)) {
                unlink($imagePath); // حذف ملف الصورة من السيرفر
            }
        }

        // 2. حذف السجل من قاعدة البيانات
        $stmtDelete = $pdo->prepare("DELETE FROM products WHERE id = :id");
        $stmtDelete->execute([':id' => $id]);

        echo json_encode([
            "status" => "success",
            "message" => "تم حذف المنتج بنجاح"
        ], JSON_UNESCAPED_UNICODE);
    } else {
        echo json_encode([
            "status" => "error",
            "message" => "المنتج غير موجود"
        ], JSON_UNESCAPED_UNICODE);
    }

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "حدث خطأ أثناء الحذف: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>