CREATE DATABASE IF NOT EXISTS `misk_perfumes` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `misk_perfumes`;

-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: 09 نوفمبر 2026 الساعة 11:16
-- إصدار الخادم: 10.4.32-MariaDB
-- تم تعديل category ليقبل القيم العربية التي ترسلها واجهة المتجر
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `misk_perfumes`
--

-- --------------------------------------------------------

--
-- بنية الجدول `admins`
--

CREATE TABLE `admins` (
  `id` int(11) NOT NULL,
  `username` varchar(100) NOT NULL,
  `admin_password` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `admins`
--

INSERT INTO `admins` (`id`, `username`, `admin_password`) VALUES
(1, 'misk', '$2y$10$3zES6Sv30C0e3Y3VP2h5e.ZccGrqf4rkTokdmrrjXYIX.RJlL2/n.');

-- --------------------------------------------------------

--
-- بنية الجدول `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `details` text DEFAULT NULL,
  `is_offer` tinyint(1) DEFAULT 0,
  `category` varchar(60) NOT NULL,
  `is_featured` tinyint(1) DEFAULT 0,
  `status` varchar(50) DEFAULT 'active'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- إرجاع أو استيراد بيانات الجدول `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `image`, `description`, `details`, `is_offer`, `category`, `is_featured`, `status`) VALUES
(1, 'jf', 25.00, 'perfume_6af18115d2fb68.85533511.png', 'fkjshidfsahdfiuasiudfiuasiudngiuasdigads', 'hsaifasiudfasudfasbdfbhdyfbgvhyvbhcxhvbzdlbvhdfviubybyubziyxbcvizhb \r\n526326252535\r\n\r\n4\r\n654\r\n54\r\n54\r\n54\r\n54\r\n\r\n54', 0, '', 1, 'متوفر'),
(2, 'jf', 25.00, NULL, 'fkjshidfsahdfiuasiudfiuasiudngiuasdigads', 'hsaifasiudfasudfasbdfbhdyfbgvhyvbhcxhvbzdlbvhdfviubybyubziyxbcvizhb \r\n526326252535\r\n\r\n4\r\n654\r\n54\r\n54\r\n54\r\n54\r\n\r\n54', 0, '', 1, 'متوفر'),
(3, 'sdz', 25.00, 'perfume_6af18e6edf9a04.21401684.png', 'glfg', '', 0, '', 0, 'متوفر'),
(4, 'sdzooo', 25.00, NULL, 'glfg', '', 0, '', 0, 'متوفر'),
(5, 'sdzooo', 25.00, NULL, 'glfg', '', 0, '', 1, 'متوفر');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `admins`
--
ALTER TABLE `admins`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `admins`
--
ALTER TABLE `admins`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
