CREATE DATABASE  IF NOT EXISTS `crm` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `crm`;
-- MySQL dump 10.13  Distrib 8.0.38, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: crm
-- ------------------------------------------------------
-- Server version	8.0.39

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `appointment_qc`
--

DROP TABLE IF EXISTS `appointment_qc`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_qc` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `qc_status` enum('Pending','In_Progress','Completed','Partial') DEFAULT 'Pending',
  `all_tests_available` tinyint(1) DEFAULT '0',
  `missing_tests` text,
  `qc_completed_by` int DEFAULT NULL,
  `qc_completed_at` timestamp NULL DEFAULT NULL,
  `remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `appointment_id` (`appointment_id`),
  KEY `qc_completed_by` (`qc_completed_by`),
  CONSTRAINT `appointment_qc_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_qc_ibfk_2` FOREIGN KEY (`qc_completed_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_qc`
--

LOCK TABLES `appointment_qc` WRITE;
/*!40000 ALTER TABLE `appointment_qc` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_qc` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_reports`
--

DROP TABLE IF EXISTS `appointment_reports`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_reports` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `report_type_id` int NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_by` int NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `report_type_id` (`report_type_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `appointment_reports_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_reports_ibfk_2` FOREIGN KEY (`report_type_id`) REFERENCES `report_types` (`id`),
  CONSTRAINT `appointment_reports_ibfk_3` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_reports`
--

LOCK TABLES `appointment_reports` WRITE;
/*!40000 ALTER TABLE `appointment_reports` DISABLE KEYS */;
/*!40000 ALTER TABLE `appointment_reports` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointment_tests`
--

DROP TABLE IF EXISTS `appointment_tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointment_tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int DEFAULT NULL,
  `test_id` int DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `completion_remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `rate_type` enum('test','category') DEFAULT 'test',
  `category_id` int DEFAULT NULL,
  `item_name` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `test_id` (`test_id`),
  KEY `fk_appointment_tests_category` (`category_id`),
  KEY `idx_appointment_tests_type` (`rate_type`),
  CONSTRAINT `appointment_tests_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_tests_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`),
  CONSTRAINT `fk_appointment_tests_category` FOREIGN KEY (`category_id`) REFERENCES `test_categories` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_tests`
--

LOCK TABLES `appointment_tests` WRITE;
/*!40000 ALTER TABLE `appointment_tests` DISABLE KEYS */;
INSERT INTO `appointment_tests` VALUES (3,253,NULL,60000.00,0,NULL,'2025-10-21 14:01:59','category',1,'B1X0');
/*!40000 ALTER TABLE `appointment_tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `appointments`
--

DROP TABLE IF EXISTS `appointments`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `case_number` varchar(100) NOT NULL,
  `application_number` varchar(100) DEFAULT NULL,
  `client_id` int DEFAULT NULL,
  `center_id` int DEFAULT NULL,
  `other_center_id` int DEFAULT NULL,
  `insurer_id` int DEFAULT NULL,
  `customer_first_name` varchar(155) DEFAULT NULL,
  `customer_last_name` varchar(155) DEFAULT NULL,
  `gender` varchar(45) DEFAULT NULL,
  `customer_mobile` varchar(20) DEFAULT NULL,
  `customer_alt_mobile` varchar(45) DEFAULT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_address` text,
  `state` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `pincode` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  `customer_gps_latitude` decimal(10,8) DEFAULT NULL,
  `customer_gps_longitude` decimal(11,8) DEFAULT NULL,
  `customer_landmark` varchar(255) DEFAULT NULL,
  `visit_type` varchar(80) DEFAULT NULL,
  `customer_category` varchar(80) DEFAULT NULL,
  `appointment_date` date DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `confirmed_time` time DEFAULT NULL,
  `status` varchar(100) DEFAULT NULL,
  `assigned_technician_id` int DEFAULT NULL,
  `assigned_at` timestamp NULL DEFAULT NULL,
  `assigned_by` int DEFAULT NULL,
  `customer_arrived_at` timestamp NULL DEFAULT NULL,
  `medical_started_at` timestamp NULL DEFAULT NULL,
  `medical_completed_at` timestamp NULL DEFAULT NULL,
  `remarks` text,
  `cancellation_reason` text,
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `test_name` varchar(45) DEFAULT NULL,
  `cost_type` varchar(85) DEFAULT NULL,
  `amount` decimal(8,2) DEFAULT NULL,
  `amount_upload` text,
  `case_severity` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `insurer_id` (`insurer_id`),
  KEY `assigned_technician_id` (`assigned_technician_id`),
  KEY `assigned_by` (`assigned_by`),
  KEY `created_by` (`created_by`),
  KEY `idx_appointment_date` (`appointment_date`),
  KEY `idx_status` (`status`),
  KEY `idx_customer_mobile` (`customer_mobile`),
  KEY `appointments_ibfk_1` (`client_id`),
  KEY `appointments_ibfk_2` (`center_id`),
  KEY `appointments_ibfk_7_idx` (`other_center_id`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `diagnostic_centers` (`id`),
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`insurer_id`) REFERENCES `insurers` (`id`),
  CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`assigned_technician_id`) REFERENCES `technicians` (`id`),
  CONSTRAINT `appointments_ibfk_5` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  CONSTRAINT `appointments_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `appointments_ibfk_7` FOREIGN KEY (`other_center_id`) REFERENCES `diagnostic_centers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=254 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
INSERT INTO `appointments` VALUES (230,'CASE/10/0001','A111',24,NULL,NULL,5,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-15','09:00:00',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-16 06:57:51','2025-10-16 06:57:51',0,NULL,NULL,NULL,NULL,0),(231,'CASE/10/0002','A112',38,NULL,NULL,63,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Both','Non_HNI','2024-01-16','00:00:00',NULL,'Confirm',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-16 06:57:51','2025-10-20 09:36:29',0,'DTA Test','Advance NEFT',NULL,'uploads\\1760952989018-651064208-pen.png',0),(232,'CASE/10/0003','A113',38,NULL,NULL,63,'John','Doe','Female','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Center_Visit','Non_HNI','2024-01-17','09:00:02',NULL,'Confirm',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-16 06:57:51','2025-10-16 06:57:51',0,NULL,NULL,NULL,NULL,0),(233,'CASE/10/0004','a22',38,12,NULL,9,'fdf','fd','Female','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Center_Visit','Non_HNI','2024-01-16','09:00:00',NULL,'Scheduled',NULL,NULL,NULL,NULL,NULL,NULL,'ddfd',NULL,2,'2025-10-16 07:18:08','2025-10-17 07:15:00',0,'',NULL,NULL,NULL,0),(234,'CASE/10/0005','tyty',24,12,NULL,5,'first name','last name','Female','4444444444',NULL,'rt@gmail.com','fdg dfgfdg df gfd gdf gdf gdfg ','Andhra Pradesh','gtyrr','233456','IN',NULL,NULL,'hhhh','Center_Visit','SUPER_HNI','2025-10-17','19:08:00','12:08:00','Scheduled',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'2025-10-16 09:38:35','2025-10-16 09:39:46',1,'','Advance NEFT',45.87,'uploads\\1760607515782-880228667-Minutes of Meeting-10 OCT.pdf',0),(235,'CASE/10/0006','yyyy',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'y@gmail.com',NULL,NULL,NULL,NULL,'IN',NULL,NULL,NULL,'Home_Visit','Non_HNI','2025-10-24','18:09:00','20:09:00','Pending',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,2,'2025-10-16 09:39:34','2025-10-16 09:39:46',1,NULL,NULL,NULL,NULL,0),(236,'CASE/10/0005','APP-001',24,NULL,NULL,5,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-15','09:00:00',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(237,'CASE/10/0006','APP-002',25,NULL,NULL,6,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-16','09:00:01',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(238,'CASE/10/0007','APP-003',26,NULL,NULL,7,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-17','09:00:02',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(239,'CASE/10/0008','APP-004',27,NULL,NULL,8,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-18','09:00:03',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(240,'CASE/10/0009','APP-005',28,NULL,NULL,9,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-19','09:00:04',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(241,'CASE/10/0010','APP-006',29,NULL,NULL,10,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-19','09:00:00',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 12:00:52',0,'',NULL,NULL,'uploads\\1760702452091-120809771-Minutes of Meeting-10 OCT.pdf',0),(242,'CASE/10/0011','APP-007',30,NULL,NULL,11,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-20','09:00:00',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 12:00:59',0,'',NULL,NULL,'uploads\\1760702459257-146289991-footer.png',0),(243,'CASE/10/0012','APP-008',31,NULL,NULL,12,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-22','09:00:07',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(244,'CASE/10/0013','APP-009',32,NULL,NULL,13,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-23','09:00:08',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(245,'CASE/10/0014','APP-010',33,NULL,NULL,14,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-24','09:00:09',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(246,'CASE/10/0015','APP-011',34,NULL,NULL,15,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-25','09:00:10',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(247,'CASE/10/0016','APP-012',35,NULL,NULL,16,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-26','09:00:11',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(248,'CASE/10/0017','APP-013',36,NULL,NULL,17,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-27','09:00:12',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(249,'CASE/10/0018','APP-014',37,NULL,NULL,18,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-28','09:00:13',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-17 07:48:49',0,NULL,NULL,NULL,NULL,0),(250,'CASE/10/0019','APP-015',38,5,NULL,19,'John','Doe','Male','9876543210',NULL,'john.doe@email.com',NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,'Home_Visit','Non_HNI','2024-01-28','09:00:00',NULL,'Pending',NULL,NULL,NULL,NULL,NULL,NULL,'Initial appointment',NULL,2,'2025-10-17 07:48:49','2025-10-19 14:28:46',1,'',NULL,NULL,NULL,0),(253,'CASE/10/0019','test23456',42,12,NULL,57,'test name','tet ;last name','Male','5656565656',NULL,'er@gmail.com','full address','Andhra Pradesh','unmaaa','444444','IN',NULL,NULL,'landmarkk','Center_Visit','Non_HNI','2025-10-20','00:00:00','08:00:00','Pending',NULL,NULL,NULL,NULL,NULL,NULL,'na',NULL,NULL,'2025-10-21 13:50:54','2025-10-21 14:01:59',0,NULL,'Credit',NULL,NULL,0);
/*!40000 ALTER TABLE `appointments` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category_test_mapping`
--

DROP TABLE IF EXISTS `category_test_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category_test_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_test_id` int NOT NULL,
  `single_test_id` int NOT NULL,
  `is_mandatory` tinyint(1) DEFAULT '1',
  `display_order` int DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_test` (`category_test_id`,`single_test_id`),
  KEY `single_test_id` (`single_test_id`),
  CONSTRAINT `category_test_mapping_ibfk_1` FOREIGN KEY (`category_test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `category_test_mapping_ibfk_2` FOREIGN KEY (`single_test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_test_mapping`
--

LOCK TABLES `category_test_mapping` WRITE;
/*!40000 ALTER TABLE `category_test_mapping` DISABLE KEYS */;
INSERT INTO `category_test_mapping` VALUES (6,1,5,1,0),(7,1,4,1,0),(8,1,3,1,0);
/*!40000 ALTER TABLE `category_test_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `center_insurer_mapping`
--

DROP TABLE IF EXISTS `center_insurer_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `center_insurer_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `center_id` int NOT NULL,
  `insurer_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `mapped_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `mapped_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_center_insurer` (`center_id`,`insurer_id`,`client_id`),
  KEY `client_id` (`client_id`),
  KEY `insurer_id` (`insurer_id`),
  KEY `mapped_by` (`mapped_by`),
  CONSTRAINT `center_insurer_mapping_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `center_insurer_mapping_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `diagnostic_centers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `center_insurer_mapping_ibfk_3` FOREIGN KEY (`insurer_id`) REFERENCES `insurers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `center_insurer_mapping_ibfk_4` FOREIGN KEY (`mapped_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `center_insurer_mapping`
--

LOCK TABLES `center_insurer_mapping` WRITE;
/*!40000 ALTER TABLE `center_insurer_mapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `center_insurer_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_center_mapping`
--

DROP TABLE IF EXISTS `client_center_mapping`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_center_mapping` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `center_id` int NOT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `mapped_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `mapped_by` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_client_center` (`client_id`,`center_id`),
  KEY `center_id` (`center_id`),
  KEY `mapped_by` (`mapped_by`),
  CONSTRAINT `client_center_mapping_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `client_center_mapping_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `diagnostic_centers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `client_center_mapping_ibfk_3` FOREIGN KEY (`mapped_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_center_mapping`
--

LOCK TABLES `client_center_mapping` WRITE;
/*!40000 ALTER TABLE `client_center_mapping` DISABLE KEYS */;
/*!40000 ALTER TABLE `client_center_mapping` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_contacts`
--

DROP TABLE IF EXISTS `client_contacts`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_contacts` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `contact_person_name` varchar(255) NOT NULL,
  `designation` varchar(100) DEFAULT NULL,
  `email` varchar(255) NOT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `contact_type` enum('Primary','Billing','Operations','Escalation') DEFAULT 'Primary',
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  CONSTRAINT `client_contacts_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_contacts`
--

LOCK TABLES `client_contacts` WRITE;
/*!40000 ALTER TABLE `client_contacts` DISABLE KEYS */;
/*!40000 ALTER TABLE `client_contacts` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_documents`
--

DROP TABLE IF EXISTS `client_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_size` int DEFAULT NULL,
  `uploaded_by` int DEFAULT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `uploaded_by` (`uploaded_by`),
  CONSTRAINT `client_documents_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `client_documents_ibfk_2` FOREIGN KEY (`uploaded_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_documents`
--

LOCK TABLES `client_documents` WRITE;
/*!40000 ALTER TABLE `client_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `client_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `client_insurers`
--

DROP TABLE IF EXISTS `client_insurers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `client_insurers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int NOT NULL,
  `insurer_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `insurer_id` (`insurer_id`),
  CONSTRAINT `client_insurers_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `client_insurers_ibfk_2` FOREIGN KEY (`insurer_id`) REFERENCES `insurers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=69 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `client_insurers`
--

LOCK TABLES `client_insurers` WRITE;
/*!40000 ALTER TABLE `client_insurers` DISABLE KEYS */;
INSERT INTO `client_insurers` VALUES (16,22,20,'2025-10-14 07:47:14','2025-10-14 07:47:14'),(17,22,43,'2025-10-14 07:47:14','2025-10-14 07:47:14'),(18,22,39,'2025-10-14 07:47:14','2025-10-14 07:47:14'),(20,23,7,'2025-10-14 10:21:10','2025-10-14 10:21:10'),(21,5,5,'2025-10-15 09:34:14','2025-10-15 09:34:14'),(22,5,6,'2025-10-15 09:35:01','2025-10-15 09:35:01'),(23,5,7,'2025-10-15 10:07:32','2025-10-15 10:07:32'),(24,23,6,'2025-10-15 10:32:49','2025-10-15 10:32:49'),(25,23,5,'2025-10-15 10:32:49','2025-10-15 10:32:49'),(27,23,8,'2025-10-15 10:42:31','2025-10-15 10:42:31'),(28,23,9,'2025-10-15 10:42:31','2025-10-15 10:42:31'),(29,23,10,'2025-10-15 10:43:07','2025-10-15 10:43:07'),(30,23,11,'2025-10-15 10:43:07','2025-10-15 10:43:07'),(31,23,12,'2025-10-15 10:43:07','2025-10-15 10:43:07'),(47,38,16,'2025-10-16 07:00:54','2025-10-16 07:02:33'),(48,38,17,'2025-10-16 07:00:54','2025-10-16 07:02:33'),(57,38,20,'2025-10-16 07:02:33','2025-10-16 07:02:33'),(58,38,63,'2025-10-16 07:03:01','2025-10-16 07:03:01'),(61,41,63,'2025-10-16 10:39:19','2025-10-16 10:39:19'),(67,42,57,'2025-10-21 07:46:32','2025-10-21 07:46:32'),(68,42,56,'2025-10-21 07:46:32','2025-10-21 07:46:32');
/*!40000 ALTER TABLE `client_insurers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_code` varchar(50) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `client_type` varchar(100) DEFAULT NULL,
  `registered_address` text,
  `gst_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(10) DEFAULT NULL,
  `mode_of_payment` varchar(55) DEFAULT NULL,
  `payment_frequency` varchar(55) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `state` varchar(45) DEFAULT NULL,
  `city` varchar(45) DEFAULT NULL,
  `pincode` varchar(45) DEFAULT NULL,
  `country` varchar(45) DEFAULT NULL,
  `email_id` varchar(45) DEFAULT NULL,
  `email_id_2` varchar(45) DEFAULT NULL,
  `email_id_3` varchar(45) DEFAULT NULL,
  `contact_person_name` varchar(45) DEFAULT NULL,
  `contact_person_no` varchar(45) DEFAULT NULL,
  `contact_person_address` varchar(455) DEFAULT NULL,
  `onboarding_date` datetime DEFAULT NULL,
  `agreement_id` varchar(45) DEFAULT NULL,
  `validity_period_start` date DEFAULT NULL,
  `validity_period_end` date DEFAULT NULL,
  `invoice_format_upload` longtext,
  `mou` varchar(45) DEFAULT NULL,
  `IRDAI_no` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (24,'TPA/10/0001','1 MG',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(25,'TPA/10/0002','Anmol TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(26,'TPA/10/0003','Call Health TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(27,'TPA/10/0004','Call Medilife TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(28,'TPA/10/0005','E Cure',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(29,'TPA/10/0006','Ericsson TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(30,'TPA/10/0007','Get Visit',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(31,'TPA/10/0008','GOWELNEXT Solutions Pvt Ltd',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(32,'INS/08/0009','Health Assure TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:07:46',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(33,'TPA/10/0010','Health India TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(34,'TPA/10/0011','MD India TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(35,'TPA/10/0012','Medibuddy TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(36,'TPA/10/0013','Medpiper TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(37,'TPA/10/0014','Volo Health Insurance TPA',NULL,NULL,NULL,NULL,NULL,NULL,1,NULL,'2025-10-16 05:05:53','2025-10-16 05:25:06',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(38,'TPA/10/0015','Test TPA','Aggregator','customers address','GST1234567RT123','PAN1234567','Credit','90',1,2,'2025-10-16 05:19:04','2025-10-16 07:00:54',0,'Chhattisgarh','Kolkata','455678','IN','p@gmail.com','s@gmail.com','t@gmail.com','udit','565656565600','adress of contact ppersone','2025-10-16 05:30:00','ATEST1','2025-10-01','2025-10-30','uploads\\1760591943988-977419594-Minutes of Meeting-10 OCT.pdf','MOUTEST123','IRDAI TEST1122'),(40,'TPA/10/0016','cv','TPA','',NULL,NULL,'Advance','30',1,2,'2025-10-16 10:36:26','2025-10-16 10:36:59',1,NULL,NULL,NULL,'IN',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-17 05:30:00',NULL,'2025-10-18','2025-10-17',NULL,NULL,NULL),(41,'TPA/10/0016','wewewefdsf','Corporate','dfdsfdfdsfdsfsdfsdfd dfdsfsd','dddddddddd33333','dddddddddd','Advance','60',1,2,'2025-10-16 10:38:32','2025-10-16 10:39:26',1,'Goa','dsdsdsdsdsd','222222','IN','r@gmail.com','r@gmail.com','r@gmail.com','gghh','3333333333','fdsfdsf dfds fds fdsfsd','2025-10-17 05:30:00','ewew232dsf','2025-10-03','2025-10-22','uploads\\1760611112725-796179227-Motogp24 Screenshot 2024.11.07 - 23.19.35.24.png','sdd2323fsd','sde23'),(42,'TPA/10/0016','tesst','Corporate','',NULL,NULL,'Advance','30',1,2,'2025-10-21 07:45:16','2025-10-21 07:46:32',0,NULL,NULL,NULL,'IN',NULL,NULL,NULL,NULL,NULL,NULL,'2025-10-23 05:30:00',NULL,'2025-10-22','2025-10-30',NULL,NULL,NULL);
/*!40000 ALTER TABLE `clients` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `diagnostic_centers`
--

DROP TABLE IF EXISTS `diagnostic_centers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `diagnostic_centers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `center_code` varchar(50) DEFAULT NULL,
  `user_id` int DEFAULT NULL,
  `center_name` varchar(255) NOT NULL,
  `center_type` varchar(55) DEFAULT NULL,
  `address` text,
  `owner_name` varchar(45) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `city_type` varchar(45) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` longtext,
  `country` varchar(45) DEFAULT NULL,
  `dc_photos` longtext,
  `gps_latitude` decimal(10,8) DEFAULT NULL,
  `gps_longitude` decimal(11,8) DEFAULT NULL,
  `letterhead_path` longtext,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `associate_doctor_1_details` json DEFAULT NULL,
  `associate_doctor_2_details` json DEFAULT NULL,
  `associate_doctor_3_details` json DEFAULT NULL,
  `associate_doctor_4_details` json DEFAULT NULL,
  `acc_name` varchar(105) DEFAULT NULL,
  `acc_no` varchar(105) DEFAULT NULL,
  `ifsc_code` varchar(105) DEFAULT NULL,
  `receivers_name` varchar(105) DEFAULT NULL,
  `accredation` varchar(105) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnostic_centers`
--

LOCK TABLES `diagnostic_centers` WRITE;
/*!40000 ALTER TABLE `diagnostic_centers` DISABLE KEYS */;
INSERT INTO `diagnostic_centers` VALUES (5,'DC0001',7,'Kumar Diagnostic Center','Third_Party','Nariman Point, Mumbai',NULL,'9999999999','reliance@elec.com','Mumbai',NULL,'Maharashtra','400021',NULL,NULL,NULL,NULL,NULL,1,2,'2025-10-09 06:28:06','2025-10-09 06:43:32',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(6,'DC002',10,'Shelll Diagnostic center','Own','ffff',NULL,'9999999999','ee@gmail.com','pune',NULL,'mh','411028',NULL,NULL,NULL,NULL,NULL,1,2,'2025-10-09 08:07:44','2025-10-09 09:20:42',0,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(10,'DC/10/0001',NULL,'newdcgg','Non Premium','fgfgfgfgfgf g fg f gfg f44t4 tt4',NULL,'7777777777','ee@gmail.com','Kolkata',NULL,'Arunachal Pradesh','411111','IN','[\"uploads\\\\1760440162483-106476657-Motogp24 Screenshot 2024.11.07 - 23.32.35.15.png\",\"uploads\\\\1760440162526-134738305-Motogp24 Screenshot 2024.12.05 - 22.21.17.90.png\",\"uploads\\\\1760440162552-413053908-Motogp24 Screenshot 2024.12.05 - 22.49.46.64.png\"]',NULL,NULL,NULL,1,2,'2025-10-14 11:09:22','2025-10-16 06:59:41',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(11,'DC/10/0002',NULL,'rtttr','Premium','dfdf df d fd f df 3 44 34 ',NULL,'6666666666','A@gmail.com','wewew',NULL,'Assam','333333','IN','[\"uploads\\\\1760442936051-72217570-Motogp24 Screenshot 2024.11.07 - 23.19.35.24.png\",\"uploads\\\\1760442936071-387098205-Motogp24 Screenshot 2024.11.07 - 23.27.08.99.png\",\"uploads\\\\1760442936121-949943484-Motogp24 Screenshot 2024.11.07 - 23.30.46.54.png\",\"uploads\\\\1760442936162-715357322-Motogp24 Screenshot 2024.11.07 - 23.15.12.88.png\",\"uploads\\\\1760442936201-951509084-Motogp24 Screenshot 2024.11.07 - 23.15.33.77.png\",\"uploads\\\\1760442936234-110895913-Motogp24 Screenshot 2024.11.07 - 23.31.11.20.png\",\"uploads\\\\1760442936265-644606387-Motogp24 Screenshot 2024.11.07 - 23.32.35.15.png\"]',NULL,NULL,'uploads\\1760442936290-372543323-.trashed-1736252251-Mount & Blade II  Bannerlord Screenshot 2024.11.26 - 00.16.39.18.png',1,2,'2025-10-14 11:51:37','2025-10-16 06:59:41',1,NULL,'{\"address\": \"fdfd\", \"email_id\": \"rdfdfdfff@gmail.com\", \"mobile_no\": \"3333333363\", \"doctor_name\": \"ytytytfdfdfdfdfd\", \"registration_no\": \"fdf43\"}',NULL,NULL,'acnamefff','acc1','fscsc23','receiver nameee','2323ddsdsdsd'),(12,'DC/10/0003',14,'TEST DC','Premium','full address of customer','owners name','4444444444','test@gmail.com','pune','Tier 2','Punjab','4444444','IN','[\"uploads\\\\1760592515048-20185955-Motogp24 Screenshot 2024.12.05 - 22.21.17.90.png\",\"uploads\\\\1760592515083-168272117-Motogp24 Screenshot 2024.12.05 - 22.49.25.00.png\",\"uploads\\\\1760592515123-265749623-Motogp24 Screenshot 2024.12.05 - 22.49.46.64.png\",\"uploads\\\\1760592515155-340670135-Motogp24 Screenshot 2024.12.05 - 22.57.44.33.png\",\"uploads\\\\1760592515196-691217737-Motogp24 Screenshot 2024.12.05 - 22.58.30.97.png\"]',NULL,NULL,'uploads\\1760592515239-576279575-Minutes of Meeting-10 OCT.pdf',1,2,'2025-10-16 05:28:35','2025-10-16 09:33:08',0,'{\"address\": \"address of doctor\", \"email_id\": \"testdoc@gmail.com\", \"mobile_no\": \"4444444444\", \"doctor_name\": \"doc name test\", \"registration_no\": \"reg23456test\"}',NULL,NULL,NULL,'acc holde rname','acc no245677','isfc3456','rohit','acc2344tt'),(13,'DC/10/0004',NULL,'T2','Non Premium','fdfd fdf dfdf d',NULL,'6666666666','a@gmail.com','ffffff',NULL,'Arunachal Pradesh','211111','IN','[\"uploads\\\\1760607296851-692728025-.trashed-1736252251-Mount & Blade II  Bannerlord Screenshot 2024.11.26 - 00.16.39.18.png\",\"uploads\\\\1760607296868-766694748-Motogp24 Screenshot 2024.11.07 - 22.36.30.99.png\"]',NULL,NULL,'uploads\\1760607296892-98556927-Minutes of Meeting-10 OCT.pdf',1,2,'2025-10-16 09:34:36','2025-10-16 10:32:55',1,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL,NULL),(17,'DC/10/0004',NULL,'TEST DC','Premium','customers address','owners name','4444444444','john.doe@email.com','Kolkata','Tier 3','Arunachal Pradesh','455678','IN','[\"uploads\\\\1760611271970-269778425-Motogp24 Screenshot 2024.11.07 - 23.19.35.24.png\",\"uploads\\\\1760611272008-454954026-Motogp24 Screenshot 2024.11.07 - 23.27.08.99.png\",\"uploads\\\\1760611272037-888906100-Motogp24 Screenshot 2024.11.07 - 23.30.46.54.png\"]',NULL,NULL,'uploads\\1760611272067-75937333-Motogp24 Screenshot 2024.11.07 - 23.27.08.99.png',1,2,'2025-10-16 10:35:00','2025-10-16 10:41:24',1,NULL,NULL,NULL,NULL,'acc holde rname','acc no245677','isfc3456','rohit','acc2344tt');
/*!40000 ALTER TABLE `diagnostic_centers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `insurers`
--

DROP TABLE IF EXISTS `insurers`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `insurers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `insurer_code` varchar(50) DEFAULT NULL,
  `insurer_name` varchar(255) DEFAULT NULL,
  `insurer_type` varchar(100) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insurers`
--

LOCK TABLES `insurers` WRITE;
/*!40000 ALTER TABLE `insurers` DISABLE KEYS */;
INSERT INTO `insurers` VALUES (5,NULL,'Aditya Birla Sun Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-19 18:17:15',0),(6,NULL,'Ageas Federal Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:38:43',0),(7,NULL,'Ageas Fede','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(8,NULL,'Aviva Life Insurance ','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:38:43',0),(9,NULL,'Axis Max Life Insurance Limited','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:39:15',0),(10,NULL,'Bajaj Allianz Life Insurance Company Ltd.','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:39:15',0),(11,NULL,'Bandhan Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:39:15',0),(12,NULL,'Bharti Axa Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(13,NULL,'Canara HSBC Life Insurance company Ltd','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(14,NULL,'Edelweiss Life Insurance Co. Ltd.','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(15,NULL,'Generali Central Life Insurance Company Limited','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(16,NULL,'HDFC Life','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(17,NULL,'ICICI Prudential Life Insurance Co. Ltd','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(18,NULL,'India First Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:56',0),(19,NULL,'Kotak Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:56',0),(20,NULL,'LIC','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(21,NULL,'PNB Metlife','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(22,NULL,'Pramerica Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:56',0),(23,NULL,'Reliance Nippon Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:56',0),(24,NULL,'SBI Life','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(25,NULL,'Shriram Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:41:26',0),(26,NULL,'Star Union Dai-ichi Life Insurance Co. Ltd.','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:41:26',0),(27,NULL,'TATA AIA Life','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(28,NULL,'Acko Life','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(29,NULL,'Aditya Birla Health Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:44:40','2025-10-09 12:44:40',0),(30,NULL,'Care Health Insurance Ltd. (formerly Religare)','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(31,NULL,'Galaxy Health Insurance Company Limited','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(32,NULL,'Manipal Cigna Health Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(33,NULL,'Niva Bupa Health Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(34,NULL,'Star Health & Allied Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(35,NULL,'Acko General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(36,NULL,'Bajaj Allianz General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(37,NULL,'Bharti AXA General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(38,NULL,'Cholamandalam MS General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(39,NULL,'Zuno (Edelweiss) General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(40,NULL,'Future Generali India Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(41,NULL,'Go Digit General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(42,NULL,'HDFC ERGO General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(43,NULL,'ICICI Lombard General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(44,NULL,'Liberty General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(45,NULL,'Magma General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(46,NULL,'National Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(47,NULL,'Navi General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(48,NULL,'Raheja QBE General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(49,NULL,'Reliance General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(50,NULL,'Royal Sundaram General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(51,NULL,'SBI General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(52,NULL,'Shriram General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(53,NULL,'Tata AIG General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(54,NULL,'The New India Assurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(55,NULL,'The Oriental Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(56,NULL,'United India Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(57,NULL,'Universal Sompo General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(58,NULL,'Acko Health','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-16 07:14:27',0),(60,'INS/10/0001','xxxxx','Health',NULL,NULL,1,'2025-10-14 04:53:22','2025-10-14 04:54:17',1),(61,'INS/10/0002','ggggg','Health',NULL,NULL,1,'2025-10-14 04:53:55','2025-10-14 04:54:17',1),(62,'INS/10/0001','qqq','Health',NULL,NULL,1,'2025-10-14 04:54:22','2025-10-16 05:20:12',1),(63,'INS/10/0001','TEST Insurer','Life','4444444444','e@gmail.com',1,'2025-10-16 05:21:16','2025-10-16 05:21:39',0),(64,'INS/10/0002','ccccc','General','5555555555','w@gmail.com',1,'2025-10-16 10:35:37','2025-10-16 10:35:46',1);
/*!40000 ALTER TABLE `insurers` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `lab_test_results`
--

DROP TABLE IF EXISTS `lab_test_results`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `lab_test_results` (
  `id` int NOT NULL AUTO_INCREMENT,
  `appointment_id` int NOT NULL,
  `test_id` int NOT NULL,
  `test_value` varchar(255) DEFAULT NULL,
  `test_unit` varchar(50) DEFAULT NULL,
  `normal_range` varchar(100) DEFAULT NULL,
  `is_abnormal` tinyint(1) DEFAULT '0',
  `remarks` text,
  `synced_from_lab_at` timestamp NULL DEFAULT NULL,
  `verified_by` int DEFAULT NULL,
  `verified_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `test_id` (`test_id`),
  KEY `verified_by` (`verified_by`),
  CONSTRAINT `lab_test_results_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `lab_test_results_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`),
  CONSTRAINT `lab_test_results_ibfk_3` FOREIGN KEY (`verified_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `lab_test_results`
--

LOCK TABLES `lab_test_results` WRITE;
/*!40000 ALTER TABLE `lab_test_results` DISABLE KEYS */;
/*!40000 ALTER TABLE `lab_test_results` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `qc_checklist`
--

DROP TABLE IF EXISTS `qc_checklist`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `qc_checklist` (
  `id` int NOT NULL AUTO_INCREMENT,
  `qc_id` int NOT NULL,
  `test_id` int NOT NULL,
  `is_available` tinyint(1) DEFAULT '0',
  `checked_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `qc_id` (`qc_id`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `qc_checklist_ibfk_1` FOREIGN KEY (`qc_id`) REFERENCES `appointment_qc` (`id`) ON DELETE CASCADE,
  CONSTRAINT `qc_checklist_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `qc_checklist`
--

LOCK TABLES `qc_checklist` WRITE;
/*!40000 ALTER TABLE `qc_checklist` DISABLE KEYS */;
/*!40000 ALTER TABLE `qc_checklist` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `report_types`
--

DROP TABLE IF EXISTS `report_types`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `report_types` (
  `id` int NOT NULL AUTO_INCREMENT,
  `type_code` varchar(50) NOT NULL,
  `type_name` varchar(255) NOT NULL,
  `description` text,
  `is_mandatory` tinyint(1) DEFAULT '0',
  `display_order` int DEFAULT '0',
  `is_active` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `type_code` (`type_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `report_types`
--

LOCK TABLES `report_types` WRITE;
/*!40000 ALTER TABLE `report_types` DISABLE KEYS */;
/*!40000 ALTER TABLE `report_types` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `roles`
--

DROP TABLE IF EXISTS `roles`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `roles` (
  `id` int NOT NULL AUTO_INCREMENT,
  `role_name` varchar(50) NOT NULL,
  `description` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `role_name` (`role_name`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `roles`
--

LOCK TABLES `roles` WRITE;
/*!40000 ALTER TABLE `roles` DISABLE KEYS */;
INSERT INTO `roles` VALUES (1,'Admin','{\"insurers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"clients\":[\"add\",\"edit\",\"delete\",\"read\",\"import\",\"export\"],\"centers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"technicians\":[\"read\",\"add\",\"edit\",\"import\",\"export\",\"delete\"],\"users\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"appointments\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"test\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"testRates\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"category\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"]}','2025-10-06 07:01:14','2025-10-21 09:06:40'),(2,'TPA','{\"insurers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"clients\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"centers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"technicians\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"users\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"appointments\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"]}','2025-10-06 09:23:27','2025-10-11 04:30:52'),(3,'Diagnostic Center','{\"appointments\":[\"export\",\"read\",\"edit\",\"add\",\"import\",\"delete\"],\"technicians\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"users\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"centers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"clients\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"insurers\":[\"read\",\"add\",\"delete\",\"edit\",\"import\",\"export\"],\"test\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"testRates\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"]}','2025-10-06 09:23:27','2025-10-16 07:28:11'),(4,'Technician','{\"insurers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"clients\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"centers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"technicians\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"users\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"appointments\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"]}','2025-10-06 11:22:03','2025-10-11 04:31:27');
/*!40000 ALTER TABLE `roles` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technician_documents`
--

DROP TABLE IF EXISTS `technician_documents`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technician_documents` (
  `id` int NOT NULL AUTO_INCREMENT,
  `technician_id` int NOT NULL,
  `document_type` varchar(100) NOT NULL,
  `file_path` varchar(500) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `uploaded_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `technician_id` (`technician_id`),
  CONSTRAINT `technician_documents_ibfk_1` FOREIGN KEY (`technician_id`) REFERENCES `technicians` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technician_documents`
--

LOCK TABLES `technician_documents` WRITE;
/*!40000 ALTER TABLE `technician_documents` DISABLE KEYS */;
/*!40000 ALTER TABLE `technician_documents` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `technicians`
--

DROP TABLE IF EXISTS `technicians`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `technicians` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `center_id` int NOT NULL,
  `technician_code` varchar(50) NOT NULL,
  `full_name` varchar(255) NOT NULL,
  `mobile` varchar(20) NOT NULL,
  `email` varchar(255) DEFAULT NULL,
  `home_gps_latitude` decimal(10,8) DEFAULT NULL,
  `home_gps_longitude` decimal(11,8) DEFAULT NULL,
  `home_address` text,
  `qualification` varchar(255) DEFAULT NULL,
  `experience_years` int DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `technician_code` (`technician_code`),
  KEY `center_id` (`center_id`),
  KEY `technicians_ibfk_1` (`user_id`),
  CONSTRAINT `technicians_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `technicians_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `diagnostic_centers` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `technicians`
--

LOCK TABLES `technicians` WRITE;
/*!40000 ALTER TABLE `technicians` DISABLE KEYS */;
INSERT INTO `technicians` VALUES (2,9,5,'TEC001','Kumar Technician','9999999999','af@gmail.com',NULL,NULL,'naaa','ME',NULL,1,'2025-10-09 06:48:50','2025-10-09 09:42:00',0),(3,11,6,'Tec002','shell technician','9999999999','er@gmail.com',NULL,NULL,'ff','be',3,1,'2025-10-09 09:55:23','2025-10-09 09:55:23',0);
/*!40000 ALTER TABLE `technicians` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_categories`
--

DROP TABLE IF EXISTS `test_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_categories` (
  `id` int NOT NULL AUTO_INCREMENT,
  `category_name` varchar(255) NOT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_categories`
--

LOCK TABLES `test_categories` WRITE;
/*!40000 ALTER TABLE `test_categories` DISABLE KEYS */;
INSERT INTO `test_categories` VALUES (1,'B1X0',NULL,1,'2025-10-21 09:21:22',0,'2025-10-21 09:35:30');
/*!40000 ALTER TABLE `test_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `test_rates`
--

DROP TABLE IF EXISTS `test_rates`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `test_rates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_id` int DEFAULT NULL,
  `center_id` int DEFAULT NULL,
  `insurer_id` int DEFAULT NULL,
  `test_id` int DEFAULT NULL,
  `rate` decimal(10,2) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  `rate_type` enum('test','category') DEFAULT 'test',
  `category_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `test_rates_ibfk_2` (`center_id`),
  KEY `test_rates_ibfk_1` (`client_id`),
  KEY `test_rates_ibfk_3` (`insurer_id`),
  KEY `test_rates_ibfk_4` (`test_id`),
  CONSTRAINT `test_rates_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_rates_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `diagnostic_centers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_rates_ibfk_3` FOREIGN KEY (`insurer_id`) REFERENCES `insurers` (`id`),
  CONSTRAINT `test_rates_ibfk_4` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_rates_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`),
  CONSTRAINT `chk_test_rates_exclusive` CHECK ((((`rate_type` = _utf8mb4'test') and (`test_id` is not null) and (`category_id` is null)) or ((`rate_type` = _utf8mb4'category') and (`category_id` is not null) and (`test_id` is null))))
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_rates`
--

LOCK TABLES `test_rates` WRITE;
/*!40000 ALTER TABLE `test_rates` DISABLE KEYS */;
INSERT INTO `test_rates` VALUES (1,5,NULL,5,2,234.46,1,2,'2025-10-15 04:20:18','2025-10-15 10:05:09',1,'test',NULL),(2,6,NULL,NULL,2,434.44,1,2,'2025-10-15 04:20:57','2025-10-15 04:20:57',0,'test',NULL),(3,5,NULL,6,1,33.56,1,2,'2025-10-15 09:39:28','2025-10-15 11:33:38',0,'test',NULL),(4,5,NULL,5,2,434.44,1,2,'2025-10-15 10:05:58','2025-10-15 10:10:17',1,'test',NULL),(5,5,NULL,7,1,33.45,1,2,'2025-10-15 10:06:11','2025-10-15 11:33:38',0,'test',NULL),(6,5,NULL,5,1,66.67,1,2,'2025-10-15 10:07:55','2025-10-15 10:07:55',0,'test',NULL),(7,5,NULL,5,1,66.67,1,2,'2025-10-15 10:08:00','2025-10-15 11:33:38',0,'test',NULL),(8,5,NULL,6,3,34.00,1,2,'2025-10-15 10:09:12','2025-10-15 11:33:38',0,'test',NULL),(9,5,NULL,7,3,45.00,1,2,'2025-10-15 10:09:12','2025-10-15 11:33:38',0,'test',NULL),(10,5,NULL,5,3,55.00,1,2,'2025-10-15 10:09:12','2025-10-15 11:33:38',0,'test',NULL),(11,5,NULL,7,2,55.00,1,2,'2025-10-15 10:11:49','2025-10-15 10:56:20',1,'test',NULL),(12,23,NULL,7,3,34.55,1,2,'2025-10-15 10:31:39','2025-10-15 10:37:31',1,'test',NULL),(13,23,NULL,7,1,45.77,1,2,'2025-10-15 10:31:39','2025-10-15 10:52:20',0,'test',NULL),(14,23,NULL,6,3,55.78,1,2,'2025-10-15 10:36:09','2025-10-15 10:37:31',1,'test',NULL),(15,23,NULL,5,1,44.67,1,2,'2025-10-15 10:36:09','2025-10-15 10:52:20',0,'test',NULL),(16,23,NULL,7,2,77.00,1,2,'2025-10-15 10:36:28','2025-10-15 10:40:08',1,'test',NULL),(17,23,NULL,6,2,0.00,1,2,'2025-10-15 10:36:28','2025-10-15 10:40:08',1,'test',NULL),(18,23,NULL,5,2,77.00,1,2,'2025-10-15 10:36:28','2025-10-15 10:40:08',1,'test',NULL),(19,23,NULL,5,3,56.00,1,2,'2025-10-15 10:38:12','2025-10-15 10:52:20',0,'test',NULL),(20,23,NULL,6,3,66.00,1,2,'2025-10-15 10:38:12','2025-10-15 10:52:20',0,'test',NULL),(21,23,NULL,7,3,89.00,1,2,'2025-10-15 10:38:12','2025-10-15 10:52:20',0,'test',NULL),(22,23,NULL,11,1,12.00,1,2,'2025-10-15 10:48:49','2025-10-15 10:52:20',0,'test',NULL),(23,23,NULL,10,3,11.00,1,2,'2025-10-15 10:48:49','2025-10-15 10:52:20',0,'test',NULL),(24,23,NULL,8,2,33.00,1,2,'2025-10-15 10:49:01','2025-10-15 10:49:48',1,'test',NULL),(25,23,NULL,5,2,55.00,1,2,'2025-10-15 10:49:40','2025-10-15 10:49:48',1,'test',NULL),(26,23,NULL,5,2,55.00,1,2,'2025-10-15 10:49:57','2025-10-15 10:52:20',0,'test',NULL),(27,23,NULL,6,2,55.00,1,2,'2025-10-15 10:49:57','2025-10-15 10:52:20',0,'test',NULL),(28,23,NULL,7,2,5.00,1,2,'2025-10-15 10:49:57','2025-10-15 10:52:20',0,'test',NULL),(29,23,NULL,8,2,55.00,1,2,'2025-10-15 10:49:57','2025-10-15 10:52:20',0,'test',NULL),(30,23,NULL,6,1,55555555.55,1,2,'2025-10-15 10:50:35','2025-10-15 10:52:20',0,'test',NULL),(31,5,NULL,5,2,0.00,1,2,'2025-10-15 10:56:30','2025-10-15 11:33:38',0,'test',NULL),(32,5,NULL,6,2,0.00,1,2,'2025-10-15 10:56:30','2025-10-15 11:33:38',0,'test',NULL),(33,5,NULL,7,2,66.00,1,2,'2025-10-15 10:56:30','2025-10-15 11:33:38',0,'test',NULL),(34,9,NULL,16,3,44.00,1,2,'2025-10-15 13:01:03','2025-10-15 13:02:20',1,'test',NULL),(35,9,NULL,16,1,44.00,1,2,'2025-10-15 13:03:54','2025-10-15 13:03:54',0,'test',NULL),(36,9,NULL,16,3,66.00,1,2,'2025-10-15 13:03:54','2025-10-15 13:03:54',0,'test',NULL),(37,38,NULL,16,4,44.00,1,2,'2025-10-16 05:37:38','2025-10-16 10:01:22',0,'test',NULL),(38,38,NULL,17,4,12000.00,1,2,'2025-10-16 05:37:38','2025-10-16 10:01:22',0,'test',NULL),(39,38,NULL,16,3,546.00,1,2,'2025-10-16 05:37:38','2025-10-16 10:01:22',0,'test',NULL),(40,38,NULL,20,3,78.78,1,2,'2025-10-16 05:37:38','2025-10-16 10:01:22',0,'test',NULL),(41,38,NULL,63,4,456.00,1,2,'2025-10-16 06:50:29','2025-10-16 10:01:22',0,'test',NULL),(42,38,NULL,63,3,678.78,1,2,'2025-10-16 06:50:29','2025-10-16 10:01:22',0,'test',NULL),(43,38,NULL,20,4,0.00,1,2,'2025-10-16 07:03:16','2025-10-16 10:01:22',0,'test',NULL),(44,38,NULL,16,5,44.00,1,2,'2025-10-16 09:02:36','2025-10-16 10:01:22',0,'test',NULL),(45,38,NULL,63,5,78.78,1,2,'2025-10-16 09:02:36','2025-10-16 10:01:22',0,'test',NULL),(46,38,NULL,17,5,55.00,1,2,'2025-10-16 09:02:36','2025-10-16 10:01:22',0,'test',NULL),(47,38,NULL,20,5,66.00,1,2,'2025-10-16 09:02:36','2025-10-16 10:01:22',0,'test',NULL),(48,38,NULL,17,3,0.00,1,2,'2025-10-16 10:01:17','2025-10-16 10:01:22',0,'test',NULL),(49,42,NULL,56,2,44.00,1,2,'2025-10-21 09:35:57','2025-10-21 10:33:40',0,'test',NULL),(50,42,NULL,57,2,56.89,1,2,'2025-10-21 09:35:57','2025-10-21 10:33:40',0,'test',NULL),(51,42,NULL,56,NULL,11200.00,1,2,'2025-10-21 10:31:20','2025-10-21 10:33:40',0,'category',1),(52,42,NULL,57,NULL,60000.00,1,2,'2025-10-21 10:33:40','2025-10-21 10:33:40',0,'category',1);
/*!40000 ALTER TABLE `test_rates` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `tests`
--

DROP TABLE IF EXISTS `tests`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `tests` (
  `id` int NOT NULL AUTO_INCREMENT,
  `test_code` varchar(150) DEFAULT NULL,
  `test_name` varchar(255) DEFAULT NULL,
  `category_id` int DEFAULT NULL,
  `description` text,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `tests_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `test_categories` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tests`
--

LOCK TABLES `tests` WRITE;
/*!40000 ALTER TABLE `tests` DISABLE KEYS */;
INSERT INTO `tests` VALUES (1,NULL,'test name 1',NULL,'test 1 descds',1,'2025-10-14 13:06:32','2025-10-15 04:19:53',0),(2,NULL,'test name 2',NULL,'test name 2 desc',1,'2025-10-15 04:19:31','2025-10-15 04:19:31',0),(3,NULL,'t3',NULL,NULL,1,'2025-10-15 10:08:57','2025-10-15 10:08:57',0),(4,NULL,'DTA Test',NULL,'DTA TESTS',1,'2025-10-16 05:37:08','2025-10-16 05:37:08',0),(5,NULL,'HIV',NULL,'HIV D',1,'2025-10-16 09:01:22','2025-10-16 09:01:22',0);
/*!40000 ALTER TABLE `tests` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user_sessions`
--

DROP TABLE IF EXISTS `user_sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user_sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int NOT NULL,
  `token` varchar(500) NOT NULL,
  `device_info` text,
  `ip_address` varchar(50) DEFAULT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `token` (`token`),
  KEY `user_id` (`user_id`),
  CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user_sessions`
--

LOCK TABLES `user_sessions` WRITE;
/*!40000 ALTER TABLE `user_sessions` DISABLE KEYS */;
/*!40000 ALTER TABLE `user_sessions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `username` varchar(100) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role_id` int DEFAULT NULL,
  `full_name` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `last_login` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `email` (`email`),
  KEY `users_ibfk_1` (`role_id`),
  CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Admin','admin1@gmail.com','$2a$10$ur.5ZxhLWI5yo0Lrx6E.g.AjDfWUWw9CouUU9GHBKXrebuIXl9fs.',1,'Admin\'s Full Name','2222888882',1,'2025-10-06 07:46:12','2025-10-06 07:01:55','2025-10-13 07:38:01',0),(4,'Center1','center1@gmail.com','$2a$10$ftdqjsW2RghXB1rUrGsZXO9oedGUj76irc9GI9gC1GTWJfj4oo33S',3,'Center1','9999999999',1,NULL,'2025-10-06 09:23:37','2025-10-09 11:31:27',0),(5,'Tec1','tec1@gmail.com','$2a$10$l4CmZznq6J8/iAdRtYWaf.UHaPG/l9QAd.vdPWYct8T.Rfp7i81lC',4,'Tec1','9999999999',1,NULL,'2025-10-06 11:23:03','2025-10-06 11:23:03',0),(6,'new','new@gmail.com','$2a$10$74qxzS4kBbDP5cOoDsiMJ.4AyFYYtWGqwD/BSa2pwrGC.lJCyF2Pq',3,'new','9999999999',1,NULL,'2025-10-08 11:06:13','2025-10-08 12:24:01',0),(7,'KumarDC','a@gmail.com','$2a$10$g0D5Mhly56K5IuLv0iD2RuRB0DRcAmD4HQN392ruIzfXQwbsB8ndi',3,'Kumar Diagnostic Center','9999999999',1,NULL,'2025-10-09 06:22:43','2025-10-09 06:22:43',0),(9,'kumarTec','af@gmail.com','$2a$10$leftI4F6P1Uw1DdCcXvZ1OAIj6vHHZnTDX.8wE8GnD9t0u1r9Zeli',4,'Kumar Technician','9999999999',1,NULL,'2025-10-09 06:45:13','2025-10-09 06:45:13',0),(10,'shelldc','d@gmail.com','$2a$10$KqY6/XWy9Jt.HpQydRWyXOwz/4ExBNO3mi9gW5St8bzQM7xyf6IBC',3,'shell diagnostic center','9999999999',1,NULL,'2025-10-09 08:06:55','2025-10-09 08:06:55',0),(11,'shelltec','h@gmail.com','$2a$10$1nKrywUpgjG56WMuMspLeublpBSV8ABIz.phL/evI13xHa.55k2/6',4,'shell technician','9999999999',1,NULL,'2025-10-09 09:53:43','2025-10-09 09:53:43',0),(14,'testdc','t@gmail.com','$2a$10$C0S0gESTpHfdXvkbjzddD.hSFLzrRI2h0UKmu07EF9G8.1lL85O62',3,'testdc','3333333333',1,NULL,'2025-10-16 05:29:15','2025-10-16 05:29:15',0),(15,'ioi','ioi@gmail.com','$2a$10$UR/mlX93TzfgjnoSUk/hTeGa4b0VHHx3jtPpCun1NuUdIeW0Cm/Eq',1,'iiiiiiiiii','6666666666',1,NULL,'2025-10-20 09:01:25','2025-10-20 10:47:54',0);
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-10-21 19:38:16
