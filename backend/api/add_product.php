<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");

require_once '../db.php';
require_once '../auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $name = trim($_POST['name'] ?? '');
    $price = $_POST['price'] ?? '';
    $category = trim($_POST['category'] ?? '');
    $description = trim($_POST['description'] ?? '');
    $details = trim($_POST['details'] ?? '');
    $is_featured = isset($_POST['is_featured']) ? 1 : 0;
    $status = $_POST['status'] ?? 'متوفر';

    if ($name === '' || !is_numeric($price) || $category === '' || $description === '') {
        echo json_encode(["status" => "error", "message" => "يرجى تعبئة بيانات المنتج المطلوبة بشكل صحيح"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    try {
        $imageName = null;

        // معالجة رفع الصورة
        if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException('فشل رفع الصورة');
        }
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $fileExtension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        if (!in_array($fileExtension, $allowed, true)) {
            throw new RuntimeException('صيغة الصورة غير مدعومة');
        }
        $uploadDir = __DIR__ . '/../../uploads/';
        if (!is_dir($uploadDir)) {
            mkdir($uploadDir, 0755, true);
        }
        $imageName = uniqid('perfume_', true) . '.' . $fileExtension;
            if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $imageName)) {
                throw new RuntimeException('تعذر حفظ الصورة على الخادم');
            }
        }

        $sql = "INSERT INTO products (name, price, category, image, description, details, is_featured, status) 
                VALUES (:name, :price, :category, :image, :description, :details, :is_featured, :status)";
        
        $stmt = $pdo->prepare($sql);
        $stmt->execute([
            ':name' => $name,
            ':price' => $price,
            ':category' => $category,
            ':image' => $imageName,
            ':description' => $description,
            ':details' => $details,
            ':is_featured' => $is_featured,
            ':status' => $status
        ]);

        echo json_encode([
            "status" => "success", 
            "message" => "تم إضافة المنتج بنجاح"
        ], JSON_UNESCAPED_UNICODE);

    } catch (Throwable $e) {
        echo json_encode([
            "status" => "error", 
            "message" => "فشل حفظ المنتج: " . $e->getMessage()
        ], JSON_UNESCAPED_UNICODE);
    }
} else {
    echo json_encode([
        "status" => "error", 
        "message" => "طريقة الطلب غير صحيحة"
    ], JSON_UNESCAPED_UNICODE);
}
?>
