<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, DELETE");
require_once '../db.php';
require_once '../auth.php';
requireAdmin();

$data = json_decode(file_get_contents("php://input"), true) ?: [];
$id = filter_var($data['id'] ?? $_POST['id'] ?? $_GET['id'] ?? null, FILTER_VALIDATE_INT);
if (!$id) {
    echo json_encode(["status" => "error", "message" => "معرّف المنتج (ID) مطلوب"], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT image FROM products WHERE id = :id");
    $stmt->execute([':id' => $id]);
    $product = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$product) {
        echo json_encode(["status" => "error", "message" => "المنتج غير موجود"], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $stmt = $pdo->prepare("DELETE FROM products WHERE id = :id");
    $stmt->execute([':id' => $id]);
    if (!empty($product['image'])) {
        $imagePath = __DIR__ . '/../../uploads/' . basename($product['image']);
        if (is_file($imagePath)) @unlink($imagePath);
    }
    echo json_encode(["status" => "success", "message" => "تم حذف المنتج بنجاح"], JSON_UNESCAPED_UNICODE);
} catch (Throwable $e) {
    echo json_encode(["status" => "error", "message" => "حدث خطأ أثناء الحذف: " . $e->getMessage()], JSON_UNESCAPED_UNICODE);
}
?>
