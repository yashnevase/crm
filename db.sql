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
  `appointment_id` int NOT NULL,
  `test_id` int NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `is_completed` tinyint(1) DEFAULT '0',
  `completion_remarks` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `appointment_id` (`appointment_id`),
  KEY `test_id` (`test_id`),
  CONSTRAINT `appointment_tests_ibfk_1` FOREIGN KEY (`appointment_id`) REFERENCES `appointments` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointment_tests_ibfk_2` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointment_tests`
--

LOCK TABLES `appointment_tests` WRITE;
/*!40000 ALTER TABLE `appointment_tests` DISABLE KEYS */;
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
  `insurer_id` int DEFAULT NULL,
  `customer_name` varchar(255) NOT NULL,
  `customer_mobile` varchar(20) NOT NULL,
  `customer_email` varchar(255) DEFAULT NULL,
  `customer_address` text NOT NULL,
  `customer_gps_latitude` decimal(10,8) DEFAULT NULL,
  `customer_gps_longitude` decimal(11,8) DEFAULT NULL,
  `customer_landmark` varchar(255) DEFAULT NULL,
  `visit_type` enum('Home_Visit','Center_Visit') NOT NULL,
  `customer_category` enum('HNI','Non_HNI') DEFAULT 'Non_HNI',
  `appointment_date` date DEFAULT NULL,
  `appointment_time` time DEFAULT NULL,
  `confirmed_time` time DEFAULT NULL,
  `status` enum('Pending','Assigned','Confirmed','In_Progress','Completed','Partially_Completed','Cancelled') DEFAULT 'Pending',
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
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`),
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `diagnostic_centers` (`id`),
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`insurer_id`) REFERENCES `insurers` (`id`),
  CONSTRAINT `appointments_ibfk_4` FOREIGN KEY (`assigned_technician_id`) REFERENCES `technicians` (`id`),
  CONSTRAINT `appointments_ibfk_5` FOREIGN KEY (`assigned_by`) REFERENCES `users` (`id`),
  CONSTRAINT `appointments_ibfk_6` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=58 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `appointments`
--

LOCK TABLES `appointments` WRITE;
/*!40000 ALTER TABLE `appointments` DISABLE KEYS */;
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category_test_mapping`
--

LOCK TABLES `category_test_mapping` WRITE;
/*!40000 ALTER TABLE `category_test_mapping` DISABLE KEYS */;
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
-- Table structure for table `clients`
--

DROP TABLE IF EXISTS `clients`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `clients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `client_code` varchar(50) DEFAULT NULL,
  `client_name` varchar(255) DEFAULT NULL,
  `client_type` enum('TPA','Insurance','Corporate','Aggregator','Retail') DEFAULT NULL,
  `registered_address` text,
  `gst_number` varchar(20) DEFAULT NULL,
  `pan_number` varchar(10) DEFAULT NULL,
  `mode_of_payment` enum('Advance','Billed_Later') DEFAULT 'Billed_Later',
  `payment_frequency` enum('Monthly','Quarterly','On_Completion','Custom') DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `gst_number` (`gst_number`),
  UNIQUE KEY `pan_number` (`pan_number`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `clients_ibfk_1` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clients`
--

