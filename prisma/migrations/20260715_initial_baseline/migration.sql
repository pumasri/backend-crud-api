-- CreateTable
CREATE TABLE `categories` (
    `CategoryID` INTEGER NOT NULL AUTO_INCREMENT,
    `CategoryName` VARCHAR(255) NULL,
    `Description` VARCHAR(255) NULL,

    PRIMARY KEY (`CategoryID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `customers` (
    `CustomerID` INTEGER NOT NULL AUTO_INCREMENT,
    `CustomerName` VARCHAR(255) NULL,
    `ContactName` VARCHAR(255) NULL,
    `Address` VARCHAR(255) NULL,
    `City` VARCHAR(255) NULL,
    `PostalCode` VARCHAR(255) NULL,
    `Country` VARCHAR(255) NULL,

    PRIMARY KEY (`CustomerID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `employees` (
    `EmployeeID` INTEGER NOT NULL AUTO_INCREMENT,
    `LastName` VARCHAR(255) NULL,
    `FirstName` VARCHAR(255) NULL,
    `BirthDate` DATE NULL,
    `Photo` VARCHAR(255) NULL,
    `Notes` TEXT NULL,

    PRIMARY KEY (`EmployeeID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_details` (
    `OrderDetailID` INTEGER NOT NULL AUTO_INCREMENT,
    `OrderID` INTEGER NULL,
    `ProductID` INTEGER NULL,
    `Quantity` INTEGER NULL,

    INDEX `OrderID`(`OrderID`),
    INDEX `ProductID`(`ProductID`),
    PRIMARY KEY (`OrderDetailID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `orders` (
    `OrderID` INTEGER NOT NULL AUTO_INCREMENT,
    `CustomerID` INTEGER NULL,
    `EmployeeID` INTEGER NULL,
    `OrderDate` DATE NULL,
    `ShipperID` INTEGER NULL,

    INDEX `CustomerID`(`CustomerID`),
    INDEX `EmployeeID`(`EmployeeID`),
    INDEX `ShipperID`(`ShipperID`),
    PRIMARY KEY (`OrderID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `products` (
    `ProductID` INTEGER NOT NULL AUTO_INCREMENT,
    `ProductName` VARCHAR(255) NULL,
    `SupplierID` INTEGER NULL,
    `CategoryID` INTEGER NULL,
    `Unit` VARCHAR(255) NULL,
    `Price` DOUBLE NULL,

    INDEX `CategoryID`(`CategoryID`),
    INDEX `SupplierID`(`SupplierID`),
    PRIMARY KEY (`ProductID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `shippers` (
    `ShipperID` INTEGER NOT NULL AUTO_INCREMENT,
    `ShipperName` VARCHAR(255) NULL,
    `Phone` VARCHAR(255) NULL,

    PRIMARY KEY (`ShipperID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `suppliers` (
    `SupplierID` INTEGER NOT NULL AUTO_INCREMENT,
    `SupplierName` VARCHAR(255) NULL,
    `ContactName` VARCHAR(255) NULL,
    `Address` VARCHAR(255) NULL,
    `City` VARCHAR(255) NULL,
    `PostalCode` VARCHAR(255) NULL,
    `Country` VARCHAR(255) NULL,
    `Phone` VARCHAR(255) NULL,

    PRIMARY KEY (`SupplierID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `username` VARCHAR(50) NOT NULL,
    `password_hash` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `username`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_details` ADD CONSTRAINT `order_details_ibfk_1` FOREIGN KEY (`OrderID`) REFERENCES `orders`(`OrderID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `order_details` ADD CONSTRAINT `order_details_ibfk_2` FOREIGN KEY (`ProductID`) REFERENCES `products`(`ProductID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`CustomerID`) REFERENCES `customers`(`CustomerID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_2` FOREIGN KEY (`EmployeeID`) REFERENCES `employees`(`EmployeeID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `orders` ADD CONSTRAINT `orders_ibfk_3` FOREIGN KEY (`ShipperID`) REFERENCES `shippers`(`ShipperID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`CategoryID`) REFERENCES `categories`(`CategoryID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `products` ADD CONSTRAINT `products_ibfk_2` FOREIGN KEY (`SupplierID`) REFERENCES `suppliers`(`SupplierID`) ON DELETE NO ACTION ON UPDATE NO ACTION;

