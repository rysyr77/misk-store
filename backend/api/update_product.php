<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST");
require_once '../db.php';
require_once '../auth.php';
requireAdmin();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(["status" => "error", "message" => "طريقة الطلب غير صحيحة"], JSON_UNESCAPED_UNICODE);
    exit;
}

$id = filter_input(INPUT_POST, 'id', FILTER_VALIDATE_INT);
$name = trim($_POST['name'] ?? '');
$price = $_POST['price'] ?? '';
$category = trim($_POST['category'] ?? '');
$description = trim($_POST['description'] ?? '');
$details = trim($_POST['details'] ?? '');
$is_featured = isset($_POST['is_featured']) ? 1 : 0;
$status = trim($_POST['status'] ?? 'متوفر');

if (!$id || $name === '' || !is_numeric($price) || $category === '' || $description === '') {
    echo json_encode(["status" => "error", "message" => "يرجى تعبئة بيانات المنتج المطلوبة بشكل صحيح"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT image FROM products WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $existing = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$existing) {
        echo json_encode(["status" => "error", "message" => "المنتج غير موجود"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $imageName = $existing['image'];
    if (isset($_FILES['image']) && $_FILES['image']['error'] !== UPLOAD_ERR_NO_FILE) {
        if ($_FILES['image']['error'] !== UPLOAD_ERR_OK) {
            throw new RuntimeException('فشل رفع الصورة');
        }
        $allowed = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        $extension = strtolower(pathinfo($_FILES['image']['name'], PATHINFO_EXTENSION));
        if (!in_array($extension, $allowed, true)) {
            throw new RuntimeException('صيغة الصورة غير مدعومة');
        }
        $uploadDir = __DIR__ . '/../../uploads/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0755, true);
        $newImageName = uniqid('perfume_', true) . '.' . $extension;
        if (!move_uploaded_file($_FILES['image']['tmp_name'], $uploadDir . $newImageName)) {
            throw new RuntimeException('تعذر حفظ الصورة على الخادم');
        }
        if (!empty($imageName)) {
            $oldPath = $uploadDir . basename($imageName);
            if (is_file($oldPath)) @unlink($oldPath);
        }
        $imageName = $newImageName;
    }

    $sql = "UPDATE products SET name=:name, price=:price, category=:category, image=:image,
            description=:description, details=:details, is_featured=:is_featured, status=:status
            WHERE id=:id";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([
        ':id' => $id, ':name' => $name, ':price' => $price, ':category' => $category,
        ':image' => $imageName, ':description' => $description, ':details' => $details,
        ':is_featured' => $is_featured, ':status' => $status
    ]);

    echo json_encode(["status" => "success", "message" => "تم تعديل المنتج بنجاح"], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode(["status" => "error", "message" => "فشل تعديل المنتج: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