LOCK TABLES `clients` WRITE;
/*!40000 ALTER TABLE `clients` DISABLE KEYS */;
INSERT INTO `clients` VALUES (5,NULL,'1 MG',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(6,NULL,'Anmol TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(7,NULL,'Call Health TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(8,NULL,'Call Medilife TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(9,NULL,'E Cure',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(10,NULL,'Ericsson TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(11,NULL,'Get Visit',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(12,NULL,'GOWELNEXT Solutions Pvt Ltd',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(13,NULL,'Health Assure TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(14,NULL,'Health India TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(15,NULL,'MD India TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(16,NULL,'Medibuddy TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(17,NULL,'Medpiper TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0),(18,NULL,'Volo Health Insurance TPA',NULL,NULL,NULL,NULL,'Billed_Later',NULL,1,NULL,'2025-10-09 12:17:54','2025-10-09 12:17:54',0);
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
  `center_code` varchar(50) NOT NULL,
  `user_id` int DEFAULT NULL,
  `center_name` varchar(255) NOT NULL,
  `center_type` enum('Own','Third_Party') NOT NULL,
  `address` text NOT NULL,
  `city` varchar(100) DEFAULT NULL,
  `state` varchar(100) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `gps_latitude` decimal(10,8) DEFAULT NULL,
  `gps_longitude` decimal(11,8) DEFAULT NULL,
  `letterhead_path` varchar(500) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `center_code` (`center_code`),
  KEY `fk_user_id` (`user_id`),
  CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `diagnostic_centers`
--

LOCK TABLES `diagnostic_centers` WRITE;
/*!40000 ALTER TABLE `diagnostic_centers` DISABLE KEYS */;
INSERT INTO `diagnostic_centers` VALUES (5,'DC0001',7,'Kumar Diagnostic Center','Third_Party','Nariman Point, Mumbai','Mumbai','Maharashtra','400021','9999999999','reliance@elec.com',NULL,NULL,NULL,1,2,'2025-10-09 06:28:06','2025-10-09 06:43:32',0),(6,'DC002',10,'Shelll Diagnostic center','Own','ffff','pune','mh','411028','9999999999','ee@gmail.com',NULL,NULL,NULL,1,2,'2025-10-09 08:07:44','2025-10-09 09:20:42',0);
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
  `insurer_type` enum('Life','Health','General') DEFAULT 'Life',
  `contact_number` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_deleted` tinyint NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=59 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `insurers`
--

LOCK TABLES `insurers` WRITE;
/*!40000 ALTER TABLE `insurers` DISABLE KEYS */;
INSERT INTO `insurers` VALUES (5,NULL,'Aditya Birla Sun Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:38:43',0),(6,NULL,'Ageas Federal Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:38:43',0),(7,NULL,'Ageas Fede','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(8,NULL,'Aviva Life Insurance ','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:38:43',0),(9,NULL,'Axis Max Life Insurance Limited','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:39:15',0),(10,NULL,'Bajaj Allianz Life Insurance Company Ltd.','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:39:15',0),(11,NULL,'Bandhan Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:39:15',0),(12,NULL,'Bharti Axa Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(13,NULL,'Canara HSBC Life Insurance company Ltd','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(14,NULL,'Edelweiss Life Insurance Co. Ltd.','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(15,NULL,'Generali Central Life Insurance Company Limited','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(16,NULL,'HDFC Life','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(17,NULL,'ICICI Prudential Life Insurance Co. Ltd','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:04',0),(18,NULL,'India First Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:56',0),(19,NULL,'Kotak Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:56',0),(20,NULL,'LIC','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(21,NULL,'PNB Metlife','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(22,NULL,'Pramerica Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:56',0),(23,NULL,'Reliance Nippon Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:40:56',0),(24,NULL,'SBI Life','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(25,NULL,'Shriram Life Insurance','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:41:26',0),(26,NULL,'Star Union Dai-ichi Life Insurance Co. Ltd.','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:41:26',0),(27,NULL,'TATA AIA Life','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(28,NULL,'Acko Life','Life',NULL,NULL,1,'2025-10-09 12:37:20','2025-10-09 12:37:20',0),(29,NULL,'Aditya Birla Health Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:44:40','2025-10-09 12:44:40',0),(30,NULL,'Care Health Insurance Ltd. (formerly Religare)','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(31,NULL,'Galaxy Health Insurance Company Limited','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(32,NULL,'Manipal Cigna Health Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(33,NULL,'Niva Bupa Health Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(34,NULL,'Star Health & Allied Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(35,NULL,'Acko General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(36,NULL,'Bajaj Allianz General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(37,NULL,'Bharti AXA General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(38,NULL,'Cholamandalam MS General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(39,NULL,'Zuno (Edelweiss) General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(40,NULL,'Future Generali India Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(41,NULL,'Go Digit General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(42,NULL,'HDFC ERGO General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(43,NULL,'ICICI Lombard General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(44,NULL,'Liberty General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(45,NULL,'Magma General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(46,NULL,'National Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(47,NULL,'Navi General Insurance Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(48,NULL,'Raheja QBE General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:47:55','2025-10-09 12:47:55',0),(49,NULL,'Reliance General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(50,NULL,'Royal Sundaram General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(51,NULL,'SBI General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(52,NULL,'Shriram General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(53,NULL,'Tata AIG General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(54,NULL,'The New India Assurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(55,NULL,'The Oriental Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(56,NULL,'United India Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(57,NULL,'Universal Sompo General Insurance Co. Ltd.','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0),(58,NULL,'Acko Health','Health',NULL,NULL,1,'2025-10-09 12:49:28','2025-10-09 12:49:28',0);
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
INSERT INTO `roles` VALUES (1,'Admin','{\"insurers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"clients\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"centers\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"technicians\":[\"read\",\"add\",\"edit\",\"import\",\"export\",\"delete\"],\"users\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"],\"appointments\":[\"read\",\"add\",\"edit\",\"delete\",\"import\",\"export\"]}','2025-10-06 07:01:14','2025-10-09 11:58:28'),(2,'TPA','tpa','2025-10-06 09:23:27','2025-10-06 09:23:27'),(3,'Diagnostic Center','{\"appointments\":[\"edit\"],\"technicians\":[],\"users\":[]}','2025-10-06 09:23:27','2025-10-09 11:56:25'),(4,'Technician','Technician','2025-10-06 11:22:03','2025-10-06 11:22:03');
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
INSERT INTO `technicians` VALUES (2,9,5,'TEC001','Kumar Technician','9999999999','af@gmail.com',NULL,NULL,'naaa','ME',NULL,1,'2025-10-09 06:48:50','2025-10-09 09:42:00',0),(3,11,6,'Tec002','shell technician','9999999999','er@gmail.com',NULL,NULL,'ff','be',3,1,'2025-10-09 09:55:23','2025-10-09 09:55:23',0),(7,NULL,6,'fdf','fsdf','9999999999','admin@gmail.com',NULL,NULL,'ff','be',NULL,1,'2025-10-09 10:28:44','2025-10-09 10:28:44',0);
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
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_categories`
--

LOCK TABLES `test_categories` WRITE;
/*!40000 ALTER TABLE `test_categories` DISABLE KEYS */;
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
  `client_id` int NOT NULL,
  `center_id` int NOT NULL,
  `insurer_id` int DEFAULT NULL,
  `test_id` int NOT NULL,
  `rate` decimal(10,2) NOT NULL,
  `discount_percentage` decimal(5,2) DEFAULT '0.00',
  `effective_from` date NOT NULL,
  `effective_to` date DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_by` int DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `client_id` (`client_id`),
  KEY `center_id` (`center_id`),
  KEY `insurer_id` (`insurer_id`),
  KEY `test_id` (`test_id`),
  KEY `created_by` (`created_by`),
  CONSTRAINT `test_rates_ibfk_1` FOREIGN KEY (`client_id`) REFERENCES `clients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_rates_ibfk_2` FOREIGN KEY (`center_id`) REFERENCES `diagnostic_centers` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_rates_ibfk_3` FOREIGN KEY (`insurer_id`) REFERENCES `insurers` (`id`),
  CONSTRAINT `test_rates_ibfk_4` FOREIGN KEY (`test_id`) REFERENCES `tests` (`id`) ON DELETE CASCADE,
  CONSTRAINT `test_rates_ibfk_5` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `test_rates`
--

LOCK TABLES `test_rates` WRITE;
/*!40000 ALTER TABLE `test_rates` DISABLE KEYS */;
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
  `test_code` varchar(50) NOT NULL,
  `test_name` varchar(255) NOT NULL,
  `test_type` enum('Single','Category') NOT NULL,
  `category_id` int DEFAULT NULL,
  `description` text,
  `normal_range_min` decimal(10,2) DEFAULT NULL,
  `normal_range_max` decimal(10,2) DEFAULT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `test_code` (`test_code`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `tests_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `test_categories` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `tests`
--

LOCK TABLES `tests` WRITE;
/*!40000 ALTER TABLE `tests` DISABLE KEYS */;
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
  `role_id` int NOT NULL,
  `full_name` varchar(255) NOT NULL,
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
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES (2,'Admin','admin1@gmail.com','$2a$10$Nq33PYKNOFPJ0p1Raxw5meUlBM5Pq.KIY9MY02wGDD2OCLb9Lk3wa',1,'Admin\'s Full Name','8888888888',1,'2025-10-06 07:46:12','2025-10-06 07:01:55','2025-10-08 09:54:46',0),(4,'Center1','center1@gmail.com','$2a$10$ftdqjsW2RghXB1rUrGsZXO9oedGUj76irc9GI9gC1GTWJfj4oo33S',3,'Center1','9999999999',1,NULL,'2025-10-06 09:23:37','2025-10-09 11:31:27',0),(5,'Tec1','tec1@gmail.com','$2a$10$l4CmZznq6J8/iAdRtYWaf.UHaPG/l9QAd.vdPWYct8T.Rfp7i81lC',4,'Tec1','9999999999',1,NULL,'2025-10-06 11:23:03','2025-10-06 11:23:03',0),(6,'new','new@gmail.com','$2a$10$74qxzS4kBbDP5cOoDsiMJ.4AyFYYtWGqwD/BSa2pwrGC.lJCyF2Pq',3,'new','9999999999',1,NULL,'2025-10-08 11:06:13','2025-10-08 12:24:01',0),(7,'KumarDC','a@gmail.com','$2a$10$g0D5Mhly56K5IuLv0iD2RuRB0DRcAmD4HQN392ruIzfXQwbsB8ndi',3,'Kumar Diagnostic Center','9999999999',1,NULL,'2025-10-09 06:22:43','2025-10-09 06:22:43',0),(9,'kumarTec','af@gmail.com','$2a$10$leftI4F6P1Uw1DdCcXvZ1OAIj6vHHZnTDX.8wE8GnD9t0u1r9Zeli',4,'Kumar Technician','9999999999',1,NULL,'2025-10-09 06:45:13','2025-10-09 06:45:13',0),(10,'shelldc','d@gmail.com','$2a$10$KqY6/XWy9Jt.HpQydRWyXOwz/4ExBNO3mi9gW5St8bzQM7xyf6IBC',3,'shell diagnostic center','9999999999',1,NULL,'2025-10-09 08:06:55','2025-10-09 08:06:55',0),(11,'shelltec','h@gmail.com','$2a$10$1nKrywUpgjG56WMuMspLeublpBSV8ABIz.phL/evI13xHa.55k2/6',4,'shell technician','9999999999',1,NULL,'2025-10-09 09:53:43','2025-10-09 09:53:43',0);
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

-- Dump completed on 2025-10-09 18:31:11
