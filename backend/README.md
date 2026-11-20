# Misk Store Backend

المرحلة الأولى: تأسيس قاعدة البيانات واختبار اتصال PHP بها.

## المتطلبات
- PHP 8.1 أو أحدث
- MySQL 8 أو MariaDB حديث
- تفعيل إضافتي `pdo` و `pdo_mysql` في PHP

## إعداد XAMPP
1. انسخ مجلد المشروع `misk-store-frontend` إلى `C:\xampp\htdocs\misk-store`.
2. شغّل Apache و MySQL من XAMPP Control Panel.
3. افتح `http://localhost/phpmyadmin`.
4. اختر Import واستورد الملف `backend/database/misk_store.sql`.
5. راجع بيانات الاتصال في `backend/config/database.php` (إعداد XAMPP الافتراضي عادةً root وكلمة مرور فارغة).
6. افتح `http://localhost/misk-store/backend/api/health.php`.

يجب أن تظهر استجابة JSON بقيمة `success: true`.

> لا ترفع بيانات الاتصال الافتراضية إلى استضافة الويب. سننقلها لاحقاً إلى إعدادات بيئة آمنة خارج مجلد الوصول العام.
