<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

include '../db.php';

try {
    // جلب إجمالي المنتجات في المتجر
    $stmtTotal = $pdo->query("SELECT COUNT(*) as total FROM products");
    $totalProducts = $stmtTotal->fetch(PDO::FETCH_ASSOC)['total'];

    // جلب عدد المنتجات التي عليها عروض مميزة
    $stmtFeatured = $pdo->query("SELECT COUNT(*) as featured FROM products WHERE is_featured = 1");
    $featuredProducts = $stmtFeatured->fetch(PDO::FETCH_ASSOC)['featured'];

    // جلب أحدث المنتجات لعرضها في الجدول
    $stmtLatest = $pdo->query("SELECT * FROM products ORDER BY id DESC");
    $latestProducts = $stmtLatest->fetchAll(PDO::FETCH_ASSOC);

    echo json_encode([
        "status" => "success",
        "statistics" => [
            "total_products" => $totalProducts,
            "featured_products" => $featuredProducts
        ],
        "products" => $latestProducts
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    echo json_encode([
        "status" => "error",
        "message" => "فشل جلب البيانات: " . $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
?>